export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { generateResumeVersion } from "../../../lib/resume/engine";
import { z } from "zod";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

const GenerateResumeSchema = z.object({
  jobId: z.string(),
  roleFamily: z.string().optional(),
  language: z.enum(["en", "he"]).default("en"),
  emphasis: z.enum(["analytics-heavy", "ai-heavy", "product-heavy", "engineering-heavy"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateResumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const context = await getOrCreateSingleUserContext();

    const resume = await generateResumeVersion({
      jobId: parsed.data.jobId,
      candidateProfileId: context.candidateProfileId,
      roleFamily: parsed.data.roleFamily,
      language: parsed.data.language,
      emphasis: parsed.data.emphasis,
    });

    return NextResponse.json({ success: true, resume });
  } catch (error) {
    console.error("[POST /api/resumes]", error);
    return NextResponse.json({ error: "Failed to generate resume", detail: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const context = await getOrCreateSingleUserContext();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const resumes = await db.resumeVersion.findMany({
      where: {
        candidateProfileId: context.candidateProfileId,
        ...(jobId && { jobId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        job: { select: { id: true, title: true, company: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("[GET /api/resumes]", error);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}
