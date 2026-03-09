"use client";
// app/(dashboard)/daily-queue/page.tsx
// Execution-focused daily action dashboard

import { useState, useEffect } from "react";
import { PageHeader, Card, Button, Label, Tag, ScoreBadge, EmptyState, StatusBadge } from "../../../components/ui";

interface QueueJob {
  id: string;
  title: string;
  company: { id: string; name: string } | null;
  location: string | null;
  workMode: string | null;
  score: number;
  actionRecommendation: string | null;
  whyApply: string | null;
  blockersSummary: string | null;
  outreachStatus: string;
  hasResume: boolean;
  hasApplication: boolean;
  createdAt: string;
  sourceUrl: string | null;
}

interface FollowUp {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  lastStageDate: string;
  daysSinceUpdate: number;
  recruiterName: string | null;
  nextAction: string | null;
}

interface StaleOpp {
  id: string;
  title: string;
  company: string | null;
  score: number;
  actionRecommendation: string | null;
  daysSinceIngestion: number;
}

const ACTION_COLORS: Record<string, string> = {
  APPLY_NOW: "#22c55e",
  APPLY_THIS_WEEK: "#00d4ff",
  STRETCH_APPLY: "#f59e0b",
  OPTIONAL: "#6b7280",
  SKIP_ONLY_IF_CLEAR_BLOCKER: "#ef4444",
};

const ACTION_LABELS: Record<string, string> = {
  APPLY_NOW: "Apply Now",
  APPLY_THIS_WEEK: "Apply This Week",
  STRETCH_APPLY: "Stretch Apply",
  OPTIONAL: "Optional",
  SKIP_ONLY_IF_CLEAR_BLOCKER: "Skip (Blockers)",
};

