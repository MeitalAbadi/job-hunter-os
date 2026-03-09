"use client";
// app/(dashboard)/jobs/batch-ingest/page.tsx
// Batch ingestion page for pasting multiple Telegram job posts

import { useState } from "react";
import { PageHeader, Card, Button, Textarea, Label, Tag, ScoreBadge, EmptyState } from "../../../../components/ui";

interface ParsedCandidate {
  title: string;
  company: string;
  location?: string;
  rawText: string;
  source: string;
  possibleExternalLinks: string[];
  confidence: number;
  parseWarnings: string[];
  dedupHash?: string;
  isDuplicate?: boolean;
  duplicateOfJobId?: string;
  inBatchDuplicateIndex?: number;
}

interface SaveResult {
  index: number;
  jobId?: string;
  isNew: boolean;
  isDuplicate: boolean;
  error?: string;
  actionRecommendation?: string;
  resumeGenerated?: boolean;
}

export default function BatchIngestPage() {
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [saveResults, setSaveResults] = useState<SaveResult[]>([]);
  const [saveSummary, setSaveSummary] = useState<{ saved: number; duplicates: number; errors: number; resumesGenerated: number } | null>(null);

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    setCandidates([]);
    setSelected(new Set());
    setSaveResults([]);
    setSaveSummary(null);

    try {
      const res = await fetch("/api/jobs/batch-ingest?action=parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawBatchText: rawText, source: "TELEGRAM" }),
      });
      const data = await res.json();

      if (data.success) {
        setCandidates(data.candidates || []);
        setParseErrors(data.parseErrors || []);
        // Auto-select non-duplicate candidates
        const nonDupes = new Set<number>();
        (data.candidates || []).forEach((c: ParsedCandidate, i: number) => {
          if (!c.isDuplicate && c.inBatchDuplicateIndex === undefined) {
            nonDupes.add(i);
          }
        });
        setSelected(nonDupes);
      } else {
        setParseErrors([data.error || "Parse failed"]);
      }
    } catch {
      setParseErrors(["Network error during parsing"]);
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (selected.size === 0) return;
    setSaving(true);
    setSaveResults([]);
    setSaveSummary(null);

    try {
      const res = await fetch("/api/jobs/batch-ingest?action=save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawBatchText: rawText,
          source: "TELEGRAM",
          selectedIndices: Array.from(selected),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSaveResults(data.results || []);
        setSaveSummary(data.summary);
      }
    } catch {
      setSaveResults([]);
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(idx: number) {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  }

  function selectAll() {
    const nonDupes = new Set<number>();
    candidates.forEach((c, i) => {
      if (!c.isDuplicate) nonDupes.add(i);
    });
    setSelected(nonDupes);
  }

  function selectNone() {
    setSelected(new Set());
  }

  const ACTION_COLORS: Record<string, string> = {
    APPLY_NOW: "#22c55e",
    APPLY_THIS_WEEK: "#00d4ff",
    STRETCH_APPLY: "#f59e0b",
    OPTIONAL: "#6b7280",
    SKIP_ONLY_IF_CLEAR_BLOCKER: "#ef4444",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader
        title="Batch Ingest"
        subtitle="Paste multiple Telegram job posts at once"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="primary"
              onClick={handleParse}
              loading={parsing}
              disabled={!rawText.trim() || parsing}
            >
              {parsing ? "Parsing..." : "Parse Batch"}
            </Button>
            {candidates.length > 0 && (
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={selected.size === 0 || saving}
              >
                {saving ? "Saving..." : `Save Selected (${selected.size})`}
              </Button>
            )}
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Input panel */}
        <div style={{
          width: candidates.length > 0 ? 400 : "100%",
          borderRight: candidates.length > 0 ? "1px solid var(--border)" : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
            <Textarea
              label="Paste Telegram messages here"
              placeholder={"Paste all job posts from your Telegram channel...\n\nPosts will be automatically split and parsed.\nSupports multiple formats: forwarded messages, emoji headers, blank-line separated."}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              style={{ minHeight: 400, fontFamily: "var(--font-mono)", fontSize: 11 }}
            />
            <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
              {rawText.length > 0 && `${rawText.length.toLocaleString()} characters`}
            </div>
          </div>
        </div>

        {/* Preview panel */}
        {candidates.length > 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Controls bar */}
            <div style={{
              padding: "10px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {candidates.length} candidates found
                {parseErrors.length > 0 && ` · ${parseErrors.length} errors`}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="sm" variant="ghost" onClick={selectAll}>Select All</Button>
                <Button size="sm" variant="ghost" onClick={selectNone}>Deselect All</Button>
              </div>
            </div>

            {/* Save summary */}
            {saveSummary && (
              <div style={{
                padding: "10px 16px",
                borderBottom: "1px solid var(--border)",
                background: "var(--accent-dim)",
                fontSize: 12,
              }}>
                Saved: {saveSummary.saved} · Duplicates: {saveSummary.duplicates} · Errors: {saveSummary.errors}
                {saveSummary.resumesGenerated > 0 && ` · Resumes generated: ${saveSummary.resumesGenerated}`}
              </div>
            )}

            {/* Candidate list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {candidates.map((c, i) => {
                const saveResult = saveResults.find((r) => r.index === i);
                const isSaved = saveResult?.isNew;
                const actionColor = saveResult?.actionRecommendation
                  ? ACTION_COLORS[saveResult.actionRecommendation] || "#6b7280"
                  : undefined;

                return (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--border-subtle)",
                      background: c.isDuplicate
                        ? "rgba(239, 68, 68, 0.05)"
                        : selected.has(i)
                        ? "var(--accent-dim)"
                        : "transparent",
                      opacity: c.isDuplicate ? 0.6 : 1,
                      cursor: c.isDuplicate ? "default" : "pointer",
                    }}
                    onClick={() => !c.isDuplicate && toggleSelect(i)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      {/* Checkbox */}
                      <div style={{
                        width: 18,
                        height: 18,
                        border: `2px solid ${selected.has(i) ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 3,
                        background: selected.has(i) ? "var(--accent)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: "var(--bg-base)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                        {selected.has(i) && "✓"}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {c.isDuplicate && (
                              <Tag color="#ef4444">Duplicate</Tag>
                            )}
                            {c.inBatchDuplicateIndex !== undefined && (
                              <Tag color="#f59e0b">In-batch dup</Tag>
                            )}
                            <Tag color={
                              c.confidence >= 0.7 ? "#22c55e" :
                              c.confidence >= 0.4 ? "#f59e0b" : "#ef4444"
                            }>
                              {Math.round(c.confidence * 100)}%
                            </Tag>
                          </div>
                        </div>

                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
                          {c.company}{c.location && ` · ${c.location}`}
                        </div>

                        {c.possibleExternalLinks.length > 0 && (
                          <div style={{ fontSize: 10, color: "var(--accent)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.possibleExternalLinks[0]}
                          </div>
                        )}

                        {c.parseWarnings.length > 0 && (
                          <div style={{ marginBottom: 4 }}>
                            {c.parseWarnings.map((w, wi) => (
                              <div key={wi} style={{ fontSize: 10, color: "var(--yellow)" }}>⚠ {w}</div>
                            ))}
                          </div>
                        )}

                        {/* Save result */}
                        {saveResult && (
                          <div style={{ marginTop: 4, fontSize: 11 }}>
                            {isSaved && (
                              <span style={{ color: "var(--green)" }}>
                                ✓ Saved
                                {saveResult.actionRecommendation && (
                                  <span style={{ color: actionColor, marginLeft: 6, fontWeight: 600 }}>
                                    {saveResult.actionRecommendation.replace(/_/g, " ")}
                                  </span>
                                )}
                                {saveResult.resumeGenerated && (
                                  <span style={{ color: "var(--accent)", marginLeft: 6 }}>+ Resume generated</span>
                                )}
                              </span>
                            )}
                            {saveResult.isDuplicate && (
                              <span style={{ color: "var(--text-muted)" }}>Already exists</span>
                            )}
                            {saveResult.error && (
                              <span style={{ color: "var(--red)" }}>Error: {saveResult.error}</span>
                            )}
                          </div>
                        )}

                        {/* Preview text */}
                        <div style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginTop: 6,
                          maxHeight: 60,
                          overflow: "hidden",
                          lineHeight: 1.5,
                          fontFamily: "var(--font-mono)",
                        }}>
                          {c.rawText.slice(0, 200)}...
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {candidates.length === 0 && rawText.length === 0 && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <EmptyState
              icon="📋"
              title="Batch Ingest"
              description="Paste multiple job posts from Telegram to parse, deduplicate, and save them"
            />
          </div>
        )}
      </div>
    </div>
  );
}
