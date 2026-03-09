export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ProfileMemoryUpdateSchema } from "../../../lib/schemas";
import { updateProfileMemoryIntake } from "../../../lib/profile-memory/engine";
import { getCandidateKnowledgeSnapshot } from "../../../lib/profile-memory/selectors";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await getCandidateKnowledgeSnapshot(userId);
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("[GET /api/profile-memory]", error);
    return NextResponse.json({ error: "Failed to fetch profile memory" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ProfileMemoryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const onboarding = await updateProfileMemoryIntake(userId, parsed.data);
    const snapshot = await getCandidateKnowledgeSnapshot(userId);

    return NextResponse.json({ success: true, onboarding, snapshot });
  } catch (error) {
    console.error("[PATCH /api/profile-memory]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update profile memory" },
      { status: 400 }
    );
  }
}
