export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/daily-queue/route.ts
import { NextResponse } from "next/server";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";
import { getDailyQueueData } from "../../../lib/daily-queue/selectors";

export async function GET() {
  try {
    const context = await getOrCreateSingleUserContext();
    const data = await getDailyQueueData(context.candidateProfileId);

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("[GET /api/daily-queue]", error);
    return NextResponse.json(
      { error: "Failed to load daily queue", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
