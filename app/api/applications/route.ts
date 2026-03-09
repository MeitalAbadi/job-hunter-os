export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { ApplicationCreateSchema } from "../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function GET(request: NextRequest) {
  try {
    const context = await getOrCreateSingleUserContext();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {
      candidateProfileId: context.candidateProfileId,
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { company: { name: { contains: search, mode: "insensitive" } } },
        { job: { title: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
          job: {
            select: {
              id: true,
              title: true,
              workMode: true,
              location: true,
              scores: {
                select: { totalScore: true, recommendation: true },
                take: 1,
              },
            },
          },
          resumeVersion: { select: { id: true, name: true } },
          stageEvents: {
            orderBy: { eventAt: "desc" },
            take: 5,
          },
        },
      }),
      db.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ApplicationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();

    const data = parsed.data;

    // Upsert company if needed
    let companyId = data.companyId;
    if (!companyId && data.companyName) {
      const company = await db.company.upsert({
        where: { name: data.companyName },
        update: {},
        create: { name: data.companyName, israelPresence: true },
      });
      companyId = company.id;
    }

    const application = await db.application.create({
      data: {
        candidateProfileId: context.candidateProfileId,
        companyId: companyId || null,
        jobId: data.jobId || null,
        resumeVersionId: data.resumeVersionId || null,
        status: data.status,
        priority: data.priority,
        sourceUrl: data.sourceUrl || null,
        notes: data.notes || null,
        salaryExpected: data.salaryExpected || null,
        recruiterName: data.recruiterName || null,
        recruiterEmail: data.recruiterEmail || null,
        followUpDueAt: data.followUpDueAt ? new Date(data.followUpDueAt) : null,
        nextAction: data.nextAction || null,
        appliedAt: data.status === "APPLIED" ? new Date() : null,
      },
      include: {
        company: true,
        job: true,
        stageEvents: true,
      },
    });

    // Create initial stage event
    await db.applicationStageEvent.create({
      data: {
        applicationId: application.id,
        stageName: data.status,
        notes: "Application created",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("[POST /api/applications]", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
