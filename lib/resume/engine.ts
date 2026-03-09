// lib/resume/engine.ts
// Resume generation engine — layered approach:
// Layer 1: Select best projects/skills/bullets (deterministic)
// Layer 2: Generate polished summary + bullets (LLM, controlled)
// Layer 3: Validate output (no invented facts, quality check)
// Layer 4: Store versioned output

import { db } from "../db";
import { llmStructured } from "../llm/provider";
import { ResumeGenerationOutputSchema, type ResumeGenerationOutput } from "../schemas";
import { CandidateProfile, CandidateSkill, Job, Project, Skill } from "@prisma/client";

type CandidateWithRelations = CandidateProfile & {
  skills: (CandidateSkill & { skill: Skill })[];
  projects: Project[];
};

// ─── Layer 1: Selection logic ─────────────────────────────────────────────────

function selectRelevantProjects(
  projects: Project[],
  job: Job,
  maxProjects = 3
): Project[] {
  const desc = (job.rawDescription + " " + job.title).toLowerCase();
  const jobKeywords = [...(job.requiredSkills || []), ...(job.niceToHaveSkills || []), ...(job.keywords || [])].map((k) => k.toLowerCase());

  const scored = projects.map((p) => {
    const tags = [...(p.techTags as string[]), ...(p.roleTags as string[])];
    const score = tags.reduce((sum, tag) => {
      const tagLower = tag.toLowerCase();
      const descMatch = desc.includes(tagLower) ? 2 : 0;
      const kwMatch = jobKeywords.some((kw) => kw.includes(tagLower) || tagLower.includes(kw)) ? 3 : 0;
      return sum + descMatch + kwMatch;
    }, 0);
    return { project: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxProjects)
    .map((s) => s.project);
}

function selectRelevantSkills(
  skills: (CandidateSkill & { skill: Skill })[],
  job: Job
): (CandidateSkill & { skill: Skill })[] {
  const jobSkills = [
    ...(job.requiredSkills || []),
    ...(job.niceToHaveSkills || []),
    ...(job.keywords || []),
  ].map((s) => s.toLowerCase());

  const matched = skills.filter((cs) => {
    const name = cs.skill.canonicalName.toLowerCase();
    return jobSkills.some((js) => js.includes(name) || name.includes(js));
  });

  // Always include high-priority skills even if not matched
  const highPriority = skills.filter((cs) => cs.priority >= 80 && !matched.includes(cs));

  return [...matched, ...highPriority.slice(0, 3)];
}

// ─── Layer 2: LLM generation ──────────────────────────────────────────────────

const RESUME_SYSTEM_PROMPT = `You are an expert technical resume writer specializing in the Israeli high-tech market.
You are creating a resume for Meital Abadi, a Technion Data Science graduate.
Your goal is to maximize interview conversion for the specific role.

CRITICAL RULES:
1. NEVER invent metrics, achievements, or experiences not explicitly provided
2. Only use the projects and skills provided to you — do not hallucinate additional ones
3. Write in active voice, start bullets with strong verbs
4. Align language to the job's keyword requirements without keyword stuffing
5. Keep the summary to 3-4 concise sentences
6. Make bullets specific and achievement-oriented where evidence allows
7. Flag any quality issues honestly in qualityIssues field

Return ONLY valid JSON matching the required schema.`;

// ─── Role template inference ─────────────────────────────────────────────────

const ROLE_TEMPLATES = [
  "Data Analyst",
  "AI Analyst",
  "Data Scientist",
  "AI Engineer",
  "BI / Product Analyst",
] as const;

type RoleTemplate = (typeof ROLE_TEMPLATES)[number];

const ROLE_TEMPLATE_KEYWORDS: Record<RoleTemplate, string[]> = {
  "Data Analyst": ["data analyst", "sql", "reporting", "kpi", "dashboard", "looker", "tableau", "analytics"],
  "AI Analyst": ["ai analyst", "analytics", "business intelligence", "insights", "data-driven"],
  "Data Scientist": ["data scientist", "machine learning", "ml", "modeling", "prediction", "statistical"],
  "AI Engineer": ["ai engineer", "llm", "nlp", "generative ai", "langchain", "rag", "embedding"],
  "BI / Product Analyst": ["product analyst", "bi analyst", "product analytics", "growth", "a/b testing", "experimentation"],
};

const EMPHASIS_PROMPTS: Record<string, string> = {
  "analytics-heavy": "Emphasize analytics, dashboards, KPIs, SQL, and data storytelling. Downplay ML/AI depth.",
  "ai-heavy": "Emphasize AI/ML, LLMs, NLP, and model development. Highlight AI projects prominently.",
  "product-heavy": "Emphasize product thinking, experimentation, A/B testing, and stakeholder communication.",
  "engineering-heavy": "Emphasize engineering skills, pipelines, infrastructure, and production code quality.",
};

export function inferRoleTemplate(jobTitle: string): RoleTemplate {
  const lower = jobTitle.toLowerCase();
  let bestMatch: RoleTemplate = "Data Analyst";
  let bestScore = 0;

  for (const [template, keywords] of Object.entries(ROLE_TEMPLATE_KEYWORDS)) {
    const matches = keywords.filter((kw) => lower.includes(kw)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestMatch = template as RoleTemplate;
    }
  }

  return bestMatch;
}

export interface ResumeGenerationInput {
  jobId: string;
  candidateProfileId: string;
  roleFamily?: string;
  language?: string;
  emphasis?: string;  // "analytics-heavy" | "ai-heavy" | "product-heavy" | "engineering-heavy"
}

export interface ResumeVersion {
  id: string;
  name: string;
  summaryText: string;
  bulletVariants: ResumeGenerationOutput["bulletVariants"];
  insertedKeywords: string[];
  qualityScore: number;
  qualityIssues: string[];
}

export async function generateResumeVersion(
  input: ResumeGenerationInput
): Promise<ResumeVersion> {
  const candidate = await db.candidateProfile.findUnique({
    where: { id: input.candidateProfileId },
    include: {
      skills: { include: { skill: true } },
      projects: true,
    },
  });

  if (!candidate) throw new Error("Candidate profile not found");

  const job = await db.job.findUnique({ where: { id: input.jobId } });
  if (!job) throw new Error("Job not found");

  // Layer 1: Select
  const selectedProjects = selectRelevantProjects(candidate.projects, job);
  const selectedSkills = selectRelevantSkills(candidate.skills, job);

  // Build context for LLM
  const projectContext = selectedProjects
    .map((p) => `Project: ${p.name}\nSummary: ${p.shortSummary}\nTech: ${(p.techTags as string[]).join(", ")}\nBullets: ${JSON.stringify(p.bulletBank)}`)
    .join("\n\n");

  const skillContext = selectedSkills
    .map((cs) => `${cs.skill.name} (${cs.proficiency})`)
    .join(", ");

  // Determine role template and emphasis
  const roleTemplate = input.roleFamily || inferRoleTemplate(job.title);
  const emphasisInstruction = input.emphasis && EMPHASIS_PROMPTS[input.emphasis]
    ? `\nEMPHASIS: ${EMPHASIS_PROMPTS[input.emphasis]}`
    : "";

  const userPrompt = `Generate a tailored resume for the following role.

=== TARGET JOB ===
Title: ${job.title}
Required Skills: ${(job.requiredSkills || []).join(", ")}
Nice-to-Have: ${(job.niceToHaveSkills || []).join(", ")}
Keywords: ${(job.keywords || []).join(", ")}
Seniority: ${job.seniority || "Unknown"}
Role Template: ${roleTemplate}

=== CANDIDATE DATA ===
Education: B.Sc. Data Science, Technion
Languages: Hebrew, English
Skills available: ${skillContext}

Selected Projects:
${projectContext}

=== INSTRUCTIONS ===
Generate a resume optimized for this specific job using the "${roleTemplate}" template angle.${emphasisInstruction}
selectedProjectIds should be: ${selectedProjects.map((p) => p.id).join(",")}
selectedSkillIds should be: ${selectedSkills.map((cs) => cs.skillId).join(",")}`;

  // Layer 2: Generate
  const result = await llmStructured({
    systemPrompt: RESUME_SYSTEM_PROMPT,
    userPrompt,
    schema: ResumeGenerationOutputSchema,
    maxTokens: 2000,
    taskName: "resume_generation",
    maxRetries: 2,
  });

  const generated = result.data;

  // Layer 3: Validate — ensure no project IDs were invented
  const validProjectIds = new Set(candidate.projects.map((p) => p.id));
  const validSkillIds = new Set(candidate.skills.map((cs) => cs.skillId));

  const sanitizedProjectIds = generated.selectedProjectIds.filter((id) =>
    validProjectIds.has(id)
  );
  const sanitizedSkillIds = generated.selectedSkillIds.filter((id) =>
    validSkillIds.has(id)
  );

  // Build version name
  const company = await db.company.findUnique({
    where: { id: job.companyId || "" },
  });
  const companySlug = (company?.name || "Company").replace(/\s+/g, "");
  const roleSlug = roleTemplate.replace(/[\s\/]+/g, "");
  const version = await db.resumeVersion.count({
    where: { jobId: job.id, candidateProfileId: input.candidateProfileId },
  });
  const emphasisTag = input.emphasis ? `_${input.emphasis.replace("-", "")}` : "";
  const versionName = `CV_${companySlug}_${roleSlug}${emphasisTag}_v${version + 1}`;

  // Layer 4: Persist
  const saved = await db.resumeVersion.create({
    data: {
      candidateProfileId: input.candidateProfileId,
      jobId: input.jobId,
      name: versionName,
      roleFamily: roleTemplate,
      language: input.language || "en",
      summaryText: generated.summaryText,
      selectedProjectIds: sanitizedProjectIds,
      selectedSkillIds: sanitizedSkillIds,
      insertedKeywords: generated.insertedKeywords,
      bulletVariants: generated.bulletVariants,
      qualityScore: generated.qualityScore,
      qualityIssues: generated.qualityIssues,
      emphasis: input.emphasis || null,
      generationRationale: generated.rationale,
      generationMetadata: {
        model: "claude-sonnet-4-20250514",
        retries: result.retries,
        durationMs: result.durationMs,
        rationale: generated.rationale,
        roleTemplate,
        emphasis: input.emphasis || null,
      },
      status: "DRAFT",
    },
  });

  return {
    id: saved.id,
    name: versionName,
    summaryText: generated.summaryText,
    bulletVariants: generated.bulletVariants,
    insertedKeywords: generated.insertedKeywords,
    qualityScore: generated.qualityScore ?? 0,
    qualityIssues: generated.qualityIssues,
  };
}
