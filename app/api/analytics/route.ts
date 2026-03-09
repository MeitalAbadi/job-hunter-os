export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";
import {
  getConversionMetrics,
  getBreakdownBySource,
  getBreakdownByRoleFamily,
  getBreakdownByResumeTemplate,
  getOutreachImpact,
  getAdvisoryInsights,
} from "../../../lib/analytics/queries";

export async function GET() {
  try {
    const context = await getOrCreateSingleUserContext();
    const cpId = context.candidateProfileId;

    const [metrics, bySource, byRole, byTemplate, outreach, insights] = await Promise.all([
      getConversionMetrics(cpId),
      getBreakdownBySource(cpId),
      getBreakdownByRoleFamily(cpId),
      getBreakdownByResumeTemplate(cpId),
      getOutreachImpact(cpId),
      getAdvisoryInsights(cpId),
    ]);

    return NextResponse.json({
      success: true,
      metrics,
      breakdowns: { bySource, byRole, byTemplate },
      outreach,
      insights,
    });
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
