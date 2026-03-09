"use client";
// app/(dashboard)/resumes/page.tsx
import { useState, useEffect, useCallback } from "react";
import { PageHeader, Card, Button, Label, Tag, EmptyState } from "../../../components/ui";

interface ResumeVersion {
  id: string;
  name: string;
  roleFamily: string;
  language: string;
  summaryText: string;
  insertedKeywords: string[];
  qualityScore?: number;
  qualityIssues: string[];
  status: string;
  bulletVariants: Array<{ section: string; text: string; roleRelevance: number }>;
  createdAt: string;
  job?: { title?: string; company?: { name: string } };
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#6b7280", REVIEWED: "#00d4ff", APPROVED: "#f59e0b", USED: "#22c55e", ARCHIVED: "#4b5563",
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ResumeVersion | null>(null);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      setResumes(data.resumes || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader
        title="▤ Resume Library"
        subtitle={`${resumes.length} versions · all AI-generated, ATS-optimized`}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* List */}
        <div style={{
          width: selected ? 320 : "100%",
          borderRight: selected ? "1px solid var(--border)" : "none",
          overflowY: "auto",
        }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}><span className="spinner" style={{ margin: "0 auto" }} /></div>
          ) : resumes.length === 0 ? (
            <EmptyState
              icon="▤"
              title="No resume versions yet"
              description="Generate your first tailored resume from the Jobs page"
            />
          ) : (
            resumes.map((resume) => {
              const isSelected = selected?.id === resume.id;
              const qScore = resume.qualityScore;
              const qColor = qScore !== undefined
                ? (qScore >= 70 ? "#22c55e" : qScore >= 50 ? "#f59e0b" : "#ef4444")
                : "#6b7280";

              return (
                <div
                  key={resume.id}
                  onClick={() => setSelected(isSelected ? null : resume)}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    background: isSelected ? "var(--accent-dim)" : "transparent",
                    borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      {resume.name}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {qScore !== undefined && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: qColor, fontFamily: "var(--font-mono)" }}>
                          Q:{qScore}
                        </span>
                      )}
                      <span style={{
                        fontSize: 9, color: STATUS_COLORS[resume.status],
                        background: STATUS_COLORS[resume.status] + "15",
                        border: `1px solid ${STATUS_COLORS[resume.status]}30`,
                        borderRadius: 3, padding: "2px 6px",
                      }}>
                        {resume.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>
                    {resume.job?.company?.name && `${resume.job.company.name} · `}
                    {resume.roleFamily} · {resume.language.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 700 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{selected.name}</h2>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    {selected.roleFamily} · {selected.language.toUpperCase()}
                    {selected.job && ` · for ${selected.job.company?.name}`}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" variant="secondary" onClick={() => copyToClipboard(selected.summaryText)}>
                    Copy Summary
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => {
                    const allBullets = selected.bulletVariants.map((b) => `[${b.section}] ${b.text}`).join("\n\n");
                    copyToClipboard(allBullets);
                  }}>
                    Copy All Bullets
                  </Button>
                </div>
              </div>

              {selected.qualityIssues.length > 0 && (
                <div style={{
                  background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 16,
                }}>
                  <Label>Quality Issues</Label>
                  {selected.qualityIssues.map((issue, i) => (
                    <div key={i} style={{ fontSize: 11, color: "var(--yellow)", marginBottom: 3 }}>⚠ {issue}</div>
                  ))}
                </div>
              )}

              <Card style={{ marginBottom: 16 }}>
                <Label>Professional Summary</Label>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-primary)" }}>
                  {selected.summaryText}
                </p>
              </Card>

              <Card style={{ marginBottom: 16 }}>
                <Label>Tailored Bullets</Label>
                {selected.bulletVariants.map((bullet, i) => (
                  <div key={i} style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <Tag color="var(--purple)">{bullet.section}</Tag>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        relevance: {bullet.roleRelevance}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                      • {bullet.text}
                    </p>
                  </div>
                ))}
              </Card>

              <Card>
                <Label>ATS Keywords Used</Label>
                <div>{selected.insertedKeywords.map((k) => <Tag key={k}>{k}</Tag>)}</div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
