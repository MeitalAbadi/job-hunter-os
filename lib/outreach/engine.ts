// lib/outreach/engine.ts
// Networking & referral outreach generation
// Human-in-the-loop design — generates drafts, never sends automatically

import { db } from "../db";
import { llmStructured } from "../llm/provider";
import { OutreachMessageOutputSchema, type OutreachMessageOutput } from "../schemas";
import { CandidateProfile, Job } from "@prisma/client";

const OUTREACH_SYSTEM_PROMPT = `You are a senior recruiting strategist helping Meital Abadi, 
a recent Technion Data Science graduate, navigate the Israeli high-tech job market.

Generate personalized, concise networking messages for the Israeli tech context.
Israeli high-tech culture is direct, relatively informal, and values Technion connections strongly.

RULES:
1. Connection requests: max 300 characters (LinkedIn limit)
2. Follow-up messages: max 500 characters
3. Referral asks: max 600 characters
4. Be specific — reference the person's role and Meital's background
5. Never promise things not substantiated by the candidate's profile
6. Keep tone warm but professional
7. Mention Technion when relevant (it resonates strongly in Israeli tech)
8. Focus on one clear ask per message

Return ONLY valid JSON.`;

export interface OutreachInput {
  companyName: string;
  roleName?: string;
  jobId?: string;
  candidateProfileId: string;
  contextNotes?: string;
}

export async function generateOutreachMessages(
  input: OutreachInput
): Promise<OutreachMessageOutput> {
  const candidate = await db.candidateProfile.findUnique({
    where: { id: input.candidateProfileId },
    include: {
      skills: { include: { skill: true } },
      projects: true,
    },
  });

  if (!candidate) throw new Error("Candidate profile not found");

  let jobContext = "";
  if (input.jobId) {
    const job = await db.job.findUnique({ where: { id: input.jobId } });
    if (job) {
      jobContext = `\nSpecific role: ${job.title}\nRequired skills: ${(job.requiredSkills || []).slice(0, 5).join(", ")}`;
    }
  }

  const topSkills = candidate.skills
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6)
    .map((cs) => cs.skill.name)
    .join(", ");

  const topProjects = candidate.projects
    .slice(0, 3)
    .map((p) => `${p.name} (${(p.techTags as string[]).slice(0, 3).join(", ")})`)
    .join("; ");

  const userPrompt = `Generate outreach messages for:

Target Company: ${input.companyName}
Target Role Family: ${input.roleName || "Data Scientist / AI Engineer"}${jobContext}

Candidate:
- Name: Meital Abadi
- Education: B.Sc. Data Science, Technion (recent graduate)
- Top Skills: ${topSkills}
- Key Projects: ${topProjects}
- Outreach voice: ${(candidate.outreachVoice as string) || "concise, direct, warm"}

Context: ${input.contextNotes || "General networking outreach for the Israeli high-tech market"}

Generate search queries, contact prioritization, and message drafts.`;

  const result = await llmStructured({
    systemPrompt: OUTREACH_SYSTEM_PROMPT,
    userPrompt,
    schema: OutreachMessageOutputSchema,
    maxTokens: 1500,
    taskName: "outreach_generation",
    maxRetries: 2,
  });

  return result.data;
}

// ─── Cover letter generation ──────────────────────────────────────────────────

import { CoverLetterOutputSchema, type CoverLetterOutput } from "../schemas";

const COVER_LETTER_SYSTEM = `You are an expert cover letter writer for Israeli high-tech companies.
Write for Meital Abadi, a Technion Data Science graduate.

RULES:
1. 3 paragraphs: why this role, what you bring, closing with specific ask
2. Reference specific technologies or projects from the candidate's background
3. Keep it concise — Israeli tech companies rarely read long cover letters
4. Email subject: clear and specific, 8-12 words
5. LinkedIn message: conversational, under 300 chars, mention Technion
6. No generic phrases like "I am passionate about..." — be specific
7. Do not fabricate metrics or experiences

Return ONLY valid JSON.`;

export async function generateCoverLetter(
  jobId: string,
  candidateProfileId: string
): Promise<CoverLetterOutput> {
  const candidate = await db.candidateProfile.findUnique({
    where: { id: candidateProfileId },
    include: { skills: { include: { skill: true } }, projects: true },
  });
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!candidate || !job) throw new Error("Candidate or job not found");

  const userPrompt = `Write a cover letter for:

Company: ${job.company?.name || "Company"}
Role: ${job.title}
Required Skills: ${(job.requiredSkills || []).join(", ")}
Job Highlights: ${job.normalizedDescription?.slice(0, 800) || job.rawDescription.slice(0, 800)}

Candidate:
- B.Sc. Data Science, Technion
- Skills: ${candidate.skills.map((cs) => cs.skill.name).slice(0, 10).join(", ")}
- Key Projects:
${candidate.projects.map((p) => `  * ${p.name}: ${p.shortSummary}`).join("\n")}`;

  const result = await llmStructured({
    systemPrompt: COVER_LETTER_SYSTEM,
    userPrompt,
    schema: CoverLetterOutputSchema,
    maxTokens: 1500,
    taskName: "cover_letter",
    maxRetries: 2,
  });

  return result.data;
}
