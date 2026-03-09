"use client";
// app/(dashboard)/applications/page.tsx
import { useState, useEffect, useCallback } from "react";
import { PageHeader, Button, StatusBadge, ScoreBadge, Label, Card, EmptyState, Input, Select } from "../../../components/ui";

interface Application {
  id: string;
  status: string;
  priority: string;
  notes?: string;
  recruiterName?: string;
  nextAction?: string;
  followUpDueAt?: string;
  appliedAt?: string;
  updatedAt: string;
  company?: { name: string };
  job?: { title?: string; workMode?: string; scores?: { totalScore: number; recommendation: string }[] };
  resumeVersion?: { id: string; name: string };
  stageEvents?: { stageName: string; eventAt: string; notes?: string }[];
}

const STATUSES = [
  "WISHLIST", "APPLIED", "RECRUITER_SCREEN", "TECHNICAL_INTERVIEW",
  "CASE_STUDY", "FINAL_INTERVIEW", "OFFER", "ACCEPTED", "REJECTED", "WITHDRAWN", "ON_HOLD"
];
const STATUS_LABELS: Record<string, string> = {
  WISHLIST: "Wishlist", APPLIED: "Applied", RECRUITER_SCREEN: "Recruiter Screen",
  TECHNICAL_INTERVIEW: "Technical", CASE_STUDY: "Case Study", FINAL_INTERVIEW: "Final Interview",
  OFFER: "Offer 🎉", ACCEPTED: "Accepted", REJECTED: "Rejected", WITHDRAWN: "Withdrawn", ON_HOLD: "On Hold",
};
const STATUS_COLORS: Record<string, string> = {
  WISHLIST: "#6b7280", APPLIED: "#00d4ff", RECRUITER_SCREEN: "#8b5cf6",
  TECHNICAL_INTERVIEW: "#f59e0b", CASE_STUDY: "#f97316", FINAL_INTERVIEW: "#06b6d4",
  OFFER: "#22c55e", ACCEPTED: "#16a34a", REJECTED: "#ef4444", WITHDRAWN: "#6b7280", ON_HOLD: "#eab308",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Add form
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("APPLIED");
  const [newNotes, setNewNotes] = useState("");
  const [newRecruiter, setNewRecruiter] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications?limit=100");
      const data = await res.json();
      setApps(data.applications || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  async function updateStatus(appId: string, status: string) {
    await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    if (selected?.id === appId) setSelected((s) => s ? { ...s, status } : null);
  }

  async function deleteApp(appId: string) {
    if (!confirm("Delete this application?")) return;
    await fetch(`/api/applications/${appId}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== appId));
    if (selected?.id === appId) setSelected(null);
  }

  async function addApplication() {
    if (!newCompany || !newRole) return;
    setSaving(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: newCompany,
        jobTitle: newRole,
        status: newStatus,
        notes: newNotes,
        recruiterName: newRecruiter,
      }),
    });
    if (res.ok) {
      setNewCompany(""); setNewRole(""); setNewNotes(""); setNewRecruiter(""); setNewStatus("APPLIED");
      setShowAdd(false);
      fetchApps();
    }
    setSaving(false);
  }

  // Group by status for kanban summary
  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader
        title="◈ Applications Pipeline"
        subtitle={`${apps.length} total · ${apps.filter(a => !["REJECTED","ACCEPTED","WITHDRAWN"].includes(a.status)).length} active`}
        actions={
          <Button variant="primary" onClick={() => { setShowAdd(!showAdd); setSelected(null); }}>
            {showAdd ? "← Cancel" : "+ Add Application"}
          </Button>
        }
      />

      {/* Status summary bar */}
      <div style={{
        display: "flex", gap: 8, padding: "10px 20px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)", overflowX: "auto",
      }}>
        {STATUSES.filter((s) => statusCounts[s] > 0).map((s) => (
          <div key={s} style={{
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            padding: "4px 10px", borderRadius: 20,
            background: STATUS_COLORS[s] + "15", border: `1px solid ${STATUS_COLORS[s]}30`,
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: STATUS_COLORS[s], lineHeight: 1 }}>
              {statusCounts[s]}
            </span>
            <span style={{ fontSize: 9, color: STATUS_COLORS[s], letterSpacing: 0.5 }}>
              {STATUS_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Add form */}
        {showAdd && (
          <div style={{
            width: 360, borderRight: "1px solid var(--border)",
            padding: 20, overflowY: "auto",
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Add Application</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Company" placeholder="Company name" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} />
              <Input label="Role" placeholder="Job title" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
              <Select label="Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </Select>
              <Input label="Recruiter name (optional)" placeholder="John Doe" value={newRecruiter} onChange={(e) => setNewRecruiter(e.target.value)} />
              <div>
                <Label>Notes (optional)</Label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Any relevant notes..."
                  style={{
                    width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
                    borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "8px 12px",
                    outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box",
                  }}
                />
              </div>
              <Button variant="primary" onClick={addApplication} loading={saving} disabled={!newCompany || !newRole}>
                Add to Pipeline
              </Button>
            </div>
          </div>
        )}

        {/* Applications list */}
        <div style={{
          flex: selected ? "0 0 400px" : 1,
          overflowY: "auto",
          borderRight: selected ? "1px solid var(--border)" : "none",
        }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}><span className="spinner" style={{ margin: "0 auto" }} /></div>
          ) : apps.length === 0 ? (
            <EmptyState icon="◈" title="No applications yet" description="Add your first application to start tracking your pipeline" />
          ) : (
            apps.map((app) => {
              const jobScore = app.job?.scores?.[0];
              const isSelected = selected?.id === app.id;
              const isOverdue = app.followUpDueAt && new Date(app.followUpDueAt) < new Date() &&
                !["REJECTED","ACCEPTED","WITHDRAWN"].includes(app.status);

              return (
                <div
                  key={app.id}
                  onClick={() => setSelected(isSelected ? null : app)}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    background: isSelected ? "var(--accent-dim)" : isOverdue ? "rgba(245,158,11,0.04)" : "transparent",
                    borderLeft: isSelected ? "2px solid var(--accent)" : isOverdue ? "2px solid var(--yellow)" : "2px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{app.company?.name || "Unknown"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{app.job?.title}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <StatusBadge status={app.status} />
                      {jobScore && <ScoreBadge score={jobScore.totalScore} recommendation={jobScore.recommendation} />}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isOverdue && <span style={{ fontSize: 9, color: "var(--yellow)" }}>⚠ FOLLOW UP</span>}
                      {app.recruiterName && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>via {app.recruiterName}</span>}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* App detail */}
        {selected && (
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 500 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>{selected.company?.name}</h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selected.job?.title}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => deleteApp(selected.id)}>Delete</Button>
              </div>

              <Card style={{ marginBottom: 16 }}>
                <Label>Update Status</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      style={{
                        padding: "5px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                        background: selected.status === s ? STATUS_COLORS[s] + "30" : "transparent",
                        border: `1px solid ${STATUS_COLORS[s]}${selected.status === s ? "80" : "30"}`,
                        color: STATUS_COLORS[s], fontWeight: selected.status === s ? 700 : 400,
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </Card>

              {selected.notes && (
                <Card style={{ marginBottom: 16 }}>
                  <Label>Notes</Label>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selected.notes}</p>
                </Card>
              )}

              {selected.stageEvents && selected.stageEvents.length > 0 && (
                <Card>
                  <Label>Stage History</Label>
                  {selected.stageEvents.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[e.stageName] || "#6b7280", marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{STATUS_LABELS[e.stageName] || e.stageName}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{new Date(e.eventAt).toLocaleString()}</div>
                        {e.notes && <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{e.notes}</div>}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
