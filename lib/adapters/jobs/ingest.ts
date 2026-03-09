// lib/adapters/jobs/ingest.ts
// Converts raw job text/URLs into normalized Job records
// Server-side only

import { db } from "../../db";
import { llmStructured, LLMValidationError } from "../../llm/provider";
import { JobExtractionOutputSchema, type JobExtractionOutput, ManualJobIngest } from "../../schemas";
import { scoreJobWithAction, scoringResultToDbShape } from "../../scoring/engine";
import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IngestResult {
  jobId: string;
  isNew: boolean;
  isDuplicate: boolean;
  scoreId?: string;
  actionRecommendation?: string;
  extracted: JobExtractionOutput;
}

export interface IngestError {
  error: string;
  detail?: string;
}

// ─── Job Extraction via LLM ───────────────────────────────────────────────────

const JOB_EXTRACTION_SYSTEM = `You are a structured job description parser for the Israeli high-tech market.
Extract all relevant structured information from a job posting.
Be precise. If a field is not found in the description, omit it or use null.
Do NOT invent information not present in the source text.
For salaryRange, use monthly ILS values if possible, or annual values — note the currency.
For seniority, map to: JUNIOR (0-2yr), MID (2-5yr), SENIOR (5+yr), LEAD, PRINCIPAL, or UNKNOWN.
For workMode, use: ONSITE, HYBRID, REMOTE, or FLEXIBLE.
For employment type: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP.`;

async function extractJobData(
  rawText: string,
  companyNameHint?: string
): Promise<JobExtractionOutput> {
  const userPrompt = `Parse the following job description and return structured JSON:

${companyNameHint ? `Company hint: ${companyNameHint}\n\n` : ""}
=== JOB DESCRIPTION ===
${rawText.slice(0, 15000)}
=== END ===`;

  const result = await llmStructured({
    systemPrompt: JOB_EXTRACTION_SYSTEM,
    userPrompt,
    schema: JobExtractionOutputSchema,
    maxTokens: 1500,
    taskName: "job_extraction",
    maxRetries: 2,
    repairPrompt:
      "The previous response was not valid JSON. Return ONLY the JSON object, no markdown, no explanation.",
  });

  return result.data;
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function buildDedupHash(
  companyName: string,
  title: string,
  location?: string
): string {
  const normalized = `${companyName.toLowerCase().trim()}_${title.toLowerCase().trim()}_${(location || "").toLowerCase().trim()}`;
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

// ─── Company upsert ───────────────────────────────────────────────────────────

async function upsertCompany(name: string): Promise<string> {
  const existing = await db.company.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) return existing.id;

  const created = await db.company.create({
    data: { name, israelPresence: true },
  });

  return created.id;
}

// ─── Main ingest function ─────────────────────────────────────────────────────

export async function ingestJob(
  input: ManualJobIngest,
  candidateProfileId: string
): Promise<IngestResult> {
  // Step 1: Extract structured data
  const extracted = await extractJobData(input.rawText, input.companyNameHint);

  // Step 2: Check for duplicate
  const dedupHash = buildDedupHash(
    extracted.companyName,
    extracted.title,
    extracted.location
  );

  const existing = await db.job.findFirst({
    where: { dedupHash },
  });

  if (existing) {
    return {
      jobId: existing.id,
      isNew: false,
      isDuplicate: true,
      extracted,
    };
  }

  // Step 3: Upsert company
  const companyId = await upsertCompany(extracted.companyName);

  // Step 4: Create job record
  const job = await db.job.create({
    data: {
      companyId,
      title: extracted.title,
      normalizedTitle: extracted.title,
      rawDescription: input.rawText,
      normalizedDescription: extracted.normalizedDescription,
      source: input.source,
      sourceUrl: input.sourceUrl || null,
      atsPlatform: extracted.atsPlatform || null,
      externalId: extracted.externalId || null,
      location: extracted.location || null,
      workMode: extracted.workMode || null,
      employmentType: extracted.employmentType || null,
      salaryRangeMin: extracted.salaryRangeMin || null,
      salaryRangeMax: extracted.salaryRangeMax || null,
      salaryCurrency: extracted.salaryCurrency || null,
      requiredSkills: extracted.requiredSkills,
      niceToHaveSkills: extracted.niceToHaveSkills,
      keywords: extracted.keywords,
      seniority: extracted.seniority || null,
      isActive: true,
      postedAt: extracted.postedAt ? new Date(extracted.postedAt) : null,
      dedupHash,
    },
  });

  // Step 5: Score the job with action recommendation
  let scoreId: string | undefined;
  let actionRecommendation: string | undefined;
  try {
    const candidateWithRelations = await db.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      include: {
        skills: { include: { skill: true } },
        projects: true,
      },
    });

    if (candidateWithRelations) {
      const { scoringResult, actionDecision } = await scoreJobWithAction(job, candidateWithRelations);
      const dbScore = scoringResultToDbShape(scoringResult, job.id, candidateProfileId, actionDecision);

      const savedScore = await db.jobScore.create({ data: dbScore });
      scoreId = savedScore.id;
      actionRecommendation = actionDecision.actionRecommendation;
    }
  } catch (err) {
    console.error("[ingest] Scoring failed — job saved but not scored:", err);
  }

  // Step 6: Log ingestion run
  await db.ingestionRun.create({
    data: {
      sourceName: input.source,
      status: "COMPLETED",
      recordsFound: 1,
      recordsCreated: 1,
      recordsUpdated: 0,
      completedAt: new Date(),
      logs: [{ timestamp: new Date().toISOString(), jobId: job.id, action: "created" }],
    },
  });

  return {
    jobId: job.id,
    isNew: true,
    isDuplicate: false,
    scoreId,
    actionRecommendation,
    extracted,
  };
}

// ─── Exported helpers for batch ingestion ────────────────────────────────────

export { extractJobData, buildDedupHash, upsertCompany };
