"use client";
// app/(dashboard)/profile/page.tsx
import { useState, useEffect } from "react";
import { PageHeader, Card, Button, Input, Label } from "../../../components/ui";

interface Profile {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  targetSalaryMin: number;
  targetSalaryIdeal: number;
  workModePrefs: string[];
  targetCities: string[];
  rolePreferences: string[];
  weightSpeed: number;
  weightFit: number;
  weightSalary: number;
  weightUpside: number;
  outreachVoice: string;
  uniqueAngles: string[];
  noGoCompanies: string[];
}

const DEFAULT_PROFILE: Profile = {
  fullName: "Meital Abadi",
  headline: "Data Scientist & AI Engineer | Technion B.Sc. | NLP · ML · LLM Pipelines",
  bio: "Recent Technion Data Science graduate with hands-on experience in NLP pipelines, ML modeling, and business intelligence. Built end-to-end data systems including large-scale article processing with LLM extraction (CIC project), Firebase/Flutter marketplace (BALI), and Airtable-based BI systems (Israeli Line). Looking for high-impact DS/AI roles in Israeli high-tech.",
  location: "Israel",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  targetSalaryMin: 18000,
  targetSalaryIdeal: 25000,
  workModePrefs: ["hybrid", "onsite"],
  targetCities: ["Tel Aviv", "Herzliya", "Haifa", "Ramat Gan", "Ra'anana", "Remote"],
  rolePreferences: ["Data Scientist", "AI Engineer", "AI Analyst", "Data Analyst", "Analytics Engineer"],
  weightSpeed: 25,
  weightFit: 30,
  weightSalary: 25,
  weightUpside: 20,
  outreachVoice: "concise, direct, and confident — mention Technion",
  uniqueAngles: [
    "End-to-end NLP pipeline (CIC): web scraping → LLM extraction → BI reporting",
    "Product + data mindset from building BALI marketplace app",
    "Business intelligence ownership at Israeli Line family business",
  ],
  noGoCompanies: [],
};

const ROLE_OPTIONS = [
  "Data Scientist", "AI Engineer", "AI Analyst", "Data Analyst",
  "Analytics Engineer", "ML Engineer", "Product Analyst",
];

const CITY_OPTIONS = [
  "Tel Aviv", "Herzliya", "Haifa", "Petah Tikva", "Ra'anana",
  "Ramat Gan", "Rishon LeZion", "Jerusalem", "Remote",
];

