import { db } from "../../../lib/db";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getAnalytics() {
  const context = await getOrCreateSingleUserContext();
  const candidateProfileId = context.candidateProfileId;
  const [scores, apps, interviews, offers, responses] = await Promise.all([
    db.jobScore.findMany({
      where: { candidateProfileId },
      select: { totalScore: true, recommendation: true },
    }),
    db.application.findMany({
      where: { candidateProfileId },
      select: { status: true, createdAt: true },
    }),
    db.application.count({
      where: {
        candidateProfileId,
        status: { in: ["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW"] },
      },
    }),
    db.application.count({
      where: { candidateProfileId, status: { in: ["OFFER", "ACCEPTED"] } },
    }),
    db.application.count({
      where: {
        candidateProfileId,
        status: {
          in: [
            "RECRUITER_SCREEN",
            "TECHNICAL_INTERVIEW",
            "CASE_STUDY",
            "FINAL_INTERVIEW",
            "OFFER",
            "ACCEPTED",
          ],
        },
      },
    }),
  ]);

  const totalJobsScored = scores.length;
  const totalApplied = apps.filter((a) => a.status !== "WISHLIST").length;
  const strongApply = scores.filter((s) => s.recommendation === "STRONG_APPLY").length;
  const avgScore =
    totalJobsScored > 0
      ? Math.round((scores.reduce((sum, s) => sum + s.totalScore, 0) / totalJobsScored) * 10) / 10
      : 0;

  const responseRate =
    totalApplied > 0 ? Math.round((responses / totalApplied) * 1000) / 10 : 0;
  const interviewRate =
    totalApplied > 0 ? Math.round((interviews / totalApplied) * 1000) / 10 : 0;
  const offerRate =
    totalApplied > 0 ? Math.round((offers / totalApplied) * 1000) / 10 : 0;

  return {
    totalJobsScored,
    strongApply,
    avgScore,
    totalApplied,
    responseRate,
    interviewRate,
    offerRate,
  };
}

function StatCard(props: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="jh-card" style={{ borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: props.color || "var(--accent)" }}>
        {props.value}
      </div>
      <div style={{ fontSize: 12, marginTop: 6 }}>{props.label}</div>
      {props.sub ? (
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{props.sub}</div>
      ) : null}
    </div>
  );
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  if (!analytics) {
    return (
      <div style={{ padding: 28 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Analytics</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Complete your profile and add data to unlock conversion analytics.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="jh-page-header">
        <div>
          <h1 className="jh-page-title">Analytics</h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            Conversion and quality signals for your job search funnel
          </p>
        </div>
      </div>

      <div className="jh-inline-grid" style={{ padding: 24 }}>
        <StatCard label="Jobs Scored" value={analytics.totalJobsScored} sub={`${analytics.strongApply} strong apply`} />
        <StatCard label="Average Fit Score" value={analytics.avgScore} sub="deterministic engine" />
        <StatCard label="Applications" value={analytics.totalApplied} sub="excluding wishlist" color="var(--purple)" />
        <StatCard label="Response Rate" value={`${analytics.responseRate}%`} sub="screen/interview+" color="var(--green)" />
        <StatCard label="Interview Rate" value={`${analytics.interviewRate}%`} sub="applied -> interview" color="var(--yellow)" />
        <StatCard label="Offer Rate" value={`${analytics.offerRate}%`} sub="applied -> offer" color="var(--green)" />
      </div>
    </div>
  );
}
