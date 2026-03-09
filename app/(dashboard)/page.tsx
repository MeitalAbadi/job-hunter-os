// app/(dashboard)/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "../../lib/db";
import Link from "next/link";

async function getDashboardData(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    include: { candidateProfile: true },
  });

  if (!user?.candidateProfile) {
    return { profile: null, stats: null, recentApps: [] };
  }

  const profileId = user.candidateProfile.id;

  const [totalJobs, scoredJobs, appsByStatus, recentApps, followUpsDue] = await Promise.all([
    db.job.count({ where: { isActive: true } }),
    db.jobScore.findMany({
      where: { candidateProfileId: profileId },
      select: { recommendation: true, totalScore: true },
    }),
    db.application.groupBy({
      by: ["status"],
      where: { candidateProfileId: profileId },
      _count: true,
    }),
    db.application.findMany({
      where: { candidateProfileId: profileId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        company: { select: { name: true } },
        job: { select: { title: true } },
      },
    }),
    db.application.count({
      where: {
        candidateProfileId: profileId,
        followUpDueAt: { lte: new Date() },
        status: { notIn: ["REJECTED", "ACCEPTED", "WITHDRAWN"] },
      },
    }),
  ]);

  const strongApply = scoredJobs.filter((s) => s.recommendation === "STRONG_APPLY").length;
  const totalApps = appsByStatus.reduce((sum, s) => sum + s._count, 0);
  const activeApps = appsByStatus
    .filter((s) => !["REJECTED", "ACCEPTED", "WITHDRAWN"].includes(s.status))
    .reduce((sum, s) => sum + s._count, 0);
  const offers = appsByStatus.find((s) => s.status === "OFFER")?._count || 0;
  const interviews = appsByStatus
    .filter((s) => ["TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW"].includes(s.status))
    .reduce((sum, s) => sum + s._count, 0);

  return {
    profile: user.candidateProfile,
    stats: { totalJobs, strongApply, totalApps, activeApps, offers, interviews, followUpsDue },
    recentApps,
  };
}

const STATUS_COLORS: Record<string, string> = {
  WISHLIST: "#6b7280", APPLIED: "#00d4ff", RECRUITER_SCREEN: "#8b5cf6",
  TECHNICAL_INTERVIEW: "#f59e0b", CASE_STUDY: "#f97316", FINAL_INTERVIEW: "#06b6d4",
  OFFER: "#22c55e", ACCEPTED: "#16a34a", REJECTED: "#ef4444", WITHDRAWN: "#6b7280", ON_HOLD: "#eab308",
};
const STATUS_LABELS: Record<string, string> = {
  WISHLIST: "Wishlist", APPLIED: "Applied", RECRUITER_SCREEN: "Recruiter Screen",
  TECHNICAL_INTERVIEW: "Technical Interview", CASE_STUDY: "Case Study", FINAL_INTERVIEW: "Final Interview",
  OFFER: "Offer", ACCEPTED: "Accepted", REJECTED: "Rejected", WITHDRAWN: "Withdrawn", ON_HOLD: "On Hold",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { profile, stats, recentApps } = await getDashboardData(session!.user!.email!);

  if (!profile) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>◉</div>
        <h2 style={{ color: "var(--accent)", marginBottom: 8, fontFamily: "var(--font-display)" }}>
          Set up your profile first
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
          Before the system can work for you, it needs to know who you are.
        </p>
        <Link
          href="/onboarding"
          className="jh-button jh-button-primary"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            color: "white",
            textDecoration: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 12,
            border: "none",
            fontFamily: "var(--font-mono)",
            letterSpacing: 1,
          }}
        >
          Start Onboarding →
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="jh-page-header">
        <div>
          <h1 className="jh-page-title">Command Center</h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            Your momentum hub, {profile.fullName}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/jobs"
            className="jh-button jh-button-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              color: "white",
              border: "none",
              textDecoration: "none",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              fontFamily: "var(--font-mono)",
            }}
          >
            ◎ Add Job
          </Link>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Alerts */}
        {stats && stats.followUpsDue > 0 && (
          <div style={{
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 8, padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 13, color: "#f59e0b" }}>
              {stats.followUpsDue} application{stats.followUpsDue > 1 ? "s" : ""} need follow-up
            </span>
            <Link href="/applications?filter=followup" style={{ marginLeft: "auto", fontSize: 11, color: "#f59e0b", textDecoration: "none" }}>
              View →
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="jh-inline-grid" style={{ marginBottom: 24 }}>
            {[
              { label: "Jobs in Inbox", val: stats.totalJobs, sub: `${stats.strongApply} strong match`, color: "var(--accent)", href: "/jobs" },
              { label: "Active Pipeline", val: stats.activeApps, sub: `${stats.totalApps} total applied`, color: "var(--purple)", href: "/applications" },
              { label: "Interviews", val: stats.interviews, sub: "technical or final", color: "var(--yellow)", href: "/applications" },
              { label: "Offers", val: stats.offers, sub: stats.offers > 0 ? "🎉 Congratulations!" : "keep pushing", color: "var(--green)", href: "/applications" },
            ].map((stat) => (
              <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
                <div
                  className="jh-card"
                  style={{
                    borderRadius: 16,
                    padding: 18,
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ fontSize: 36, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                    {stat.val}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", marginTop: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{stat.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {/* Recent Applications */}
          <div className="jh-card" style={{ borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Recent Applications</span>
              <Link href="/applications" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>View all →</Link>
            </div>
            {recentApps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 12 }}>
                No applications yet.<br />
                <Link href="/jobs" style={{ color: "var(--accent)", textDecoration: "none" }}>Find jobs →</Link>
              </div>
            ) : (
              recentApps.map((app) => (
                <div key={app.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 0", borderBottom: "1px solid var(--border-subtle)",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: STATUS_COLORS[app.status] || "#6b7280",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {app.company?.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {app.job?.title}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9, color: STATUS_COLORS[app.status] || "#6b7280",
                    background: (STATUS_COLORS[app.status] || "#6b7280") + "15",
                    border: `1px solid ${STATUS_COLORS[app.status] || "#6b7280"}30`,
                    borderRadius: 3, padding: "1px 6px", whiteSpace: "nowrap",
                  }}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* System Modules */}
          <div className="jh-card" style={{ borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16 }}>Active Modules</div>
            {[
              { href: "/jobs", icon: "◎", label: "Job Analyzer", desc: "Ingest & score jobs", status: "active" },
              { href: "/resumes", icon: "▤", label: "Resume Engine", desc: "Generate tailored CVs", status: "active" },
              { href: "/outreach", icon: "⬡", label: "Outreach Scout", desc: "Networking & referrals", status: "active" },
              { href: "/applications", icon: "◈", label: "CRM Tracker", desc: "Application pipeline", status: "active" },
              { href: "/analytics", icon: "▲", label: "Analytics", desc: "Learning loop", status: "beta" },
            ].map((mod) => (
              <Link key={mod.href} href={mod.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 0", borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}>
                  <span style={{ color: "var(--accent)", fontSize: 14, width: 20, textAlign: "center" }}>{mod.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{mod.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{mod.desc}</div>
                  </div>
                  <span style={{
                    fontSize: 9, letterSpacing: 1,
                    color: mod.status === "active" ? "var(--green)" : "var(--yellow)",
                    background: mod.status === "active" ? "var(--green-dim)" : "var(--yellow-dim)",
                    border: `1px solid ${mod.status === "active" ? "var(--green)" : "var(--yellow)"}30`,
                    borderRadius: 3, padding: "2px 6px",
                  }}>
                    {mod.status.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
