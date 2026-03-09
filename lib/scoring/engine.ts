// lib/scoring/engine.ts
// Deterministic scoring engine — Layer 1: rule-based
// LLM explanation — Layer 2: narrative only, does not affect score
// Every score is traceable to specific factors and evidence

import {
  CandidateProfile,
  CandidateSkill,
  Job,
  Prisma,
  Project,
  Skill,
} from "@prisma/client";
import { llmStructured } from "../llm/provider";
import { JobScoreOutputSchema, type JobScoreOutput } from "../schemas";

// ─── Types ───────────────────────────────────────────────────────────────────

type CandidateWithRelations = CandidateProfile & {
  skills: (CandidateSkill & { skill: Skill })[];
  projects: Project[];
};

interface ScoringFactor {
  factor: string;
  score: number;       // 0–100
  weight: number;      // 0–1, factors must sum to 1
  weightedScore: number;
  explanation: string;
  evidence: string[];
  confidence: number;  // 0–1
}

// ─── Role family matching ─────────────────────────────────────────────────────

const ROLE_FAMILY_KEYWORDS: Record<string, string[]> = {
  "Data Scientist": [
    "data scientist", "machine learning", "ml", "statistical", "modeling",
    "scikit-learn", "pytorch", "tensorflow", "xgboost", "prediction", "classification",
  ],
  "AI Engineer": [
    "ai engineer", "llm", "large language model", "nlp", "generative ai",
    "prompt engineering", "rag", "vector", "embedding", "openai", "anthropic",
    "langchain", "fine-tuning",
  ],
  "AI Analyst": [
    "ai analyst", "analytics", "business intelligence", "bi", "reporting",
    "dashboard", "tableau", "power bi", "data analysis", "insights",
  ],
  "Data Analyst": [
    "data analyst", "sql", "excel", "reporting", "kpi", "metrics",
    "analytics", "looker", "dashboard", "stakeholder",
  ],
  "Analytics Engineer": [
    "analytics engineer", "dbt", "data modeling", "data warehouse",
    "snowflake", "bigquery", "redshift", "etl", "elt", "pipeline",
  ],
  "ML Engineer": [
    "ml engineer", "mlops", "model deployment", "inference", "serving",
    "kubernetes", "docker", "feature store", "model monitoring",
  ],
};

function scoreRoleFamily(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const desc = (job.rawDescription + " " + (job.normalizedTitle || "")).toLowerCase();
  const targetRoles = (candidate.rolePreferences as string[]) || [];

  let bestScore = 0;
  const matchedRoles: string[] = [];
  const evidence: string[] = [];

  for (const role of targetRoles) {
    const keywords = ROLE_FAMILY_KEYWORDS[role] || [];
    const matches = keywords.filter((kw) => desc.includes(kw));
    if (matches.length > 0) {
      matchedRoles.push(role);
      evidence.push(...matches.map((m) => `"${m}" found in job`));
      const roleScore = Math.min(100, (matches.length / keywords.length) * 100 * 2);
      bestScore = Math.max(bestScore, roleScore);
    }
  }

  // Direct title match boosts score
  const jobTitle = (job.title || "").toLowerCase();
  for (const role of targetRoles) {
    if (jobTitle.includes(role.toLowerCase())) {
      bestScore = Math.min(100, bestScore + 20);
      evidence.push(`Job title directly matches "${role}"`);
    }
  }

  return {
    factor: "Role Family Alignment",
    score: Math.round(bestScore),
    weight: 0.2,
    weightedScore: Math.round(bestScore * 0.2),
    explanation: matchedRoles.length > 0
      ? `Role aligns with ${matchedRoles.join(", ")}`
      : "Role family alignment unclear",
    evidence: evidence.slice(0, 5),
    confidence: matchedRoles.length > 0 ? 0.85 : 0.4,
  };
}

// ─── Skill matching ───────────────────────────────────────────────────────────

