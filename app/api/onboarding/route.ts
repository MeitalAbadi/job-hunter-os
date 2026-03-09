export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { OnboardingSaveSchema } from "../../../lib/schemas";
import { saveOnboardingState } from "../../../lib/profile-memory/engine";
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

    const [onboarding, snapshot] = await Promise.all([
      db.candidateIntake.findUnique({ where: { userId } }),
      getCandidateKnowledgeSnapshot(userId),
    ]);

    return NextResponse.json({ onboarding, snapshot });
  } catch (error) {
    console.error("[GET /api/onboarding]", error);
    return NextResponse.json({ error: "Failed to fetch onboarding state" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = OnboardingSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const onboarding = await saveOnboardingState(userId, parsed.data);
    const snapshot = await getCandidateKnowledgeSnapshot(userId);

    return NextResponse.json({ success: true, onboarding, snapshot });
  } catch (error) {
    console.error("[POST /api/onboarding]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save onboarding state" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = OnboardingSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const onboarding = await saveOnboardingState(userId, parsed.data);
    const snapshot = await getCandidateKnowledgeSnapshot(userId);

    return NextResponse.json({ success: true, onboarding, snapshot });
  } catch (error) {
    console.error("[PATCH /api/onboarding]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update onboarding state" },
      { status: 400 }
    );
  }
}
