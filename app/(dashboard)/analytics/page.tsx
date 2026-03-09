"use client";
// app/(dashboard)/analytics/page.tsx
// Conversion-focused analytics dashboard with breakdowns and advisory insights

import { useState, useEffect } from "react";
import { PageHeader, Card, Label } from "../../../components/ui";

interface ConversionMetrics {
  totalJobsIngested: number;
  totalApplicationsSent: number;
  totalOutreachDrafts: number;
  totalRecruiterResponses: number;
  totalScreeningCalls: number;
  totalInterviews: number;
  totalRejections: number;
  responseRate: number;
  interviewRate: number;
}

interface BreakdownItem {
  label: string;
  applications: number;
  responses: number;
  interviews: number;
  responseRate: number;
  interviewRate: number;
}

interface OutreachImpact {
  withOutreach: { applications: number; responses: number; responseRate: number };
  withoutOutreach: { applications: number; responses: number; responseRate: number };
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: 18,
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "var(--accent)" }}>{value}</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function BreakdownTable({ title, items }: { title: string; items: BreakdownItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card style={{ marginBottom: 16 }}>
      <Label>{title}</Label>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}>Source</th>
              <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--text-muted)", fontSize: 10 }}>Apps</th>
              <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--text-muted)", fontSize: 10 }}>Responses</th>
              <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--text-muted)", fontSize: 10 }}>Interviews</th>
              <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--text-muted)", fontSize: 10 }}>Response %</th>
              <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--text-muted)", fontSize: 10 }}>Interview %</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.label} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "8px", fontWeight: 600 }}>{item.label}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{item.applications}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{item.responses}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{item.interviews}</td>
                <td style={{ padding: "8px", textAlign: "right", color: item.responseRate > 20 ? "var(--green)" : "var(--text-secondary)" }}>
                  {item.responseRate}%
                </td>
                <td style={{ padding: "8px", textAlign: "right", color: item.interviewRate > 10 ? "var(--green)" : "var(--text-secondary)" }}>
                  {item.interviewRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [breakdowns, setBreakdowns] = useState<{ bySource: BreakdownItem[]; byRole: BreakdownItem[]; byTemplate: BreakdownItem[] }>({ bySource: [], byRole: [], byTemplate: [] });
  const [outreach, setOutreach] = useState<OutreachImpact | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setBreakdowns(data.breakdowns);
        setOutreach(data.outreach);
        setInsights(data.insights);
      }
    } catch {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Loading..." />
        <div style={{ padding: 40, textAlign: "center" }}><span className="spinner" /></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="No data yet" />
        <div style={{ padding: 28, color: "var(--text-secondary)" }}>
          Complete your profile and add data to unlock conversion analytics.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Conversion and quality signals for your job search funnel"
      />

      <div style={{ padding: 24, maxWidth: 1100 }}>
        {/* Core metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatCard label="Jobs Ingested" value={metrics.totalJobsIngested} />
          <StatCard label="Applications Sent" value={metrics.totalApplicationsSent} color="var(--purple)" />
          <StatCard label="Response Rate" value={`${metrics.responseRate}%`} sub="responses / applications" color="var(--green)" />
          <StatCard label="Interview Rate" value={`${metrics.interviewRate}%`} sub="interviews / applications" color="var(--yellow)" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatCard label="Outreach Drafts" value={metrics.totalOutreachDrafts} sub="generated" color="var(--purple)" />
          <StatCard label="Screening Calls" value={metrics.totalScreeningCalls} color="var(--accent)" />
          <StatCard label="Interviews" value={metrics.totalInterviews} color="var(--green)" />
          <StatCard label="Rejections" value={metrics.totalRejections} color="var(--red)" />
        </div>

        {/* Advisory insights */}
        {insights.length > 0 && (
          <Card style={{ marginBottom: 24, borderColor: "var(--accent)", borderWidth: 2 }}>
            <Label>Advisory Insights</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {insights.map((insight, i) => (
                <div key={i} style={{
                  fontSize: 12,
                  color: "var(--text-primary)",
                  padding: "8px 12px",
                  background: "var(--accent-dim)",
                  borderRadius: 6,
                  lineHeight: 1.5,
                }}>
                  {insight}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Outreach impact */}
        {outreach && (outreach.withOutreach.applications > 0 || outreach.withoutOutreach.applications > 0) && (
          <Card style={{ marginBottom: 24 }}>
            <Label>Outreach Impact</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: 12, background: "var(--bg-base)", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>With Outreach</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{outreach.withOutreach.responseRate}%</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {outreach.withOutreach.responses} responses / {outreach.withOutreach.applications} applications
                </div>
              </div>
              <div style={{ padding: 12, background: "var(--bg-base)", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Without Outreach</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-secondary)" }}>{outreach.withoutOutreach.responseRate}%</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {outreach.withoutOutreach.responses} responses / {outreach.withoutOutreach.applications} applications
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Breakdowns */}
        <BreakdownTable title="By Source" items={breakdowns.bySource} />
        <BreakdownTable title="By Role Family" items={breakdowns.byRole} />
        <BreakdownTable title="By Resume Template" items={breakdowns.byTemplate} />
      </div>
    </div>
  );
}