function scoreSkills(
  job: Job,
  candidate: CandidateWithRelations,
  isMustHave: boolean
): ScoringFactor {
  const candidateSkillNames = candidate.skills.map((s) =>
    s.skill.canonicalName.toLowerCase()
  );
  const jobSkills = isMustHave
    ? (job.requiredSkills || [])
    : (job.niceToHaveSkills || []);

  if (jobSkills.length === 0) {
    return {
      factor: isMustHave ? "Must-Have Skills" : "Nice-to-Have Skills",
      score: 60, // neutral when job has no explicit skill list
      weight: isMustHave ? 0.25 : 0.1,
      weightedScore: isMustHave ? 15 : 6,
      explanation: "No explicit skill requirements extracted from job",
      evidence: [],
      confidence: 0.3,
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jobSkills) {
    const skillLower = skill.toLowerCase();
    const isMatch = candidateSkillNames.some(
      (cs) => cs.includes(skillLower) || skillLower.includes(cs)
    );
    if (isMatch) matched.push(skill);
    else missing.push(skill);
  }

  const coverageRatio = matched.length / jobSkills.length;
  const score = Math.round(coverageRatio * 100);

  return {
    factor: isMustHave ? "Must-Have Skills" : "Nice-to-Have Skills",
    score,
    weight: isMustHave ? 0.25 : 0.1,
    weightedScore: Math.round(score * (isMustHave ? 0.25 : 0.1)),
    explanation: `${matched.length}/${jobSkills.length} ${isMustHave ? "required" : "preferred"} skills matched`,
    evidence: [
      ...matched.slice(0, 4).map((s) => `✓ ${s}`),
      ...missing.slice(0, 3).map((s) => `✗ ${s}`),
    ],
    confidence: 0.8,
  };
}

// ─── Seniority matching ───────────────────────────────────────────────────────

function scoreSeniority(job: Job): ScoringFactor {
  const seniority = (job.seniority || "UNKNOWN").toUpperCase();
  const desc = job.rawDescription.toLowerCase();

  // Meital is a recent grad — Junior/Mid is perfect, Senior is stretch
  const seniorityScores: Record<string, number> = {
    JUNIOR: 95,
    MID: 85,
    SENIOR: 50,
    LEAD: 25,
    PRINCIPAL: 10,
    UNKNOWN: 65,
  };

  // Check for junior-friendly signals in description
  const juniorSignals = [
    "entry level", "junior", "new grad", "0-2 years", "1-2 years",
    "recent graduate", "graduate", "junior level", "entry-level",
  ];
  const seniorSignals = [
    "5+ years", "7+ years", "senior", "lead", "principal", "staff",
    "extensive experience", "proven track record",
  ];

  let score = seniorityScores[seniority] ?? 65;
  const evidence: string[] = [`Detected seniority: ${seniority}`];

  for (const signal of juniorSignals) {
    if (desc.includes(signal)) {
      score = Math.min(100, score + 10);
      evidence.push(`Junior-friendly signal: "${signal}"`);
      break;
    }
  }
  for (const signal of seniorSignals) {
    if (desc.includes(signal)) {
      score = Math.max(0, score - 15);
      evidence.push(`Senior requirement signal: "${signal}"`);
      break;
    }
  }

  return {
    factor: "Seniority Match",
    score: Math.round(score),
    weight: 0.1,
    weightedScore: Math.round(score * 0.1),
    explanation: `Job targets ${seniority} level — Meital is a recent Technion grad`,
    evidence,
    confidence: seniority === "UNKNOWN" ? 0.4 : 0.75,
  };
}

// ─── Project relevance ────────────────────────────────────────────────────────

function scoreProjects(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const desc = (job.rawDescription + " " + job.title).toLowerCase();
  const evidence: string[] = [];
  let totalScore = 0;

  for (const project of candidate.projects) {
    const tags = [...(project.techTags || []), ...(project.roleTags || [])];
    const tagMatches = tags.filter((t) => desc.includes(t.toLowerCase()));

    if (tagMatches.length > 0) {
      const projectScore = Math.min(100, tagMatches.length * 20);
      totalScore += projectScore;
      evidence.push(
        `"${project.name}" matches: ${tagMatches.slice(0, 3).join(", ")}`
      );
    }
  }

  const normalizedScore =
    candidate.projects.length > 0
      ? Math.min(100, totalScore / candidate.projects.length)
      : 40;

  return {
    factor: "Project Relevance",
    score: Math.round(normalizedScore),
    weight: 0.15,
    weightedScore: Math.round(normalizedScore * 0.15),
    explanation: `${evidence.length} of ${candidate.projects.length} projects match job domain`,
    evidence: evidence.slice(0, 4),
    confidence: candidate.projects.length > 0 ? 0.75 : 0.3,
  };
}

// ─── Location / work mode ─────────────────────────────────────────────────────

function scoreLocation(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const jobLocation = (job.location || "").toLowerCase();
  const jobWorkMode = job.workMode;
  const preferredModes = (candidate.workModePrefs as string[]).map((m) =>
    m.toLowerCase()
  );
  const targetCities = (candidate.targetCities as string[]).map((c) =>
    c.toLowerCase()
  );

  let score = 70; // neutral default
  const evidence: string[] = [];

  // Work mode check
  if (jobWorkMode) {
    const mode = jobWorkMode.toLowerCase();
    if (preferredModes.includes(mode)) {
      score += 20;
      evidence.push(`Work mode "${mode}" matches preference`);
    } else if (mode === "remote") {
      score += 15;
      evidence.push("Remote option available");
    }
  }

  // City check
  const cityMatch = targetCities.some(
    (city) => city !== "remote" && jobLocation.includes(city)
  );
  if (cityMatch) {
    score += 10;
    evidence.push(`Location "${job.location}" is in target cities`);
  }

  // Israel presence check
  const israelSignals = ["israel", "tel aviv", "herzliya", "haifa", "ramat gan", "petah tikva", "ra'anana"];
  if (israelSignals.some((s) => jobLocation.includes(s))) {
    score += 5;
    evidence.push("Job is in Israel");
  }

  return {
    factor: "Location & Work Mode",
    score: Math.min(100, Math.round(score)),
    weight: 0.05,
    weightedScore: Math.min(5, Math.round(score * 0.05)),
    explanation: `Location: ${job.location || "unspecified"}, Work mode: ${jobWorkMode || "unspecified"}`,
    evidence,
    confidence: jobWorkMode ? 0.85 : 0.5,
  };
}

// ─── Domain relevance ─────────────────────────────────────────────────────────

function scoreDomain(job: Job): ScoringFactor {
  const desc = (job.rawDescription + " " + job.title).toLowerCase();

  // High-value domains for Meital based on her background
  const DOMAIN_SCORES: { keywords: string[]; domain: string; score: number }[] = [
    { domain: "AI/ML Platform", keywords: ["llm", "generative ai", "nlp", "foundation model", "ai platform"], score: 95 },
    { domain: "Data Platform", keywords: ["data platform", "analytics platform", "data infra", "data mesh"], score: 90 },
    { domain: "ProductAnalytics", keywords: ["product analytics", "growth", "experimentation", "a/b testing"], score: 85 },
    { domain: "Cybersecurity", keywords: ["cybersecurity", "cyber", "threat detection", "security"], score: 75 },
    { domain: "Fintech", keywords: ["fintech", "payments", "financial", "banking", "trading"], score: 75 },
    { domain: "Adtech/Martech", keywords: ["adtech", "marketing tech", "advertising", "campaign"], score: 70 },
    { domain: "Healthtech", keywords: ["health tech", "medical", "clinical", "biotech", "pharma"], score: 65 },
    { domain: "E-commerce", keywords: ["e-commerce", "marketplace", "retail", "shopping"], score: 65 },
    { domain: "Infra/DevOps", keywords: ["infrastructure", "devops", "sre", "platform engineering"], score: 55 },
  ];

  let bestMatch = { domain: "General Tech", score: 60 };
  const evidence: string[] = [];

  for (const domainDef of DOMAIN_SCORES) {
    const matches = domainDef.keywords.filter((kw) => desc.includes(kw));
    if (matches.length > 0) {
      evidence.push(`${domainDef.domain}: ${matches.join(", ")}`);
      if (domainDef.score > bestMatch.score) {
        bestMatch = { domain: domainDef.domain, score: domainDef.score };
      }
    }
  }

  return {
    factor: "Domain Relevance",
    score: bestMatch.score,
    weight: 0.1,
    weightedScore: Math.round(bestMatch.score * 0.1),
    explanation: `Domain: ${bestMatch.domain}`,
    evidence,
    confidence: evidence.length > 0 ? 0.75 : 0.4,
  };
}

// ─── Salary scoring ───────────────────────────────────────────────────────────

function scoreSalary(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const salaryMin = job.salaryRangeMin;
  const salaryMax = job.salaryRangeMax;
  const targetIdeal = candidate.targetSalaryIdeal;
  const targetMin = candidate.targetSalaryMin;

  if (!salaryMin && !salaryMax) {
    return {
      factor: "Salary Range",
      score: 60, // neutral when salary not disclosed
      weight: 0.05,
      weightedScore: 3,
      explanation: "Salary not disclosed — common in Israeli high-tech",
      evidence: [],
      confidence: 0.2,
    };
  }

  let score = 70;
  const evidence: string[] = [];

  if (salaryMax && targetIdeal) {
    if (salaryMax >= targetIdeal) {
      score = 95;
      evidence.push(`Max salary ${salaryMax} meets ideal target ${targetIdeal}`);
    } else if (salaryMax >= (targetMin || 0)) {
      score = 70;
      evidence.push(`Salary range is acceptable but below ideal`);
    } else {
      score = 30;
      evidence.push(`Salary ${salaryMax} may be below minimum target`);
    }
  }

  return {
    factor: "Salary Range",
    score: Math.round(score),
    weight: 0.05,
    weightedScore: Math.round(score * 0.05),
    explanation: salaryMin || salaryMax
      ? `Range: ${salaryMin || "?"}–${salaryMax || "?"} ${job.salaryCurrency || ""}`
      : "No salary data",
    evidence,
    confidence: salaryMax ? 0.8 : 0.4,
  };
}

// ─── Recommendation from score ────────────────────────────────────────────────

function getRecommendation(totalScore: number): JobScoreOutput["recommendation"] {
  if (totalScore >= 80) return "STRONG_APPLY";
  if (totalScore >= 65) return "APPLY";
  if (totalScore >= 50) return "STRETCH_APPLY";
  if (totalScore >= 35) return "LOW_PRIORITY";
  return "SKIP";
}

// ─── Candidate priority weights (from profile) ───────────────────────────────

interface PriorityWeights {
  speed: number;
  fit: number;
  salary: number;
  upside: number;
}

function normalizePriorityWeights(candidate: CandidateWithRelations): PriorityWeights {
  const raw = {
    speed: Math.max(0, candidate.weightSpeed ?? 25),
    fit: Math.max(0, candidate.weightFit ?? 30),
    salary: Math.max(0, candidate.weightSalary ?? 25),
    upside: Math.max(0, candidate.weightUpside ?? 20),
  };

  const total = raw.speed + raw.fit + raw.salary + raw.upside;
  if (total <= 0) {
    return { speed: 0.25, fit: 0.3, salary: 0.25, upside: 0.2 };
  }

  return {
    speed: raw.speed / total,
    fit: raw.fit / total,
    salary: raw.salary / total,
    upside: raw.upside / total,
  };
}

function buildFactorWeightMap(priorities: PriorityWeights): Record<string, number> {
  // Fit distribution: role + skills + projects + domain
  // Speed distribution: seniority + location friction
  // Salary distribution: explicit compensation signal
  // Upside distribution: role trajectory + project leverage + domain quality
  const map: Record<string, number> = {
    "Role Family Alignment": priorities.fit * 0.25 + priorities.upside * 0.4,
    "Must-Have Skills": priorities.fit * 0.35,
    "Nice-to-Have Skills": priorities.fit * 0.1,
    "Project Relevance": priorities.fit * 0.2 + priorities.upside * 0.3,
    "Domain Relevance": priorities.fit * 0.1 + priorities.upside * 0.3,
    "Seniority Match": priorities.speed * 0.7,
    "Location & Work Mode": priorities.speed * 0.3,
    "Salary Range": priorities.salary,
  };

  const sum = Object.values(map).reduce((acc, value) => acc + value, 0);
  if (Math.abs(sum - 1) > 0.0001) {
    // Safety normalize in case of future changes.
    Object.keys(map).forEach((key) => {
      map[key] = map[key] / sum;
    });
  }

  return map;
}

// ─── LLM Explanation Layer ────────────────────────────────────────────────────

async function generateLLMExplanation(
  job: Job,
  candidate: CandidateWithRelations,
  factors: ScoringFactor[],
  totalScore: number,
  recommendation: string
): Promise<string> {
  const topFactors = [...factors]
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 4)
    .map((f) => `${f.factor}: ${f.score}/100 — ${f.explanation}`)
    .join("\n");

  const systemPrompt = `You are a senior tech recruiter who specializes in the Israeli high-tech market.
You are analyzing job fit for Meital Abadi, a recent Technion Data Science graduate.
Write concise, honest, actionable explanations of job fit. Be specific. Do not be generic.
Return ONLY a 2-3 sentence explanation. No JSON needed — this is plain text.`;

  const userPrompt = `
Job: ${job.title} at company
Total fit score: ${totalScore}/100
Recommendation: ${recommendation}
Top scoring factors:
${topFactors}

Write a 2-3 sentence explanation of why Meital should or shouldn't apply, 
referencing specific factors. Be direct and actionable.`;

  try {
    const response = await import("../llm/provider").then((m) =>
      m.llmComplete({ systemPrompt, userPrompt, maxTokens: 200, taskName: "score_explanation" })
    );
    return response.text.trim();
  } catch {
    // Explanation failure should not break scoring
    return `Score ${totalScore}/100. Recommendation: ${recommendation}. See factor breakdown for details.`;
  }
}

