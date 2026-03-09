"use client";
// app/(dashboard)/outreach/page.tsx
import { useState } from "react";
import { PageHeader, Card, Button, Input, Label, Tag } from "../../../components/ui";

interface OutreachResult {
  targetPersona: string;
  searchQuery: string;
  contactType: string;
  connectionRequest: string;
  followUpMessage: string;
  referralAsk: string;
  tips: string[];
  rationale: string;
}

export default function OutreachPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    if (!company.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: company, roleName: role, contextNotes: notes }),
      });
      const data = await res.json();
      if (data.result) setResult(data.result);
      else setError(data.error || "Generation failed");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ flexDirection: "column", height: "100vh", display: "flex" }}>
      <PageHeader
        title="⬡ Outreach Scout"
        subtitle="Human-in-the-loop networking intelligence — review before sending"
      />

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* LinkedIn compliance notice */}
          <div style={{
            background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 8, padding: "12px 16px", marginBottom: 24,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16, marginTop: 2 }}>ℹ️</span>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--accent)" }}>Assistive Mode Only</strong> — 
              This tool generates message drafts for your manual review. You control all sends.
              LinkedIn search queries are provided for you to execute manually. No automated scraping or messaging.
            </div>
          </div>

          {/* Input form */}
          <Card style={{ marginBottom: 24 }}>
            <Label>Target Company & Role</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Input
                placeholder="Voyantis, Wix, Monday.com..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Input
                placeholder="Data Scientist, AI Engineer..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Label>Context notes (optional)</Label>
              <input
                placeholder="e.g. Found via LinkedIn, 2nd degree through a friend, saw their job post..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
                  borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "8px 12px",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <Button variant="primary" onClick={generate} loading={loading} disabled={!company.trim()}>
              {loading ? "Generating..." : "⬡ Generate Outreach Package"}
            </Button>
            {error && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{error}</div>}
          </Card>

          {/* Results */}
          {result && (
            <div className="animate-fadeIn">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Card>
                  <Label>Target Persona</Label>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
                    {result.targetPersona}
                  </div>
                  <Tag color="var(--purple)">{result.contactType}</Tag>
                </Card>
                <Card>
                  <Label>LinkedIn Search Query</Label>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--green)",
                    background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: 6, padding: "8px 12px", wordBreak: "break-all",
                  }}>
                    {result.searchQuery}
                  </div>
                  <Button size="sm" variant="ghost" style={{ marginTop: 8 }} onClick={() => copy(result.searchQuery, "query")}>
                    {copied === "query" ? "✓ Copied" : "Copy query"}
                  </Button>
                </Card>
              </div>

              {[
                { label: "Connection Request", key: "connectionRequest", text: result.connectionRequest, limit: 300, channel: "LinkedIn" },
                { label: "Follow-Up Message", key: "followUp", text: result.followUpMessage, limit: 500, channel: "LinkedIn DM" },
                { label: "Referral Ask", key: "referral", text: result.referralAsk, limit: 600, channel: "LinkedIn / Email" },
              ].map(({ label, key, text, limit, channel }) => (
                <Card key={key} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Label>{label}</Label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Tag color="var(--text-muted)">{channel}</Tag>
                      <span style={{
                        fontSize: 10, fontFamily: "var(--font-mono)",
                        color: text.length > limit ? "var(--red)" : "var(--green)",
                      }}>
                        {text.length}/{limit}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    background: "var(--bg-base)", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "12px 14px", fontSize: 12, lineHeight: 1.7,
                    color: "var(--text-primary)", whiteSpace: "pre-wrap",
                  }}>
                    {text}
                  </div>
                  <Button size="sm" variant="secondary" style={{ marginTop: 8 }} onClick={() => copy(text, key)}>
                    {copied === key ? "✓ Copied" : "Copy message"}
                  </Button>
                </Card>
              ))}

              <Card>
                <Label>Strategy Tips</Label>
                {result.tips.map((tip, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", padding: "4px 0", display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--accent)" }}>→</span>
                    {tip}
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--bg-base)", borderRadius: 6, fontSize: 11, color: "var(--text-muted)", borderLeft: "2px solid var(--accent)" }}>
                  {result.rationale}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