const WORK_MODE_OPTIONS = ["onsite", "hybrid", "remote", "flexible"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("identity");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile({
            ...DEFAULT_PROFILE,
            ...data.profile,
            workModePrefs: data.profile.workModePrefs || DEFAULT_PROFILE.workModePrefs,
            targetCities: data.profile.targetCities || DEFAULT_PROFILE.targetCities,
            rolePreferences: data.profile.rolePreferences || DEFAULT_PROFILE.rolePreferences,
          });
        }
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const totalWeight = profile.weightSpeed + profile.weightFit + profile.weightSalary + profile.weightUpside;

  const SECTIONS = ["identity", "targets", "priorities", "outreach"];

  return (
    <div style={{ flexDirection: "column", height: "100vh", display: "flex" }}>
      <PageHeader
        title="◉ Candidate Profile"
        subtitle="Your source of truth — used by all AI modules"
        actions={
          <Button variant="primary" onClick={save} loading={saving}>
            {saved ? "✓ Saved" : "Save Profile"}
          </Button>
        }
      />

      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}><span className="spinner" style={{ margin: "0 auto" }} /></div>
      ) : (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Section nav */}
          <div style={{ width: 160, borderRight: "1px solid var(--border)", padding: "12px 0" }}>
            {SECTIONS.map((s) => (
              <div
                key={s}
                onClick={() => setActiveSection(s)}
                style={{
                  padding: "8px 16px", cursor: "pointer", fontSize: 12, letterSpacing: 0.5,
                  color: activeSection === s ? "var(--accent)" : "var(--text-secondary)",
                  background: activeSection === s ? "var(--accent-dim)" : "transparent",
                  borderLeft: activeSection === s ? "2px solid var(--accent)" : "2px solid transparent",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 660 }}>
              {activeSection === "identity" && (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    <Label>Basic Info</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <Input label="Full Name" value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
                      <Input label="Headline" value={profile.headline} onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))} />
                      <div>
                        <Label>Bio</Label>
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                          style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "8px 12px", outline: "none", resize: "vertical", minHeight: 100, boxSizing: "border-box" }}
                        />
                      </div>
                      <Input label="LinkedIn URL" value={profile.linkedinUrl} onChange={(e) => setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                      <Input label="GitHub URL" value={profile.githubUrl} onChange={(e) => setProfile((p) => ({ ...p, githubUrl: e.target.value }))} placeholder="https://github.com/..." />
                      <Input label="Portfolio URL" value={profile.portfolioUrl} onChange={(e) => setProfile((p) => ({ ...p, portfolioUrl: e.target.value }))} />
                    </div>
                  </Card>
                </>
              )}

              {activeSection === "targets" && (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    <Label>Salary Target (ILS monthly)</Label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Input label="Minimum" type="number" value={profile.targetSalaryMin} onChange={(e) => setProfile((p) => ({ ...p, targetSalaryMin: parseInt(e.target.value) || 0 }))} />
                      <Input label="Ideal" type="number" value={profile.targetSalaryIdeal} onChange={(e) => setProfile((p) => ({ ...p, targetSalaryIdeal: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </Card>

                  <Card style={{ marginBottom: 16 }}>
                    <Label>Target Role Families</Label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {ROLE_OPTIONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setProfile((p) => ({ ...p, rolePreferences: toggleArray(p.rolePreferences, r) }))}
                          style={{
                            padding: "5px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                            background: profile.rolePreferences.includes(r) ? "var(--accent-dim)" : "transparent",
                            border: `1px solid ${profile.rolePreferences.includes(r) ? "var(--accent)" : "var(--border)"}`,
                            color: profile.rolePreferences.includes(r) ? "var(--accent)" : "var(--text-secondary)",
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card style={{ marginBottom: 16 }}>
                    <Label>Work Mode Preferences</Label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {WORK_MODE_OPTIONS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setProfile((p) => ({ ...p, workModePrefs: toggleArray(p.workModePrefs, m) }))}
                          style={{
                            padding: "5px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                            background: profile.workModePrefs.includes(m) ? "var(--accent-dim)" : "transparent",
                            border: `1px solid ${profile.workModePrefs.includes(m) ? "var(--accent)" : "var(--border)"}`,
                            color: profile.workModePrefs.includes(m) ? "var(--accent)" : "var(--text-secondary)",
                            textTransform: "capitalize",
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <Label>Target Cities</Label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {CITY_OPTIONS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setProfile((p) => ({ ...p, targetCities: toggleArray(p.targetCities, c) }))}
                          style={{
                            padding: "5px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                            background: profile.targetCities.includes(c) ? "var(--accent-dim)" : "transparent",
                            border: `1px solid ${profile.targetCities.includes(c) ? "var(--accent)" : "var(--border)"}`,
                            color: profile.targetCities.includes(c) ? "var(--accent)" : "var(--text-secondary)",
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              {activeSection === "priorities" && (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    <Label>Scoring Weights</Label>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>
                      These weights affect how jobs are ranked. Must sum to 100. Currently: {totalWeight}
                      {totalWeight !== 100 && <span style={{ color: "var(--red)" }}> (adjust to equal 100)</span>}
                    </p>
                    {[
                      { key: "weightSpeed", label: "Speed to Interview", desc: "Prefer roles with faster hiring process" },
                      { key: "weightFit", label: "Role Fit Quality", desc: "Prefer roles where skills match well" },
                      { key: "weightSalary", label: "Salary Upside", desc: "Prefer higher compensation potential" },
                      { key: "weightUpside", label: "Career Upside", desc: "Prefer roles with strong future growth" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{desc}</div>
                          </div>
                          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                            {profile[key as keyof Profile] as number}%
                          </span>
                        </div>
                        <input
                          type="range" min={0} max={100} step={5}
                          value={profile[key as keyof Profile] as number}
                          onChange={(e) => setProfile((p) => ({ ...p, [key]: parseInt(e.target.value) }))}
                          style={{ width: "100%", accentColor: "var(--accent)" }}
                        />
                      </div>
                    ))}
                  </Card>
                </>
              )}

              {activeSection === "outreach" && (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    <Label>Outreach Voice</Label>
                    <input
                      value={profile.outreachVoice}
                      onChange={(e) => setProfile((p) => ({ ...p, outreachVoice: e.target.value }))}
                      placeholder="e.g. concise, direct, warm — mention Technion"
                      style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "8px 12px", outline: "none", boxSizing: "border-box" }}
                    />
                  </Card>

                  <Card style={{ marginBottom: 16 }}>
                    <Label>Unique Narrative Angles</Label>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
                      Key differentiators used in outreach and resume summaries
                    </p>
                    {profile.uniqueAngles.map((angle, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                          value={angle}
                          onChange={(e) => {
                            const updated = [...profile.uniqueAngles];
                            updated[i] = e.target.value;
                            setProfile((p) => ({ ...p, uniqueAngles: updated }));
                          }}
                          style={{ flex: 1, background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "6px 10px", outline: "none" }}
                        />
                        <button onClick={() => setProfile((p) => ({ ...p, uniqueAngles: p.uniqueAngles.filter((_, idx) => idx !== i) }))}
                          style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 14 }}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => setProfile((p) => ({ ...p, uniqueAngles: [...p.uniqueAngles, ""] }))}>
                      + Add angle
                    </Button>
                  </Card>

                  <Card>
                    <Label>No-Go Companies</Label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                      {profile.noGoCompanies.map((c) => (
                        <span key={c} style={{ fontSize: 11, padding: "3px 8px", background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
                          {c}
                          <button onClick={() => setProfile((p) => ({ ...p, noGoCompanies: p.noGoCompanies.filter((x) => x !== c) }))}
                            style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 10 }}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        id="nogo-input"
                        placeholder="Add company to exclude..."
                        style={{ flex: 1, background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "6px 10px", outline: "none" }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              setProfile((p) => ({ ...p, noGoCompanies: [...p.noGoCompanies, val] }));
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>Press Enter to add</div>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
