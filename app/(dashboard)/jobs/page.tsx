"use client";
// app/(dashboard)/jobs/page.tsx
import { useState, useEffect, useCallback } from "react";
import { PageHeader, Card, Button, Textarea, Input, Select, ScoreBadge, Tag, Label, EmptyState } from "../../../components/ui";

const ACTION_COLORS: Record<string, string> = {
  APPLY_NOW: "#22c55e",
  APPLY_THIS_WEEK: "#00d4ff",
  STRETCH_APPLY: "#f59e0b",
  OPTIONAL: "#6b7280",
  SKIP_ONLY_IF_CLEAR_BLOCKER: "#ef4444",
};

const ACTION_LABELS: Record<string, string> = {
  APPLY_NOW: "Apply Now",
  APPLY_THIS_WEEK: "This Week",
  STRETCH_APPLY: "Stretch",
  OPTIONAL: "Optional",
  SKIP_ONLY_IF_CLEAR_BLOCKER: "Skip (Blockers)",
};

interface JobScore {
  totalScore: number;
  recommendation: string;
  actionRecommendation?: string;
  strengths: string[];
  risks: string[];
  confidence: number;
  llmExplanation: string;
  whyApply?: string;
  whyNotApply?: string;
  blockersSummary?: string;
}

interface Job {
  id: string;
  title: string;
  location?: string;
  workMode?: string;
  seniority?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  keywords: string[];
  isActive: boolean;
  outreachStatus?: string;
  sourceUrl?: string;
  postedAt?: string;
  createdAt: string;
  company?: { id: string; name: string; stage?: string };
  scores?: JobScore[];
  _count?: { applications: number };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIngest, setShowIngest] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Ingest form
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [companyHint, setCompanyHint] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<{ success?: boolean; isDuplicate?: boolean; error?: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [sortBy, setSortBy] = useState("score");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sortBy, sortDir: "desc", limit: "50" });
      if (search) params.set("search", search);
      if (minScore) params.set("minScore", minScore);
      if (actionFilter) params.set("actionRecommendation", actionFilter);
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [search, minScore, actionFilter, sortBy]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleIngest() {
    if (!rawText.trim()) return;
    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch("/api/jobs/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          sourceUrl: sourceUrl || undefined,
          companyNameHint: companyHint || undefined,
          source: "MANUAL_PASTE",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIngestResult({ success: true, isDuplicate: data.isDuplicate });
        if (!data.isDuplicate) {
          setRawText(""); setSourceUrl(""); setCompanyHint("");
          fetchJobs();
        }
      } else {
        setIngestResult({ error: data.error || "Ingestion failed" });
      }
    } catch {
      setIngestResult({ error: "Network error" });
    } finally {
      setIngesting(false);
    }
  }

  const selectedScore = selectedJob?.scores?.[0];

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <PageHeader
        title="Jobs Inbox"
        subtitle={`${jobs.length} jobs · sorted by fit score`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={() => window.location.href = "/jobs/batch-ingest"}>
              Batch Ingest
            </Button>
            <Button variant="primary" onClick={() => { setShowIngest(!showIngest); setSelectedJob(null); }}>
              {showIngest ? "Back" : "+ Ingest Job"}
            </Button>
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Job list */}
        <div style={{
          width: showIngest || selectedJob ? 340 : "100%",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Filters */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 100, background: "var(--bg-base)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "6px 10px", outline: "none",
              }}
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                background: "var(--bg-base)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-secondary)", fontSize: 11, padding: "6px 8px", outline: "none",
              }}
            >
              <option value="">All actions</option>
              <option value="APPLY_NOW">Apply Now</option>
              <option value="APPLY_THIS_WEEK">This Week</option>
              <option value="STRETCH_APPLY">Stretch</option>
              <option value="OPTIONAL">Optional</option>
            </select>
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              style={{
                background: "var(--bg-base)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-secondary)", fontSize: 11, padding: "6px 8px", outline: "none",
              }}
            >
              <option value="">All scores</option>
              <option value="75">75+</option>
              <option value="60">60+</option>
              <option value="50">50+</option>
            </select>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: "center" }}>
                <span className="spinner" style={{ margin: "0 auto" }} />
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="◎"
                title="No jobs yet"
                description='Click "Ingest Job" to add your first job posting'
              />
            ) : (
              jobs.map((job) => {
                const score = job.scores?.[0];
                const isSelected = selectedJob?.id === job.id;
                const actionColor = score?.actionRecommendation ? ACTION_COLORS[score.actionRecommendation] : undefined;
                return (
                  <div
                    key={job.id}
                    onClick={() => { setSelectedJob(job); setShowIngest(false); }}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      background: isSelected ? "var(--accent-dim)" : "transparent",
                      borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, flex: 1, paddingRight: 8 }}>
                        {job.title}
                      </div>
                      {score && <ScoreBadge score={score.totalScore} recommendation={score.actionRecommendation || score.recommendation} />}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>
                      {job.company?.name || "Unknown"}
                      {job.location && ` · ${job.location}`}
                      {job.workMode && ` · ${job.workMode}`}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {score?.actionRecommendation && (
                        <Tag color={actionColor}>
                          {ACTION_LABELS[score.actionRecommendation] || score.actionRecommendation}
                        </Tag>
                      )}
                      {job.requiredSkills.slice(0, 3).map((s) => (
                        <Tag key={s} color="var(--text-muted)">{s}</Tag>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ingest panel */}
        {showIngest && (
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 700 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Add Job</h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
                Paste the full job description. The AI will extract all structured data and score it against your profile.
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <Input label="Source URL (optional)" placeholder="https://jobs.company.com/..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <Input label="Company name hint (optional)" placeholder="Wix, Voyantis..." value={companyHint} onChange={(e) => setCompanyHint(e.target.value)} />
                </div>
              </div>

              <Textarea
                label="Job Description"
                placeholder="Paste the full job description here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{ minHeight: 300 }}
              />

              <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <Button variant="primary" onClick={handleIngest} loading={ingesting} disabled={!rawText.trim()}>
                  {ingesting ? "Extracting & scoring..." : "Analyze & Add Job"}
                </Button>
                {ingestResult && (
                  <span style={{
                    fontSize: 12,
                    color: ingestResult.error ? "var(--red)" : "var(--green)",
                  }}>
                    {ingestResult.error
                      ? `Error: ${ingestResult.error}`
                      : ingestResult.isDuplicate
                      ? "Already exists in your inbox"
                      : "Job added and scored!"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Job detail with outreach + resume actions */}
        {selectedJob && !showIngest && (
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 700 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedJob.title}</h2>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                      {selectedJob.company?.name}
                      {selectedJob.location && ` · ${selectedJob.location}`}
                      {selectedJob.workMode && ` · ${selectedJob.workMode}`}
                      {selectedJob.seniority && ` · ${selectedJob.seniority}`}
                    </p>
                  </div>
                  {selectedScore && (
                    <ScoreBadge score={selectedScore.totalScore} recommendation={selectedScore.actionRecommendation || selectedScore.recommendation} />
                  )}
                </div>
              </div>

              {/* Action recommendation */}
              {selectedScore?.actionRecommendation && (
                <Card style={{ marginBottom: 16, borderColor: ACTION_COLORS[selectedScore.actionRecommendation] + "60" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <Label>Action Recommendation</Label>
                    <Tag color={ACTION_COLORS[selectedScore.actionRecommendation]}>
                      {ACTION_LABELS[selectedScore.actionRecommendation]}
                    </Tag>
                  </div>
                  {selectedScore.whyApply && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>WHY APPLY</div>
                      <div style={{ fontSize: 12, color: "var(--green)", lineHeight: 1.5 }}>{selectedScore.whyApply}</div>
                    </div>
                  )}
                  {selectedScore.whyNotApply && selectedScore.whyNotApply !== "No significant concerns" && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>CONCERNS</div>
                      <div style={{ fontSize: 12, color: "var(--red)", lineHeight: 1.5 }}>{selectedScore.whyNotApply}</div>
                    </div>
                  )}
                  {selectedScore.blockersSummary && selectedScore.blockersSummary !== "No blockers detected" && (
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>BLOCKERS</div>
                      <div style={{ fontSize: 11, color: "var(--yellow)", lineHeight: 1.5 }}>{selectedScore.blockersSummary}</div>
                    </div>
                  )}
                </Card>
              )}

              {selectedScore && (
                <Card style={{ marginBottom: 16 }}>
                  <Label>AI Analysis</Label>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                    {selectedScore.llmExplanation}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <Label>Strengths</Label>
                      {selectedScore.strengths.map((s, i) => (
                        <div key={i} style={{ fontSize: 11, color: "var(--green)", marginBottom: 3 }}>{s}</div>
                      ))}
                    </div>
                    <div>
                      <Label>Risks</Label>
                      {selectedScore.risks.length === 0
                        ? <div style={{ fontSize: 11, color: "var(--text-muted)" }}>No major risks</div>
                        : selectedScore.risks.map((r, i) => (
                          <div key={i} style={{ fontSize: 11, color: "var(--red)", marginBottom: 3 }}>{r}</div>
                        ))}
                    </div>
                  </div>
                </Card>
              )}

              <Card style={{ marginBottom: 16 }}>
                <Label>Required Skills</Label>
                <div style={{ marginBottom: 10 }}>
                  {selectedJob.requiredSkills.map((s) => <Tag key={s}>{s}</Tag>)}
                </div>
                {selectedJob.niceToHaveSkills.length > 0 && (
                  <>
                    <Label>Nice to Have</Label>
                    <div>{selectedJob.niceToHaveSkills.map((s) => <Tag key={s} color="var(--text-muted)">{s}</Tag>)}</div>
                  </>
                )}
              </Card>

              {/* Quick actions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <Button variant="primary" onClick={async () => {
                  const res = await fetch("/api/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      companyName: selectedJob.company?.name || "Unknown",
                      companyId: selectedJob.company?.id,
                      jobTitle: selectedJob.title,
                      jobId: selectedJob.id,
                      status: "APPLIED",
                      priority: selectedScore && selectedScore.totalScore >= 75 ? "HIGH" : "MEDIUM",
                    }),
                  });
                  if (res.ok) alert("Added to applications!");
                }}>
                  + Application
                </Button>
                <Button variant="secondary" onClick={async () => {
                  const res = await fetch("/api/resumes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jobId: selectedJob.id }),
                  });
                  if (res.ok) alert("Resume generated! View in Resumes tab.");
                }}>
                  Generate Resume
                </Button>
                <Button variant="secondary" onClick={async () => {
                  const res = await fetch("/api/outreach", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      companyName: selectedJob.company?.name || "Unknown",
                      roleName: selectedJob.title,
                      jobId: selectedJob.id,
                    }),
                  });
                  if (res.ok) {
                    await fetch(`/api/jobs/${selectedJob.id}/outreach-status`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ outreachStatus: "DRAFTED" }),
                    });
                    alert("Outreach drafted! View in Outreach tab.");
                  }
                }}>
                  Generate Outreach
                </Button>
                {selectedJob.sourceUrl && (
                  <Button variant="ghost" onClick={() => window.open(selectedJob.sourceUrl!, "_blank")}>
                    Open Link
                  </Button>
                )}
              </div>

              {/* Outreach status */}
              {selectedJob.outreachStatus && selectedJob.outreachStatus !== "NOT_GENERATED" && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                  Outreach status: <Tag color={
                    selectedJob.outreachStatus === "REPLIED" ? "#22c55e" :
                    selectedJob.outreachStatus === "SENT_MANUALLY" ? "#00d4ff" :
                    "#f59e0b"
                  }>{selectedJob.outreachStatus}</Tag>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
