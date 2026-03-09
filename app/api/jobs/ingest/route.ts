export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/jobs/ingest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ingestJob } from "../../../../lib/adapters/jobs/ingest";
import { ManualJobIngestSchema } from "../../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ManualJobIngestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();
    const result = await ingestJob(parsed.data, context.candidateProfileId);

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      isNew: result.isNew,
      isDuplicate: result.isDuplicate,
      extracted: result.extracted,
      scoreId: result.scoreId,
    });
  } catch (error) {
    console.error("[POST /api/jobs/ingest]", error);
    return NextResponse.json(
      { error: "Failed to ingest job", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
