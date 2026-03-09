export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { JobsQuerySchema } from "../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = JobsQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
    }

    const q = parsed.data;
    const skip = (q.page - 1) * q.limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: q.isActive !== undefined ? q.isActive : true,
    };

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: "insensitive" } },
        { rawDescription: { contains: q.search, mode: "insensitive" } },
        { company: { name: { contains: q.search, mode: "insensitive" } } },
      ];
    }

    if (q.workMode) {
      where.workMode = q.workMode;
    }

    const context = await getOrCreateSingleUserContext();
    const candidateProfileId = context.candidateProfileId;

    // Score filter requires joining through JobScore
    let jobIds: string[] | undefined;
    if (q.minScore !== undefined || q.recommendation || q.actionRecommendation) {
      const scoreWhere: Record<string, unknown> = {};
      if (candidateProfileId) scoreWhere.candidateProfileId = candidateProfileId;
      if (q.minScore !== undefined) scoreWhere.totalScore = { gte: q.minScore };
      if (q.recommendation) scoreWhere.recommendation = q.recommendation;
      if (q.actionRecommendation) scoreWhere.actionRecommendation = q.actionRecommendation;

      const scores = await db.jobScore.findMany({
        where: scoreWhere,
        select: { jobId: true },
      });
      jobIds = scores.map((s) => s.jobId);
      where.id = { in: jobIds };
    }

    // Determine sort order
    let orderBy: Record<string, unknown>;
    if (q.sortBy === "score" && candidateProfileId) {
      // Sort by score requires post-processing since it's a relation
      // Fetch all and sort in JS for now (acceptable for reasonable job counts)
      orderBy = { createdAt: q.sortDir };
    } else {
      orderBy = { [q.sortBy === "score" ? "createdAt" : q.sortBy]: q.sortDir };
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy,
        skip,
        take: q.limit,
        include: {
          company: { select: { id: true, name: true, stage: true } },
          scores: candidateProfileId
            ? {
                where: { candidateProfileId },
                select: {
                  totalScore: true,
                  recommendation: true,
                  actionRecommendation: true,
                  strengths: true,
                  risks: true,
                  confidence: true,
                  llmExplanation: true,
                  whyApply: true,
                  whyNotApply: true,
                  blockersSummary: true,
                },
              }
            : false,
          _count: { select: { applications: true } },
        },
      }),
      db.job.count({ where }),
    ]);

    // Sort by score if requested
    let sortedJobs = jobs;
    if (q.sortBy === "score") {
      sortedJobs = [...jobs].sort((a, b) => {
        const scoreA = a.scores?.[0]?.totalScore ?? 0;
        const scoreB = b.scores?.[0]?.totalScore ?? 0;
        return q.sortDir === "desc" ? scoreB - scoreA : scoreA - scoreB;
      });
    }

    return NextResponse.json({
      jobs: sortedJobs,
      pagination: {
        total,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(total / q.limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
