export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ProfileMemorySkillUpdateSchema } from "../../../../../lib/schemas";
import { updateProfileMemorySkill } from "../../../../../lib/profile-memory/engine";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ProfileMemorySkillUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const skill = await updateProfileMemorySkill(userId, params.id, parsed.data);
    return NextResponse.json({ success: true, skill });
  } catch (error) {
    console.error(`[PATCH /api/profile-memory/skills/${params.id}]`, error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update skill" },
      { status: 400 }
    );
  }
}
