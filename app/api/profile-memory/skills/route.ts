export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ProfileMemorySkillCreateSchema } from "../../../../lib/schemas";
import { createProfileMemorySkill } from "../../../../lib/profile-memory/engine";
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
    const parsed = ProfileMemorySkillCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const skill = await createProfileMemorySkill(userId, parsed.data);
    return NextResponse.json({ success: true, skill });
  } catch (error) {
    console.error("[POST /api/profile-memory/skills]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create skill" },
      { status: 400 }
    );
  }
}