function JobCard({ job, onAction }: { job: QueueJob; onAction: (action: string, jobId: string) => void }) {
  const actionColor = job.actionRecommendation ? ACTION_COLORS[job.actionRecommendation] || "#6b7280" : "#6b7280";

  return (
    <div style={{
      padding: "14px 16px",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{job.title}</div>
          <ScoreBadge score={job.score} recommendation={job.actionRecommendation || "APPLY"} />
        </div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>
          {job.company?.name || "Unknown"}{job.location && ` · ${job.location}`}
        </div>
        {job.whyApply && (
          <div style={{ fontSize: 10, color: "var(--green)", marginBottom: 4, lineHeight: 1.4 }}>
            {job.whyApply.slice(0, 120)}
          </div>
        )}
        {job.actionRecommendation && (
          <Tag color={actionColor}>
            {ACTION_LABELS[job.actionRecommendation] || job.actionRecommendation}
          </Tag>
        )}
        {job.hasResume && <Tag color="#8b5cf6">Resume ready</Tag>}
        {job.hasApplication && <Tag color="#00d4ff">Applied</Tag>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        {!job.hasResume && (
          <Button size="sm" variant="secondary" onClick={() => onAction("resume", job.id)}>
            Generate Resume
          </Button>
        )}
        {!job.hasApplication && (
          <Button size="sm" variant="primary" onClick={() => onAction("apply", job.id)}>
            + Application
          </Button>
        )}
        {job.outreachStatus === "NOT_GENERATED" && (
          <Button size="sm" variant="ghost" onClick={() => onAction("outreach", job.id)}>
            Gen Outreach
          </Button>
        )}
        {job.sourceUrl && (
          <Button size="sm" variant="ghost" onClick={() => window.open(job.sourceUrl!, "_blank")}>
            Open Link
          </Button>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div style={{
      padding: "12px 16px",
      background: color + "10",
      borderBottom: `2px solid ${color}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{title}</span>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color,
        background: color + "20",
        padding: "2px 8px",
        borderRadius: 10,
      }}>
        {count}
      </span>
    </div>
  );
}

export default function DailyQueuePage() {
  const [loading, setLoading] = useState(true);
  const [applyToday, setApplyToday] = useState<QueueJob[]>([]);
  const [applyThisWeek, setApplyThisWeek] = useState<QueueJob[]>([]);
  const [needsOutreach, setNeedsOutreach] = useState<QueueJob[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [staleOpps, setStaleOpps] = useState<StaleOpp[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-queue");
      const data = await res.json();
      if (data.success) {
        setApplyToday(data.applyToday || []);
        setApplyThisWeek(data.applyThisWeek || []);
        setNeedsOutreach(data.needsOutreach || []);
        setFollowUps(data.followUps || []);
        setStaleOpps(data.staleOpportunities || []);
      }
    } catch {
      console.error("Failed to fetch daily queue");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string, jobId: string) {
    setActionLoading(jobId);
    try {
      if (action === "resume") {
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        if (res.ok) {
          fetchQueue();
        }
      } else if (action === "apply") {
        const job = [...applyToday, ...applyThisWeek, ...needsOutreach].find((j) => j.id === jobId);
        if (job) {
          const res = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: job.company?.name || "Unknown",
              companyId: job.company?.id,
              jobTitle: job.title,
              jobId: job.id,
              status: "APPLIED",
              priority: job.actionRecommendation === "APPLY_NOW" ? "HIGH" : "MEDIUM",
            }),
          });
          if (res.ok) fetchQueue();
        }
      } else if (action === "outreach") {
        const job = [...applyToday, ...applyThisWeek, ...needsOutreach].find((j) => j.id === jobId);
        if (job) {
          const res = await fetch("/api/outreach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: job.company?.name || "Unknown",
              roleName: job.title,
              jobId: job.id,
            }),
          });
          if (res.ok) {
            // Update outreach status
            await fetch(`/api/jobs/${jobId}/outreach-status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ outreachStatus: "DRAFTED" }),
            });
            fetchQueue();
          }
        }
      }
    } catch {
      console.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  const totalActions = applyToday.length + applyThisWeek.length + needsOutreach.length + followUps.length + staleOpps.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader
        title="Daily Queue"
        subtitle={loading ? "Loading..." : `${totalActions} actions pending`}
        actions={
          <Button variant="secondary" onClick={fetchQueue} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <span className="spinner" />
        </div>
      ) : totalActions === 0 ? (
        <EmptyState
          icon="✓"
          title="All caught up!"
          description="No pending actions. Ingest more jobs or wait for new opportunities."
        />
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Apply Today */}
          {applyToday.length > 0 && (
            <div>
              <SectionHeader title="Apply Today" count={applyToday.length} color="#22c55e" />
              {applyToday.map((job) => (
                <JobCard key={job.id} job={job} onAction={handleAction} />
              ))}
            </div>
          )}

          {/* Apply This Week */}
          {applyThisWeek.length > 0 && (
            <div>
              <SectionHeader title="Apply This Week" count={applyThisWeek.length} color="#00d4ff" />
              {applyThisWeek.map((job) => (
                <JobCard key={job.id} job={job} onAction={handleAction} />
              ))}
            </div>
          )}

          {/* Needs Outreach */}
          {needsOutreach.length > 0 && (
            <div>
              <SectionHeader title="Needs Outreach" count={needsOutreach.length} color="#8b5cf6" />
              {needsOutreach.map((job) => (
                <JobCard key={job.id} job={job} onAction={handleAction} />
              ))}
            </div>
          )}

          {/* Follow-Ups */}
          {followUps.length > 0 && (
            <div>
              <SectionHeader title="Follow-Ups" count={followUps.length} color="#f59e0b" />
              {followUps.map((fu) => (
                <div key={fu.id} style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fu.jobTitle}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {fu.companyName} · <StatusBadge status={fu.status} /> · {fu.daysSinceUpdate} days since update
                    </div>
                    {fu.recruiterName && (
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                        Recruiter: {fu.recruiterName}
                      </div>
                    )}
                    {fu.nextAction && (
                      <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 2 }}>
                        Next: {fu.nextAction}
                      </div>
                    )}
                  </div>
                  <Tag color="#f59e0b">{fu.daysSinceUpdate}d</Tag>
                </div>
              ))}
            </div>
          )}

          {/* Stale Opportunities */}
          {staleOpps.length > 0 && (
            <div>
              <SectionHeader title="Stale Opportunities" count={staleOpps.length} color="#ef4444" />
              {staleOpps.map((opp) => (
                <div key={opp.id} style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{opp.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {opp.company || "Unknown"} · Score: {Math.round(opp.score)} · {opp.daysSinceIngestion} days old
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {opp.actionRecommendation && (
                      <Tag color={ACTION_COLORS[opp.actionRecommendation] || "#6b7280"}>
                        {ACTION_LABELS[opp.actionRecommendation] || opp.actionRecommendation}
                      </Tag>
                    )}
                    <Tag color="#ef4444">{opp.daysSinceIngestion}d stale</Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
