export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/jobs/batch-ingest/route.ts
// Batch ingestion: parse raw text -> split -> extract -> dedup -> score -> save
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BatchIngestInputSchema } from "../../../../lib/schemas";
import { parseTelegramBatch } from "../../../../lib/adapters/jobs/telegram-batch";
import { ingestJob } from "../../../../lib/adapters/jobs/ingest";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";
import { shouldAutoGenerateResume } from "../../../../lib/scoring/action-recommendation";
import { generateResumeVersion } from "../../../../lib/resume/engine";

// POST /api/jobs/batch-ingest?action=parse  → parse only, return candidates
// POST /api/jobs/batch-ingest?action=save   → save selected candidates
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "parse";
    const body = await request.json();

    if (action === "parse") {
      return handleParse(body);
    } else if (action === "save") {
      return handleSave(body);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[POST /api/jobs/batch-ingest]", error);
    return NextResponse.json(
      { error: "Batch ingestion failed", detail: (error as Error).message },
      { status: 500 }
    );
  }
}

async function handleParse(body: unknown) {
  const parsed = BatchIngestInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const source = parsed.data.source === "TELEGRAM" ? "telegram" : "manual";
  const result = await parseTelegramBatch(parsed.data.rawBatchText, source as "telegram" | "manual");

  return NextResponse.json({
    success: true,
    ...result,
  });
}

async function handleSave(body: unknown) {
  const saveSchema = BatchIngestInputSchema.extend({
    selectedIndices: z.array(z.number().int().nonnegative()),
  });

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid save input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const context = await getOrCreateSingleUserContext();
  const source = parsed.data.source === "TELEGRAM" ? "telegram" : "manual";

  // Re-parse to get candidates
  const parseResult = await parseTelegramBatch(parsed.data.rawBatchText, source as "telegram" | "manual");

  const results: Array<{
    index: number;
    jobId?: string;
    isNew: boolean;
    isDuplicate: boolean;
    error?: string;
    actionRecommendation?: string;
    resumeGenerated?: boolean;
  }> = [];

  for (const idx of parsed.data.selectedIndices) {
    if (idx >= parseResult.candidates.length) {
      results.push({ index: idx, isNew: false, isDuplicate: false, error: "Index out of range" });
      continue;
    }

    const candidate = parseResult.candidates[idx];

    // Skip already known duplicates
    if (candidate.isDuplicate) {
      results.push({
        index: idx,
        jobId: candidate.duplicateOfJobId,
        isNew: false,
        isDuplicate: true,
      });
      continue;
    }

    try {
      const ingestResult = await ingestJob(
        {
          rawText: candidate.rawText,
          source: parsed.data.source === "TELEGRAM" ? "TELEGRAM" : "MANUAL_PASTE",
          sourceUrl: candidate.possibleExternalLinks[0] || "",
          companyNameHint: candidate.company !== "Unknown Company" ? candidate.company : undefined,
        },
        context.candidateProfileId
      );

      // Auto-generate resume for jobs that pass the filter
      let resumeGenerated = false;
      if (
        ingestResult.isNew &&
        ingestResult.actionRecommendation &&
        shouldAutoGenerateResume(ingestResult.actionRecommendation as any)
      ) {
        try {
          await generateResumeVersion({
            jobId: ingestResult.jobId,
            candidateProfileId: context.candidateProfileId,
          });
          resumeGenerated = true;
        } catch (err) {
          console.error(`[batch-ingest] Resume generation failed for job ${ingestResult.jobId}:`, err);
        }
      }

      results.push({
        index: idx,
        jobId: ingestResult.jobId,
        isNew: ingestResult.isNew,
        isDuplicate: ingestResult.isDuplicate,
        actionRecommendation: ingestResult.actionRecommendation,
        resumeGenerated,
      });
    } catch (err) {
      results.push({
        index: idx,
        isNew: false,
        isDuplicate: false,
        error: (err as Error).message,
      });
    }
  }

  const saved = results.filter((r) => r.isNew).length;
  const duplicates = results.filter((r) => r.isDuplicate).length;
  const errors = results.filter((r) => r.error).length;
  const resumesGenerated = results.filter((r) => r.resumeGenerated).length;

  return NextResponse.json({
    success: true,
    summary: { saved, duplicates, errors, resumesGenerated, total: parsed.data.selectedIndices.length },
    results,
  });
}