// ─── Main scoring function ────────────────────────────────────────────────────

export interface ScoringResult {
  totalScore: number;
  recommendation: JobScoreOutput["recommendation"];
  factors: ScoringFactor[];
  strengths: string[];
  risks: string[];
  confidence: number;
  llmExplanation: string;
}

export async function scoreJob(
  job: Job,
  candidate: CandidateWithRelations
): Promise<ScoringResult> {
  // Layer 1: deterministic raw scoring
  const rawFactors: ScoringFactor[] = [
    scoreRoleFamily(job, candidate),
    scoreSkills(job, candidate, true),    // must-have
    scoreSkills(job, candidate, false),   // nice-to-have
    scoreSeniority(job),
    scoreProjects(job, candidate),
    scoreDomain(job),
    scoreLocation(job, candidate),
    scoreSalary(job, candidate),
  ];

  // Apply candidate-specific strategy weights (speed/fit/salary/upside).
  const priorities = normalizePriorityWeights(candidate);
  const factorWeightMap = buildFactorWeightMap(priorities);
  const factors = rawFactors.map((factor) => {
    const weight = factorWeightMap[factor.factor] ?? factor.weight;
    return {
      ...factor,
      weight,
      weightedScore: Math.round(factor.score * weight * 100) / 100,
    };
  });

  // Validate weights sum to ~1 (sanity check)
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.05) {
    console.warn(`[scoring] Weight sum = ${totalWeight}, expected 1.0`);
  }

  const totalScore = Math.round(
    factors.reduce((sum, f) => sum + f.weightedScore, 0)
  );

  const recommendation = getRecommendation(totalScore);
  const avgConfidence =
    factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length;

  const strengths = factors
    .filter((f) => f.score >= 70)
    .map((f) => `${f.factor}: ${f.explanation}`);

  const risks = factors
    .filter((f) => f.score < 45)
    .map((f) => `${f.factor}: ${f.explanation}`);

  // Layer 2: LLM explanation (doesn't affect score)
  const llmExplanation = await generateLLMExplanation(
    job,
    candidate,
    factors,
    totalScore,
    recommendation
  );

  return {
    totalScore,
    recommendation,
    factors,
    strengths,
    risks,
    confidence: Math.round(avgConfidence * 100) / 100,
    llmExplanation,
  };
}

