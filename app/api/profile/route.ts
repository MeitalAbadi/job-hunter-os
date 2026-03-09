export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { ProfileUpdateSchema } from "../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function GET() {
  try {
    const context = await getOrCreateSingleUserContext();
    const profile = await db.candidateProfile.findUnique({
      where: { id: context.candidateProfileId },
      include: {
        skills: { include: { skill: true }, orderBy: { priority: "desc" } },
        projects: { orderBy: { displayOrder: "asc" } },
      },
    });

    return NextResponse.json({ profile: profile ?? null });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();

    const data = parsed.data;

    const profile = await db.candidateProfile.upsert({
      where: { userId: context.userId },
      update: {
        fullName: data.fullName,
        headline: data.headline,
        bio: data.bio,
        location: data.location,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
        targetSalaryMin: data.targetSalaryMin,
        targetSalaryIdeal: data.targetSalaryIdeal,
        workModePrefs: data.workModePrefs,
        targetCities: data.targetCities,
        rolePreferences: data.rolePreferences,
        weightSpeed: data.weightSpeed,
        weightFit: data.weightFit,
        weightSalary: data.weightSalary,
        weightUpside: data.weightUpside,
        outreachVoice: data.outreachVoice,
        uniqueAngles: data.uniqueAngles,
        noGoCompanies: data.noGoCompanies,
      },
      create: {
        userId: context.userId,
        fullName: data.fullName,
        headline: data.headline,
        bio: data.bio,
        location: data.location ?? "Israel",
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
        targetSalaryMin: data.targetSalaryMin,
        targetSalaryIdeal: data.targetSalaryIdeal,
        workModePrefs: data.workModePrefs,
        targetCities: data.targetCities,
        rolePreferences: data.rolePreferences,
        weightSpeed: data.weightSpeed,
        weightFit: data.weightFit,
        weightSalary: data.weightSalary,
        weightUpside: data.weightUpside,
        outreachVoice: data.outreachVoice,
        uniqueAngles: data.uniqueAngles,
        noGoCompanies: data.noGoCompanies,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[PUT /api/profile]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
