export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ExperienceEpisodeCreateSchema } from "../../../../lib/schemas";
import { createExperienceEpisodeRecord } from "../../../../lib/profile-memory/engine";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ExperienceEpisodeCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const episode = await createExperienceEpisodeRecord(userId, parsed.data);
    return NextResponse.json({ success: true, episode });
  } catch (error) {
    console.error("[POST /api/profile-memory/experience-episodes]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create experience episode" },
      { status: 400 }
    );
  }
}