// ─── Convert to Prisma-ready shape ────────────────────────────────────────────

import { computeActionDecision } from "./action-recommendation";
import type { ActionDecision } from "../schemas";

export function scoringResultToDbShape(
  result: ScoringResult,
  jobId: string,
  candidateProfileId: string,
  actionDecision?: ActionDecision
): Prisma.JobScoreUncheckedCreateInput {
  const factorMap = Object.fromEntries(
    result.factors.map((f) => [f.factor, f])
  );

  const getScore = (name: string) => factorMap[name]?.score ?? 0;

  return {
    jobId,
    candidateProfileId,
    totalScore: result.totalScore,
    recommendation: result.recommendation,
    roleFamilyScore: getScore("Role Family Alignment"),
    mustHaveSkillScore: getScore("Must-Have Skills"),
    niceToHaveScore: getScore("Nice-to-Have Skills"),
    seniorityScore: getScore("Seniority Match"),
    projectScore: getScore("Project Relevance"),
    domainScore: getScore("Domain Relevance"),
    locationScore: getScore("Location & Work Mode"),
    salaryScore: getScore("Salary Range"),
    confidence: result.confidence,
    breakdown: result.factors as unknown as Prisma.InputJsonValue,
    strengths: result.strengths,
    risks: result.risks,
    llmExplanation: result.llmExplanation,
    // Action recommendation layer
    actionRecommendation: actionDecision?.actionRecommendation ?? null,
    blockersSummary: actionDecision?.blockersSummary ?? null,
    whyApply: actionDecision?.whyApply ?? null,
    whyNotApply: actionDecision?.whyNotApply ?? null,
    blockers: (actionDecision?.blockers ?? []) as unknown as Prisma.InputJsonValue,
  };
}

// ─── Score + Action Decision combined ────────────────────────────────────────

export async function scoreJobWithAction(
  job: Job,
  candidate: CandidateWithRelations
): Promise<{ scoringResult: ScoringResult; actionDecision: ActionDecision }> {
  const scoringResult = await scoreJob(job, candidate);
  const actionDecision = computeActionDecision(job, candidate, scoringResult);
  return { scoringResult, actionDecision };
}
