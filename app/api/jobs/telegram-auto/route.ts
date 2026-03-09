export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/jobs/telegram-auto/route.ts
// Automated Telegram channel scraping endpoint
// Called by scheduled task or manually to scrape & ingest new jobs

import { NextRequest, NextResponse } from "next/server";
import { scrapeTelegramChannel } from "../../../../lib/adapters/jobs/telegram-scraper";
import { ingestJob } from "../../../../lib/adapters/jobs/ingest";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";
import { shouldAutoGenerateResume } from "../../../../lib/scoring/action-recommendation";
import { generateResumeVersion } from "../../../../lib/resume/engine";
import { db } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Optional auth token for scheduled task security
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.AUTOMATION_SECRET;
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await getOrCreateSingleUserContext();

    // Step 1: Scrape the channel
    const scrapeResult = await scrapeTelegramChannel();

    if (scrapeResult.errors.length > 0 && scrapeResult.jobs.length === 0) {
      return NextResponse.json({
        success: false,
        errors: scrapeResult.errors,
        scrapedAt: scrapeResult.scrapedAt,
      }, { status: 500 });
    }

    // Step 2: Ingest only new jobs
    const newJobs = scrapeResult.jobs.filter((j) => j.isNew);

    const ingestResults: Array<{
      title: string;
      company: string;
      jobId?: string;
      actionRecommendation?: string;
      resumeGenerated: boolean;
      error?: string;
    }> = [];

    let resumesGenerated = 0;
    let ingested = 0;
    let failed = 0;

    for (const job of newJobs) {
      try {
        const result = await ingestJob(
          {
            rawText: job.rawText,
            source: "TELEGRAM",
            sourceUrl: job.externalUrl,
            companyNameHint: job.company !== "Unknown Company" ? job.company : undefined,
          },
          context.candidateProfileId
        );

        // Update telegram-specific metadata
        if (result.jobId) {
          await db.job.update({
            where: { id: result.jobId },
            data: {
              telegramMessageId: job.telegramMessageId,
              telegramChannelId: "secretdatajobs",
            },
          });
        }

        // Auto-generate resume for qualifying jobs
        let resumeGenerated = false;
        if (
          result.isNew &&
          result.actionRecommendation &&
          shouldAutoGenerateResume(result.actionRecommendation as any)
        ) {
          try {
            await generateResumeVersion({
              jobId: result.jobId,
              candidateProfileId: context.candidateProfileId,
            });
            resumeGenerated = true;
            resumesGenerated++;
          } catch (err) {
            console.error(
              `[telegram-auto] Resume generation failed for ${job.title} @ ${job.company}:`,
              err
            );
          }
        }

        ingested++;
        ingestResults.push({
          title: job.title,
          company: job.company,
          jobId: result.jobId,
          actionRecommendation: result.actionRecommendation,
          resumeGenerated,
        });
      } catch (err) {
        failed++;
        ingestResults.push({
          title: job.title,
          company: job.company,
          resumeGenerated: false,
          error: (err as Error).message,
        });
      }
    }

    // Step 3: Log the ingestion run
    await db.ingestionRun.create({
      data: {
        sourceName: "TELEGRAM_AUTO",
        status: failed === 0 ? "COMPLETED" : failed === newJobs.length ? "FAILED" : "PARTIAL",
        recordsFound: scrapeResult.totalScraped,
        recordsCreated: ingested,
        recordsSkipped: scrapeResult.duplicates,
        errorCount: failed,
        completedAt: new Date(),
        logs: JSON.stringify({
          scrapedAt: scrapeResult.scrapedAt,
          scrapeErrors: scrapeResult.errors,
          ingestResults,
          durationMs: Date.now() - startTime,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalScraped: scrapeResult.totalScraped,
        newJobsFound: scrapeResult.newJobs,
        duplicatesSkipped: scrapeResult.duplicates,
        ingested,
        failed,
        resumesGenerated,
        durationMs: Date.now() - startTime,
      },
      scrapeErrors: scrapeResult.errors,
      results: ingestResults,
    });
  } catch (error) {
    console.error("[POST /api/jobs/telegram-auto]", error);
    return NextResponse.json(
      { error: "Telegram auto-ingestion failed", detail: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint to check last run status
export async function GET() {
  try {
    const lastRun = await db.ingestionRun.findFirst({
      where: { sourceName: "TELEGRAM_AUTO" },
      orderBy: { startedAt: "desc" },
    });

    const totalTelegramJobs = await db.job.count({
      where: { source: "TELEGRAM" },
    });

    return NextResponse.json({
      lastRun: lastRun
        ? {
            status: lastRun.status,
            startedAt: lastRun.startedAt,
            completedAt: lastRun.completedAt,
            recordsFound: lastRun.recordsFound,
            recordsCreated: lastRun.recordsCreated,
            recordsSkipped: lastRun.recordsSkipped,
            errorCount: lastRun.errorCount,
          }
        : null,
      totalTelegramJobs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get status", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
