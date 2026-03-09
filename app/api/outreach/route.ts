export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/outreach/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateOutreachMessages } from "../../../lib/outreach/engine";
import { z } from "zod";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

const OutreachRequestSchema = z.object({
  companyName: z.string().min(1),
  roleName: z.string().optional(),
  jobId: z.string().optional(),
  contextNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OutreachRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const context = await getOrCreateSingleUserContext();

    const result = await generateOutreachMessages({
      companyName: parsed.data.companyName,
      roleName: parsed.data.roleName,
      jobId: parsed.data.jobId,
      candidateProfileId: context.candidateProfileId,
      contextNotes: parsed.data.contextNotes,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[POST /api/outreach]", error);
    return NextResponse.json(
      { error: "Failed to generate outreach", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
