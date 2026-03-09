# Full System Handoff - Job Hunter OS (Meital)

Project root:
`/Users/meitalabadi/Desktop/Claude Learning/job-hunter`

Generated at:
2026-03-08 22:51:24 IST

---

## 1) מטרת המסמך

זהו handoff מלא של המערכת כפי שהיא כרגע, כדי שאפשר יהיה לשתף אותו עם ChatGPT רגיל ולקבל ניתוח/פידבק/הכוונת המשך על בסיס **הקוד האמיתי** ולא רק תיאור חלקי.

המסמך כולל:

- תיאור ארכיטקטורה ותלויות
- מפת Routes (UI + API)
- מודל נתונים (Prisma)
- מודולי הלוגיקה המרכזיים
- נספח קוד מלא לכל קבצי הפרויקט הרלוונטיים

לא נכלל בכוונה:

- קבצי סודיות: `.env`, `.env.local`
- ארטיפקטים/תלויות: `node_modules`, `.next`
- קובץ handoff קודם של Agent 1 (כדי לא לשכפל ענקית בתוך ענקית)

---

## 2) תמונת מצב מערכת

### Stack

- Next.js 14 (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- Anthropic SDK (server-side)

### Runtime mode

- המערכת עובדת ב-single-user mode דרך:
  - `lib/auth/single-user.ts`

### סוכן 1 (Career Profile Agent)

- UI:
  - `/onboarding`
  - `/profile-memory`
- API:
  - `/api/onboarding`
  - `/api/profile-memory/*`
- Data models:
  - `CandidateIntake`
  - `SkillEvidence`
  - `ExperienceEpisode`
  - `InterviewStory`
- לוגיקת שרת:
  - `lib/profile-memory/*`

---

## 3) מפת קבצים ורכיבים

### Top-level files/dirs


```text
.DS_Store
.env
.env.example
.env.local
.eslintrc.json
.gitignore
.next
README.md
app
components
docs
lib
next-env.d.ts
next.config.js
node_modules
package-lock.json
package.json
prisma
tsconfig.json
types
```

### App Routes (UI pages)

```text
app/(auth)/login/page.tsx
app/(dashboard)/analytics/page.tsx
app/(dashboard)/applications/page.tsx
app/(dashboard)/jobs/page.tsx
app/(dashboard)/onboarding/page.tsx
app/(dashboard)/outreach/page.tsx
app/(dashboard)/page.tsx
app/(dashboard)/profile-memory/page.tsx
app/(dashboard)/profile/page.tsx
app/(dashboard)/resumes/page.tsx
```

### API Routes

```text
app/api/applications/[id]/route.ts
app/api/applications/route.ts
app/api/auth/[...nextauth]/route.ts
app/api/jobs/ingest/route.ts
app/api/jobs/route.ts
app/api/onboarding/route.ts
app/api/outreach/route.ts
app/api/profile-memory/experience-episodes/route.ts
app/api/profile-memory/interview-stories/route.ts
app/api/profile-memory/route.ts
app/api/profile-memory/skill-evidence/route.ts
app/api/profile-memory/skills/[id]/route.ts
app/api/profile-memory/skills/route.ts
app/api/profile/route.ts
app/api/resumes/route.ts
```

### Core libs

```text
lib/adapters/jobs/ingest.ts
lib/auth/options.ts
lib/auth/single-user.ts
lib/db/index.ts
lib/env.ts
lib/llm/provider.ts
lib/outreach/engine.ts
lib/profile-memory/engine.ts
lib/profile-memory/normalizers.ts
lib/profile-memory/selectors.ts
lib/profile-memory/types.ts
lib/resume/engine.ts
lib/schemas/index.ts
lib/scoring/engine.ts
```

---

## 4) החלטות מימוש חשובות

1. מצב עבודה אישי (single-user) נשמר כדי לא לשבור זרימות קיימות.
2. Agent 1 נבנה כתשתית זיכרון מועמד/ת additive, בלי לשכתב את engines הקיימים.
3. נשמרה הפרדה בין:
   - self-reported skill proficiency
   - evidence-backed records
4. נוספו APIs דטרמיניסטיים (לא תלויי LLM) ל-CRUD של profile-memory.
5. סנכרון DB לפרויקט קיים בוצע דרך \`prisma db push\`.

---

## 5) פקודות עבודה ובדיקה

```bash
cd '/Users/meitalabadi/Desktop/Claude Learning/job-hunter'
npm run lint
npm run build
npm run dev
```

DB sync (בפרויקט הנוכחי):

```bash
npm run db:push
```

---

## 6) Code Appendix (Full)

> זה נספח הקוד המלא לכל קבצי הפרויקט שנכללו.


### File: `.env.example`

```text
# ────────────────────────────────────────────────────────────
# Job Hunter OS — Environment Variables
# Copy this file to .env.local and fill in your values
# NEVER commit .env.local to version control
# ────────────────────────────────────────────────────────────

# Database (PostgreSQL)
# For local dev: postgresql://USER:PASSWORD@localhost:5432/job_hunter_os
# For production: use a managed Postgres service (Neon, Supabase, Railway, etc.)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/job_hunter_os"

# Authentication
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="REPLACE_WITH_SECURE_RANDOM_SECRET"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic Claude (SERVER-SIDE ONLY — never expose to client)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY="sk-ant-REPLACE_WITH_YOUR_KEY"

```

### File: `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals"]
}

```

### File: `.gitignore`

```text
node_modules
.next
.env
.env.local
.env.*.local
dist
coverage
*.log
*.tsbuildinfo

```

### File: `README.md`

```md
# Job Hunter OS (Production Foundation)

Personal Job-Search Operating System optimized for Meital and the Israeli high-tech market.

## What Is Included

- Next.js 14 + TypeScript app router structure
- Server-side authentication with NextAuth (credentials)
- PostgreSQL + Prisma schema for:
  - candidate profile
  - jobs + deterministic scoring
  - applications CRM + stage history
  - resume versions
  - outreach messages
- LLM orchestration layer (server-side only, Anthropic SDK)
- Manual job ingestion + explainable scoring engine
- Resume generation foundation with versioning
- Outreach generation endpoint

## 1. Setup

```bash
cp .env.example .env.local
```

Fill in:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (usually `http://localhost:3000`)
- `ANTHROPIC_API_KEY`

## 2. Install

```bash
npm install
```

## 3. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Seed default login:

- Email: `meital@jobhunter.local`
- Password: `changeme123` (or `SEED_PASSWORD`)

## 4. Run

```bash
npm run dev
```

Open: `http://localhost:3000`

## Notes

- All model/provider calls are server-side only.
- No API keys are exposed to the client.
- Scoring is deterministic and explainable (factor breakdown persisted).

```

### File: `app/(auth)/login/page.tsx`

```tsx
import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/");
}

```

### File: `app/(dashboard)/analytics/page.tsx`

```tsx
export const dynamic = "force-dynamic";

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
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 18,
      }}
    >
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
      <div
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        <h1 style={{ fontSize: 16, fontWeight: 700 }}>Analytics</h1>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
          Conversion and quality signals for your job search funnel
        </p>
      </div>

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
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

```

### File: `app/(dashboard)/applications/page.tsx`

```tsx
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

```

### File: `app/(dashboard)/jobs/page.tsx`

```tsx
"use client";
// app/(dashboard)/jobs/page.tsx
import { useState, useEffect, useCallback } from "react";
import { PageHeader, Card, Button, Textarea, Input, Select, ScoreBadge, Tag, Label, EmptyState } from "../../../components/ui";

interface JobScore {
  totalScore: number;
  recommendation: string;
  strengths: string[];
  risks: string[];
  confidence: number;
  llmExplanation: string;
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
  const [sortBy, setSortBy] = useState("score");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sortBy, sortDir: "desc", limit: "50" });
      if (search) params.set("search", search);
      if (minScore) params.set("minScore", minScore);
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [search, minScore, sortBy]);

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
        title="◎ Jobs Inbox"
        subtitle={`${jobs.length} jobs · sorted by fit score`}
        actions={
          <Button variant="primary" onClick={() => { setShowIngest(!showIngest); setSelectedJob(null); }}>
            {showIngest ? "← Back" : "+ Ingest Job"}
          </Button>
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
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, background: "var(--bg-base)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-primary)", fontSize: 12, padding: "6px 10px", outline: "none",
              }}
            />
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              style={{
                background: "var(--bg-base)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-secondary)", fontSize: 11, padding: "6px 8px", outline: "none",
              }}
            >
              <option value="">All scores</option>
              <option value="75">75+ only</option>
              <option value="60">60+ only</option>
              <option value="50">50+ only</option>
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
                      {score && <ScoreBadge score={score.totalScore} recommendation={score.recommendation} />}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>
                      {job.company?.name || "Unknown"}
                      {job.location && ` · ${job.location}`}
                      {job.workMode && ` · ${job.workMode}`}
                    </div>
                    <div>
                      {job.requiredSkills.slice(0, 4).map((s) => (
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
                  {ingesting ? "Extracting & scoring..." : "◎ Analyze & Add Job"}
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
                      : "✓ Job added and scored!"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Job detail */}
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
                    <ScoreBadge score={selectedScore.totalScore} recommendation={selectedScore.recommendation} />
                  )}
                </div>
              </div>

              {selectedScore && (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    <Label>AI Analysis</Label>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                      {selectedScore.llmExplanation}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <Label>Strengths</Label>
                        {selectedScore.strengths.map((s, i) => (
                          <div key={i} style={{ fontSize: 11, color: "var(--green)", marginBottom: 3 }}>✓ {s}</div>
                        ))}
                      </div>
                      <div>
                        <Label>Risks</Label>
                        {selectedScore.risks.length === 0
                          ? <div style={{ fontSize: 11, color: "var(--text-muted)" }}>No major risks</div>
                          : selectedScore.risks.map((r, i) => (
                            <div key={i} style={{ fontSize: 11, color: "var(--red)", marginBottom: 3 }}>✗ {r}</div>
                          ))}
                      </div>
                    </div>
                  </Card>
                </>
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

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                  + Add to Applications
                </Button>
                <Button variant="secondary" onClick={async () => {
                  const res = await fetch("/api/resumes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jobId: selectedJob.id }),
                  });
                  if (res.ok) alert("Resume generated! View in Resumes tab.");
                }}>
                  ▤ Generate Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

```

### File: `app/(dashboard)/layout.tsx`

```tsx
// app/(dashboard)/layout.tsx
import { Sidebar } from "../../components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflow: "auto",
        background: "var(--bg-base)",
      }}>
        {children}
      </main>
    </div>
  );
}

```

### File: `app/(dashboard)/onboarding/page.tsx`

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  Label,
  PageHeader,
  Select,
  Textarea,
} from "../../../components/ui";

type WorkMode = "ONSITE" | "HYBRID" | "REMOTE" | "FLEXIBLE";
type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
type EvidenceType =
  | "PROJECT"
  | "COURSE"
  | "INTERVIEW"
  | "WORK_EXPERIENCE"
  | "EXERCISE"
  | "CERTIFICATION"
  | "OTHER";
type StoryType =
  | "BEHAVIORAL"
  | "TECHNICAL"
  | "LEADERSHIP"
  | "FAILURE"
  | "PROJECT"
  | "CONFLICT"
  | "OWNERSHIP";

interface CandidateSkillView {
  id: string;
  proficiency: SkillLevel;
  lastUsedAt?: string;
  interviewConfidence?: number;
  productionConfidence?: number;
  selfReportedOnly: boolean;
  profileNotes?: string;
  skill: { id: string; name: string };
  evidenceRecords: {
    id: string;
    title: string;
    evidenceType: EvidenceType;
    evidenceDate?: string;
    credibility?: number;
  }[];
}

interface ExperienceEpisodeView {
  id: string;
  title: string;
  organization?: string;
  impact?: string;
  interviewConfidence?: number;
}

interface InterviewStoryView {
  id: string;
  type: StoryType;
  title: string;
  confidence?: number;
}

interface Snapshot {
  onboardingComplete: boolean;
  skills: CandidateSkillView[];
  experienceEpisodes: ExperienceEpisodeView[];
  interviewStories: InterviewStoryView[];
}

interface OnboardingForm {
  targetTitle: string;
  fallbackTitles: string[];
  minimumSalaryIls?: number;
  idealSalaryMinIls?: number;
  idealSalaryMaxIls?: number;
  acceptableCities: string[];
  conditionalCities: string[];
  unacceptableCities: string[];
  workModes: WorkMode[];
  roleSeniorityTarget: string;
  constraintsNotes: string;
  topTargetCompanies: string[];
  preferredStages: string[];
  preferredDomains: string[];
  avoidDomains: string[];
  preferredTeamTypes: string[];
  avoidIndustries: string[];
  strongestTopics: string[];
  weakestTopics: string[];
  stressfulInterviewTypes: string[];
  missingMaterials: string[];
  confidenceRecruiterInterview?: number;
  confidenceTechnicalInterview?: number;
  confidenceCaseInterview?: number;
  confidenceBehavioralInterview?: number;
  hebrewCommunicationConfidence?: number;
  englishCommunicationConfidence?: number;
  writingConfidence?: number;
  liveInterviewConfidence?: number;
  preferredOutreachTone: string;
  preferredPositioningStyle: string;
  outreachAvoidances: string[];
}

const DEFAULT_FORM: OnboardingForm = {
  targetTitle: "",
  fallbackTitles: [],
  acceptableCities: [],
  conditionalCities: [],
  unacceptableCities: [],
  workModes: ["HYBRID"],
  roleSeniorityTarget: "",
  constraintsNotes: "",
  topTargetCompanies: [],
  preferredStages: [],
  preferredDomains: [],
  avoidDomains: [],
  preferredTeamTypes: [],
  avoidIndustries: [],
  strongestTopics: [],
  weakestTopics: [],
  stressfulInterviewTypes: [],
  missingMaterials: [],
  preferredOutreachTone: "",
  preferredPositioningStyle: "",
  outreachAvoidances: [],
};

const STEPS = [
  "Goals",
  "Market",
  "Skills",
  "Evidence",
  "Episodes",
  "Readiness",
  "Communication",
  "Review",
];

const WORK_MODES: WorkMode[] = ["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"];
const SKILL_LEVELS: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const EVIDENCE_TYPES: EvidenceType[] = [
  "PROJECT",
  "COURSE",
  "INTERVIEW",
  "WORK_EXPERIENCE",
  "EXERCISE",
  "CERTIFICATION",
  "OTHER",
];
const STORY_TYPES: StoryType[] = [
  "PROJECT",
  "BEHAVIORAL",
  "TECHNICAL",
  "LEADERSHIP",
  "FAILURE",
  "CONFLICT",
  "OWNERSHIP",
];

function toCsv(values: string[]) {
  return values.join(", ");
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>(DEFAULT_FORM);
  const [snapshot, setSnapshot] = useState<Snapshot>({
    onboardingComplete: false,
    skills: [],
    experienceEpisodes: [],
    interviewStories: [],
  });
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "",
    proficiency: "INTERMEDIATE" as SkillLevel,
    lastUsedAt: "",
    interviewConfidence: "",
    productionConfidence: "",
    selfReportedOnly: true,
    profileNotes: "",
  });

  const [evidenceForm, setEvidenceForm] = useState({
    candidateSkillId: "",
    evidenceType: "PROJECT" as EvidenceType,
    title: "",
    description: "",
    outcome: "",
    evidenceDate: "",
    credibility: "",
    url: "",
  });

  const [episodeForm, setEpisodeForm] = useState({
    title: "",
    organization: "",
    context: "",
    technicalOwnership: "",
    collaborators: "",
    dataScale: "",
    toolingStack: "",
    tradeoffs: "",
    impact: "",
    biggestChallenge: "",
    resolution: "",
    interviewConfidence: "",
    externallyUsable: true,
  });

  const [storyForm, setStoryForm] = useState({
    type: "PROJECT" as StoryType,
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    topics: "",
    confidence: "",
  });

  const progressLabel = useMemo(() => `${step + 1}/${STEPS.length}`, [step]);

  async function refreshState() {
    const res = await fetch("/api/onboarding");
    const data = await res.json();

    if (data.onboarding) {
      setForm((prev) => ({
        ...prev,
        ...data.onboarding,
        targetTitle: data.onboarding.targetTitle || "",
        roleSeniorityTarget: data.onboarding.roleSeniorityTarget || "",
        constraintsNotes: data.onboarding.constraintsNotes || "",
        preferredOutreachTone: data.onboarding.preferredOutreachTone || "",
        preferredPositioningStyle: data.onboarding.preferredPositioningStyle || "",
      }));
    }

    if (data.snapshot) {
      setSnapshot({
        onboardingComplete: !!data.snapshot.onboardingComplete,
        skills: data.snapshot.skills || [],
        experienceEpisodes: data.snapshot.experienceEpisodes || [],
        interviewStories: data.snapshot.interviewStories || [],
      });
    }
  }

  useEffect(() => {
    refreshState()
      .catch(() => setError("Failed to load onboarding state"))
      .finally(() => setLoading(false));
  }, []);

  async function saveDraft() {
    setSavingDraft(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, finalize: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");
      setMessage("Draft saved");
      if (data.snapshot) {
        setSnapshot({
          onboardingComplete: !!data.snapshot.onboardingComplete,
          skills: data.snapshot.skills || [],
          experienceEpisodes: data.snapshot.experienceEpisodes || [],
          interviewStories: data.snapshot.interviewStories || [],
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingDraft(false);
    }
  }

  async function finalizeOnboarding() {
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, finalize: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalize onboarding");
      setMessage("Onboarding completed");
      if (data.snapshot) {
        setSnapshot({
          onboardingComplete: !!data.snapshot.onboardingComplete,
          skills: data.snapshot.skills || [],
          experienceEpisodes: data.snapshot.experienceEpisodes || [],
          interviewStories: data.snapshot.interviewStories || [],
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function addSkill() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: skillForm.name,
          category: skillForm.category || undefined,
          proficiency: skillForm.proficiency,
          lastUsedAt: skillForm.lastUsedAt
            ? new Date(skillForm.lastUsedAt).toISOString()
            : undefined,
          interviewConfidence: parseNumber(skillForm.interviewConfidence),
          productionConfidence: parseNumber(skillForm.productionConfidence),
          selfReportedOnly: skillForm.selfReportedOnly,
          profileNotes: skillForm.profileNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add skill");
      setSkillForm({
        name: "",
        category: "",
        proficiency: "INTERMEDIATE",
        lastUsedAt: "",
        interviewConfidence: "",
        productionConfidence: "",
        selfReportedOnly: true,
        profileNotes: "",
      });
      setMessage("Skill added");
      await refreshState();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addEvidence() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/skill-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateSkillId: evidenceForm.candidateSkillId,
          evidenceType: evidenceForm.evidenceType,
          title: evidenceForm.title,
          description: evidenceForm.description || undefined,
          outcome: evidenceForm.outcome || undefined,
          evidenceDate: evidenceForm.evidenceDate
            ? new Date(evidenceForm.evidenceDate).toISOString()
            : undefined,
          credibility: parseNumber(evidenceForm.credibility),
          url: evidenceForm.url || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add evidence");
      setEvidenceForm({
        candidateSkillId: "",
        evidenceType: "PROJECT",
        title: "",
        description: "",
        outcome: "",
        evidenceDate: "",
        credibility: "",
        url: "",
      });
      setMessage("Evidence added");
      await refreshState();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addEpisode() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/experience-episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: episodeForm.title,
          organization: episodeForm.organization || undefined,
          context: episodeForm.context || undefined,
          technicalOwnership: episodeForm.technicalOwnership || undefined,
          collaborators: fromCsv(episodeForm.collaborators),
          dataScale: episodeForm.dataScale || undefined,
          toolingStack: fromCsv(episodeForm.toolingStack),
          tradeoffs: fromCsv(episodeForm.tradeoffs),
          impact: episodeForm.impact || undefined,
          biggestChallenge: episodeForm.biggestChallenge || undefined,
          resolution: episodeForm.resolution || undefined,
          interviewConfidence: parseNumber(episodeForm.interviewConfidence),
          externallyUsable: episodeForm.externallyUsable,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add episode");
      setEpisodeForm({
        title: "",
        organization: "",
        context: "",
        technicalOwnership: "",
        collaborators: "",
        dataScale: "",
        toolingStack: "",
        tradeoffs: "",
        impact: "",
        biggestChallenge: "",
        resolution: "",
        interviewConfidence: "",
        externallyUsable: true,
      });
      setMessage("Experience episode added");
      await refreshState();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addStory() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/interview-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: storyForm.type,
          title: storyForm.title,
          situation: storyForm.situation,
          task: storyForm.task,
          action: storyForm.action,
          result: storyForm.result,
          topics: fromCsv(storyForm.topics),
          confidence: parseNumber(storyForm.confidence),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add interview story");
      setStoryForm({
        type: "PROJECT",
        title: "",
        situation: "",
        task: "",
        action: "",
        result: "",
        topics: "",
        confidence: "",
      });
      setMessage("Interview story added");
      await refreshState();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function renderStepContent() {
    if (step === 0) {
      return (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input
              label="Target title (next 3 months)"
              value={form.targetTitle}
              onChange={(e) => setForm((prev) => ({ ...prev, targetTitle: e.target.value }))}
            />
            <Input
              label="Role seniority target"
              value={form.roleSeniorityTarget}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, roleSeniorityTarget: e.target.value }))
              }
            />
            <Input
              label="Fallback titles (comma-separated)"
              value={toCsv(form.fallbackTitles)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fallbackTitles: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Acceptable cities (comma-separated)"
              value={toCsv(form.acceptableCities)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, acceptableCities: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Conditional cities (comma-separated)"
              value={toCsv(form.conditionalCities)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, conditionalCities: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Unacceptable locations (comma-separated)"
              value={toCsv(form.unacceptableCities)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, unacceptableCities: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Minimum salary (ILS / month)"
              type="number"
              value={form.minimumSalaryIls ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  minimumSalaryIls: parseNumber(e.target.value),
                }))
              }
            />
            <Input
              label="Ideal salary min (ILS / month)"
              type="number"
              value={form.idealSalaryMinIls ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  idealSalaryMinIls: parseNumber(e.target.value),
                }))
              }
            />
            <Input
              label="Ideal salary max (ILS / month)"
              type="number"
              value={form.idealSalaryMaxIls ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  idealSalaryMaxIls: parseNumber(e.target.value),
                }))
              }
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <Label>Work mode preference</Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {WORK_MODES.map((mode) => {
                const active = form.workModes.includes(mode);
                return (
                  <button
                    key={mode}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        workModes: active
                          ? prev.workModes.filter((item) => item !== mode)
                          : [...prev.workModes, mode],
                      }))
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 5,
                      cursor: "pointer",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent-dim)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      fontSize: 11,
                    }}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Textarea
              label="Notes about constraints"
              value={form.constraintsNotes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, constraintsNotes: e.target.value }))
              }
            />
          </div>
        </Card>
      );
    }

    if (step === 1) {
      return (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input
              label="Top target companies"
              value={toCsv(form.topTargetCompanies)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, topTargetCompanies: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Preferred company stages"
              value={toCsv(form.preferredStages)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, preferredStages: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Preferred domains"
              value={toCsv(form.preferredDomains)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, preferredDomains: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="No-go domains"
              value={toCsv(form.avoidDomains)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, avoidDomains: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Preferred team types"
              value={toCsv(form.preferredTeamTypes)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, preferredTeamTypes: fromCsv(e.target.value) }))
              }
            />
            <Input
              label="Industries to avoid"
              value={toCsv(form.avoidIndustries)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, avoidIndustries: fromCsv(e.target.value) }))
              }
            />
          </div>
        </Card>
      );
    }

    if (step === 2) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Input
                label="Skill name"
                value={skillForm.name}
                onChange={(e) => setSkillForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Category"
                value={skillForm.category}
                onChange={(e) => setSkillForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="language, framework, analytics..."
              />
              <Select
                label="Current level"
                value={skillForm.proficiency}
                onChange={(e) =>
                  setSkillForm((prev) => ({
                    ...prev,
                    proficiency: e.target.value as SkillLevel,
                  }))
                }
              >
                {SKILL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
              <Input
                label="Last used"
                type="date"
                value={skillForm.lastUsedAt}
                onChange={(e) => setSkillForm((prev) => ({ ...prev, lastUsedAt: e.target.value }))}
              />
              <Input
                label="Interview confidence (0-100)"
                type="number"
                value={skillForm.interviewConfidence}
                onChange={(e) =>
                  setSkillForm((prev) => ({ ...prev, interviewConfidence: e.target.value }))
                }
              />
              <Input
                label="Production confidence (0-100)"
                type="number"
                value={skillForm.productionConfidence}
                onChange={(e) =>
                  setSkillForm((prev) => ({ ...prev, productionConfidence: e.target.value }))
                }
              />
              <Textarea
                label="Notes"
                value={skillForm.profileNotes}
                onChange={(e) =>
                  setSkillForm((prev) => ({ ...prev, profileNotes: e.target.value }))
                }
              />
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={skillForm.selfReportedOnly}
                  onChange={(e) =>
                    setSkillForm((prev) => ({
                      ...prev,
                      selfReportedOnly: e.target.checked,
                    }))
                  }
                  style={{ marginRight: 8 }}
                />
                Self-reported only
              </label>
              <Button variant="primary" onClick={addSkill} disabled={!skillForm.name.trim()}>
                Add skill
              </Button>
            </div>
          </Card>

          <Card>
            <Label>Current skills</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
              {snapshot.skills.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No skills added yet</div>
              )}
              {snapshot.skills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: 10,
                    background: "var(--bg-base)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{skill.skill.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {skill.proficiency} · Interview {skill.interviewConfidence ?? "-"} · Production{" "}
                    {skill.productionConfidence ?? "-"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                    {skill.selfReportedOnly ? "Self-reported" : "Evidence-backed"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Select
                label="Skill"
                value={evidenceForm.candidateSkillId}
                onChange={(e) =>
                  setEvidenceForm((prev) => ({ ...prev, candidateSkillId: e.target.value }))
                }
              >
                <option value="">Select skill</option>
                {snapshot.skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.skill.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Evidence type"
                value={evidenceForm.evidenceType}
                onChange={(e) =>
                  setEvidenceForm((prev) => ({
                    ...prev,
                    evidenceType: e.target.value as EvidenceType,
                  }))
                }
              >
                {EVIDENCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <Input
                label="Title"
                value={evidenceForm.title}
                onChange={(e) => setEvidenceForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                label="Description"
                value={evidenceForm.description}
                onChange={(e) =>
                  setEvidenceForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <Textarea
                label="Outcome / result"
                value={evidenceForm.outcome}
                onChange={(e) =>
                  setEvidenceForm((prev) => ({ ...prev, outcome: e.target.value }))
                }
              />
              <Input
                label="Approximate date"
                type="date"
                value={evidenceForm.evidenceDate}
                onChange={(e) =>
                  setEvidenceForm((prev) => ({ ...prev, evidenceDate: e.target.value }))
                }
              />
              <Input
                label="Credibility score (0-100)"
                type="number"
                value={evidenceForm.credibility}
                onChange={(e) =>
                  setEvidenceForm((prev) => ({ ...prev, credibility: e.target.value }))
                }
              />
              <Input
                label="URL / reference"
                value={evidenceForm.url}
                onChange={(e) => setEvidenceForm((prev) => ({ ...prev, url: e.target.value }))}
              />
              <Button
                variant="primary"
                onClick={addEvidence}
                disabled={!evidenceForm.candidateSkillId || !evidenceForm.title.trim()}
              >
                Add evidence
              </Button>
            </div>
          </Card>

          <Card>
            <Label>Evidence by skill</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 520, overflowY: "auto" }}>
              {snapshot.skills.map((skill) => (
                <div key={skill.id}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{skill.skill.name}</div>
                  {skill.evidenceRecords.length === 0 ? (
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>No evidence yet</div>
                  ) : (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                      {skill.evidenceRecords.map((record) => (
                        <div
                          key={record.id}
                          style={{
                            padding: 8,
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            background: "var(--bg-base)",
                          }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 600 }}>{record.title}</div>
                          <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                            {record.evidenceType} · {record.credibility ?? "-"} credibility ·{" "}
                            {toDateInput(record.evidenceDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Input
                label="Title"
                value={episodeForm.title}
                onChange={(e) => setEpisodeForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Input
                label="Organization or project name"
                value={episodeForm.organization}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({ ...prev, organization: e.target.value }))
                }
              />
              <Textarea
                label="Context / business problem"
                value={episodeForm.context}
                onChange={(e) => setEpisodeForm((prev) => ({ ...prev, context: e.target.value }))}
              />
              <Textarea
                label="Technical ownership"
                value={episodeForm.technicalOwnership}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({
                    ...prev,
                    technicalOwnership: e.target.value,
                  }))
                }
              />
              <Input
                label="Collaborators (comma-separated)"
                value={episodeForm.collaborators}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({ ...prev, collaborators: e.target.value }))
                }
              />
              <Input
                label="Data scale"
                value={episodeForm.dataScale}
                onChange={(e) => setEpisodeForm((prev) => ({ ...prev, dataScale: e.target.value }))}
              />
              <Input
                label="Tooling stack (comma-separated)"
                value={episodeForm.toolingStack}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({ ...prev, toolingStack: e.target.value }))
                }
              />
              <Input
                label="Tradeoffs made (comma-separated)"
                value={episodeForm.tradeoffs}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({ ...prev, tradeoffs: e.target.value }))
                }
              />
              <Textarea
                label="Result / impact"
                value={episodeForm.impact}
                onChange={(e) => setEpisodeForm((prev) => ({ ...prev, impact: e.target.value }))}
              />
              <Textarea
                label="Biggest challenge"
                value={episodeForm.biggestChallenge}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({ ...prev, biggestChallenge: e.target.value }))
                }
              />
              <Textarea
                label="Fix / resolution"
                value={episodeForm.resolution}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({ ...prev, resolution: e.target.value }))
                }
              />
              <Input
                label="Interview confidence (0-100)"
                type="number"
                value={episodeForm.interviewConfidence}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({
                    ...prev,
                    interviewConfidence: e.target.value,
                  }))
                }
              />
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={episodeForm.externallyUsable}
                  onChange={(e) =>
                    setEpisodeForm((prev) => ({
                      ...prev,
                      externallyUsable: e.target.checked,
                    }))
                  }
                  style={{ marginRight: 8 }}
                />
                Safe for external resume use
              </label>
              <Button variant="primary" onClick={addEpisode} disabled={!episodeForm.title.trim()}>
                Add episode
              </Button>
            </div>
          </Card>

          <Card>
            <Label>Stored experience episodes</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {snapshot.experienceEpisodes.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No episodes yet</div>
              )}
              {snapshot.experienceEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: 10,
                    background: "var(--bg-base)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{episode.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {episode.organization || "No organization"} · Interview{" "}
                    {episode.interviewConfidence ?? "-"}
                  </div>
                  {episode.impact && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      {episode.impact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input
                label="Strongest topics"
                value={toCsv(form.strongestTopics)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, strongestTopics: fromCsv(e.target.value) }))
                }
              />
              <Input
                label="Weakest topics"
                value={toCsv(form.weakestTopics)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, weakestTopics: fromCsv(e.target.value) }))
                }
              />
              <Input
                label="Stressful interview types"
                value={toCsv(form.stressfulInterviewTypes)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stressfulInterviewTypes: fromCsv(e.target.value),
                  }))
                }
              />
              <Input
                label="Missing materials"
                value={toCsv(form.missingMaterials)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, missingMaterials: fromCsv(e.target.value) }))
                }
              />
              <Input
                label="Recruiter interview confidence (0-100)"
                type="number"
                value={form.confidenceRecruiterInterview ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confidenceRecruiterInterview: parseNumber(e.target.value),
                  }))
                }
              />
              <Input
                label="Technical interview confidence (0-100)"
                type="number"
                value={form.confidenceTechnicalInterview ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confidenceTechnicalInterview: parseNumber(e.target.value),
                  }))
                }
              />
              <Input
                label="Case/Product/Analytics confidence (0-100)"
                type="number"
                value={form.confidenceCaseInterview ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confidenceCaseInterview: parseNumber(e.target.value),
                  }))
                }
              />
              <Input
                label="Behavioral confidence (0-100)"
                type="number"
                value={form.confidenceBehavioralInterview ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confidenceBehavioralInterview: parseNumber(e.target.value),
                  }))
                }
              />
            </div>
          </Card>

          <Card>
            <Label>Interview stories</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Select
                label="Story type"
                value={storyForm.type}
                onChange={(e) =>
                  setStoryForm((prev) => ({ ...prev, type: e.target.value as StoryType }))
                }
              >
                {STORY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <Input
                label="Title"
                value={storyForm.title}
                onChange={(e) => setStoryForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                label="Situation"
                value={storyForm.situation}
                onChange={(e) =>
                  setStoryForm((prev) => ({ ...prev, situation: e.target.value }))
                }
              />
              <Textarea
                label="Task"
                value={storyForm.task}
                onChange={(e) => setStoryForm((prev) => ({ ...prev, task: e.target.value }))}
              />
              <Textarea
                label="Action"
                value={storyForm.action}
                onChange={(e) => setStoryForm((prev) => ({ ...prev, action: e.target.value }))}
              />
              <Textarea
                label="Result"
                value={storyForm.result}
                onChange={(e) => setStoryForm((prev) => ({ ...prev, result: e.target.value }))}
              />
              <Input
                label="Topics (comma-separated)"
                value={storyForm.topics}
                onChange={(e) => setStoryForm((prev) => ({ ...prev, topics: e.target.value }))}
              />
              <Input
                label="Confidence (0-100)"
                type="number"
                value={storyForm.confidence}
                onChange={(e) =>
                  setStoryForm((prev) => ({ ...prev, confidence: e.target.value }))
                }
              />
              <Button
                variant="primary"
                onClick={addStory}
                disabled={!storyForm.title || !storyForm.situation || !storyForm.task || !storyForm.action || !storyForm.result}
              >
                Add interview story
              </Button>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {snapshot.interviewStories.map((story) => (
                <div key={story.id} style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  {story.type}: {story.title} ({story.confidence ?? "-"})
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (step === 6) {
      return (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input
              label="Hebrew communication confidence (0-100)"
              type="number"
              value={form.hebrewCommunicationConfidence ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  hebrewCommunicationConfidence: parseNumber(e.target.value),
                }))
              }
            />
            <Input
              label="English communication confidence (0-100)"
              type="number"
              value={form.englishCommunicationConfidence ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  englishCommunicationConfidence: parseNumber(e.target.value),
                }))
              }
            />
            <Input
              label="Writing confidence (0-100)"
              type="number"
              value={form.writingConfidence ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, writingConfidence: parseNumber(e.target.value) }))
              }
            />
            <Input
              label="Live interview confidence (0-100)"
              type="number"
              value={form.liveInterviewConfidence ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  liveInterviewConfidence: parseNumber(e.target.value),
                }))
              }
            />
            <Input
              label="Preferred outreach tone"
              value={form.preferredOutreachTone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, preferredOutreachTone: e.target.value }))
              }
            />
            <Input
              label="Preferred self-positioning style"
              value={form.preferredPositioningStyle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, preferredPositioningStyle: e.target.value }))
              }
            />
            <Input
              label="Things to avoid in outreach"
              value={toCsv(form.outreachAvoidances)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, outreachAvoidances: fromCsv(e.target.value) }))
              }
            />
          </div>
        </Card>
      );
    }

    return (
      <Card>
        <Label>Review before final submission</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Goal</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{form.targetTitle || "-"}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              Fallback: {toCsv(form.fallbackTitles) || "-"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              Cities: {toCsv(form.acceptableCities) || "-"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Market</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
              Domains: {toCsv(form.preferredDomains) || "-"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              Stages: {toCsv(form.preferredStages) || "-"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              Target companies: {toCsv(form.topTargetCompanies) || "-"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Knowledge base</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
              Skills: {snapshot.skills.length}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              Experience episodes: {snapshot.experienceEpisodes.length}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              Interview stories: {snapshot.interviewStories.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Readiness</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
              Strongest: {toCsv(form.strongestTopics) || "-"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
              Weakest: {toCsv(form.weakestTopics) || "-"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Button variant="primary" onClick={finalizeOnboarding} loading={submitting}>
            Finalize onboarding
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader
        title="◍ Career Profile Onboarding"
        subtitle={`Step ${progressLabel} · ${STEPS[step]}${snapshot.onboardingComplete ? " · Completed" : ""}`}
        actions={
          <Button variant="secondary" onClick={saveDraft} loading={savingDraft}>
            Save Draft
          </Button>
        }
      />

      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <span className="spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div
            style={{
              width: 220,
              borderRight: "1px solid var(--border)",
              padding: "10px 0",
              overflowY: "auto",
            }}
          >
            {STEPS.map((label, index) => {
              const active = index === step;
              return (
                <div
                  key={label}
                  onClick={() => setStep(index)}
                  style={{
                    padding: "9px 16px",
                    cursor: "pointer",
                    fontSize: 12,
                    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                    background: active ? "var(--accent-dim)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {index + 1}. {label}
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {error && (
              <div
                style={{
                  marginBottom: 12,
                  border: "1px solid var(--red)",
                  background: "var(--red-dim)",
                  color: "var(--red)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}
            {message && (
              <div
                style={{
                  marginBottom: 12,
                  border: "1px solid var(--green)",
                  background: "var(--green-dim)",
                  color: "var(--green)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 12,
                }}
              >
                {message}
              </div>
            )}

            {renderStepContent()}

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <Button
                variant="secondary"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))}
                disabled={step === STEPS.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

### File: `app/(dashboard)/outreach/page.tsx`

```tsx
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

```

### File: `app/(dashboard)/page.tsx`

```tsx
// app/(dashboard)/page.tsx
export const dynamic = "force-dynamic";

import { db } from "../../lib/db";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";
import Link from "next/link";

async function getDashboardData() {
  const context = await getOrCreateSingleUserContext();
  const profile = await db.candidateProfile.findUnique({
    where: { id: context.candidateProfileId },
  });

  if (!profile) {
    return { profile: null, stats: null, recentApps: [] };
  }

  const profileId = profile.id;

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
    profile,
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
  const { profile, stats, recentApps } = await getDashboardData();

  if (!profile) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>◉</div>
        <h2 style={{ color: "var(--accent)", marginBottom: 8 }}>Set up your profile first</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
          Before the system can work for you, it needs to know who you are.
        </p>
        <Link href="/profile" style={{
          display: "inline-block", padding: "10px 20px",
          background: "var(--accent)", color: "var(--bg-base)",
          textDecoration: "none", borderRadius: 6, fontWeight: 700, fontSize: 12,
        }}>
          Complete Your Profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{
        padding: "20px 28px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>Command Center</h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            Job Search OS — {profile.fullName}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/jobs" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", background: "var(--accent)", color: "var(--bg-base)",
            textDecoration: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1,
          }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Jobs in Inbox", val: stats.totalJobs, sub: `${stats.strongApply} strong match`, color: "var(--accent)", href: "/jobs" },
              { label: "Active Pipeline", val: stats.activeApps, sub: `${stats.totalApps} total applied`, color: "var(--purple)", href: "/applications" },
              { label: "Interviews", val: stats.interviews, sub: "technical or final", color: "var(--yellow)", href: "/applications" },
              { label: "Offers", val: stats.offers, sub: stats.offers > 0 ? "🎉 Congratulations!" : "keep pushing", color: "var(--green)", href: "/applications" },
            ].map((stat) => (
              <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: 18, cursor: "pointer",
                  transition: "border-color 0.15s",
                }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Recent Applications */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
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
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
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

```

### File: `app/(dashboard)/profile-memory/page.tsx`

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  Label,
  PageHeader,
  Select,
  Textarea,
} from "../../../components/ui";

type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
type EvidenceType =
  | "PROJECT"
  | "COURSE"
  | "INTERVIEW"
  | "WORK_EXPERIENCE"
  | "EXERCISE"
  | "CERTIFICATION"
  | "OTHER";
type StoryType =
  | "BEHAVIORAL"
  | "TECHNICAL"
  | "LEADERSHIP"
  | "FAILURE"
  | "PROJECT"
  | "CONFLICT"
  | "OWNERSHIP";

interface SkillView {
  id: string;
  proficiency: SkillLevel;
  interviewConfidence?: number;
  productionConfidence?: number;
  selfReportedOnly: boolean;
  profileNotes?: string;
  skill: { id: string; name: string };
  evidenceStrength: number;
  evidenceBacked: boolean;
  evidenceRecords: {
    id: string;
    title: string;
    evidenceType: EvidenceType;
    evidenceDate?: string;
    credibility?: number;
    outcome?: string;
  }[];
}

interface IntakeView {
  status: "DRAFT" | "COMPLETED";
  targetTitle?: string;
  fallbackTitles: string[];
  minimumSalaryIls?: number;
  idealSalaryMinIls?: number;
  idealSalaryMaxIls?: number;
  acceptableCities: string[];
  conditionalCities: string[];
  unacceptableCities: string[];
  preferredDomains: string[];
  preferredStages: string[];
  constraintsNotes?: string;
  strongestTopics: string[];
  weakestTopics: string[];
  stressfulInterviewTypes: string[];
  missingMaterials: string[];
  confidenceRecruiterInterview?: number;
  confidenceTechnicalInterview?: number;
  confidenceCaseInterview?: number;
  confidenceBehavioralInterview?: number;
  hebrewCommunicationConfidence?: number;
  englishCommunicationConfidence?: number;
  writingConfidence?: number;
  liveInterviewConfidence?: number;
  preferredOutreachTone?: string;
  preferredPositioningStyle?: string;
  outreachAvoidances: string[];
}

interface Snapshot {
  onboardingComplete: boolean;
  intake: IntakeView | null;
  skills: SkillView[];
  experienceEpisodes: {
    id: string;
    title: string;
    organization?: string;
    impact?: string;
    interviewConfidence?: number;
    externallyUsable: boolean;
  }[];
  interviewStories: {
    id: string;
    type: StoryType;
    title: string;
    confidence?: number;
  }[];
  readiness: {
    overallInterviewConfidence?: number | null;
  };
}

interface IntakeForm {
  targetTitle: string;
  fallbackTitles: string[];
  minimumSalaryIls?: number;
  idealSalaryMinIls?: number;
  idealSalaryMaxIls?: number;
  acceptableCities: string[];
  conditionalCities: string[];
  unacceptableCities: string[];
  preferredDomains: string[];
  preferredStages: string[];
  constraintsNotes: string;
  strongestTopics: string[];
  weakestTopics: string[];
  stressfulInterviewTypes: string[];
  missingMaterials: string[];
  confidenceRecruiterInterview?: number;
  confidenceTechnicalInterview?: number;
  confidenceCaseInterview?: number;
  confidenceBehavioralInterview?: number;
  hebrewCommunicationConfidence?: number;
  englishCommunicationConfidence?: number;
  writingConfidence?: number;
  liveInterviewConfidence?: number;
  preferredOutreachTone: string;
  preferredPositioningStyle: string;
  outreachAvoidances: string[];
}

const DEFAULT_INTAKE: IntakeForm = {
  targetTitle: "",
  fallbackTitles: [],
  acceptableCities: [],
  conditionalCities: [],
  unacceptableCities: [],
  preferredDomains: [],
  preferredStages: [],
  constraintsNotes: "",
  strongestTopics: [],
  weakestTopics: [],
  stressfulInterviewTypes: [],
  missingMaterials: [],
  preferredOutreachTone: "",
  preferredPositioningStyle: "",
  outreachAvoidances: [],
};

const SKILL_LEVELS: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const EVIDENCE_TYPES: EvidenceType[] = [
  "PROJECT",
  "COURSE",
  "INTERVIEW",
  "WORK_EXPERIENCE",
  "EXERCISE",
  "CERTIFICATION",
  "OTHER",
];
const STORY_TYPES: StoryType[] = [
  "PROJECT",
  "BEHAVIORAL",
  "TECHNICAL",
  "LEADERSHIP",
  "FAILURE",
  "CONFLICT",
  "OWNERSHIP",
];

function toCsv(values: string[]) {
  return values.join(", ");
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function ProfileMemoryPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    onboardingComplete: false,
    intake: null,
    skills: [],
    experienceEpisodes: [],
    interviewStories: [],
    readiness: {},
  });
  const [intakeForm, setIntakeForm] = useState<IntakeForm>(DEFAULT_INTAKE);
  const [loading, setLoading] = useState(true);
  const [savingTargets, setSavingTargets] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  const [skillDrafts, setSkillDrafts] = useState<
    Record<
      string,
      {
        proficiency: SkillLevel;
        interviewConfidence: string;
        productionConfidence: string;
        selfReportedOnly: boolean;
      }
    >
  >({});

  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    proficiency: "INTERMEDIATE" as SkillLevel,
    interviewConfidence: "",
    productionConfidence: "",
    selfReportedOnly: true,
    profileNotes: "",
  });

  const [newEvidence, setNewEvidence] = useState({
    candidateSkillId: "",
    evidenceType: "COURSE" as EvidenceType,
    title: "",
    description: "",
    outcome: "",
    evidenceDate: "",
    credibility: "",
    url: "",
  });

  const [newEpisode, setNewEpisode] = useState({
    title: "",
    organization: "",
    context: "",
    technicalOwnership: "",
    collaborators: "",
    dataScale: "",
    toolingStack: "",
    tradeoffs: "",
    impact: "",
    biggestChallenge: "",
    resolution: "",
    interviewConfidence: "",
    externallyUsable: true,
  });

  const [newStory, setNewStory] = useState({
    type: "PROJECT" as StoryType,
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    topics: "",
    confidence: "",
  });

  const evidenceBackedSkills = useMemo(
    () => snapshot.skills.filter((skill) => skill.evidenceBacked).length,
    [snapshot.skills]
  );

  const refreshSnapshot = useCallback(async () => {
    const res = await fetch("/api/profile-memory");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch profile memory");

    const nextSnapshot = data.snapshot as Snapshot;
    setSnapshot(nextSnapshot);
    if (nextSnapshot.intake) {
      setIntakeForm({
        ...DEFAULT_INTAKE,
        ...nextSnapshot.intake,
        targetTitle: nextSnapshot.intake.targetTitle || "",
        constraintsNotes: nextSnapshot.intake.constraintsNotes || "",
        preferredOutreachTone: nextSnapshot.intake.preferredOutreachTone || "",
        preferredPositioningStyle: nextSnapshot.intake.preferredPositioningStyle || "",
      });
    }
    const drafts: typeof skillDrafts = {};
    for (const skill of nextSnapshot.skills) {
      drafts[skill.id] = {
        proficiency: skill.proficiency,
        interviewConfidence: skill.interviewConfidence?.toString() || "",
        productionConfidence: skill.productionConfidence?.toString() || "",
        selfReportedOnly: skill.selfReportedOnly,
      };
    }
    setSkillDrafts(drafts);
  }, []);

  useEffect(() => {
    refreshSnapshot()
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [refreshSnapshot]);

  async function saveTargets() {
    setSavingTargets(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intakeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile memory");
      setMessage("Profile memory updated");
      await refreshSnapshot();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingTargets(false);
    }
  }

  async function addSkill() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkill.name,
          category: newSkill.category || undefined,
          proficiency: newSkill.proficiency,
          interviewConfidence: parseNumber(newSkill.interviewConfidence),
          productionConfidence: parseNumber(newSkill.productionConfidence),
          selfReportedOnly: newSkill.selfReportedOnly,
          profileNotes: newSkill.profileNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add skill");
      setNewSkill({
        name: "",
        category: "",
        proficiency: "INTERMEDIATE",
        interviewConfidence: "",
        productionConfidence: "",
        selfReportedOnly: true,
        profileNotes: "",
      });
      setMessage("Skill added");
      await refreshSnapshot();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function updateSkill(skillId: string) {
    setError("");
    setMessage("");
    try {
      const draft = skillDrafts[skillId];
      const res = await fetch(`/api/profile-memory/skills/${skillId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proficiency: draft.proficiency,
          interviewConfidence: parseNumber(draft.interviewConfidence),
          productionConfidence: parseNumber(draft.productionConfidence),
          selfReportedOnly: draft.selfReportedOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update skill");
      setMessage("Skill updated");
      await refreshSnapshot();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addEvidence() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/skill-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateSkillId: newEvidence.candidateSkillId,
          evidenceType: newEvidence.evidenceType,
          title: newEvidence.title,
          description: newEvidence.description || undefined,
          outcome: newEvidence.outcome || undefined,
          evidenceDate: newEvidence.evidenceDate
            ? new Date(newEvidence.evidenceDate).toISOString()
            : undefined,
          credibility: parseNumber(newEvidence.credibility),
          url: newEvidence.url || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add evidence");
      setNewEvidence({
        candidateSkillId: "",
        evidenceType: "COURSE",
        title: "",
        description: "",
        outcome: "",
        evidenceDate: "",
        credibility: "",
        url: "",
      });
      setMessage("Evidence added");
      await refreshSnapshot();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addEpisode() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/experience-episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEpisode.title,
          organization: newEpisode.organization || undefined,
          context: newEpisode.context || undefined,
          technicalOwnership: newEpisode.technicalOwnership || undefined,
          collaborators: fromCsv(newEpisode.collaborators),
          dataScale: newEpisode.dataScale || undefined,
          toolingStack: fromCsv(newEpisode.toolingStack),
          tradeoffs: fromCsv(newEpisode.tradeoffs),
          impact: newEpisode.impact || undefined,
          biggestChallenge: newEpisode.biggestChallenge || undefined,
          resolution: newEpisode.resolution || undefined,
          interviewConfidence: parseNumber(newEpisode.interviewConfidence),
          externallyUsable: newEpisode.externallyUsable,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add episode");
      setNewEpisode({
        title: "",
        organization: "",
        context: "",
        technicalOwnership: "",
        collaborators: "",
        dataScale: "",
        toolingStack: "",
        tradeoffs: "",
        impact: "",
        biggestChallenge: "",
        resolution: "",
        interviewConfidence: "",
        externallyUsable: true,
      });
      setMessage("Experience episode added");
      await refreshSnapshot();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addStory() {
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile-memory/interview-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newStory.type,
          title: newStory.title,
          situation: newStory.situation,
          task: newStory.task,
          action: newStory.action,
          result: newStory.result,
          topics: fromCsv(newStory.topics),
          confidence: parseNumber(newStory.confidence),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add interview story");
      setNewStory({
        type: "PROJECT",
        title: "",
        situation: "",
        task: "",
        action: "",
        result: "",
        topics: "",
        confidence: "",
      });
      setMessage("Interview story added");
      await refreshSnapshot();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <span className="spinner" style={{ margin: "0 auto" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader
        title="◌ Profile Memory"
        subtitle={`Skills ${snapshot.skills.length} · Evidence-backed ${evidenceBackedSkills} · Onboarding ${
          snapshot.onboardingComplete ? "completed" : "draft"
        }`}
        actions={
          <Button variant="primary" onClick={saveTargets} loading={savingTargets}>
            Save Updates
          </Button>
        }
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 210, borderRight: "1px solid var(--border)", padding: "10px 0" }}>
          {["summary", "skills", "evidence", "episodes", "readiness"].map((tab) => {
            const active = activeTab === tab;
            return (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: 12,
                  textTransform: "capitalize",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  background: active ? "var(--accent-dim)" : "transparent",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                }}
              >
                {tab}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {error && (
            <div
              style={{
                marginBottom: 12,
                border: "1px solid var(--red)",
                background: "var(--red-dim)",
                color: "var(--red)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              style={{
                marginBottom: 12,
                border: "1px solid var(--green)",
                background: "var(--green-dim)",
                color: "var(--green)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 12,
              }}
            >
              {message}
            </div>
          )}

          {activeTab === "summary" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <Label>Role & constraints</Label>
                <Input
                  label="Target title"
                  value={intakeForm.targetTitle}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({ ...prev, targetTitle: e.target.value }))
                  }
                />
                <Input
                  label="Fallback titles"
                  value={toCsv(intakeForm.fallbackTitles)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({ ...prev, fallbackTitles: fromCsv(e.target.value) }))
                  }
                />
                <Input
                  label="Minimum salary (ILS)"
                  type="number"
                  value={intakeForm.minimumSalaryIls ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      minimumSalaryIls: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Ideal salary min (ILS)"
                  type="number"
                  value={intakeForm.idealSalaryMinIls ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      idealSalaryMinIls: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Ideal salary max (ILS)"
                  type="number"
                  value={intakeForm.idealSalaryMaxIls ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      idealSalaryMaxIls: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Acceptable cities"
                  value={toCsv(intakeForm.acceptableCities)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      acceptableCities: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Conditional cities"
                  value={toCsv(intakeForm.conditionalCities)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      conditionalCities: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Unacceptable locations"
                  value={toCsv(intakeForm.unacceptableCities)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      unacceptableCities: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Preferred domains"
                  value={toCsv(intakeForm.preferredDomains)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      preferredDomains: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Preferred stages"
                  value={toCsv(intakeForm.preferredStages)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      preferredStages: fromCsv(e.target.value),
                    }))
                  }
                />
                <Textarea
                  label="Constraint notes"
                  value={intakeForm.constraintsNotes}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      constraintsNotes: e.target.value,
                    }))
                  }
                />
              </Card>

              <Card>
                <Label>Communication profile</Label>
                <Input
                  label="Hebrew communication confidence"
                  type="number"
                  value={intakeForm.hebrewCommunicationConfidence ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      hebrewCommunicationConfidence: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="English communication confidence"
                  type="number"
                  value={intakeForm.englishCommunicationConfidence ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      englishCommunicationConfidence: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Writing confidence"
                  type="number"
                  value={intakeForm.writingConfidence ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      writingConfidence: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Live interview confidence"
                  type="number"
                  value={intakeForm.liveInterviewConfidence ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      liveInterviewConfidence: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Preferred outreach tone"
                  value={intakeForm.preferredOutreachTone}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      preferredOutreachTone: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Preferred positioning style"
                  value={intakeForm.preferredPositioningStyle}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      preferredPositioningStyle: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Outreach avoidances"
                  value={toCsv(intakeForm.outreachAvoidances)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      outreachAvoidances: fromCsv(e.target.value),
                    }))
                  }
                />
              </Card>
            </div>
          )}

          {activeTab === "skills" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <Label>Add skill</Label>
                <Input
                  label="Name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Category"
                  value={newSkill.category}
                  onChange={(e) =>
                    setNewSkill((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
                <Select
                  label="Level"
                  value={newSkill.proficiency}
                  onChange={(e) =>
                    setNewSkill((prev) => ({
                      ...prev,
                      proficiency: e.target.value as SkillLevel,
                    }))
                  }
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Interview confidence"
                  type="number"
                  value={newSkill.interviewConfidence}
                  onChange={(e) =>
                    setNewSkill((prev) => ({
                      ...prev,
                      interviewConfidence: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Production confidence"
                  type="number"
                  value={newSkill.productionConfidence}
                  onChange={(e) =>
                    setNewSkill((prev) => ({
                      ...prev,
                      productionConfidence: e.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Notes"
                  value={newSkill.profileNotes}
                  onChange={(e) =>
                    setNewSkill((prev) => ({ ...prev, profileNotes: e.target.value }))
                  }
                />
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={newSkill.selfReportedOnly}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        selfReportedOnly: e.target.checked,
                      }))
                    }
                    style={{ marginRight: 8 }}
                  />
                  Self-reported only
                </label>
                <div style={{ marginTop: 8 }}>
                  <Button variant="primary" onClick={addSkill} disabled={!newSkill.name.trim()}>
                    Add skill
                  </Button>
                </div>
              </Card>

              <Card>
                <Label>Update existing skills</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 620, overflowY: "auto" }}>
                  {snapshot.skills.map((skill) => {
                    const draft = skillDrafts[skill.id];
                    if (!draft) return null;
                    return (
                      <div
                        key={skill.id}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: 10,
                          background: "var(--bg-base)",
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{skill.skill.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>
                          Evidence strength {skill.evidenceStrength} ·{" "}
                          {skill.evidenceBacked ? "Evidence-backed" : "Self-reported"}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <Select
                            label="Level"
                            value={draft.proficiency}
                            onChange={(e) =>
                              setSkillDrafts((prev) => ({
                                ...prev,
                                [skill.id]: {
                                  ...prev[skill.id],
                                  proficiency: e.target.value as SkillLevel,
                                },
                              }))
                            }
                          >
                            {SKILL_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </Select>
                          <Input
                            label="Interview confidence"
                            type="number"
                            value={draft.interviewConfidence}
                            onChange={(e) =>
                              setSkillDrafts((prev) => ({
                                ...prev,
                                [skill.id]: {
                                  ...prev[skill.id],
                                  interviewConfidence: e.target.value,
                                },
                              }))
                            }
                          />
                          <Input
                            label="Production confidence"
                            type="number"
                            value={draft.productionConfidence}
                            onChange={(e) =>
                              setSkillDrafts((prev) => ({
                                ...prev,
                                [skill.id]: {
                                  ...prev[skill.id],
                                  productionConfidence: e.target.value,
                                },
                              }))
                            }
                          />
                          <label style={{ fontSize: 11, color: "var(--text-secondary)", alignSelf: "end" }}>
                            <input
                              type="checkbox"
                              checked={draft.selfReportedOnly}
                              onChange={(e) =>
                                setSkillDrafts((prev) => ({
                                  ...prev,
                                  [skill.id]: {
                                    ...prev[skill.id],
                                    selfReportedOnly: e.target.checked,
                                  },
                                }))
                              }
                              style={{ marginRight: 6 }}
                            />
                            Self-reported only
                          </label>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Button variant="secondary" onClick={() => updateSkill(skill.id)}>
                            Update skill
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "evidence" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <Label>Add evidence / mark course completed</Label>
                <Select
                  label="Skill"
                  value={newEvidence.candidateSkillId}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({ ...prev, candidateSkillId: e.target.value }))
                  }
                >
                  <option value="">Select skill</option>
                  {snapshot.skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.skill.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Evidence type"
                  value={newEvidence.evidenceType}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({
                      ...prev,
                      evidenceType: e.target.value as EvidenceType,
                    }))
                  }
                >
                  {EVIDENCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Title"
                  value={newEvidence.title}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <Textarea
                  label="Description"
                  value={newEvidence.description}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Outcome / result"
                  value={newEvidence.outcome}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({ ...prev, outcome: e.target.value }))
                  }
                />
                <Input
                  label="Date"
                  type="date"
                  value={newEvidence.evidenceDate}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({ ...prev, evidenceDate: e.target.value }))
                  }
                />
                <Input
                  label="Credibility (0-100)"
                  type="number"
                  value={newEvidence.credibility}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({ ...prev, credibility: e.target.value }))
                  }
                />
                <Input
                  label="URL"
                  value={newEvidence.url}
                  onChange={(e) =>
                    setNewEvidence((prev) => ({ ...prev, url: e.target.value }))
                  }
                />
                <div style={{ marginTop: 8 }}>
                  <Button
                    variant="primary"
                    onClick={addEvidence}
                    disabled={!newEvidence.candidateSkillId || !newEvidence.title}
                  >
                    Add evidence
                  </Button>
                </div>
              </Card>

              <Card>
                <Label>Evidence grouped by skill</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 620, overflowY: "auto" }}>
                  {snapshot.skills.map((skill) => (
                    <div key={skill.id}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{skill.skill.name}</div>
                      {skill.evidenceRecords.length === 0 ? (
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>No evidence</div>
                      ) : (
                        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                          {skill.evidenceRecords.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                border: "1px solid var(--border)",
                                borderRadius: 6,
                                padding: 8,
                                background: "var(--bg-base)",
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 600 }}>{item.title}</div>
                              <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                                {item.evidenceType} · credibility {item.credibility ?? "-"} ·{" "}
                                {(item.evidenceDate || "").slice(0, 10)}
                              </div>
                              {item.outcome && (
                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                                  {item.outcome}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "episodes" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <Label>Add experience episode</Label>
                <Input
                  label="Title"
                  value={newEpisode.title}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <Input
                  label="Organization"
                  value={newEpisode.organization}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({
                      ...prev,
                      organization: e.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Context / business problem"
                  value={newEpisode.context}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({ ...prev, context: e.target.value }))
                  }
                />
                <Textarea
                  label="Technical ownership"
                  value={newEpisode.technicalOwnership}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({
                      ...prev,
                      technicalOwnership: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Collaborators"
                  value={newEpisode.collaborators}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({
                      ...prev,
                      collaborators: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Data scale"
                  value={newEpisode.dataScale}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({ ...prev, dataScale: e.target.value }))
                  }
                />
                <Input
                  label="Tooling stack"
                  value={newEpisode.toolingStack}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({
                      ...prev,
                      toolingStack: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Tradeoffs"
                  value={newEpisode.tradeoffs}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({ ...prev, tradeoffs: e.target.value }))
                  }
                />
                <Textarea
                  label="Impact metrics"
                  value={newEpisode.impact}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({ ...prev, impact: e.target.value }))
                  }
                />
                <Textarea
                  label="Biggest challenge"
                  value={newEpisode.biggestChallenge}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({
                      ...prev,
                      biggestChallenge: e.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Resolution"
                  value={newEpisode.resolution}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({ ...prev, resolution: e.target.value }))
                  }
                />
                <Input
                  label="Interview confidence"
                  type="number"
                  value={newEpisode.interviewConfidence}
                  onChange={(e) =>
                    setNewEpisode((prev) => ({
                      ...prev,
                      interviewConfidence: e.target.value,
                    }))
                  }
                />
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={newEpisode.externallyUsable}
                    onChange={(e) =>
                      setNewEpisode((prev) => ({
                        ...prev,
                        externallyUsable: e.target.checked,
                      }))
                    }
                    style={{ marginRight: 8 }}
                  />
                  Safe for external resume use
                </label>
                <div style={{ marginTop: 8 }}>
                  <Button variant="primary" onClick={addEpisode} disabled={!newEpisode.title}>
                    Add episode
                  </Button>
                </div>
              </Card>

              <Card>
                <Label>Experience episodes</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {snapshot.experienceEpisodes.map((episode) => (
                    <div
                      key={episode.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: 10,
                        background: "var(--bg-base)",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{episode.title}</div>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                        {episode.organization || "No organization"} · Interview{" "}
                        {episode.interviewConfidence ?? "-"} ·{" "}
                        {episode.externallyUsable ? "Resume-safe" : "Internal only"}
                      </div>
                      {episode.impact && (
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                          {episode.impact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "readiness" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <Label>Interview readiness</Label>
                <Input
                  label="Strongest topics"
                  value={toCsv(intakeForm.strongestTopics)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      strongestTopics: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Weakest topics"
                  value={toCsv(intakeForm.weakestTopics)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      weakestTopics: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Stressful interview types"
                  value={toCsv(intakeForm.stressfulInterviewTypes)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      stressfulInterviewTypes: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Missing materials"
                  value={toCsv(intakeForm.missingMaterials)}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      missingMaterials: fromCsv(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Recruiter interview confidence"
                  type="number"
                  value={intakeForm.confidenceRecruiterInterview ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      confidenceRecruiterInterview: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Technical interview confidence"
                  type="number"
                  value={intakeForm.confidenceTechnicalInterview ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      confidenceTechnicalInterview: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Case / product / analytics confidence"
                  type="number"
                  value={intakeForm.confidenceCaseInterview ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      confidenceCaseInterview: parseNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Behavioral interview confidence"
                  type="number"
                  value={intakeForm.confidenceBehavioralInterview ?? ""}
                  onChange={(e) =>
                    setIntakeForm((prev) => ({
                      ...prev,
                      confidenceBehavioralInterview: parseNumber(e.target.value),
                    }))
                  }
                />
                <div style={{ marginTop: 8 }}>
                  <Button variant="primary" onClick={saveTargets} loading={savingTargets}>
                    Update readiness
                  </Button>
                </div>
              </Card>

              <Card>
                <Label>Interview stories</Label>
                <Select
                  label="Type"
                  value={newStory.type}
                  onChange={(e) =>
                    setNewStory((prev) => ({ ...prev, type: e.target.value as StoryType }))
                  }
                >
                  {STORY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Title"
                  value={newStory.title}
                  onChange={(e) => setNewStory((prev) => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  label="Situation"
                  value={newStory.situation}
                  onChange={(e) =>
                    setNewStory((prev) => ({ ...prev, situation: e.target.value }))
                  }
                />
                <Textarea
                  label="Task"
                  value={newStory.task}
                  onChange={(e) => setNewStory((prev) => ({ ...prev, task: e.target.value }))}
                />
                <Textarea
                  label="Action"
                  value={newStory.action}
                  onChange={(e) => setNewStory((prev) => ({ ...prev, action: e.target.value }))}
                />
                <Textarea
                  label="Result"
                  value={newStory.result}
                  onChange={(e) => setNewStory((prev) => ({ ...prev, result: e.target.value }))}
                />
                <Input
                  label="Topics"
                  value={newStory.topics}
                  onChange={(e) => setNewStory((prev) => ({ ...prev, topics: e.target.value }))}
                />
                <Input
                  label="Confidence"
                  type="number"
                  value={newStory.confidence}
                  onChange={(e) =>
                    setNewStory((prev) => ({ ...prev, confidence: e.target.value }))
                  }
                />
                <div style={{ marginTop: 8 }}>
                  <Button
                    variant="primary"
                    onClick={addStory}
                    disabled={
                      !newStory.title ||
                      !newStory.situation ||
                      !newStory.task ||
                      !newStory.action ||
                      !newStory.result
                    }
                  >
                    Add story
                  </Button>
                </div>

                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {snapshot.interviewStories.map((story) => (
                    <div key={story.id} style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {story.type}: {story.title} ({story.confidence ?? "-"})
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

```

### File: `app/(dashboard)/profile/page.tsx`

```tsx
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

```

### File: `app/(dashboard)/resumes/page.tsx`

```tsx
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

```

### File: `app/api/applications/[id]/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { ApplicationUpdateSchema } from "../../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = ApplicationUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();

    const existing = await db.application.findFirst({
      where: { id: params.id, candidateProfileId: context.candidateProfileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = parsed.data;
    const statusChanged = data.status && data.status !== existing.status;

    const updated = await db.application.update({
      where: { id: params.id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.recruiterName && { recruiterName: data.recruiterName }),
        ...(data.recruiterEmail && { recruiterEmail: data.recruiterEmail }),
        ...(data.nextAction !== undefined && { nextAction: data.nextAction }),
        ...(data.followUpDueAt && { followUpDueAt: new Date(data.followUpDueAt) }),
        ...(data.salaryExpected && { salaryExpected: data.salaryExpected }),
        ...(data.rejectionReason && { rejectionReason: data.rejectionReason }),
        ...(data.offerAmount && { offerAmount: data.offerAmount }),
        ...(data.status === "APPLIED" && !existing.appliedAt && { appliedAt: new Date() }),
      },
      include: {
        company: true,
        job: true,
        stageEvents: { orderBy: { eventAt: "desc" }, take: 10 },
      },
    });

    // Log stage change
    if (statusChanged && data.status) {
      await db.applicationStageEvent.create({
        data: {
          applicationId: params.id,
          stageName: data.status,
          notes: body.stageNote || null,
        },
      });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error(`[PATCH /api/applications/${params.id}]`, error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getOrCreateSingleUserContext();

    const existing = await db.application.findFirst({
      where: { id: params.id, candidateProfileId: context.candidateProfileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.application.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/applications/${params.id}]`, error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}

```

### File: `app/api/applications/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { ApplicationCreateSchema } from "../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function GET(request: NextRequest) {
  try {
    const context = await getOrCreateSingleUserContext();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {
      candidateProfileId: context.candidateProfileId,
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { company: { name: { contains: search, mode: "insensitive" } } },
        { job: { title: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
          job: {
            select: {
              id: true,
              title: true,
              workMode: true,
              location: true,
              scores: {
                select: { totalScore: true, recommendation: true },
                take: 1,
              },
            },
          },
          resumeVersion: { select: { id: true, name: true } },
          stageEvents: {
            orderBy: { eventAt: "desc" },
            take: 5,
          },
        },
      }),
      db.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ApplicationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();

    const data = parsed.data;

    // Upsert company if needed
    let companyId = data.companyId;
    if (!companyId && data.companyName) {
      const company = await db.company.upsert({
        where: { name: data.companyName },
        update: {},
        create: { name: data.companyName, israelPresence: true },
      });
      companyId = company.id;
    }

    const application = await db.application.create({
      data: {
        candidateProfileId: context.candidateProfileId,
        companyId: companyId || null,
        jobId: data.jobId || null,
        resumeVersionId: data.resumeVersionId || null,
        status: data.status,
        priority: data.priority,
        sourceUrl: data.sourceUrl || null,
        notes: data.notes || null,
        salaryExpected: data.salaryExpected || null,
        recruiterName: data.recruiterName || null,
        recruiterEmail: data.recruiterEmail || null,
        followUpDueAt: data.followUpDueAt ? new Date(data.followUpDueAt) : null,
        nextAction: data.nextAction || null,
        appliedAt: data.status === "APPLIED" ? new Date() : null,
      },
      include: {
        company: true,
        job: true,
        stageEvents: true,
      },
    });

    // Create initial stage event
    await db.applicationStageEvent.create({
      data: {
        applicationId: application.id,
        stageName: data.status,
        notes: "Application created",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("[POST /api/applications]", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}

```

### File: `app/api/auth/[...nextauth]/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

```

### File: `app/api/jobs/ingest/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/jobs/ingest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ingestJob } from "../../../../lib/adapters/jobs/ingest";
import { ManualJobIngestSchema } from "../../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ManualJobIngestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();
    const result = await ingestJob(parsed.data, context.candidateProfileId);

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      isNew: result.isNew,
      isDuplicate: result.isDuplicate,
      extracted: result.extracted,
      scoreId: result.scoreId,
    });
  } catch (error) {
    console.error("[POST /api/jobs/ingest]", error);
    return NextResponse.json(
      { error: "Failed to ingest job", detail: (error as Error).message },
      { status: 500 }
    );
  }
}

```

### File: `app/api/jobs/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { JobsQuerySchema } from "../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = JobsQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
    }

    const q = parsed.data;
    const skip = (q.page - 1) * q.limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: q.isActive !== undefined ? q.isActive : true,
    };

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: "insensitive" } },
        { rawDescription: { contains: q.search, mode: "insensitive" } },
        { company: { name: { contains: q.search, mode: "insensitive" } } },
      ];
    }

    if (q.workMode) {
      where.workMode = q.workMode;
    }

    const context = await getOrCreateSingleUserContext();
    const candidateProfileId = context.candidateProfileId;

    // Score filter requires joining through JobScore
    let jobIds: string[] | undefined;
    if (q.minScore !== undefined || q.recommendation) {
      const scoreWhere: Record<string, unknown> = {};
      if (candidateProfileId) scoreWhere.candidateProfileId = candidateProfileId;
      if (q.minScore !== undefined) scoreWhere.totalScore = { gte: q.minScore };
      if (q.recommendation) scoreWhere.recommendation = q.recommendation;

      const scores = await db.jobScore.findMany({
        where: scoreWhere,
        select: { jobId: true },
      });
      jobIds = scores.map((s) => s.jobId);
      where.id = { in: jobIds };
    }

    // Determine sort order
    let orderBy: Record<string, unknown>;
    if (q.sortBy === "score" && candidateProfileId) {
      // Sort by score requires post-processing since it's a relation
      // Fetch all and sort in JS for now (acceptable for reasonable job counts)
      orderBy = { createdAt: q.sortDir };
    } else {
      orderBy = { [q.sortBy === "score" ? "createdAt" : q.sortBy]: q.sortDir };
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy,
        skip,
        take: q.limit,
        include: {
          company: { select: { id: true, name: true, stage: true } },
          scores: candidateProfileId
            ? {
                where: { candidateProfileId },
                select: {
                  totalScore: true,
                  recommendation: true,
                  strengths: true,
                  risks: true,
                  confidence: true,
                  llmExplanation: true,
                },
              }
            : false,
          _count: { select: { applications: true } },
        },
      }),
      db.job.count({ where }),
    ]);

    // Sort by score if requested
    let sortedJobs = jobs;
    if (q.sortBy === "score") {
      sortedJobs = [...jobs].sort((a, b) => {
        const scoreA = a.scores?.[0]?.totalScore ?? 0;
        const scoreB = b.scores?.[0]?.totalScore ?? 0;
        return q.sortDir === "desc" ? scoreB - scoreA : scoreA - scoreB;
      });
    }

    return NextResponse.json({
      jobs: sortedJobs,
      pagination: {
        total,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(total / q.limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

```

### File: `app/api/onboarding/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { OnboardingSaveSchema } from "../../../lib/schemas";
import { saveOnboardingState } from "../../../lib/profile-memory/engine";
import { getCandidateKnowledgeSnapshot } from "../../../lib/profile-memory/selectors";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [onboarding, snapshot] = await Promise.all([
      db.candidateIntake.findUnique({ where: { userId } }),
      getCandidateKnowledgeSnapshot(userId),
    ]);

    return NextResponse.json({ onboarding, snapshot });
  } catch (error) {
    console.error("[GET /api/onboarding]", error);
    return NextResponse.json({ error: "Failed to fetch onboarding state" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = OnboardingSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const onboarding = await saveOnboardingState(userId, parsed.data);
    const snapshot = await getCandidateKnowledgeSnapshot(userId);

    return NextResponse.json({ success: true, onboarding, snapshot });
  } catch (error) {
    console.error("[POST /api/onboarding]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save onboarding state" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = OnboardingSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const onboarding = await saveOnboardingState(userId, parsed.data);
    const snapshot = await getCandidateKnowledgeSnapshot(userId);

    return NextResponse.json({ success: true, onboarding, snapshot });
  } catch (error) {
    console.error("[PATCH /api/onboarding]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update onboarding state" },
      { status: 400 }
    );
  }
}

```

### File: `app/api/outreach/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/outreach/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateOutreachMessages } from "../../../lib/outreach/engine";
import { z } from "zod";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

const OutreachRequestSchema = z.object({
  companyName: z.string().min(1),
  roleName: z.string().optional(),
  jobId: z.string().optional(),
  contextNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OutreachRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const context = await getOrCreateSingleUserContext();

    const result = await generateOutreachMessages({
      companyName: parsed.data.companyName,
      roleName: parsed.data.roleName,
      jobId: parsed.data.jobId,
      candidateProfileId: context.candidateProfileId,
      contextNotes: parsed.data.contextNotes,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[POST /api/outreach]", error);
    return NextResponse.json(
      { error: "Failed to generate outreach", detail: (error as Error).message },
      { status: 500 }
    );
  }
}

```

### File: `app/api/profile-memory/experience-episodes/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ExperienceEpisodeCreateSchema } from "../../../../lib/schemas";
import { createExperienceEpisodeRecord } from "../../../../lib/profile-memory/engine";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ExperienceEpisodeCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const episode = await createExperienceEpisodeRecord(userId, parsed.data);
    return NextResponse.json({ success: true, episode });
  } catch (error) {
    console.error("[POST /api/profile-memory/experience-episodes]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create experience episode" },
      { status: 400 }
    );
  }
}

```

### File: `app/api/profile-memory/interview-stories/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { InterviewStoryCreateSchema } from "../../../../lib/schemas";
import { createInterviewStoryRecord } from "../../../../lib/profile-memory/engine";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = InterviewStoryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const story = await createInterviewStoryRecord(userId, parsed.data);
    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error("[POST /api/profile-memory/interview-stories]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create interview story" },
      { status: 400 }
    );
  }
}

```

### File: `app/api/profile-memory/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ProfileMemoryUpdateSchema } from "../../../lib/schemas";
import { updateProfileMemoryIntake } from "../../../lib/profile-memory/engine";
import { getCandidateKnowledgeSnapshot } from "../../../lib/profile-memory/selectors";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await getCandidateKnowledgeSnapshot(userId);
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("[GET /api/profile-memory]", error);
    return NextResponse.json({ error: "Failed to fetch profile memory" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ProfileMemoryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const onboarding = await updateProfileMemoryIntake(userId, parsed.data);
    const snapshot = await getCandidateKnowledgeSnapshot(userId);

    return NextResponse.json({ success: true, onboarding, snapshot });
  } catch (error) {
    console.error("[PATCH /api/profile-memory]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update profile memory" },
      { status: 400 }
    );
  }
}

```

### File: `app/api/profile-memory/skill-evidence/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { SkillEvidenceCreateSchema } from "../../../../lib/schemas";
import { createSkillEvidenceRecord } from "../../../../lib/profile-memory/engine";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SkillEvidenceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const evidence = await createSkillEvidenceRecord(userId, parsed.data);
    return NextResponse.json({ success: true, evidence });
  } catch (error) {
    console.error("[POST /api/profile-memory/skill-evidence]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create skill evidence" },
      { status: 400 }
    );
  }
}

```

### File: `app/api/profile-memory/skills/[id]/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ProfileMemorySkillUpdateSchema } from "../../../../../lib/schemas";
import { updateProfileMemorySkill } from "../../../../../lib/profile-memory/engine";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ProfileMemorySkillUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const skill = await updateProfileMemorySkill(userId, params.id, parsed.data);
    return NextResponse.json({ success: true, skill });
  } catch (error) {
    console.error(`[PATCH /api/profile-memory/skills/${params.id}]`, error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update skill" },
      { status: 400 }
    );
  }
}

```

### File: `app/api/profile-memory/skills/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ProfileMemorySkillCreateSchema } from "../../../../lib/schemas";
import { createProfileMemorySkill } from "../../../../lib/profile-memory/engine";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

async function getCurrentUserId(): Promise<string | null> {
  const context = await getOrCreateSingleUserContext();
  return context.userId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ProfileMemorySkillCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const skill = await createProfileMemorySkill(userId, parsed.data);
    return NextResponse.json({ success: true, skill });
  } catch (error) {
    console.error("[POST /api/profile-memory/skills]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create skill" },
      { status: 400 }
    );
  }
}

```

### File: `app/api/profile/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { ProfileUpdateSchema } from "../../../lib/schemas";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

export async function GET() {
  try {
    const context = await getOrCreateSingleUserContext();
    const profile = await db.candidateProfile.findUnique({
      where: { id: context.candidateProfileId },
      include: {
        skills: { include: { skill: true }, orderBy: { priority: "desc" } },
        projects: { orderBy: { displayOrder: "asc" } },
      },
    });

    return NextResponse.json({ profile: profile ?? null });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const context = await getOrCreateSingleUserContext();

    const data = parsed.data;

    const profile = await db.candidateProfile.upsert({
      where: { userId: context.userId },
      update: {
        fullName: data.fullName,
        headline: data.headline,
        bio: data.bio,
        location: data.location,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
        targetSalaryMin: data.targetSalaryMin,
        targetSalaryIdeal: data.targetSalaryIdeal,
        workModePrefs: data.workModePrefs,
        targetCities: data.targetCities,
        rolePreferences: data.rolePreferences,
        weightSpeed: data.weightSpeed,
        weightFit: data.weightFit,
        weightSalary: data.weightSalary,
        weightUpside: data.weightUpside,
        outreachVoice: data.outreachVoice,
        uniqueAngles: data.uniqueAngles,
        noGoCompanies: data.noGoCompanies,
      },
      create: {
        userId: context.userId,
        fullName: data.fullName,
        headline: data.headline,
        bio: data.bio,
        location: data.location ?? "Israel",
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
        targetSalaryMin: data.targetSalaryMin,
        targetSalaryIdeal: data.targetSalaryIdeal,
        workModePrefs: data.workModePrefs,
        targetCities: data.targetCities,
        rolePreferences: data.rolePreferences,
        weightSpeed: data.weightSpeed,
        weightFit: data.weightFit,
        weightSalary: data.weightSalary,
        weightUpside: data.weightUpside,
        outreachVoice: data.outreachVoice,
        uniqueAngles: data.uniqueAngles,
        noGoCompanies: data.noGoCompanies,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[PUT /api/profile]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

```

### File: `app/api/resumes/route.ts`

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// app/api/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { generateResumeVersion } from "../../../lib/resume/engine";
import { z } from "zod";
import { getOrCreateSingleUserContext } from "@/lib/auth/single-user";

const GenerateResumeSchema = z.object({
  jobId: z.string(),
  roleFamily: z.string().optional(),
  language: z.enum(["en", "he"]).default("en"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateResumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const context = await getOrCreateSingleUserContext();

    const resume = await generateResumeVersion({
      jobId: parsed.data.jobId,
      candidateProfileId: context.candidateProfileId,
      roleFamily: parsed.data.roleFamily,
      language: parsed.data.language,
    });

    return NextResponse.json({ success: true, resume });
  } catch (error) {
    console.error("[POST /api/resumes]", error);
    return NextResponse.json({ error: "Failed to generate resume", detail: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const context = await getOrCreateSingleUserContext();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const resumes = await db.resumeVersion.findMany({
      where: {
        candidateProfileId: context.candidateProfileId,
        ...(jobId && { jobId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        job: { select: { id: true, title: true, company: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("[GET /api/resumes]", error);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

```

### File: `app/globals.css`

```css
/* app/globals.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base: #070c14;
  --bg-surface: #0b1220;
  --bg-elevated: #101826;
  --border: #152035;
  --border-subtle: #0e1a2a;
  --text-primary: #c8dff0;
  --text-secondary: #5a7a96;
  --text-muted: #2a4560;
  --accent: #00d4ff;
  --accent-dim: rgba(0, 212, 255, 0.12);
  --green: #22c55e;
  --green-dim: rgba(34, 197, 94, 0.12);
  --yellow: #f59e0b;
  --yellow-dim: rgba(245, 158, 11, 0.12);
  --red: #ef4444;
  --red-dim: rgba(239, 68, 68, 0.12);
  --purple: #8b5cf6;
  --purple-dim: rgba(139, 92, 246, 0.12);
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --radius: 6px;
  --radius-lg: 10px;
}

html, body { height: 100%; background: var(--bg-base); color: var(--text-primary); font-family: var(--font-sans); font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Focus */
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Selection */
::selection { background: rgba(0, 212, 255, 0.2); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes spin { to { transform: rotate(360deg); } }

.animate-fadeIn { animation: fadeIn 0.2s ease; }
.animate-pulse { animation: pulse 1.5s ease infinite; }
.spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; }

```

### File: `app/layout.tsx`

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Job Hunter OS — Meital",
  description: "Personal AI-powered job search operating system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

```

### File: `app/providers.tsx`

```tsx
"use client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

```

### File: `components/dashboard/Sidebar.tsx`

```tsx
"use client";
// components/dashboard/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "⚡", label: "Command Center" },
  { href: "/jobs", icon: "◎", label: "Jobs Inbox" },
  { href: "/applications", icon: "◈", label: "Applications" },
  { href: "/resumes", icon: "▤", label: "Resumes" },
  { href: "/outreach", icon: "⬡", label: "Outreach" },
  { href: "/analytics", icon: "▲", label: "Analytics" },
  { href: "/onboarding", icon: "◍", label: "Onboarding" },
  { href: "/profile-memory", icon: "◌", label: "Profile Memory" },
  { href: "/profile", icon: "◉", label: "Profile" },
];

const s = {
  sidebar: {
    width: 220,
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
    height: "100vh",
  },
  logo: {
    padding: "20px 18px 16px",
    borderBottom: "1px solid var(--border)",
  },
  logoTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--accent)",
    letterSpacing: 3,
    textTransform: "uppercase" as const,
  },
  logoSub: {
    fontSize: 10,
    color: "var(--text-muted)",
    letterSpacing: 1,
    marginTop: 3,
  },
  nav: { flex: 1, padding: "8px 0", overflowY: "auto" as const },
  navLink: (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 18px",
    textDecoration: "none",
    fontSize: 12,
    letterSpacing: 0.5,
    color: active ? "var(--accent)" : "var(--text-secondary)",
    background: active ? "var(--accent-dim)" : "transparent",
    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
    transition: "all 0.15s",
  }),
  navIcon: { fontSize: 14, width: 18, textAlign: "center" as const, flexShrink: 0 },
  footer: {
    padding: "12px 18px",
    borderTop: "1px solid var(--border)",
  },
  userEmail: { fontSize: 10, color: "var(--text-muted)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--green)",
    display: "inline-block",
    marginRight: 6,
  },
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoTitle}>Job Hunter</div>
        <div style={s.logoSub}>AI Operating System</div>
        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ ...s.statusDot }} />
          <span style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1 }}>
            ACTIVE
          </span>
        </div>
      </div>

      <nav style={s.nav}>
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={s.navLink(active)}>
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={s.footer}>
        <div style={s.userEmail}>Single-user personal mode</div>
      </div>
    </div>
  );
}

```

### File: `components/ui/index.tsx`

```tsx
// components/ui/index.tsx
// Reusable UI primitives — no external component library dependency

import React from "react";

// ─── Score Badge ──────────────────────────────────────────────────────────────

const SCORE_COLORS: Record<string, string> = {
  STRONG_APPLY: "#22c55e",
  APPLY: "#00d4ff",
  STRETCH_APPLY: "#f59e0b",
  LOW_PRIORITY: "#6b7280",
  SKIP: "#ef4444",
};

const SCORE_LABELS: Record<string, string> = {
  STRONG_APPLY: "Strong Apply",
  APPLY: "Apply",
  STRETCH_APPLY: "Stretch",
  LOW_PRIORITY: "Low Priority",
  SKIP: "Skip",
};

export function ScoreBadge({ score, recommendation }: { score: number; recommendation: string }) {
  const col = SCORE_COLORS[recommendation] || "#6b7280";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11,
      fontWeight: 600,
      color: col,
      background: col + "18",
      border: `1px solid ${col}33`,
      borderRadius: 4,
      padding: "3px 8px",
      fontFamily: "var(--font-mono)",
      letterSpacing: 0.5,
    }}>
      <span style={{ fontSize: 15, lineHeight: 1 }}>{Math.round(score)}</span>
      <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 }}>
        {SCORE_LABELS[recommendation] || recommendation}
      </span>
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  WISHLIST:             { color: "#6b7280", label: "Wishlist" },
  APPLIED:              { color: "#00d4ff", label: "Applied" },
  RECRUITER_SCREEN:     { color: "#8b5cf6", label: "Recruiter Screen" },
  TECHNICAL_INTERVIEW:  { color: "#f59e0b", label: "Technical Interview" },
  CASE_STUDY:           { color: "#f97316", label: "Case Study" },
  FINAL_INTERVIEW:      { color: "#06b6d4", label: "Final Interview" },
  OFFER:                { color: "#22c55e", label: "Offer 🎉" },
  ACCEPTED:             { color: "#16a34a", label: "Accepted ✓" },
  REJECTED:             { color: "#ef4444", label: "Rejected" },
  WITHDRAWN:            { color: "#6b7280", label: "Withdrawn" },
  ON_HOLD:              { color: "#eab308", label: "On Hold" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || { color: "#6b7280", label: status };
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 600,
      color: s.color,
      background: s.color + "15",
      border: `1px solid ${s.color}30`,
      borderRadius: 3,
      padding: "2px 7px",
      letterSpacing: 0.5,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9,
      letterSpacing: 2,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      marginBottom: 8,
      fontFamily: "var(--font-mono)",
    }}>
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  loading,
  size = "md",
  style,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    borderRadius: "var(--radius)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    transition: "all 0.15s",
    opacity: disabled || loading ? 0.5 : 1,
    fontSize: size === "sm" ? 10 : 11,
    padding: size === "sm" ? "5px 12px" : "9px 16px",
  };

  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "var(--bg-base)" },
    secondary: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)" },
    ghost: { background: "transparent", color: "var(--text-secondary)" },
    danger: { background: "var(--red-dim)", border: "1px solid var(--red)", color: "var(--red)" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

// ─── Input / Textarea ─────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-base)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  padding: "8px 12px",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input style={inputBase} {...props} />
    </div>
  );
}

export function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea style={{ ...inputBase, resize: "vertical", minHeight: 100, fontFamily: "var(--font-mono)", fontSize: 12 }} {...props} />
    </div>
  );
}

export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select style={{ ...inputBase, cursor: "pointer" }} {...props}>
        {children}
      </select>
    </div>
  );
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = color || "var(--accent)";
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      padding: "2px 7px",
      borderRadius: 3,
      marginRight: 4,
      marginBottom: 3,
      background: c + "15",
      border: `1px solid ${c}25`,
      color: c,
      fontFamily: "var(--font-mono)",
    }}>
      {children}
    </span>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{
      padding: "20px 28px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: 0.5 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12 }}>{description}</div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

export function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const col = score >= 70 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: col }}>{Math.round(score)}</span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: col,
          borderRadius: 2,
          transition: "width 0.5s ease",
        }} />
      </div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>
        weight: {Math.round(weight * 100)}%
      </div>
    </div>
  );
}

```

### File: `docs/CHATGPT_HANDOFF_MEITAL_2026-03-08.md`

```md
# Job Hunter OS - Handoff For ChatGPT (Meital)

Date: 2026-03-08  
Owner: Meital Abadi  
Mode: Personal single-user system (no multi-user login flow required)

## 1) Product Goal

Build a serious Personal Job-Search OS for Meital in the Israeli high-tech market, optimized for:

1. Speed to interview
2. Quality of role/company match
3. Referral opportunities
4. Salary upside

## 2) Current Technical Snapshot

### Stack

- Next.js 14 (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod validation
- Anthropic SDK (server-side only)

### Runtime Mode

- Project currently runs in **single-user personal mode**.
- No login is required in normal use.
- A helper resolves/creates one local owner context:
  - `lib/auth/single-user.ts`

### Project Root

- `/Users/meitalabadi/Desktop/Claude Learning/job-hunter`

## 3) Key Internal Structure

### Core Folders

- `app/` - dashboard pages + API routes
- `lib/` - business logic (scoring, ingestion, resume/outreach generation, auth helper)
- `prisma/` - schema + seed
- `components/` - UI components

### Important Files

- Schema: `prisma/schema.prisma`
- Single-user context: `lib/auth/single-user.ts`
- Job ingestion engine: `lib/adapters/jobs/ingest.ts`
- Scoring engine: `lib/scoring/engine.ts`
- Resume engine: `lib/resume/engine.ts`
- Outreach engine: `lib/outreach/engine.ts`
- Validation schemas: `lib/schemas/index.ts`
- Jobs API: `app/api/jobs/route.ts`
- Jobs ingest API: `app/api/jobs/ingest/route.ts`
- Applications API: `app/api/applications/route.ts`
- Application update API: `app/api/applications/[id]/route.ts`
- Resumes API: `app/api/resumes/route.ts`
- Profile API: `app/api/profile/route.ts`
- Outreach API: `app/api/outreach/route.ts`

## 4) Database Design (High-Level)

Main models currently present:

- `User`
- `CandidateProfile`
- `Skill`, `CandidateSkill`
- `Project`
- `Company`
- `Job`
- `JobScore`
- `ResumeVersion`
- `OutreachContact`, `OutreachMessage`
- `Application`, `ApplicationStageEvent`
- `IngestionRun`
- `Experiment`

This is already a production-oriented schema, not only demo state.

## 5) What Works Today (End-to-End)

### A) Job Intake + Ranking

Current flow:

1. User pastes a JD manually in Jobs page.
2. API `POST /api/jobs/ingest` validates payload with Zod.
3. `lib/adapters/jobs/ingest.ts` calls LLM extraction to structured fields.
4. Dedup hash is computed and checked.
5. Job is persisted.
6. Deterministic scoring is computed in `lib/scoring/engine.ts`.
7. LLM explanation is generated as narrative only (does not alter deterministic numeric score).
8. Score is stored in `JobScore`.

### B) Applications CRM

Current flow:

1. User adds application manually or from selected job.
2. API `POST /api/applications` creates record.
3. Stage history is tracked in `ApplicationStageEvent`.
4. Updates via `PATCH /api/applications/[id]`.
5. Deletion via `DELETE /api/applications/[id]`.

### C) Resume Versioning

Current flow:

1. User selects job and clicks generate resume.
2. `POST /api/resumes` triggers `lib/resume/engine.ts`.
3. Engine chooses relevant projects/skills deterministically.
4. LLM generates structured resume payload (validated by Zod).
5. Resume version is saved in `ResumeVersion`.

### D) Outreach Drafts

Current flow:

1. User enters company/role/context.
2. `POST /api/outreach` calls `lib/outreach/engine.ts`.
3. System returns:
   - target persona
   - search query for LinkedIn/manual search
   - connection request
   - follow-up
   - referral ask

## 6) Important Truths (Current Limitations)

### Job Discovery

- **There is no automated crawler yet** for Telegram/LinkedIn/Greenhouse.
- Job discovery is currently manual ingestion by paste.

### CV Submission

- System currently **generates tailored CV versions**, but **does not auto-submit** applications.
- Sending is human-in-the-loop (manual apply), which is good for compliance.

### Keys/Env

- `ANTHROPIC_API_KEY` must be real in `.env.local` for AI features.
- Prisma CLI reads `.env`, not `.env.local` by default.

## 7) How Meital Can Use Telegram Job Groups Right Now

Current practical workflow:

1. Open Telegram daily job posts.
2. Copy each relevant post/JD text.
3. Paste into Jobs -> "Analyze & Add Job".
4. Review fit score + strengths/risks.
5. Decide:
   - `STRONG_APPLY` / `APPLY` -> generate resume + add application
   - `STRETCH_APPLY` -> optional
   - `LOW_PRIORITY` / `SKIP` -> ignore
6. Track all active opportunities in Applications CRM.

This is the current best path until Telegram ingestion automation is added.

## 8) Requested Next Major Upgrade: Deep Candidate Intake

Goal: system should ask comprehensive questions to build a high-quality personal knowledge graph.

### Must-Capture Areas

1. Career goals and constraints
2. Role targeting and market preference
3. Technical stack depth (strong / medium / basic)
4. Project evidence (what was built, impact, scale, ownership)
5. Collaboration and leadership signals
6. Communication (Hebrew/English, writing/interview confidence)
7. Salary and negotiation constraints
8. Geographic/work-mode constraints
9. Red lines (companies/industries to avoid)
10. Outreach style preferences

### Suggested Implementation

Build a dedicated onboarding wizard:

- `/onboarding` multi-step form
- Save structured answers to new tables, e.g.:
  - `CandidateIntake`
  - `SkillEvidence`
  - `ExperienceEpisode`
  - `InterviewStory`
- Then use this richer data in scoring/resume/outreach engines.

## 9) Proposed Improvement Roadmap (Priority Order)

### Phase 1 (Immediate)

1. Build onboarding wizard + deep intake schema
2. Add score breakdown UI with factor-level numeric bars
3. Add "why not apply" explicit blockers
4. Add role-specific resume templates (DS / AI Eng / AI Analyst)

### Phase 2 (Job Discovery)

1. Telegram ingestion assistant:
   - Import exported messages / copied batches
   - Parse message -> normalize to job candidate
   - Dedup + scoring pipeline
2. Greenhouse/Lever URL parser from links found in posts
3. Daily inbox + triage queue

### Phase 3 (Execution Quality)

1. Interview conversion analytics dashboard
2. Resume A/B tracking by outcome
3. Outreach outcome learning loop
4. Priority queue based on expected interview probability * salary upside

## 10) Deep Intake Question Bank (For Meital)

Use these sections to interview and store answers in structured form:

### Identity & Goal

1. What is your exact target title for the next 3 months?
2. What titles are acceptable fallback options?
3. What is your minimum acceptable salary in ILS/month?
4. What is your ideal salary range?
5. Which cities are fully acceptable / partially acceptable / not acceptable?
6. Are you open to remote-only roles? Hybrid-only?

### Skills Mapping

For each skill/tool/language:

1. Current level: basic / intermediate / advanced / expert
2. Last time used
3. Real project evidence
4. Confidence for interview discussion
5. Confidence for production implementation

### Project Evidence

For each project:

1. Problem and business context
2. Exact technical ownership
3. Data scale
4. Tooling stack
5. Tradeoffs made
6. Results/impact metrics
7. Biggest failure and fix

### Interview Readiness

1. Which topics are strongest technically?
2. Which topics cause stress?
3. Which interview type is hardest: recruiter / technical / case / behavioral?
4. What support material is missing today?

### Market Targeting

1. Which 20 companies are top-priority?
2. Which domains are preferred? (AI infra, product analytics, etc.)
3. Which domains are no-go?
4. Which company stages preferred? (startup/growth/public)

## 11) Prompt To Paste Into A New ChatGPT Conversation

Paste this exactly:

---
I am continuing development of my personal Job Hunter OS project for Israeli high-tech roles.
Read and use this handoff as source-of-truth:

`/Users/meitalabadi/Desktop/Claude Learning/job-hunter/docs/CHATGPT_HANDOFF_MEITAL_2026-03-08.md`

Project root:
`/Users/meitalabadi/Desktop/Claude Learning/job-hunter`

Important constraints:
1. Single-user personal system (no multi-user login needed right now).
2. Keep all model keys server-side only.
3. Scoring must remain deterministic and explainable.
4. Job submission remains human-in-the-loop (no policy-violating automation).
5. Prioritize speed to interview + salary upside + referral leverage.

First task:
Design and implement a production-grade onboarding/intake module that asks me deep structured questions about my experience, skills, tools, project evidence, and career preferences, then persists this data and integrates it into scoring/resume/outreach.
---

## 12) Current "Search & Apply" Mechanism Explained Simply

### Search

- Today: manual discovery (Telegram/LinkedIn/other sources) -> paste JD into system.
- System: parses + scores + recommends apply/skip.

### Updated CV per Job

- System generates a tailored `ResumeVersion` for selected job.
- You manually review and then apply externally.

### Sending Applications

- System tracks applications and stage progression in CRM.
- Actual submission to external platforms is manual today.

---

If you ask an assistant to improve this project, tell it to work from this file and from the real codebase paths listed above.

```

### File: `lib/adapters/jobs/ingest.ts`

```ts
// lib/adapters/jobs/ingest.ts
// Converts raw job text/URLs into normalized Job records
// Server-side only

import { db } from "../../db";
import { llmStructured, LLMValidationError } from "../../llm/provider";
import { JobExtractionOutputSchema, type JobExtractionOutput, ManualJobIngest } from "../../schemas";
import { scoreJob, scoringResultToDbShape } from "../../scoring/engine";
import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IngestResult {
  jobId: string;
  isNew: boolean;
  isDuplicate: boolean;
  scoreId?: string;
  extracted: JobExtractionOutput;
}

export interface IngestError {
  error: string;
  detail?: string;
}

// ─── Job Extraction via LLM ───────────────────────────────────────────────────

const JOB_EXTRACTION_SYSTEM = `You are a structured job description parser for the Israeli high-tech market.
Extract all relevant structured information from a job posting.
Be precise. If a field is not found in the description, omit it or use null.
Do NOT invent information not present in the source text.
For salaryRange, use monthly ILS values if possible, or annual values — note the currency.
For seniority, map to: JUNIOR (0-2yr), MID (2-5yr), SENIOR (5+yr), LEAD, PRINCIPAL, or UNKNOWN.
For workMode, use: ONSITE, HYBRID, REMOTE, or FLEXIBLE.
For employment type: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP.`;

async function extractJobData(
  rawText: string,
  companyNameHint?: string
): Promise<JobExtractionOutput> {
  const userPrompt = `Parse the following job description and return structured JSON:

${companyNameHint ? `Company hint: ${companyNameHint}\n\n` : ""}
=== JOB DESCRIPTION ===
${rawText.slice(0, 15000)}
=== END ===`;

  const result = await llmStructured({
    systemPrompt: JOB_EXTRACTION_SYSTEM,
    userPrompt,
    schema: JobExtractionOutputSchema,
    maxTokens: 1500,
    taskName: "job_extraction",
    maxRetries: 2,
    repairPrompt:
      "The previous response was not valid JSON. Return ONLY the JSON object, no markdown, no explanation.",
  });

  return result.data;
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function buildDedupHash(
  companyName: string,
  title: string,
  location?: string
): string {
  const normalized = `${companyName.toLowerCase().trim()}_${title.toLowerCase().trim()}_${(location || "").toLowerCase().trim()}`;
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

// ─── Company upsert ───────────────────────────────────────────────────────────

async function upsertCompany(name: string): Promise<string> {
  const existing = await db.company.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) return existing.id;

  const created = await db.company.create({
    data: { name, israelPresence: true },
  });

  return created.id;
}

// ─── Main ingest function ─────────────────────────────────────────────────────

export async function ingestJob(
  input: ManualJobIngest,
  candidateProfileId: string
): Promise<IngestResult> {
  // Step 1: Extract structured data
  const extracted = await extractJobData(input.rawText, input.companyNameHint);

  // Step 2: Check for duplicate
  const dedupHash = buildDedupHash(
    extracted.companyName,
    extracted.title,
    extracted.location
  );

  const existing = await db.job.findFirst({
    where: { dedupHash },
  });

  if (existing) {
    return {
      jobId: existing.id,
      isNew: false,
      isDuplicate: true,
      extracted,
    };
  }

  // Step 3: Upsert company
  const companyId = await upsertCompany(extracted.companyName);

  // Step 4: Create job record
  const job = await db.job.create({
    data: {
      companyId,
      title: extracted.title,
      normalizedTitle: extracted.title,
      rawDescription: input.rawText,
      normalizedDescription: extracted.normalizedDescription,
      source: input.source,
      sourceUrl: input.sourceUrl || null,
      atsPlatform: extracted.atsPlatform || null,
      externalId: extracted.externalId || null,
      location: extracted.location || null,
      workMode: extracted.workMode || null,
      employmentType: extracted.employmentType || null,
      salaryRangeMin: extracted.salaryRangeMin || null,
      salaryRangeMax: extracted.salaryRangeMax || null,
      salaryCurrency: extracted.salaryCurrency || null,
      requiredSkills: extracted.requiredSkills,
      niceToHaveSkills: extracted.niceToHaveSkills,
      keywords: extracted.keywords,
      seniority: extracted.seniority || null,
      isActive: true,
      postedAt: extracted.postedAt ? new Date(extracted.postedAt) : null,
      dedupHash,
    },
  });

  // Step 5: Score the job (requires candidate profile with relations)
  let scoreId: string | undefined;
  try {
    const candidateWithRelations = await db.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      include: {
        skills: { include: { skill: true } },
        projects: true,
      },
    });

    if (candidateWithRelations) {
      const scoreResult = await scoreJob(job, candidateWithRelations);
      const dbScore = scoringResultToDbShape(scoreResult, job.id, candidateProfileId);

      const savedScore = await db.jobScore.create({ data: dbScore });
      scoreId = savedScore.id;
    }
  } catch (err) {
    console.error("[ingest] Scoring failed — job saved but not scored:", err);
  }

  // Step 6: Log ingestion run
  await db.ingestionRun.create({
    data: {
      sourceName: input.source,
      status: "COMPLETED",
      recordsFound: 1,
      recordsCreated: 1,
      recordsUpdated: 0,
      completedAt: new Date(),
      logs: [{ timestamp: new Date().toISOString(), jobId: job.id, action: "created" }],
    },
  });

  return {
    jobId: job.id,
    isNew: true,
    isDuplicate: false,
    scoreId,
    extracted,
  };
}

```

### File: `lib/auth/options.ts`

```ts
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "../db";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user = { ...session.user, id: token.userId as string };
      }
      return session;
    },
  },
};

```

### File: `lib/auth/single-user.ts`

```ts
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SINGLE_USER_EMAIL =
  process.env.SINGLE_USER_EMAIL || "meital@jobhunter.local";
const SINGLE_USER_NAME =
  process.env.SINGLE_USER_NAME || "Meital Abadi";

export interface SingleUserContext {
  userId: string;
  candidateProfileId: string;
  email: string;
}

export async function getOrCreateSingleUserContext(): Promise<SingleUserContext> {
  let user = await db.user.findUnique({
    where: { email: SINGLE_USER_EMAIL },
    include: { candidateProfile: true },
  });

  if (!user) {
    user = await db.user.findFirst({
      orderBy: { createdAt: "asc" },
      include: { candidateProfile: true },
    });
  }

  if (!user) {
    const passwordHash = await bcrypt.hash("local-single-user", 10);
    user = await db.user.create({
      data: {
        email: SINGLE_USER_EMAIL,
        name: SINGLE_USER_NAME,
        passwordHash,
      },
      include: { candidateProfile: true },
    });
  }

  if (!user.candidateProfile) {
    const profile = await db.candidateProfile.create({
      data: {
        userId: user.id,
        fullName: SINGLE_USER_NAME,
        location: "Israel",
        targetSalaryCurrency: "ILS",
        workModePrefs: ["hybrid", "onsite"],
        targetCities: ["Tel Aviv", "Herzliya", "Haifa", "Remote"],
        rolePreferences: ["Data Scientist", "AI Engineer", "AI Analyst"],
        weightSpeed: 25,
        weightFit: 30,
        weightSalary: 25,
        weightUpside: 20,
      },
    });

    return {
      userId: user.id,
      candidateProfileId: profile.id,
      email: user.email,
    };
  }

  return {
    userId: user.id,
    candidateProfileId: user.candidateProfile.id,
    email: user.email,
  };
}

```

### File: `lib/db/index.ts`

```ts
// lib/db/index.ts
// Prisma client singleton — prevents connection exhaustion in development

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

```

### File: `lib/env.ts`

```ts
// lib/env.ts
// Validates all required environment variables at startup
// Fails fast with clear error messages

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // DB
  DATABASE_URL: requireEnv("DATABASE_URL"),

  // Auth
  NEXTAUTH_SECRET: requireEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // LLM — server-side only
  ANTHROPIC_API_KEY: requireEnv("ANTHROPIC_API_KEY"),

  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

```

### File: `lib/llm/provider.ts`

```ts
// lib/llm/provider.ts
// Server-side only. Never import this in client components.
// All API keys stay on the server.

import Anthropic from "@anthropic-ai/sdk";
import { z, ZodSchema } from "zod";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  taskName?: string;         // for logging
  maxRetries?: number;
}

export interface LLMStructuredOptions<T> extends LLMRequestOptions {
  schema: ZodSchema<T>;
  repairPrompt?: string;     // if first parse fails, prompt to try to fix it
}

export interface LLMResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  durationMs: number;
}

export interface LLMStructuredResponse<T> extends LLMResponse {
  data: T;
  rawText: string;
  retries: number;
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export class LLMValidationError extends Error {
  constructor(
    message: string,
    public readonly rawText: string,
    public readonly zodError: z.ZodError
  ) {
    super(message);
    this.name = "LLMValidationError";
  }
}

export class LLMProviderError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "LLMProviderError";
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new LLMProviderError("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Core text completion ─────────────────────────────────────────────────────

export async function llmComplete(options: LLMRequestOptions): Promise<LLMResponse> {
  const client = getClient();
  const maxRetries = options.maxRetries ?? 2;
  const start = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: options.maxTokens ?? 2000,
        system: options.systemPrompt,
        messages: [{ role: "user", content: options.userPrompt }],
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

      return {
        text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        durationMs: Date.now() - start,
      };
    } catch (error) {
      if (attempt === maxRetries) {
        throw new LLMProviderError(
          `LLM request failed after ${maxRetries + 1} attempts`,
          error
        );
      }
      await sleep(Math.pow(2, attempt) * 500); // exponential backoff
    }
  }

  throw new LLMProviderError("Unreachable");
}

// ─── Structured output with Zod validation ────────────────────────────────────

export async function llmStructured<T>(
  options: LLMStructuredOptions<T>
): Promise<LLMStructuredResponse<T>> {
  const maxRetries = options.maxRetries ?? 2;
  const start = Date.now();
  let lastError: Error | null = null;
  let lastRawText = "";

  const systemWithJsonInstruction = `${options.systemPrompt}

CRITICAL OUTPUT REQUIREMENT:
You MUST respond with ONLY valid JSON that matches the exact schema described.
Do NOT include any text before or after the JSON.
Do NOT use markdown code fences.
Do NOT include any explanation outside the JSON.
If you are uncertain about a value, use a reasonable default — do not omit required fields.`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const userPrompt =
      attempt > 0 && options.repairPrompt
        ? `${options.repairPrompt}\n\nPrevious invalid response:\n${lastRawText}\n\nPlease return ONLY valid JSON now.`
        : options.userPrompt;

    try {
      const response = await llmComplete({
        systemPrompt: systemWithJsonInstruction,
        userPrompt,
        maxTokens: options.maxTokens,
        taskName: options.taskName,
        maxRetries: 0, // handle retries at this level
      });

      lastRawText = response.text;
      const cleaned = stripJsonFences(response.text);

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch (jsonErr) {
        lastError = new LLMValidationError(
          "Response was not valid JSON",
          lastRawText,
          new z.ZodError([])
        );
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 300);
          continue;
        }
        throw lastError;
      }

      const validation = options.schema.safeParse(parsed);
      if (!validation.success) {
        lastError = new LLMValidationError(
          "Response failed schema validation",
          lastRawText,
          validation.error
        );
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 300);
          continue;
        }
        throw lastError;
      }

      return {
        data: validation.data,
        rawText: lastRawText,
        usage: response.usage,
        durationMs: Date.now() - start,
        text: response.text,
        retries: attempt,
      };
    } catch (error) {
      if (error instanceof LLMValidationError || error instanceof LLMProviderError) {
        throw error;
      }
      lastError = new LLMProviderError("Unexpected error in LLM call", error);
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 500);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new LLMProviderError("Unreachable");
}

```

### File: `lib/outreach/engine.ts`

```ts
// lib/outreach/engine.ts
// Networking & referral outreach generation
// Human-in-the-loop design — generates drafts, never sends automatically

import { db } from "../db";
import { llmStructured } from "../llm/provider";
import { OutreachMessageOutputSchema, type OutreachMessageOutput } from "../schemas";
import { CandidateProfile, Job } from "@prisma/client";

const OUTREACH_SYSTEM_PROMPT = `You are a senior recruiting strategist helping Meital Abadi, 
a recent Technion Data Science graduate, navigate the Israeli high-tech job market.

Generate personalized, concise networking messages for the Israeli tech context.
Israeli high-tech culture is direct, relatively informal, and values Technion connections strongly.

RULES:
1. Connection requests: max 300 characters (LinkedIn limit)
2. Follow-up messages: max 500 characters
3. Referral asks: max 600 characters
4. Be specific — reference the person's role and Meital's background
5. Never promise things not substantiated by the candidate's profile
6. Keep tone warm but professional
7. Mention Technion when relevant (it resonates strongly in Israeli tech)
8. Focus on one clear ask per message

Return ONLY valid JSON.`;

export interface OutreachInput {
  companyName: string;
  roleName?: string;
  jobId?: string;
  candidateProfileId: string;
  contextNotes?: string;
}

export async function generateOutreachMessages(
  input: OutreachInput
): Promise<OutreachMessageOutput> {
  const candidate = await db.candidateProfile.findUnique({
    where: { id: input.candidateProfileId },
    include: {
      skills: { include: { skill: true } },
      projects: true,
    },
  });

  if (!candidate) throw new Error("Candidate profile not found");

  let jobContext = "";
  if (input.jobId) {
    const job = await db.job.findUnique({ where: { id: input.jobId } });
    if (job) {
      jobContext = `\nSpecific role: ${job.title}\nRequired skills: ${(job.requiredSkills || []).slice(0, 5).join(", ")}`;
    }
  }

  const topSkills = candidate.skills
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6)
    .map((cs) => cs.skill.name)
    .join(", ");

  const topProjects = candidate.projects
    .slice(0, 3)
    .map((p) => `${p.name} (${(p.techTags as string[]).slice(0, 3).join(", ")})`)
    .join("; ");

  const userPrompt = `Generate outreach messages for:

Target Company: ${input.companyName}
Target Role Family: ${input.roleName || "Data Scientist / AI Engineer"}${jobContext}

Candidate:
- Name: Meital Abadi
- Education: B.Sc. Data Science, Technion (recent graduate)
- Top Skills: ${topSkills}
- Key Projects: ${topProjects}
- Outreach voice: ${(candidate.outreachVoice as string) || "concise, direct, warm"}

Context: ${input.contextNotes || "General networking outreach for the Israeli high-tech market"}

Generate search queries, contact prioritization, and message drafts.`;

  const result = await llmStructured({
    systemPrompt: OUTREACH_SYSTEM_PROMPT,
    userPrompt,
    schema: OutreachMessageOutputSchema,
    maxTokens: 1500,
    taskName: "outreach_generation",
    maxRetries: 2,
  });

  return result.data;
}

// ─── Cover letter generation ──────────────────────────────────────────────────

import { CoverLetterOutputSchema, type CoverLetterOutput } from "../schemas";

const COVER_LETTER_SYSTEM = `You are an expert cover letter writer for Israeli high-tech companies.
Write for Meital Abadi, a Technion Data Science graduate.

RULES:
1. 3 paragraphs: why this role, what you bring, closing with specific ask
2. Reference specific technologies or projects from the candidate's background
3. Keep it concise — Israeli tech companies rarely read long cover letters
4. Email subject: clear and specific, 8-12 words
5. LinkedIn message: conversational, under 300 chars, mention Technion
6. No generic phrases like "I am passionate about..." — be specific
7. Do not fabricate metrics or experiences

Return ONLY valid JSON.`;

export async function generateCoverLetter(
  jobId: string,
  candidateProfileId: string
): Promise<CoverLetterOutput> {
  const candidate = await db.candidateProfile.findUnique({
    where: { id: candidateProfileId },
    include: { skills: { include: { skill: true } }, projects: true },
  });
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!candidate || !job) throw new Error("Candidate or job not found");

  const userPrompt = `Write a cover letter for:

Company: ${job.company?.name || "Company"}
Role: ${job.title}
Required Skills: ${(job.requiredSkills || []).join(", ")}
Job Highlights: ${job.normalizedDescription?.slice(0, 800) || job.rawDescription.slice(0, 800)}

Candidate:
- B.Sc. Data Science, Technion
- Skills: ${candidate.skills.map((cs) => cs.skill.name).slice(0, 10).join(", ")}
- Key Projects:
${candidate.projects.map((p) => `  * ${p.name}: ${p.shortSummary}`).join("\n")}`;

  const result = await llmStructured({
    systemPrompt: COVER_LETTER_SYSTEM,
    userPrompt,
    schema: CoverLetterOutputSchema,
    maxTokens: 1500,
    taskName: "cover_letter",
    maxRetries: 2,
  });

  return result.data;
}

```

### File: `lib/profile-memory/engine.ts`

```ts
import { Prisma } from "@prisma/client";
import { db } from "../db";
import type {
  ExperienceEpisodeCreate,
  InterviewStoryCreate,
  OnboardingSaveInput,
  ProfileMemorySkillCreate,
  ProfileMemorySkillUpdate,
  ProfileMemoryUpdateInput,
  SkillEvidenceCreate,
} from "../schemas";
import {
  normalizeSkillCategory,
  normalizeSkillName,
  normalizeTextList,
  parseDateOrNull,
} from "./normalizers";

function cleanOptionalText(value?: string): string | undefined {
  if (value === undefined) return undefined;
  const cleaned = value.trim();
  return cleaned ? cleaned : undefined;
}

async function ensureCandidateProfileForUser(userId: string) {
  const existing = await db.candidateProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const emailPrefix = user.email.split("@")[0]?.replace(/[._-]+/g, " ") || "Candidate";
  const fallbackName = user.name || emailPrefix;
  const fullName = fallbackName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

  return db.candidateProfile.create({
    data: {
      userId,
      fullName,
      location: "Israel",
    },
  });
}

function buildIntakeWriteData(
  input: Omit<OnboardingSaveInput, "finalize"> | ProfileMemoryUpdateInput
): Prisma.CandidateIntakeUncheckedUpdateInput {
  const data: Prisma.CandidateIntakeUncheckedUpdateInput = {};

  if (input.targetTitle !== undefined) data.targetTitle = cleanOptionalText(input.targetTitle) ?? null;
  if (input.fallbackTitles !== undefined) data.fallbackTitles = normalizeTextList(input.fallbackTitles);
  if (input.minimumSalaryIls !== undefined) data.minimumSalaryIls = input.minimumSalaryIls;
  if (input.idealSalaryMinIls !== undefined) data.idealSalaryMinIls = input.idealSalaryMinIls;
  if (input.idealSalaryMaxIls !== undefined) data.idealSalaryMaxIls = input.idealSalaryMaxIls;
  if (input.acceptableCities !== undefined) data.acceptableCities = normalizeTextList(input.acceptableCities);
  if (input.conditionalCities !== undefined) data.conditionalCities = normalizeTextList(input.conditionalCities);
  if (input.unacceptableCities !== undefined) data.unacceptableCities = normalizeTextList(input.unacceptableCities);
  if (input.workModes !== undefined) data.workModes = input.workModes;
  if (input.roleSeniorityTarget !== undefined) data.roleSeniorityTarget = cleanOptionalText(input.roleSeniorityTarget) ?? null;
  if (input.constraintsNotes !== undefined) data.constraintsNotes = cleanOptionalText(input.constraintsNotes) ?? null;
  if (input.topTargetCompanies !== undefined) data.topTargetCompanies = normalizeTextList(input.topTargetCompanies);
  if (input.preferredStages !== undefined) data.preferredStages = normalizeTextList(input.preferredStages);
  if (input.preferredDomains !== undefined) data.preferredDomains = normalizeTextList(input.preferredDomains);
  if (input.avoidDomains !== undefined) data.avoidDomains = normalizeTextList(input.avoidDomains);
  if (input.preferredTeamTypes !== undefined) data.preferredTeamTypes = normalizeTextList(input.preferredTeamTypes);
  if (input.avoidIndustries !== undefined) data.avoidIndustries = normalizeTextList(input.avoidIndustries);
  if (input.strongestTopics !== undefined) data.strongestTopics = normalizeTextList(input.strongestTopics);
  if (input.weakestTopics !== undefined) data.weakestTopics = normalizeTextList(input.weakestTopics);
  if (input.stressfulInterviewTypes !== undefined) {
    data.stressfulInterviewTypes = normalizeTextList(input.stressfulInterviewTypes);
  }
  if (input.missingMaterials !== undefined) data.missingMaterials = normalizeTextList(input.missingMaterials);
  if (input.confidenceRecruiterInterview !== undefined) {
    data.confidenceRecruiterInterview = input.confidenceRecruiterInterview;
  }
  if (input.confidenceTechnicalInterview !== undefined) {
    data.confidenceTechnicalInterview = input.confidenceTechnicalInterview;
  }
  if (input.confidenceCaseInterview !== undefined) {
    data.confidenceCaseInterview = input.confidenceCaseInterview;
  }
  if (input.confidenceBehavioralInterview !== undefined) {
    data.confidenceBehavioralInterview = input.confidenceBehavioralInterview;
  }
  if (input.hebrewCommunicationConfidence !== undefined) {
    data.hebrewCommunicationConfidence = input.hebrewCommunicationConfidence;
  }
  if (input.englishCommunicationConfidence !== undefined) {
    data.englishCommunicationConfidence = input.englishCommunicationConfidence;
  }
  if (input.writingConfidence !== undefined) data.writingConfidence = input.writingConfidence;
  if (input.liveInterviewConfidence !== undefined) data.liveInterviewConfidence = input.liveInterviewConfidence;
  if (input.preferredOutreachTone !== undefined) {
    data.preferredOutreachTone = cleanOptionalText(input.preferredOutreachTone) ?? null;
  }
  if (input.preferredPositioningStyle !== undefined) {
    data.preferredPositioningStyle = cleanOptionalText(input.preferredPositioningStyle) ?? null;
  }
  if (input.outreachAvoidances !== undefined) {
    data.outreachAvoidances = normalizeTextList(input.outreachAvoidances);
  }

  return data;
}

function validateFinalize(intake: {
  targetTitle: string | null;
  workModes: string[];
  acceptableCities: string[];
}) {
  if (!intake.targetTitle) {
    throw new Error("Target title is required before finalizing onboarding.");
  }
  if (!intake.workModes || intake.workModes.length === 0) {
    throw new Error("At least one work mode preference is required before finalizing.");
  }
  if (!intake.acceptableCities || intake.acceptableCities.length === 0) {
    throw new Error("Please add at least one acceptable city before finalizing.");
  }
}

async function syncIntakeToCandidateProfile(userId: string) {
  const [candidateProfile, intake] = await Promise.all([
    ensureCandidateProfileForUser(userId),
    db.candidateIntake.findUnique({ where: { userId } }),
  ]);

  if (!intake) return;

  const rolePreferences = normalizeTextList([
    intake.targetTitle || "",
    ...intake.fallbackTitles,
  ]);

  const updateData: Prisma.CandidateProfileUpdateInput = {};

  if (rolePreferences.length > 0) updateData.rolePreferences = rolePreferences;
  if (intake.minimumSalaryIls !== null) updateData.targetSalaryMin = intake.minimumSalaryIls;
  if (intake.idealSalaryMaxIls !== null) updateData.targetSalaryIdeal = intake.idealSalaryMaxIls;
  if (intake.idealSalaryMaxIls === null && intake.idealSalaryMinIls !== null) {
    updateData.targetSalaryIdeal = intake.idealSalaryMinIls;
  }
  if (intake.workModes.length > 0) {
    updateData.workModePrefs = intake.workModes.map((mode) => mode.toLowerCase());
  }
  if (intake.acceptableCities.length > 0) updateData.targetCities = intake.acceptableCities;
  if (intake.preferredStages.length > 0) updateData.targetCompanyStages = intake.preferredStages;
  if (intake.preferredDomains.length > 0) updateData.targetIndustries = intake.preferredDomains;
  if (intake.preferredOutreachTone) updateData.outreachVoice = intake.preferredOutreachTone;

  if (Object.keys(updateData).length > 0) {
    await db.candidateProfile.update({
      where: { id: candidateProfile.id },
      data: updateData,
    });
  }
}

export async function saveOnboardingState(userId: string, input: OnboardingSaveInput) {
  const finalize = !!input.finalize;
  const writeData = buildIntakeWriteData(input);

  const existing = await db.candidateIntake.findUnique({ where: { userId } });

  if (finalize) {
    const mergedTargetTitle = cleanOptionalText(input.targetTitle) ?? existing?.targetTitle ?? null;
    const mergedWorkModes = input.workModes ?? existing?.workModes ?? [];
    const mergedAcceptableCities = input.acceptableCities
      ? normalizeTextList(input.acceptableCities)
      : existing?.acceptableCities ?? [];

    validateFinalize({
      targetTitle: mergedTargetTitle,
      workModes: mergedWorkModes,
      acceptableCities: mergedAcceptableCities,
    });
  }

  const createData: Prisma.CandidateIntakeUncheckedCreateInput = {
    userId,
    status: finalize ? "COMPLETED" : "DRAFT",
    completedAt: finalize ? new Date() : null,
  };
  Object.assign(createData, writeData);

  const onboarding = await db.candidateIntake.upsert({
    where: { userId },
    update: {
      ...writeData,
      status: finalize ? "COMPLETED" : undefined,
      completedAt: finalize ? new Date() : undefined,
    },
    create: createData,
  });

  if (!finalize && !existing) {
    await ensureCandidateProfileForUser(userId);
  }

  await syncIntakeToCandidateProfile(userId);

  return onboarding;
}

export async function updateProfileMemoryIntake(
  userId: string,
  input: ProfileMemoryUpdateInput
) {
  const writeData = buildIntakeWriteData(input);
  const createData: Prisma.CandidateIntakeUncheckedCreateInput = {
    userId,
    status: "DRAFT",
  };
  Object.assign(createData, writeData);

  const onboarding = await db.candidateIntake.upsert({
    where: { userId },
    update: writeData,
    create: createData,
  });

  await syncIntakeToCandidateProfile(userId);
  return onboarding;
}

export async function createProfileMemorySkill(
  userId: string,
  input: ProfileMemorySkillCreate
) {
  const candidateProfile = await ensureCandidateProfileForUser(userId);
  const normalized = normalizeSkillName(input.name);

  let skill = await db.skill.findFirst({
    where: {
      OR: [
        { canonicalName: { equals: normalized.canonicalName, mode: "insensitive" } },
        { name: { equals: normalized.displayName, mode: "insensitive" } },
      ],
    },
  });

  if (!skill) {
    skill = await db.skill.create({
      data: {
        name: normalized.displayName,
        canonicalName: normalized.canonicalName,
        category: normalizeSkillCategory(input.category),
      },
    });
  }

  const existingCandidateSkill = await db.candidateSkill.findUnique({
    where: {
      candidateProfileId_skillId: {
        candidateProfileId: candidateProfile.id,
        skillId: skill.id,
      },
    },
    select: {
      id: true,
      evidenceRecords: {
        take: 1,
        select: { id: true },
      },
    },
  });

  const selfReportedOnly =
    existingCandidateSkill && existingCandidateSkill.evidenceRecords.length > 0
      ? false
      : input.selfReportedOnly;

  return db.candidateSkill.upsert({
    where: {
      candidateProfileId_skillId: {
        candidateProfileId: candidateProfile.id,
        skillId: skill.id,
      },
    },
    update: {
      proficiency: input.proficiency,
      lastUsedAt: parseDateOrNull(input.lastUsedAt),
      interviewConfidence: input.interviewConfidence,
      productionConfidence: input.productionConfidence,
      selfReportedOnly,
      profileNotes: cleanOptionalText(input.profileNotes) ?? null,
      evidenceNote: cleanOptionalText(input.evidenceNote) ?? null,
      priority: input.priority,
    },
    create: {
      candidateProfileId: candidateProfile.id,
      skillId: skill.id,
      proficiency: input.proficiency,
      lastUsedAt: parseDateOrNull(input.lastUsedAt),
      interviewConfidence: input.interviewConfidence ?? null,
      productionConfidence: input.productionConfidence ?? null,
      selfReportedOnly,
      profileNotes: cleanOptionalText(input.profileNotes) ?? null,
      evidenceNote: cleanOptionalText(input.evidenceNote) ?? null,
      priority: input.priority,
    },
    include: {
      skill: true,
      evidenceRecords: {
        orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });
}

export async function updateProfileMemorySkill(
  userId: string,
  candidateSkillId: string,
  input: ProfileMemorySkillUpdate
) {
  const candidateSkill = await db.candidateSkill.findFirst({
    where: {
      id: candidateSkillId,
      candidateProfile: { userId },
    },
  });

  if (!candidateSkill) throw new Error("Skill not found");

  return db.candidateSkill.update({
    where: { id: candidateSkillId },
    data: {
      ...(input.proficiency !== undefined && { proficiency: input.proficiency }),
      ...(input.lastUsedAt !== undefined && { lastUsedAt: parseDateOrNull(input.lastUsedAt) }),
      ...(input.interviewConfidence !== undefined && {
        interviewConfidence: input.interviewConfidence,
      }),
      ...(input.productionConfidence !== undefined && {
        productionConfidence: input.productionConfidence,
      }),
      ...(input.selfReportedOnly !== undefined && {
        selfReportedOnly: input.selfReportedOnly,
      }),
      ...(input.profileNotes !== undefined && {
        profileNotes: cleanOptionalText(input.profileNotes ?? undefined) ?? null,
      }),
      ...(input.evidenceNote !== undefined && {
        evidenceNote: cleanOptionalText(input.evidenceNote ?? undefined) ?? null,
      }),
      ...(input.priority !== undefined && { priority: input.priority }),
    },
    include: {
      skill: true,
      evidenceRecords: {
        orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });
}

export async function createSkillEvidenceRecord(userId: string, input: SkillEvidenceCreate) {
  const candidateSkill = await db.candidateSkill.findFirst({
    where: {
      id: input.candidateSkillId,
      candidateProfile: { userId },
    },
  });

  if (!candidateSkill) {
    throw new Error("Skill not found");
  }

  const evidence = await db.skillEvidence.create({
    data: {
      candidateSkillId: candidateSkill.id,
      evidenceType: input.evidenceType,
      title: input.title.trim(),
      description: cleanOptionalText(input.description) ?? null,
      outcome: cleanOptionalText(input.outcome) ?? null,
      evidenceDate: parseDateOrNull(input.evidenceDate),
      credibility: input.credibility ?? null,
      url: cleanOptionalText(input.url) ?? null,
    },
  });

  if (candidateSkill.selfReportedOnly) {
    await db.candidateSkill.update({
      where: { id: candidateSkill.id },
      data: { selfReportedOnly: false },
    });
  }

  return evidence;
}

export async function createExperienceEpisodeRecord(
  userId: string,
  input: ExperienceEpisodeCreate
) {
  const candidateProfile = await ensureCandidateProfileForUser(userId);

  return db.experienceEpisode.create({
    data: {
      candidateProfileId: candidateProfile.id,
      title: input.title.trim(),
      organization: cleanOptionalText(input.organization) ?? null,
      context: cleanOptionalText(input.context) ?? null,
      technicalOwnership: cleanOptionalText(input.technicalOwnership) ?? null,
      collaborators: normalizeTextList(input.collaborators),
      dataScale: cleanOptionalText(input.dataScale) ?? null,
      toolingStack: normalizeTextList(input.toolingStack),
      tradeoffs: normalizeTextList(input.tradeoffs),
      impact: cleanOptionalText(input.impact) ?? null,
      biggestChallenge: cleanOptionalText(input.biggestChallenge) ?? null,
      resolution: cleanOptionalText(input.resolution) ?? null,
      interviewConfidence: input.interviewConfidence ?? null,
      externallyUsable: input.externallyUsable,
    },
  });
}

export async function createInterviewStoryRecord(
  userId: string,
  input: InterviewStoryCreate
) {
  const candidateProfile = await ensureCandidateProfileForUser(userId);

  return db.interviewStory.create({
    data: {
      candidateProfileId: candidateProfile.id,
      type: input.type,
      title: input.title.trim(),
      situation: input.situation.trim(),
      task: input.task.trim(),
      action: input.action.trim(),
      result: input.result.trim(),
      topics: normalizeTextList(input.topics),
      confidence: input.confidence ?? null,
    },
  });
}

```

### File: `lib/profile-memory/normalizers.ts`

```ts
import { SkillCategory } from "@prisma/client";

export function normalizeTextList(values?: string[] | null): string[] {
  if (!values || values.length === 0) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const cleaned = raw.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function toTitleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeSkillName(input: string): {
  displayName: string;
  canonicalName: string;
} {
  const cleaned = input.trim().replace(/\s+/g, " ");
  return {
    displayName: toTitleCase(cleaned),
    canonicalName: cleaned.toLowerCase(),
  };
}

const CATEGORY_LOOKUP: Record<string, SkillCategory> = {
  language: SkillCategory.PROGRAMMING_LANGUAGE,
  "programming language": SkillCategory.PROGRAMMING_LANGUAGE,
  framework: SkillCategory.ML_FRAMEWORK,
  ml: SkillCategory.ML_FRAMEWORK,
  "ml framework": SkillCategory.ML_FRAMEWORK,
  ai: SkillCategory.ML_FRAMEWORK,
  data: SkillCategory.DATA_TOOL,
  analytics: SkillCategory.DATA_TOOL,
  "data tool": SkillCategory.DATA_TOOL,
  bi: SkillCategory.BI_TOOL,
  "bi tool": SkillCategory.BI_TOOL,
  cloud: SkillCategory.CLOUD,
  database: SkillCategory.DATABASE,
  infra: SkillCategory.CLOUD,
  infrastructure: SkillCategory.CLOUD,
  mobile: SkillCategory.MOBILE,
};

export function normalizeSkillCategory(input?: string): SkillCategory {
  if (!input) return SkillCategory.OTHER;
  const key = input.trim().toLowerCase();
  return CATEGORY_LOOKUP[key] ?? SkillCategory.OTHER;
}

export function parseDateOrNull(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

```

### File: `lib/profile-memory/selectors.ts`

```ts
import type { CandidateIntake, SkillEvidence } from "@prisma/client";
import { db } from "../db";
import type {
  CandidateKnowledgeSnapshot,
  CandidateSkillWithEvidence,
  InterviewReadinessSnapshot,
  SkillEvidenceSummaryItem,
} from "./types";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function latestEvidenceDate(records: SkillEvidence[]): Date | null {
  const sorted = [...records].sort((a, b) => {
    const aTime = (a.evidenceDate ?? a.createdAt).getTime();
    const bTime = (b.evidenceDate ?? b.createdAt).getTime();
    return bTime - aTime;
  });
  return sorted[0]?.evidenceDate ?? sorted[0]?.createdAt ?? null;
}

function computeEvidenceStrength(records: SkillEvidence[]): number {
  if (records.length === 0) return 0;

  const credibilityValues = records
    .map((record) => record.credibility)
    .filter((value): value is number => typeof value === "number");

  const credibilityAverage = average(credibilityValues) ?? 60;
  const countBoost = Math.min(20, records.length * 5);
  const latestDate = latestEvidenceDate(records);

  const recencyBoost =
    latestDate && Date.now() - latestDate.getTime() <= 365 * 24 * 60 * 60 * 1000
      ? 10
      : 0;

  return Math.min(100, Math.round(credibilityAverage + countBoost + recencyBoost));
}

function buildReadinessSnapshot(intake: CandidateIntake | null): InterviewReadinessSnapshot {
  if (!intake) {
    return {
      strongestTopics: [],
      weakestTopics: [],
      stressfulInterviewTypes: [],
      missingMaterials: [],
      confidenceRecruiterInterview: null,
      confidenceTechnicalInterview: null,
      confidenceCaseInterview: null,
      confidenceBehavioralInterview: null,
      overallInterviewConfidence: null,
    };
  }

  const confidenceValues = [
    intake.confidenceRecruiterInterview,
    intake.confidenceTechnicalInterview,
    intake.confidenceCaseInterview,
    intake.confidenceBehavioralInterview,
  ].filter((value): value is number => typeof value === "number");

  const overall = average(confidenceValues);

  return {
    strongestTopics: intake.strongestTopics,
    weakestTopics: intake.weakestTopics,
    stressfulInterviewTypes: intake.stressfulInterviewTypes,
    missingMaterials: intake.missingMaterials,
    confidenceRecruiterInterview: intake.confidenceRecruiterInterview,
    confidenceTechnicalInterview: intake.confidenceTechnicalInterview,
    confidenceCaseInterview: intake.confidenceCaseInterview,
    confidenceBehavioralInterview: intake.confidenceBehavioralInterview,
    overallInterviewConfidence: overall === null ? null : Math.round(overall),
  };
}

function buildSkillWithEvidence(input: {
  id: string;
  candidateProfileId: string;
  skillId: string;
  proficiency: any;
  lastUsedAt: Date | null;
  interviewConfidence: number | null;
  productionConfidence: number | null;
  selfReportedOnly: boolean;
  profileNotes: string | null;
  evidenceNote: string | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  skill: any;
  evidenceRecords: SkillEvidence[];
}): CandidateSkillWithEvidence {
  const strength = computeEvidenceStrength(input.evidenceRecords);
  return {
    ...input,
    evidenceStrength: strength,
    evidenceBacked: input.evidenceRecords.length > 0,
  };
}

function buildEvidenceSummary(skills: CandidateSkillWithEvidence[]): SkillEvidenceSummaryItem[] {
  return skills.map((skillRecord) => {
    const credibilityValues = skillRecord.evidenceRecords
      .map((record) => record.credibility)
      .filter((value): value is number => typeof value === "number");

    const averageCredibility = average(credibilityValues);
    const latest = latestEvidenceDate(skillRecord.evidenceRecords);

    return {
      candidateSkillId: skillRecord.id,
      skillName: skillRecord.skill.name,
      evidenceCount: skillRecord.evidenceRecords.length,
      averageCredibility: averageCredibility === null ? null : Math.round(averageCredibility),
      latestEvidenceDate: latest ? latest.toISOString() : null,
      evidenceStrength: skillRecord.evidenceStrength,
      evidenceBacked: skillRecord.evidenceBacked,
    };
  });
}

export async function getSkillEvidenceSummary(userId: string): Promise<SkillEvidenceSummaryItem[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidateProfile: {
        include: {
          skills: {
            include: {
              skill: true,
              evidenceRecords: {
                orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
              },
            },
            orderBy: { priority: "desc" },
          },
        },
      },
    },
  });

  if (!user?.candidateProfile) return [];

  const skills = user.candidateProfile.skills.map((skillRecord) =>
    buildSkillWithEvidence(skillRecord)
  );

  return buildEvidenceSummary(skills);
}

export async function getInterviewReadinessSnapshot(
  userId: string
): Promise<InterviewReadinessSnapshot> {
  const intake = await db.candidateIntake.findUnique({ where: { userId } });
  return buildReadinessSnapshot(intake);
}

export async function getCandidateKnowledgeSnapshot(
  userId: string
): Promise<CandidateKnowledgeSnapshot> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidateIntake: true,
      candidateProfile: {
        include: {
          skills: {
            include: {
              skill: true,
              evidenceRecords: {
                orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
              },
            },
            orderBy: { priority: "desc" },
          },
          experienceEpisodes: {
            orderBy: { updatedAt: "desc" },
          },
          interviewStories: {
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
  });

  const intake = user?.candidateIntake ?? null;
  const readiness = buildReadinessSnapshot(intake);

  if (!user?.candidateProfile) {
    return {
      intake,
      skills: [],
      evidenceSummary: [],
      experienceEpisodes: [],
      interviewStories: [],
      readiness,
      onboardingComplete: intake?.status === "COMPLETED",
    };
  }

  const skills = user.candidateProfile.skills.map((skillRecord) =>
    buildSkillWithEvidence(skillRecord)
  );

  return {
    intake,
    skills,
    evidenceSummary: buildEvidenceSummary(skills),
    experienceEpisodes: user.candidateProfile.experienceEpisodes,
    interviewStories: user.candidateProfile.interviewStories,
    readiness,
    onboardingComplete: intake?.status === "COMPLETED",
  };
}

```

### File: `lib/profile-memory/types.ts`

```ts
import type {
  CandidateIntake,
  CandidateSkill,
  ExperienceEpisode,
  InterviewStory,
  Skill,
  SkillEvidence,
} from "@prisma/client";

export interface SkillEvidenceSummaryItem {
  candidateSkillId: string;
  skillName: string;
  evidenceCount: number;
  averageCredibility: number | null;
  latestEvidenceDate: string | null;
  evidenceStrength: number;
  evidenceBacked: boolean;
}

export type CandidateSkillWithEvidence = CandidateSkill & {
  skill: Skill;
  evidenceRecords: SkillEvidence[];
  evidenceStrength: number;
  evidenceBacked: boolean;
};

export interface InterviewReadinessSnapshot {
  strongestTopics: string[];
  weakestTopics: string[];
  stressfulInterviewTypes: string[];
  missingMaterials: string[];
  confidenceRecruiterInterview: number | null;
  confidenceTechnicalInterview: number | null;
  confidenceCaseInterview: number | null;
  confidenceBehavioralInterview: number | null;
  overallInterviewConfidence: number | null;
}

export interface CandidateKnowledgeSnapshot {
  intake: CandidateIntake | null;
  skills: CandidateSkillWithEvidence[];
  evidenceSummary: SkillEvidenceSummaryItem[];
  experienceEpisodes: ExperienceEpisode[];
  interviewStories: InterviewStory[];
  readiness: InterviewReadinessSnapshot;
  onboardingComplete: boolean;
}

```

### File: `lib/resume/engine.ts`

```ts
// lib/resume/engine.ts
// Resume generation engine — layered approach:
// Layer 1: Select best projects/skills/bullets (deterministic)
// Layer 2: Generate polished summary + bullets (LLM, controlled)
// Layer 3: Validate output (no invented facts, quality check)
// Layer 4: Store versioned output

import { db } from "../db";
import { llmStructured } from "../llm/provider";
import { ResumeGenerationOutputSchema, type ResumeGenerationOutput } from "../schemas";
import { CandidateProfile, CandidateSkill, Job, Project, Skill } from "@prisma/client";

type CandidateWithRelations = CandidateProfile & {
  skills: (CandidateSkill & { skill: Skill })[];
  projects: Project[];
};

// ─── Layer 1: Selection logic ─────────────────────────────────────────────────

function selectRelevantProjects(
  projects: Project[],
  job: Job,
  maxProjects = 3
): Project[] {
  const desc = (job.rawDescription + " " + job.title).toLowerCase();
  const jobKeywords = [...(job.requiredSkills || []), ...(job.niceToHaveSkills || []), ...(job.keywords || [])].map((k) => k.toLowerCase());

  const scored = projects.map((p) => {
    const tags = [...(p.techTags as string[]), ...(p.roleTags as string[])];
    const score = tags.reduce((sum, tag) => {
      const tagLower = tag.toLowerCase();
      const descMatch = desc.includes(tagLower) ? 2 : 0;
      const kwMatch = jobKeywords.some((kw) => kw.includes(tagLower) || tagLower.includes(kw)) ? 3 : 0;
      return sum + descMatch + kwMatch;
    }, 0);
    return { project: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxProjects)
    .map((s) => s.project);
}

function selectRelevantSkills(
  skills: (CandidateSkill & { skill: Skill })[],
  job: Job
): (CandidateSkill & { skill: Skill })[] {
  const jobSkills = [
    ...(job.requiredSkills || []),
    ...(job.niceToHaveSkills || []),
    ...(job.keywords || []),
  ].map((s) => s.toLowerCase());

  const matched = skills.filter((cs) => {
    const name = cs.skill.canonicalName.toLowerCase();
    return jobSkills.some((js) => js.includes(name) || name.includes(js));
  });

  // Always include high-priority skills even if not matched
  const highPriority = skills.filter((cs) => cs.priority >= 80 && !matched.includes(cs));

  return [...matched, ...highPriority.slice(0, 3)];
}

// ─── Layer 2: LLM generation ──────────────────────────────────────────────────

const RESUME_SYSTEM_PROMPT = `You are an expert technical resume writer specializing in the Israeli high-tech market.
You are creating a resume for Meital Abadi, a Technion Data Science graduate.
Your goal is to maximize interview conversion for the specific role.

CRITICAL RULES:
1. NEVER invent metrics, achievements, or experiences not explicitly provided
2. Only use the projects and skills provided to you — do not hallucinate additional ones
3. Write in active voice, start bullets with strong verbs
4. Align language to the job's keyword requirements without keyword stuffing
5. Keep the summary to 3-4 concise sentences
6. Make bullets specific and achievement-oriented where evidence allows
7. Flag any quality issues honestly in qualityIssues field

Return ONLY valid JSON matching the required schema.`;

export interface ResumeGenerationInput {
  jobId: string;
  candidateProfileId: string;
  roleFamily?: string;
  language?: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  summaryText: string;
  bulletVariants: ResumeGenerationOutput["bulletVariants"];
  insertedKeywords: string[];
  qualityScore: number;
  qualityIssues: string[];
}

export async function generateResumeVersion(
  input: ResumeGenerationInput
): Promise<ResumeVersion> {
  const candidate = await db.candidateProfile.findUnique({
    where: { id: input.candidateProfileId },
    include: {
      skills: { include: { skill: true } },
      projects: true,
    },
  });

  if (!candidate) throw new Error("Candidate profile not found");

  const job = await db.job.findUnique({ where: { id: input.jobId } });
  if (!job) throw new Error("Job not found");

  // Layer 1: Select
  const selectedProjects = selectRelevantProjects(candidate.projects, job);
  const selectedSkills = selectRelevantSkills(candidate.skills, job);

  // Build context for LLM
  const projectContext = selectedProjects
    .map((p) => `Project: ${p.name}\nSummary: ${p.shortSummary}\nTech: ${(p.techTags as string[]).join(", ")}\nBullets: ${JSON.stringify(p.bulletBank)}`)
    .join("\n\n");

  const skillContext = selectedSkills
    .map((cs) => `${cs.skill.name} (${cs.proficiency})`)
    .join(", ");

  const userPrompt = `Generate a tailored resume for the following role.

=== TARGET JOB ===
Title: ${job.title}
Required Skills: ${(job.requiredSkills || []).join(", ")}
Nice-to-Have: ${(job.niceToHaveSkills || []).join(", ")}
Keywords: ${(job.keywords || []).join(", ")}
Seniority: ${job.seniority || "Unknown"}

=== CANDIDATE DATA ===
Education: B.Sc. Data Science, Technion
Languages: Hebrew, English
Skills available: ${skillContext}

Selected Projects:
${projectContext}

=== INSTRUCTIONS ===
Generate a resume optimized for this specific job.
selectedProjectIds should be: ${selectedProjects.map((p) => p.id).join(",")}
selectedSkillIds should be: ${selectedSkills.map((cs) => cs.skillId).join(",")}`;

  // Layer 2: Generate
  const result = await llmStructured({
    systemPrompt: RESUME_SYSTEM_PROMPT,
    userPrompt,
    schema: ResumeGenerationOutputSchema,
    maxTokens: 2000,
    taskName: "resume_generation",
    maxRetries: 2,
  });

  const generated = result.data;

  // Layer 3: Validate — ensure no project IDs were invented
  const validProjectIds = new Set(candidate.projects.map((p) => p.id));
  const validSkillIds = new Set(candidate.skills.map((cs) => cs.skillId));

  const sanitizedProjectIds = generated.selectedProjectIds.filter((id) =>
    validProjectIds.has(id)
  );
  const sanitizedSkillIds = generated.selectedSkillIds.filter((id) =>
    validSkillIds.has(id)
  );

  // Build version name
  const company = await db.company.findUnique({
    where: { id: job.companyId || "" },
  });
  const companySlug = (company?.name || "Company").replace(/\s+/g, "");
  const roleSlug = (input.roleFamily || job.title).replace(/\s+/g, "");
  const version = await db.resumeVersion.count({
    where: { jobId: job.id, candidateProfileId: input.candidateProfileId },
  });
  const versionName = `CV_${companySlug}_${roleSlug}_v${version + 1}`;

  // Layer 4: Persist
  const saved = await db.resumeVersion.create({
    data: {
      candidateProfileId: input.candidateProfileId,
      jobId: input.jobId,
      name: versionName,
      roleFamily: input.roleFamily || job.title,
      language: input.language || "en",
      summaryText: generated.summaryText,
      selectedProjectIds: sanitizedProjectIds,
      selectedSkillIds: sanitizedSkillIds,
      insertedKeywords: generated.insertedKeywords,
      bulletVariants: generated.bulletVariants,
      qualityScore: generated.qualityScore,
      qualityIssues: generated.qualityIssues,
      generationMetadata: {
        model: "claude-sonnet-4-20250514",
        retries: result.retries,
        durationMs: result.durationMs,
        rationale: generated.rationale,
      },
      status: "DRAFT",
    },
  });

  return {
    id: saved.id,
    name: versionName,
    summaryText: generated.summaryText,
    bulletVariants: generated.bulletVariants,
    insertedKeywords: generated.insertedKeywords,
    qualityScore: generated.qualityScore ?? 0,
    qualityIssues: generated.qualityIssues,
  };
}

```

### File: `lib/schemas/index.ts`

```ts
// lib/schemas/index.ts
// Central schema registry — all structured outputs validated here
// Never trust LLM output without running through these schemas

import { z } from "zod";

// ─── Candidate Profile ───────────────────────────────────────────────────────

export const ProfileUpdateSchema = z.object({
  fullName: z.string().min(1).max(100),
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  targetSalaryMin: z.number().int().positive().optional(),
  targetSalaryIdeal: z.number().int().positive().optional(),
  workModePrefs: z.array(z.enum(["onsite", "hybrid", "remote", "flexible"])),
  targetCities: z.array(z.string()),
  rolePreferences: z.array(z.string()),
  weightSpeed: z.number().int().min(0).max(100),
  weightFit: z.number().int().min(0).max(100),
  weightSalary: z.number().int().min(0).max(100),
  weightUpside: z.number().int().min(0).max(100),
  outreachVoice: z.string().max(500).optional(),
  uniqueAngles: z.array(z.string()),
  noGoCompanies: z.array(z.string()),
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

// ─── Onboarding & Profile Memory ─────────────────────────────────────────────

const IntakeWorkModeSchema = z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]);
const SkillLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]);
const SkillEvidenceTypeSchema = z.enum([
  "PROJECT",
  "COURSE",
  "INTERVIEW",
  "WORK_EXPERIENCE",
  "EXERCISE",
  "CERTIFICATION",
  "OTHER",
]);
const InterviewStoryTypeSchema = z.enum([
  "BEHAVIORAL",
  "TECHNICAL",
  "LEADERSHIP",
  "FAILURE",
  "PROJECT",
  "CONFLICT",
  "OWNERSHIP",
]);
const ConfidenceSchema = z.number().int().min(0).max(100);

const CandidateIntakeBaseSchema = z.object({
  targetTitle: z.string().max(120).optional(),
  fallbackTitles: z.array(z.string().min(1).max(120)).optional(),
  minimumSalaryIls: z.number().int().nonnegative().optional(),
  idealSalaryMinIls: z.number().int().nonnegative().optional(),
  idealSalaryMaxIls: z.number().int().nonnegative().optional(),
  acceptableCities: z.array(z.string().min(1).max(80)).optional(),
  conditionalCities: z.array(z.string().min(1).max(80)).optional(),
  unacceptableCities: z.array(z.string().min(1).max(80)).optional(),
  workModes: z.array(IntakeWorkModeSchema).optional(),
  roleSeniorityTarget: z.string().max(80).optional(),
  constraintsNotes: z.string().max(2000).optional(),
  topTargetCompanies: z.array(z.string().min(1).max(120)).optional(),
  preferredStages: z.array(z.string().min(1).max(80)).optional(),
  preferredDomains: z.array(z.string().min(1).max(120)).optional(),
  avoidDomains: z.array(z.string().min(1).max(120)).optional(),
  preferredTeamTypes: z.array(z.string().min(1).max(120)).optional(),
  avoidIndustries: z.array(z.string().min(1).max(120)).optional(),
  strongestTopics: z.array(z.string().min(1).max(120)).optional(),
  weakestTopics: z.array(z.string().min(1).max(120)).optional(),
  stressfulInterviewTypes: z.array(z.string().min(1).max(120)).optional(),
  missingMaterials: z.array(z.string().min(1).max(120)).optional(),
  confidenceRecruiterInterview: ConfidenceSchema.optional(),
  confidenceTechnicalInterview: ConfidenceSchema.optional(),
  confidenceCaseInterview: ConfidenceSchema.optional(),
  confidenceBehavioralInterview: ConfidenceSchema.optional(),
  hebrewCommunicationConfidence: ConfidenceSchema.optional(),
  englishCommunicationConfidence: ConfidenceSchema.optional(),
  writingConfidence: ConfidenceSchema.optional(),
  liveInterviewConfidence: ConfidenceSchema.optional(),
  preferredOutreachTone: z.string().max(300).optional(),
  preferredPositioningStyle: z.string().max(300).optional(),
  outreachAvoidances: z.array(z.string().min(1).max(200)).optional(),
});

export const OnboardingSaveSchema = CandidateIntakeBaseSchema.extend({
  finalize: z.boolean().optional(),
});

export type OnboardingSaveInput = z.infer<typeof OnboardingSaveSchema>;

export const ProfileMemoryUpdateSchema = CandidateIntakeBaseSchema.partial();

export type ProfileMemoryUpdateInput = z.infer<typeof ProfileMemoryUpdateSchema>;

export const ProfileMemorySkillCreateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(80).optional(),
  proficiency: SkillLevelSchema.default("INTERMEDIATE"),
  lastUsedAt: z.string().datetime().optional(),
  interviewConfidence: ConfidenceSchema.optional(),
  productionConfidence: ConfidenceSchema.optional(),
  selfReportedOnly: z.boolean().default(true),
  profileNotes: z.string().max(2000).optional(),
  evidenceNote: z.string().max(1000).optional(),
  priority: z.number().int().min(0).max(100).default(50),
});

export type ProfileMemorySkillCreate = z.infer<typeof ProfileMemorySkillCreateSchema>;

export const ProfileMemorySkillUpdateSchema = z.object({
  proficiency: SkillLevelSchema.optional(),
  lastUsedAt: z.string().datetime().nullable().optional(),
  interviewConfidence: ConfidenceSchema.nullable().optional(),
  productionConfidence: ConfidenceSchema.nullable().optional(),
  selfReportedOnly: z.boolean().optional(),
  profileNotes: z.string().max(2000).nullable().optional(),
  evidenceNote: z.string().max(1000).nullable().optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

export type ProfileMemorySkillUpdate = z.infer<typeof ProfileMemorySkillUpdateSchema>;

export const SkillEvidenceCreateSchema = z.object({
  candidateSkillId: z.string().min(1),
  evidenceType: SkillEvidenceTypeSchema,
  title: z.string().min(1).max(160),
  description: z.string().max(3000).optional(),
  outcome: z.string().max(2000).optional(),
  evidenceDate: z.string().datetime().optional(),
  credibility: ConfidenceSchema.optional(),
  url: z.string().url().optional().or(z.literal("")),
});

export type SkillEvidenceCreate = z.infer<typeof SkillEvidenceCreateSchema>;

export const ExperienceEpisodeCreateSchema = z.object({
  title: z.string().min(1).max(160),
  organization: z.string().max(160).optional(),
  context: z.string().max(3000).optional(),
  technicalOwnership: z.string().max(3000).optional(),
  collaborators: z.array(z.string().min(1).max(120)).optional(),
  dataScale: z.string().max(300).optional(),
  toolingStack: z.array(z.string().min(1).max(120)).optional(),
  tradeoffs: z.array(z.string().min(1).max(160)).optional(),
  impact: z.string().max(3000).optional(),
  biggestChallenge: z.string().max(2000).optional(),
  resolution: z.string().max(2000).optional(),
  interviewConfidence: ConfidenceSchema.optional(),
  externallyUsable: z.boolean().default(true),
});

export type ExperienceEpisodeCreate = z.infer<typeof ExperienceEpisodeCreateSchema>;

export const InterviewStoryCreateSchema = z.object({
  type: InterviewStoryTypeSchema.default("PROJECT"),
  title: z.string().min(1).max(160),
  situation: z.string().min(1).max(3000),
  task: z.string().min(1).max(3000),
  action: z.string().min(1).max(3000),
  result: z.string().min(1).max(3000),
  topics: z.array(z.string().min(1).max(120)).optional(),
  confidence: ConfidenceSchema.optional(),
});

export type InterviewStoryCreate = z.infer<typeof InterviewStoryCreateSchema>;

// ─── Job Ingestion ────────────────────────────────────────────────────────────

export const ManualJobIngestSchema = z.object({
  rawText: z.string().min(50).max(50000),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  companyNameHint: z.string().max(100).optional(),
  source: z.enum([
    "MANUAL_PASTE",
    "MANUAL_URL",
    "GREENHOUSE",
    "LEVER",
    "COMEET",
    "COMPANY_CAREERS",
    "USER_UPLOAD",
    "HIDDEN_LEAD",
    "REFERRAL",
  ]),
});

export type ManualJobIngest = z.infer<typeof ManualJobIngestSchema>;

// ─── LLM Output Schemas ───────────────────────────────────────────────────────
// These define the contract for all model outputs
// If a model response fails validation, we retry — never silently pass garbage

export const JobExtractionOutputSchema = z.object({
  title: z.string(),
  companyName: z.string(),
  location: z.string().optional(),
  workMode: z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]).optional(),
  seniority: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD", "PRINCIPAL", "UNKNOWN"]).optional(),
  salaryRangeMin: z.number().int().optional(),
  salaryRangeMax: z.number().int().optional(),
  salaryCurrency: z.string().optional(),
  requiredSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()),
  keywords: z.array(z.string()),
  normalizedDescription: z.string(),
  atsPlatform: z.string().optional(),
  postedAt: z.string().optional(), // ISO date string
  externalId: z.string().optional(),
});

export type JobExtractionOutput = z.infer<typeof JobExtractionOutputSchema>;

export const ScoringBreakdownItemSchema = z.object({
  factor: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  weightedScore: z.number(),
  explanation: z.string(),
  evidence: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const JobScoreOutputSchema = z.object({
  totalScore: z.number().min(0).max(100),
  recommendation: z.enum([
    "STRONG_APPLY",
    "APPLY",
    "STRETCH_APPLY",
    "LOW_PRIORITY",
    "SKIP",
  ]),
  roleFamilyScore: z.number().min(0).max(100),
  mustHaveSkillScore: z.number().min(0).max(100),
  niceToHaveScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  projectScore: z.number().min(0).max(100),
  domainScore: z.number().min(0).max(100),
  locationScore: z.number().min(0).max(100),
  salaryScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  breakdown: z.array(ScoringBreakdownItemSchema),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  llmExplanation: z.string(),
});

export type JobScoreOutput = z.infer<typeof JobScoreOutputSchema>;

export const ResumeGenerationOutputSchema = z.object({
  summaryText: z.string().min(50).max(800),
  selectedProjectIds: z.array(z.string()),
  selectedSkillIds: z.array(z.string()),
  insertedKeywords: z.array(z.string()),
  bulletVariants: z.array(
    z.object({
      projectId: z.string().optional(),
      section: z.string(),
      text: z.string(),
      roleRelevance: z.number().min(0).max(100),
    })
  ),
  qualityScore: z.number().min(0).max(100),
  qualityIssues: z.array(z.string()),
  rationale: z.string(),
});

export type ResumeGenerationOutput = z.infer<typeof ResumeGenerationOutputSchema>;

export const OutreachMessageOutputSchema = z.object({
  targetPersona: z.string(),
  searchQuery: z.string(),
  contactType: z.enum([
    "RECRUITER",
    "HIRING_MANAGER",
    "TEAM_MEMBER",
    "ALUMNI",
    "FOUNDER",
    "ANALYTICS_LEAD",
    "ENGINEERING_MANAGER",
    "TA_PARTNER",
    "OTHER",
  ]),
  connectionRequest: z.string().max(300),
  followUpMessage: z.string().max(500),
  referralAsk: z.string().max(600),
  tips: z.array(z.string()),
  rationale: z.string(),
});

export type OutreachMessageOutput = z.infer<typeof OutreachMessageOutputSchema>;

export const CoverLetterOutputSchema = z.object({
  subject: z.string().max(150),
  letterText: z.string().min(200).max(3000),
  linkedinMessage: z.string().max(300),
  toneUsed: z.string(),
  keywordsUsed: z.array(z.string()),
});

export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

// ─── Application CRM ─────────────────────────────────────────────────────────

export const ApplicationCreateSchema = z.object({
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  jobId: z.string().optional(),
  companyId: z.string().optional(),
  status: z.enum([
    "WISHLIST",
    "APPLIED",
    "RECRUITER_SCREEN",
    "TECHNICAL_INTERVIEW",
    "CASE_STUDY",
    "FINAL_INTERVIEW",
    "OFFER",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
    "ON_HOLD",
  ]).default("WISHLIST"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(5000).optional(),
  salaryExpected: z.number().int().positive().optional(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().email().optional().or(z.literal("")),
  followUpDueAt: z.string().datetime().optional(),
  nextAction: z.string().max(500).optional(),
  resumeVersionId: z.string().optional(),
});

export type ApplicationCreate = z.infer<typeof ApplicationCreateSchema>;

export const ApplicationUpdateSchema = ApplicationCreateSchema.partial().extend({
  rejectionReason: z.string().max(500).optional(),
  offerAmount: z.number().int().positive().optional(),
  appliedAt: z.string().datetime().optional(),
});

export type ApplicationUpdate = z.infer<typeof ApplicationUpdateSchema>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const JobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  recommendation: z.enum(["STRONG_APPLY", "APPLY", "STRETCH_APPLY", "LOW_PRIORITY", "SKIP"]).optional(),
  workMode: z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["score", "postedAt", "createdAt"]).default("score"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type JobsQuery = z.infer<typeof JobsQuerySchema>;

```

### File: `lib/scoring/engine.ts`

```ts
// lib/scoring/engine.ts
// Deterministic scoring engine — Layer 1: rule-based
// LLM explanation — Layer 2: narrative only, does not affect score
// Every score is traceable to specific factors and evidence

import {
  CandidateProfile,
  CandidateSkill,
  Job,
  Prisma,
  Project,
  Skill,
} from "@prisma/client";
import { llmStructured } from "../llm/provider";
import { JobScoreOutputSchema, type JobScoreOutput } from "../schemas";

// ─── Types ───────────────────────────────────────────────────────────────────

type CandidateWithRelations = CandidateProfile & {
  skills: (CandidateSkill & { skill: Skill })[];
  projects: Project[];
};

interface ScoringFactor {
  factor: string;
  score: number;       // 0–100
  weight: number;      // 0–1, factors must sum to 1
  weightedScore: number;
  explanation: string;
  evidence: string[];
  confidence: number;  // 0–1
}

// ─── Role family matching ─────────────────────────────────────────────────────

const ROLE_FAMILY_KEYWORDS: Record<string, string[]> = {
  "Data Scientist": [
    "data scientist", "machine learning", "ml", "statistical", "modeling",
    "scikit-learn", "pytorch", "tensorflow", "xgboost", "prediction", "classification",
  ],
  "AI Engineer": [
    "ai engineer", "llm", "large language model", "nlp", "generative ai",
    "prompt engineering", "rag", "vector", "embedding", "openai", "anthropic",
    "langchain", "fine-tuning",
  ],
  "AI Analyst": [
    "ai analyst", "analytics", "business intelligence", "bi", "reporting",
    "dashboard", "tableau", "power bi", "data analysis", "insights",
  ],
  "Data Analyst": [
    "data analyst", "sql", "excel", "reporting", "kpi", "metrics",
    "analytics", "looker", "dashboard", "stakeholder",
  ],
  "Analytics Engineer": [
    "analytics engineer", "dbt", "data modeling", "data warehouse",
    "snowflake", "bigquery", "redshift", "etl", "elt", "pipeline",
  ],
  "ML Engineer": [
    "ml engineer", "mlops", "model deployment", "inference", "serving",
    "kubernetes", "docker", "feature store", "model monitoring",
  ],
};

function scoreRoleFamily(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const desc = (job.rawDescription + " " + (job.normalizedTitle || "")).toLowerCase();
  const targetRoles = (candidate.rolePreferences as string[]) || [];

  let bestScore = 0;
  const matchedRoles: string[] = [];
  const evidence: string[] = [];

  for (const role of targetRoles) {
    const keywords = ROLE_FAMILY_KEYWORDS[role] || [];
    const matches = keywords.filter((kw) => desc.includes(kw));
    if (matches.length > 0) {
      matchedRoles.push(role);
      evidence.push(...matches.map((m) => `"${m}" found in job`));
      const roleScore = Math.min(100, (matches.length / keywords.length) * 100 * 2);
      bestScore = Math.max(bestScore, roleScore);
    }
  }

  // Direct title match boosts score
  const jobTitle = (job.title || "").toLowerCase();
  for (const role of targetRoles) {
    if (jobTitle.includes(role.toLowerCase())) {
      bestScore = Math.min(100, bestScore + 20);
      evidence.push(`Job title directly matches "${role}"`);
    }
  }

  return {
    factor: "Role Family Alignment",
    score: Math.round(bestScore),
    weight: 0.2,
    weightedScore: Math.round(bestScore * 0.2),
    explanation: matchedRoles.length > 0
      ? `Role aligns with ${matchedRoles.join(", ")}`
      : "Role family alignment unclear",
    evidence: evidence.slice(0, 5),
    confidence: matchedRoles.length > 0 ? 0.85 : 0.4,
  };
}

// ─── Skill matching ───────────────────────────────────────────────────────────

function scoreSkills(
  job: Job,
  candidate: CandidateWithRelations,
  isMustHave: boolean
): ScoringFactor {
  const candidateSkillNames = candidate.skills.map((s) =>
    s.skill.canonicalName.toLowerCase()
  );
  const jobSkills = isMustHave
    ? (job.requiredSkills || [])
    : (job.niceToHaveSkills || []);

  if (jobSkills.length === 0) {
    return {
      factor: isMustHave ? "Must-Have Skills" : "Nice-to-Have Skills",
      score: 60, // neutral when job has no explicit skill list
      weight: isMustHave ? 0.25 : 0.1,
      weightedScore: isMustHave ? 15 : 6,
      explanation: "No explicit skill requirements extracted from job",
      evidence: [],
      confidence: 0.3,
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jobSkills) {
    const skillLower = skill.toLowerCase();
    const isMatch = candidateSkillNames.some(
      (cs) => cs.includes(skillLower) || skillLower.includes(cs)
    );
    if (isMatch) matched.push(skill);
    else missing.push(skill);
  }

  const coverageRatio = matched.length / jobSkills.length;
  const score = Math.round(coverageRatio * 100);

  return {
    factor: isMustHave ? "Must-Have Skills" : "Nice-to-Have Skills",
    score,
    weight: isMustHave ? 0.25 : 0.1,
    weightedScore: Math.round(score * (isMustHave ? 0.25 : 0.1)),
    explanation: `${matched.length}/${jobSkills.length} ${isMustHave ? "required" : "preferred"} skills matched`,
    evidence: [
      ...matched.slice(0, 4).map((s) => `✓ ${s}`),
      ...missing.slice(0, 3).map((s) => `✗ ${s}`),
    ],
    confidence: 0.8,
  };
}

// ─── Seniority matching ───────────────────────────────────────────────────────

function scoreSeniority(job: Job): ScoringFactor {
  const seniority = (job.seniority || "UNKNOWN").toUpperCase();
  const desc = job.rawDescription.toLowerCase();

  // Meital is a recent grad — Junior/Mid is perfect, Senior is stretch
  const seniorityScores: Record<string, number> = {
    JUNIOR: 95,
    MID: 85,
    SENIOR: 50,
    LEAD: 25,
    PRINCIPAL: 10,
    UNKNOWN: 65,
  };

  // Check for junior-friendly signals in description
  const juniorSignals = [
    "entry level", "junior", "new grad", "0-2 years", "1-2 years",
    "recent graduate", "graduate", "junior level", "entry-level",
  ];
  const seniorSignals = [
    "5+ years", "7+ years", "senior", "lead", "principal", "staff",
    "extensive experience", "proven track record",
  ];

  let score = seniorityScores[seniority] ?? 65;
  const evidence: string[] = [`Detected seniority: ${seniority}`];

  for (const signal of juniorSignals) {
    if (desc.includes(signal)) {
      score = Math.min(100, score + 10);
      evidence.push(`Junior-friendly signal: "${signal}"`);
      break;
    }
  }
  for (const signal of seniorSignals) {
    if (desc.includes(signal)) {
      score = Math.max(0, score - 15);
      evidence.push(`Senior requirement signal: "${signal}"`);
      break;
    }
  }

  return {
    factor: "Seniority Match",
    score: Math.round(score),
    weight: 0.1,
    weightedScore: Math.round(score * 0.1),
    explanation: `Job targets ${seniority} level — Meital is a recent Technion grad`,
    evidence,
    confidence: seniority === "UNKNOWN" ? 0.4 : 0.75,
  };
}

// ─── Project relevance ────────────────────────────────────────────────────────

function scoreProjects(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const desc = (job.rawDescription + " " + job.title).toLowerCase();
  const evidence: string[] = [];
  let totalScore = 0;

  for (const project of candidate.projects) {
    const tags = [...(project.techTags || []), ...(project.roleTags || [])];
    const tagMatches = tags.filter((t) => desc.includes(t.toLowerCase()));

    if (tagMatches.length > 0) {
      const projectScore = Math.min(100, tagMatches.length * 20);
      totalScore += projectScore;
      evidence.push(
        `"${project.name}" matches: ${tagMatches.slice(0, 3).join(", ")}`
      );
    }
  }

  const normalizedScore =
    candidate.projects.length > 0
      ? Math.min(100, totalScore / candidate.projects.length)
      : 40;

  return {
    factor: "Project Relevance",
    score: Math.round(normalizedScore),
    weight: 0.15,
    weightedScore: Math.round(normalizedScore * 0.15),
    explanation: `${evidence.length} of ${candidate.projects.length} projects match job domain`,
    evidence: evidence.slice(0, 4),
    confidence: candidate.projects.length > 0 ? 0.75 : 0.3,
  };
}

// ─── Location / work mode ─────────────────────────────────────────────────────

function scoreLocation(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const jobLocation = (job.location || "").toLowerCase();
  const jobWorkMode = job.workMode;
  const preferredModes = (candidate.workModePrefs as string[]).map((m) =>
    m.toLowerCase()
  );
  const targetCities = (candidate.targetCities as string[]).map((c) =>
    c.toLowerCase()
  );

  let score = 70; // neutral default
  const evidence: string[] = [];

  // Work mode check
  if (jobWorkMode) {
    const mode = jobWorkMode.toLowerCase();
    if (preferredModes.includes(mode)) {
      score += 20;
      evidence.push(`Work mode "${mode}" matches preference`);
    } else if (mode === "remote") {
      score += 15;
      evidence.push("Remote option available");
    }
  }

  // City check
  const cityMatch = targetCities.some(
    (city) => city !== "remote" && jobLocation.includes(city)
  );
  if (cityMatch) {
    score += 10;
    evidence.push(`Location "${job.location}" is in target cities`);
  }

  // Israel presence check
  const israelSignals = ["israel", "tel aviv", "herzliya", "haifa", "ramat gan", "petah tikva", "ra'anana"];
  if (israelSignals.some((s) => jobLocation.includes(s))) {
    score += 5;
    evidence.push("Job is in Israel");
  }

  return {
    factor: "Location & Work Mode",
    score: Math.min(100, Math.round(score)),
    weight: 0.05,
    weightedScore: Math.min(5, Math.round(score * 0.05)),
    explanation: `Location: ${job.location || "unspecified"}, Work mode: ${jobWorkMode || "unspecified"}`,
    evidence,
    confidence: jobWorkMode ? 0.85 : 0.5,
  };
}

// ─── Domain relevance ─────────────────────────────────────────────────────────

function scoreDomain(job: Job): ScoringFactor {
  const desc = (job.rawDescription + " " + job.title).toLowerCase();

  // High-value domains for Meital based on her background
  const DOMAIN_SCORES: { keywords: string[]; domain: string; score: number }[] = [
    { domain: "AI/ML Platform", keywords: ["llm", "generative ai", "nlp", "foundation model", "ai platform"], score: 95 },
    { domain: "Data Platform", keywords: ["data platform", "analytics platform", "data infra", "data mesh"], score: 90 },
    { domain: "ProductAnalytics", keywords: ["product analytics", "growth", "experimentation", "a/b testing"], score: 85 },
    { domain: "Cybersecurity", keywords: ["cybersecurity", "cyber", "threat detection", "security"], score: 75 },
    { domain: "Fintech", keywords: ["fintech", "payments", "financial", "banking", "trading"], score: 75 },
    { domain: "Adtech/Martech", keywords: ["adtech", "marketing tech", "advertising", "campaign"], score: 70 },
    { domain: "Healthtech", keywords: ["health tech", "medical", "clinical", "biotech", "pharma"], score: 65 },
    { domain: "E-commerce", keywords: ["e-commerce", "marketplace", "retail", "shopping"], score: 65 },
    { domain: "Infra/DevOps", keywords: ["infrastructure", "devops", "sre", "platform engineering"], score: 55 },
  ];

  let bestMatch = { domain: "General Tech", score: 60 };
  const evidence: string[] = [];

  for (const domainDef of DOMAIN_SCORES) {
    const matches = domainDef.keywords.filter((kw) => desc.includes(kw));
    if (matches.length > 0) {
      evidence.push(`${domainDef.domain}: ${matches.join(", ")}`);
      if (domainDef.score > bestMatch.score) {
        bestMatch = { domain: domainDef.domain, score: domainDef.score };
      }
    }
  }

  return {
    factor: "Domain Relevance",
    score: bestMatch.score,
    weight: 0.1,
    weightedScore: Math.round(bestMatch.score * 0.1),
    explanation: `Domain: ${bestMatch.domain}`,
    evidence,
    confidence: evidence.length > 0 ? 0.75 : 0.4,
  };
}

// ─── Salary scoring ───────────────────────────────────────────────────────────

function scoreSalary(job: Job, candidate: CandidateWithRelations): ScoringFactor {
  const salaryMin = job.salaryRangeMin;
  const salaryMax = job.salaryRangeMax;
  const targetIdeal = candidate.targetSalaryIdeal;
  const targetMin = candidate.targetSalaryMin;

  if (!salaryMin && !salaryMax) {
    return {
      factor: "Salary Range",
      score: 60, // neutral when salary not disclosed
      weight: 0.05,
      weightedScore: 3,
      explanation: "Salary not disclosed — common in Israeli high-tech",
      evidence: [],
      confidence: 0.2,
    };
  }

  let score = 70;
  const evidence: string[] = [];

  if (salaryMax && targetIdeal) {
    if (salaryMax >= targetIdeal) {
      score = 95;
      evidence.push(`Max salary ${salaryMax} meets ideal target ${targetIdeal}`);
    } else if (salaryMax >= (targetMin || 0)) {
      score = 70;
      evidence.push(`Salary range is acceptable but below ideal`);
    } else {
      score = 30;
      evidence.push(`Salary ${salaryMax} may be below minimum target`);
    }
  }

  return {
    factor: "Salary Range",
    score: Math.round(score),
    weight: 0.05,
    weightedScore: Math.round(score * 0.05),
    explanation: salaryMin || salaryMax
      ? `Range: ${salaryMin || "?"}–${salaryMax || "?"} ${job.salaryCurrency || ""}`
      : "No salary data",
    evidence,
    confidence: salaryMax ? 0.8 : 0.4,
  };
}

// ─── Recommendation from score ────────────────────────────────────────────────

function getRecommendation(totalScore: number): JobScoreOutput["recommendation"] {
  if (totalScore >= 80) return "STRONG_APPLY";
  if (totalScore >= 65) return "APPLY";
  if (totalScore >= 50) return "STRETCH_APPLY";
  if (totalScore >= 35) return "LOW_PRIORITY";
  return "SKIP";
}

// ─── Candidate priority weights (from profile) ───────────────────────────────

interface PriorityWeights {
  speed: number;
  fit: number;
  salary: number;
  upside: number;
}

function normalizePriorityWeights(candidate: CandidateWithRelations): PriorityWeights {
  const raw = {
    speed: Math.max(0, candidate.weightSpeed ?? 25),
    fit: Math.max(0, candidate.weightFit ?? 30),
    salary: Math.max(0, candidate.weightSalary ?? 25),
    upside: Math.max(0, candidate.weightUpside ?? 20),
  };

  const total = raw.speed + raw.fit + raw.salary + raw.upside;
  if (total <= 0) {
    return { speed: 0.25, fit: 0.3, salary: 0.25, upside: 0.2 };
  }

  return {
    speed: raw.speed / total,
    fit: raw.fit / total,
    salary: raw.salary / total,
    upside: raw.upside / total,
  };
}

function buildFactorWeightMap(priorities: PriorityWeights): Record<string, number> {
  // Fit distribution: role + skills + projects + domain
  // Speed distribution: seniority + location friction
  // Salary distribution: explicit compensation signal
  // Upside distribution: role trajectory + project leverage + domain quality
  const map: Record<string, number> = {
    "Role Family Alignment": priorities.fit * 0.25 + priorities.upside * 0.4,
    "Must-Have Skills": priorities.fit * 0.35,
    "Nice-to-Have Skills": priorities.fit * 0.1,
    "Project Relevance": priorities.fit * 0.2 + priorities.upside * 0.3,
    "Domain Relevance": priorities.fit * 0.1 + priorities.upside * 0.3,
    "Seniority Match": priorities.speed * 0.7,
    "Location & Work Mode": priorities.speed * 0.3,
    "Salary Range": priorities.salary,
  };

  const sum = Object.values(map).reduce((acc, value) => acc + value, 0);
  if (Math.abs(sum - 1) > 0.0001) {
    // Safety normalize in case of future changes.
    Object.keys(map).forEach((key) => {
      map[key] = map[key] / sum;
    });
  }

  return map;
}

// ─── LLM Explanation Layer ────────────────────────────────────────────────────

async function generateLLMExplanation(
  job: Job,
  candidate: CandidateWithRelations,
  factors: ScoringFactor[],
  totalScore: number,
  recommendation: string
): Promise<string> {
  const topFactors = [...factors]
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 4)
    .map((f) => `${f.factor}: ${f.score}/100 — ${f.explanation}`)
    .join("\n");

  const systemPrompt = `You are a senior tech recruiter who specializes in the Israeli high-tech market.
You are analyzing job fit for Meital Abadi, a recent Technion Data Science graduate.
Write concise, honest, actionable explanations of job fit. Be specific. Do not be generic.
Return ONLY a 2-3 sentence explanation. No JSON needed — this is plain text.`;

  const userPrompt = `
Job: ${job.title} at company
Total fit score: ${totalScore}/100
Recommendation: ${recommendation}
Top scoring factors:
${topFactors}

Write a 2-3 sentence explanation of why Meital should or shouldn't apply, 
referencing specific factors. Be direct and actionable.`;

  try {
    const response = await import("../llm/provider").then((m) =>
      m.llmComplete({ systemPrompt, userPrompt, maxTokens: 200, taskName: "score_explanation" })
    );
    return response.text.trim();
  } catch {
    // Explanation failure should not break scoring
    return `Score ${totalScore}/100. Recommendation: ${recommendation}. See factor breakdown for details.`;
  }
}

// ─── Main scoring function ────────────────────────────────────────────────────

export interface ScoringResult {
  totalScore: number;
  recommendation: JobScoreOutput["recommendation"];
  factors: ScoringFactor[];
  strengths: string[];
  risks: string[];
  confidence: number;
  llmExplanation: string;
}

export async function scoreJob(
  job: Job,
  candidate: CandidateWithRelations
): Promise<ScoringResult> {
  // Layer 1: deterministic raw scoring
  const rawFactors: ScoringFactor[] = [
    scoreRoleFamily(job, candidate),
    scoreSkills(job, candidate, true),    // must-have
    scoreSkills(job, candidate, false),   // nice-to-have
    scoreSeniority(job),
    scoreProjects(job, candidate),
    scoreDomain(job),
    scoreLocation(job, candidate),
    scoreSalary(job, candidate),
  ];

  // Apply candidate-specific strategy weights (speed/fit/salary/upside).
  const priorities = normalizePriorityWeights(candidate);
  const factorWeightMap = buildFactorWeightMap(priorities);
  const factors = rawFactors.map((factor) => {
    const weight = factorWeightMap[factor.factor] ?? factor.weight;
    return {
      ...factor,
      weight,
      weightedScore: Math.round(factor.score * weight * 100) / 100,
    };
  });

  // Validate weights sum to ~1 (sanity check)
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.05) {
    console.warn(`[scoring] Weight sum = ${totalWeight}, expected 1.0`);
  }

  const totalScore = Math.round(
    factors.reduce((sum, f) => sum + f.weightedScore, 0)
  );

  const recommendation = getRecommendation(totalScore);
  const avgConfidence =
    factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length;

  const strengths = factors
    .filter((f) => f.score >= 70)
    .map((f) => `${f.factor}: ${f.explanation}`);

  const risks = factors
    .filter((f) => f.score < 45)
    .map((f) => `${f.factor}: ${f.explanation}`);

  // Layer 2: LLM explanation (doesn't affect score)
  const llmExplanation = await generateLLMExplanation(
    job,
    candidate,
    factors,
    totalScore,
    recommendation
  );

  return {
    totalScore,
    recommendation,
    factors,
    strengths,
    risks,
    confidence: Math.round(avgConfidence * 100) / 100,
    llmExplanation,
  };
}

// ─── Convert to Prisma-ready shape ────────────────────────────────────────────

export function scoringResultToDbShape(
  result: ScoringResult,
  jobId: string,
  candidateProfileId: string
): Prisma.JobScoreUncheckedCreateInput {
  const factorMap = Object.fromEntries(
    result.factors.map((f) => [f.factor, f])
  );

  const getScore = (name: string) => factorMap[name]?.score ?? 0;

  return {
    jobId,
    candidateProfileId,
    totalScore: result.totalScore,
    recommendation: result.recommendation,
    roleFamilyScore: getScore("Role Family Alignment"),
    mustHaveSkillScore: getScore("Must-Have Skills"),
    niceToHaveScore: getScore("Nice-to-Have Skills"),
    seniorityScore: getScore("Seniority Match"),
    projectScore: getScore("Project Relevance"),
    domainScore: getScore("Domain Relevance"),
    locationScore: getScore("Location & Work Mode"),
    salaryScore: getScore("Salary Range"),
    confidence: result.confidence,
    breakdown: result.factors as unknown as Prisma.InputJsonValue,
    strengths: result.strengths,
    risks: result.risks,
    llmExplanation: result.llmExplanation,
  };
}

```

### File: `next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

```

### File: `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security: ensure server-side env vars never leak to client
  serverRuntimeConfig: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  publicRuntimeConfig: {},
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

module.exports = nextConfig;

```

### File: `package-lock.json`

```json
{
  "name": "job-hunter-os",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "job-hunter-os",
      "version": "0.1.0",
      "dependencies": {
        "@anthropic-ai/sdk": "^0.26.0",
        "@prisma/client": "^5.16.1",
        "bcryptjs": "^2.4.3",
        "clsx": "^2.1.1",
        "date-fns": "^3.6.0",
        "dotenv": "^17.3.1",
        "next": "14.2.5",
        "next-auth": "^4.24.7",
        "zod": "^3.23.8"
      },
      "devDependencies": {
        "@types/bcryptjs": "^2.4.6",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "eslint": "^8",
        "eslint-config-next": "14.2.5",
        "prisma": "^5.16.1",
        "typescript": "^5"
      }
    },
    "node_modules/@anthropic-ai/sdk": {
      "version": "0.26.1",
      "resolved": "https://registry.npmjs.org/@anthropic-ai/sdk/-/sdk-0.26.1.tgz",
      "integrity": "sha512-HeMJP1bDFfQPQS3XTJAmfXkFBdZ88wvfkE05+vsoA9zGn5dHqEaHOPsqkazf/i0gXYg2XlLxxZrf6rUAarSqzw==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "^18.11.18",
        "@types/node-fetch": "^2.6.4",
        "abort-controller": "^3.0.0",
        "agentkeepalive": "^4.2.1",
        "form-data-encoder": "1.7.2",
        "formdata-node": "^4.3.2",
        "node-fetch": "^2.6.7"
      }
    },
    "node_modules/@anthropic-ai/sdk/node_modules/@types/node": {
      "version": "18.19.130",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-18.19.130.tgz",
      "integrity": "sha512-GRaXQx6jGfL8sKfaIDD6OupbIHBr9jv7Jnaml9tB7l4v068PAOXqfcujMMo5PhbIs6ggR1XODELqahT2R8v0fg==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~5.26.4"
      }
    },
    "node_modules/@anthropic-ai/sdk/node_modules/undici-types": {
      "version": "5.26.5",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-5.26.5.tgz",
      "integrity": "sha512-JlCMO+ehdEIKqlFxk6IfVoAUVmgz7cU7zD/h9XZ0qzeosSHmUJVOzSQvvYSYWXkFXC+IfLKSIffhv0sVZup6pA==",
      "license": "MIT"
    },
    "node_modules/@babel/runtime": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.28.6.tgz",
      "integrity": "sha512-05WQkdpL9COIMz4LjTxGpPNCdlpyimKppYNoJ5Di5EUObifl8t4tuLuUBBZEpoLYOmfvIWrsp9fCl0HoPRVTdA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@emnapi/core": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-1.8.1.tgz",
      "integrity": "sha512-AvT9QFpxK0Zd8J0jopedNm+w/2fIzvtPKPjqyw9jwvBaReTTqPBk9Hixaz7KbjimP+QNz605/XnjFcDAL2pqBg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/wasi-threads": "1.1.0",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.8.1.tgz",
      "integrity": "sha512-mehfKSMWjjNol8659Z8KxEMrdSJDDot5SXMq00dM8BN4o+CLNXQ0xH2V7EchNHV4RmbZLmmPdEaXZc5H2FXmDg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/wasi-threads": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-1.1.0.tgz",
      "integrity": "sha512-WI0DdZ8xFSbgMjR1sFsKABJ/C5OnRrjT06JXbZKexJGrDuPTzZdDYfFlsgcCXCyf+suG5QU2e/y1Wo2V/OapLQ==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.9.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.9.1.tgz",
      "integrity": "sha512-phrYmNiYppR7znFEdqgfWHXR6NCkZEK7hwWDHZUjit/2/U0r6XvkDl0SYnoM51Hq7FhCGdLDT6zxCCOY1hexsQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.12.2",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.2.tgz",
      "integrity": "sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-2.1.4.tgz",
      "integrity": "sha512-269Z39MS6wVJtsoUl10L60WdkhJVdPG24Q4eZTH3nnF6lpvSShEK3wQjDX9JRWAUPvPh7COouPpU9IrqaZFvtQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ajv": "^6.12.4",
        "debug": "^4.3.2",
        "espree": "^9.6.0",
        "globals": "^13.19.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.1.0",
        "minimatch": "^3.1.2",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/js": {
      "version": "8.57.1",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-8.57.1.tgz",
      "integrity": "sha512-d9zaMRSTIKDLhctzH12MtXvJKSSUhaHcjV+2Z+GK+EEY7XKpP5yR4x+N3TAcHTcu963nIr+TMcCb4DBCYX1z6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      }
    },
    "node_modules/@humanwhocodes/config-array": {
      "version": "0.13.0",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/config-array/-/config-array-0.13.0.tgz",
      "integrity": "sha512-DZLEEqFWQFiyK6h5YIeynKx7JlvCYWL0cImfSRXZ9l4Sg2efkFGTuFf6vzXjK1cq6IYkU+Eg/JizXw+TD2vRNw==",
      "deprecated": "Use @eslint/config-array instead",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanwhocodes/object-schema": "^2.0.3",
        "debug": "^4.3.1",
        "minimatch": "^3.0.5"
      },
      "engines": {
        "node": ">=10.10.0"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/object-schema": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/object-schema/-/object-schema-2.0.3.tgz",
      "integrity": "sha512-93zYdMES/c1D69yZiKDBj0V24vqNzB/koF26KPaagAfd3P/4gUlh3Dys5ogAK+Exi9QyzlD8x/08Zt7wIKcDcA==",
      "deprecated": "Use @eslint/object-schema instead",
      "dev": true,
      "license": "BSD-3-Clause"
    },
    "node_modules/@isaacs/cliui": {
      "version": "8.0.2",
      "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-8.0.2.tgz",
      "integrity": "sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "string-width": "^5.1.2",
        "string-width-cjs": "npm:string-width@^4.2.0",
        "strip-ansi": "^7.0.1",
        "strip-ansi-cjs": "npm:strip-ansi@^6.0.1",
        "wrap-ansi": "^8.1.0",
        "wrap-ansi-cjs": "npm:wrap-ansi@^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@isaacs/cliui/node_modules/ansi-regex": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.2.2.tgz",
      "integrity": "sha512-Bq3SmSpyFHaWjPk8If9yc6svM8c56dB5BAtW4Qbw5jHTwwXXcTLoRMkpDJp6VL0XzlWaCHTXrkFURMYmD0sLqg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/@isaacs/cliui/node_modules/strip-ansi": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.2.0.tgz",
      "integrity": "sha512-yDPMNjp4WyfYBkHnjIRLfca1i6KMyGCtsVgoKe/z1+6vukgaENdgGBZt+ZmKPc4gavvEZ5OgHfHdrazhgNyG7w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^6.2.2"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/@napi-rs/wasm-runtime": {
      "version": "0.2.12",
      "resolved": "https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-0.2.12.tgz",
      "integrity": "sha512-ZVWUcfwY4E/yPitQJl481FjFo3K22D6qF0DuFH6Y/nbnE11GY5uguDxZMGXPQ8WQ0128MXQD7TnfHyK4oWoIJQ==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.4.3",
        "@emnapi/runtime": "^1.4.3",
        "@tybys/wasm-util": "^0.10.0"
      }
    },
    "node_modules/@next/env": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/env/-/env-14.2.5.tgz",
      "integrity": "sha512-/zZGkrTOsraVfYjGP8uM0p6r0BDT6xWpkjdVbcz66PJVSpwXX3yNiRycxAuDfBKGWBrZBXRuK/YVlkNgxHGwmA==",
      "license": "MIT"
    },
    "node_modules/@next/eslint-plugin-next": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/eslint-plugin-next/-/eslint-plugin-next-14.2.5.tgz",
      "integrity": "sha512-LY3btOpPh+OTIpviNojDpUdIbHW9j0JBYBjsIp8IxtDFfYFyORvw3yNq6N231FVqQA7n7lwaf7xHbVJlA1ED7g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "glob": "10.3.10"
      }
    },
    "node_modules/@next/swc-darwin-arm64": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-14.2.5.tgz",
      "integrity": "sha512-/9zVxJ+K9lrzSGli1///ujyRfon/ZneeZ+v4ptpiPoOU+GKZnm8Wj8ELWU1Pm7GHltYRBklmXMTUqM/DqQ99FQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-darwin-x64": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-14.2.5.tgz",
      "integrity": "sha512-vXHOPCwfDe9qLDuq7U1OYM2wUY+KQ4Ex6ozwsKxp26BlJ6XXbHleOUldenM67JRyBfVjv371oneEvYd3H2gNSA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-gnu": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-14.2.5.tgz",
      "integrity": "sha512-vlhB8wI+lj8q1ExFW8lbWutA4M2ZazQNvMWuEDqZcuJJc78iUnLdPPunBPX8rC4IgT6lIx/adB+Cwrl99MzNaA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-musl": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-14.2.5.tgz",
      "integrity": "sha512-NpDB9NUR2t0hXzJJwQSGu1IAOYybsfeB+LxpGsXrRIb7QOrYmidJz3shzY8cM6+rO4Aojuef0N/PEaX18pi9OA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-gnu": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-14.2.5.tgz",
      "integrity": "sha512-8XFikMSxWleYNryWIjiCX+gU201YS+erTUidKdyOVYi5qUQo/gRxv/3N1oZFCgqpesN6FPeqGM72Zve+nReVXQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-musl": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-14.2.5.tgz",
      "integrity": "sha512-6QLwi7RaYiQDcRDSU/os40r5o06b5ue7Jsk5JgdRBGGp8l37RZEh9JsLSM8QF0YDsgcosSeHjglgqi25+m04IQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-arm64-msvc": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-14.2.5.tgz",
      "integrity": "sha512-1GpG2VhbspO+aYoMOQPQiqc/tG3LzmsdBH0LhnDS3JrtDx2QmzXe0B6mSZZiN3Bq7IOMXxv1nlsjzoS1+9mzZw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-ia32-msvc": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-ia32-msvc/-/swc-win32-ia32-msvc-14.2.5.tgz",
      "integrity": "sha512-Igh9ZlxwvCDsu6438FXlQTHlRno4gFpJzqPjSIBZooD22tKeI4fE/YMRoHVJHmrQ2P5YL1DoZ0qaOKkbeFWeMg==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-x64-msvc": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-14.2.5.tgz",
      "integrity": "sha512-tEQ7oinq1/CjSG9uSTerca3v4AZ+dFa+4Yu6ihaG8Ud8ddqLQgFGcnwYls13H5X5CPDPZJdYxyeMui6muOLd4g==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nolyfill/is-core-module": {
      "version": "1.0.39",
      "resolved": "https://registry.npmjs.org/@nolyfill/is-core-module/-/is-core-module-1.0.39.tgz",
      "integrity": "sha512-nn5ozdjYQpUCZlWGuxcJY/KpxkWQs4DcbMCmKojjyrYDEAGy4Ce19NN4v5MduafTwJlbKc99UA8YhSVqq9yPZA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.4.0"
      }
    },
    "node_modules/@panva/hkdf": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@panva/hkdf/-/hkdf-1.2.1.tgz",
      "integrity": "sha512-6oclG6Y3PiDFcoyk8srjLfVKyMfVCKJ27JwNPViuXziFpmdz+MZnZN/aKY0JGXgYuO/VghU0jcOAZgWXZ1Dmrw==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/panva"
      }
    },
    "node_modules/@pkgjs/parseargs": {
      "version": "0.11.0",
      "resolved": "https://registry.npmjs.org/@pkgjs/parseargs/-/parseargs-0.11.0.tgz",
      "integrity": "sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@prisma/client": {
      "version": "5.22.0",
      "resolved": "https://registry.npmjs.org/@prisma/client/-/client-5.22.0.tgz",
      "integrity": "sha512-M0SVXfyHnQREBKxCgyo7sffrKttwE6R8PMq330MIUF0pTwjUhLbW84pFDlf06B27XyCR++VtjugEnIHdr07SVA==",
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=16.13"
      },
      "peerDependencies": {
        "prisma": "*"
      },
      "peerDependenciesMeta": {
        "prisma": {
          "optional": true
        }
      }
    },
    "node_modules/@prisma/debug": {
      "version": "5.22.0",
      "resolved": "https://registry.npmjs.org/@prisma/debug/-/debug-5.22.0.tgz",
      "integrity": "sha512-AUt44v3YJeggO2ZU5BkXI7M4hu9BF2zzH2iF2V5pyXT/lRTyWiElZ7It+bRH1EshoMRxHgpYg4VB6rCM+mG5jQ==",
      "devOptional": true,
      "license": "Apache-2.0"
    },
    "node_modules/@prisma/engines": {
      "version": "5.22.0",
      "resolved": "https://registry.npmjs.org/@prisma/engines/-/engines-5.22.0.tgz",
      "integrity": "sha512-UNjfslWhAt06kVL3CjkuYpHAWSO6L4kDCVPegV6itt7nD1kSJavd3vhgAEhjglLJJKEdJ7oIqDJ+yHk6qO8gPA==",
      "devOptional": true,
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/debug": "5.22.0",
        "@prisma/engines-version": "5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2",
        "@prisma/fetch-engine": "5.22.0",
        "@prisma/get-platform": "5.22.0"
      }
    },
    "node_modules/@prisma/engines-version": {
      "version": "5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2",
      "resolved": "https://registry.npmjs.org/@prisma/engines-version/-/engines-version-5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2.tgz",
      "integrity": "sha512-2PTmxFR2yHW/eB3uqWtcgRcgAbG1rwG9ZriSvQw+nnb7c4uCr3RAcGMb6/zfE88SKlC1Nj2ziUvc96Z379mHgQ==",
      "devOptional": true,
      "license": "Apache-2.0"
    },
    "node_modules/@prisma/fetch-engine": {
      "version": "5.22.0",
      "resolved": "https://registry.npmjs.org/@prisma/fetch-engine/-/fetch-engine-5.22.0.tgz",
      "integrity": "sha512-bkrD/Mc2fSvkQBV5EpoFcZ87AvOgDxbG99488a5cexp5Ccny+UM6MAe/UFkUC0wLYD9+9befNOqGiIJhhq+HbA==",
      "devOptional": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/debug": "5.22.0",
        "@prisma/engines-version": "5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2",
        "@prisma/get-platform": "5.22.0"
      }
    },
    "node_modules/@prisma/get-platform": {
      "version": "5.22.0",
      "resolved": "https://registry.npmjs.org/@prisma/get-platform/-/get-platform-5.22.0.tgz",
      "integrity": "sha512-pHhpQdr1UPFpt+zFfnPazhulaZYCUqeIcPpJViYoq9R+D/yw4fjE+CtnsnKzPYm0ddUbeXUzjGVGIRVgPDCk4Q==",
      "devOptional": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/debug": "5.22.0"
      }
    },
    "node_modules/@rtsao/scc": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@rtsao/scc/-/scc-1.1.0.tgz",
      "integrity": "sha512-zt6OdqaDoOnJ1ZYsCYGt9YmWzDXl4vQdKTyJev62gFhRGKdx7mcT54V9KIjg+d2wi9EXsPvAPKe7i7WjfVWB8g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rushstack/eslint-patch": {
      "version": "1.16.1",
      "resolved": "https://registry.npmjs.org/@rushstack/eslint-patch/-/eslint-patch-1.16.1.tgz",
      "integrity": "sha512-TvZbIpeKqGQQ7X0zSCvPH9riMSFQFSggnfBjFZ1mEoILW+UuXCKwOoPcgjMwiUtRqFZ8jWhPJc4um14vC6I4ag==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@swc/counter": {
      "version": "0.1.3",
      "resolved": "https://registry.npmjs.org/@swc/counter/-/counter-0.1.3.tgz",
      "integrity": "sha512-e2BR4lsJkkRlKZ/qCHPw9ZaSxc0MVUd7gtbtaB7aMvHeJVYe8sOB8DBZkP2DtISHGSku9sCK6T6cnY0CtXrOCQ==",
      "license": "Apache-2.0"
    },
    "node_modules/@swc/helpers": {
      "version": "0.5.5",
      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.5.tgz",
      "integrity": "sha512-KGYxvIOXcceOAbEk4bi/dVLEK9z8sZ0uBB3Il5b1rhfClSpcX0yfRO0KmTkqR2cnQDymwLB+25ZyMzICg/cm/A==",
      "license": "Apache-2.0",
      "dependencies": {
        "@swc/counter": "^0.1.3",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@tybys/wasm-util": {
      "version": "0.10.1",
      "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.1.tgz",
      "integrity": "sha512-9tTaPJLSiejZKx+Bmog4uSubteqTvFrVrURwkmHixBo0G4seD0zUxp98E1DzUBJxLQ3NPwXrGKDiVjwx/DpPsg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@types/bcryptjs": {
      "version": "2.4.6",
      "resolved": "https://registry.npmjs.org/@types/bcryptjs/-/bcryptjs-2.4.6.tgz",
      "integrity": "sha512-9xlo6R2qDs5uixm0bcIqCeMCE6HiQsIyel9KQySStiyqNl2tnj2mP3DX1Nf56MD6KMenNNlBBsy3LJ7gUEQPXQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json5": {
      "version": "0.0.29",
      "resolved": "https://registry.npmjs.org/@types/json5/-/json5-0.0.29.tgz",
      "integrity": "sha512-dRLjCWHYg4oaA77cxO64oO+7JwCwnIzkZPdrrC71jQmQtlhM556pwKo5bUzqvZndkVbeFLIIi+9TC40JNF5hNQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "20.19.37",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-20.19.37.tgz",
      "integrity": "sha512-8kzdPJ3FsNsVIurqBs7oodNnCEVbni9yUEkaHbgptDACOPW04jimGagZ51E6+lXUwJjgnBw+hyko/lkFWCldqw==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~6.21.0"
      }
    },
    "node_modules/@types/node-fetch": {
      "version": "2.6.13",
      "resolved": "https://registry.npmjs.org/@types/node-fetch/-/node-fetch-2.6.13.tgz",
      "integrity": "sha512-QGpRVpzSaUs30JBSGPjOg4Uveu384erbHBoT1zeONvyCfwQxIkUshLAOqN/k9EjGviPRmWTTe6aH2qySWKTVSw==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "form-data": "^4.0.4"
      }
    },
    "node_modules/@types/prop-types": {
      "version": "15.7.15",
      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "18.3.28",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.28.tgz",
      "integrity": "sha512-z9VXpC7MWrhfWipitjNdgCauoMLRdIILQsAEV+ZesIzBq/oUlxk0m3ApZuMFCXdnS4U7KrI+l3WRUEGQ8K1QKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/prop-types": "*",
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "18.3.7",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^18.0.0"
      }
    },
    "node_modules/@typescript-eslint/parser": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/parser/-/parser-7.2.0.tgz",
      "integrity": "sha512-5FKsVcHTk6TafQKQbuIVkXq58Fnbkd2wDL4LB7AURN7RUOu1utVP+G8+6u3ZhEroW3DF6hyo3ZEXxgKgp4KeCg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "@typescript-eslint/scope-manager": "7.2.0",
        "@typescript-eslint/types": "7.2.0",
        "@typescript-eslint/typescript-estree": "7.2.0",
        "@typescript-eslint/visitor-keys": "7.2.0",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": "^16.0.0 || >=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.56.0"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/scope-manager": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-7.2.0.tgz",
      "integrity": "sha512-Qh976RbQM/fYtjx9hs4XkayYujB/aPwglw2choHmf3zBjB4qOywWSdt9+KLRdHubGcoSwBnXUH2sR3hkyaERRg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "7.2.0",
        "@typescript-eslint/visitor-keys": "7.2.0"
      },
      "engines": {
        "node": "^16.0.0 || >=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/types": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/types/-/types-7.2.0.tgz",
      "integrity": "sha512-XFtUHPI/abFhm4cbCDc5Ykc8npOKBSJePY3a3s+lwumt7XWJuzP5cZcfZ610MIPHjQjNsOLlYK8ASPaNG8UiyA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^16.0.0 || >=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-7.2.0.tgz",
      "integrity": "sha512-cyxS5WQQCoBwSakpMrvMXuMDEbhOo9bNHHrNcEWis6XHx6KF518tkF1wBvKIn/tpq5ZpUYK7Bdklu8qY0MsFIA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "@typescript-eslint/types": "7.2.0",
        "@typescript-eslint/visitor-keys": "7.2.0",
        "debug": "^4.3.4",
        "globby": "^11.1.0",
        "is-glob": "^4.0.3",
        "minimatch": "9.0.3",
        "semver": "^7.5.4",
        "ts-api-utils": "^1.0.1"
      },
      "engines": {
        "node": "^16.0.0 || >=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch": {
      "version": "9.0.3",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.3.tgz",
      "integrity": "sha512-RHiac9mvaRw0x3AYRgDC1CxAP7HTcNrrECeA8YYJeWnpo+2Q5CegtZjaotWTWxDG3UeGA1coE05iH1mPjT/2mg==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-7.2.0.tgz",
      "integrity": "sha512-c6EIQRHhcpl6+tO8EMR+kjkkV+ugUNXOmeASA1rlzkd8EPIriavpWoiEz1HR/VLhbVIdhqnV6E7JZm00cBDx2A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "7.2.0",
        "eslint-visitor-keys": "^3.4.1"
      },
      "engines": {
        "node": "^16.0.0 || >=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@ungap/structured-clone": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/@ungap/structured-clone/-/structured-clone-1.3.0.tgz",
      "integrity": "sha512-WmoN8qaIAo7WTYWbAZuG8PYEhn5fkz7dZrqTBZ7dtt//lL2Gwms1IcnQ5yHqjDfX8Ft5j4YzDM23f87zBfDe9g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/@unrs/resolver-binding-android-arm-eabi": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-android-arm-eabi/-/resolver-binding-android-arm-eabi-1.11.1.tgz",
      "integrity": "sha512-ppLRUgHVaGRWUx0R0Ut06Mjo9gBaBkg3v/8AxusGLhsIotbBLuRk51rAzqLC8gq6NyyAojEXglNjzf6R948DNw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@unrs/resolver-binding-android-arm64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-android-arm64/-/resolver-binding-android-arm64-1.11.1.tgz",
      "integrity": "sha512-lCxkVtb4wp1v+EoN+HjIG9cIIzPkX5OtM03pQYkG+U5O/wL53LC4QbIeazgiKqluGeVEeBlZahHalCaBvU1a2g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@unrs/resolver-binding-darwin-arm64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-darwin-arm64/-/resolver-binding-darwin-arm64-1.11.1.tgz",
      "integrity": "sha512-gPVA1UjRu1Y/IsB/dQEsp2V1pm44Of6+LWvbLc9SDk1c2KhhDRDBUkQCYVWe6f26uJb3fOK8saWMgtX8IrMk3g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@unrs/resolver-binding-darwin-x64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-darwin-x64/-/resolver-binding-darwin-x64-1.11.1.tgz",
      "integrity": "sha512-cFzP7rWKd3lZaCsDze07QX1SC24lO8mPty9vdP+YVa3MGdVgPmFc59317b2ioXtgCMKGiCLxJ4HQs62oz6GfRQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@unrs/resolver-binding-freebsd-x64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-freebsd-x64/-/resolver-binding-freebsd-x64-1.11.1.tgz",
      "integrity": "sha512-fqtGgak3zX4DCB6PFpsH5+Kmt/8CIi4Bry4rb1ho6Av2QHTREM+47y282Uqiu3ZRF5IQioJQ5qWRV6jduA+iGw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm-gnueabihf": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-gnueabihf/-/resolver-binding-linux-arm-gnueabihf-1.11.1.tgz",
      "integrity": "sha512-u92mvlcYtp9MRKmP+ZvMmtPN34+/3lMHlyMj7wXJDeXxuM0Vgzz0+PPJNsro1m3IZPYChIkn944wW8TYgGKFHw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm-musleabihf": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-musleabihf/-/resolver-binding-linux-arm-musleabihf-1.11.1.tgz",
      "integrity": "sha512-cINaoY2z7LVCrfHkIcmvj7osTOtm6VVT16b5oQdS4beibX2SYBwgYLmqhBjA1t51CarSaBuX5YNsWLjsqfW5Cw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-gnu/-/resolver-binding-linux-arm64-gnu-1.11.1.tgz",
      "integrity": "sha512-34gw7PjDGB9JgePJEmhEqBhWvCiiWCuXsL9hYphDF7crW7UgI05gyBAi6MF58uGcMOiOqSJ2ybEeCvHcq0BCmQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-musl/-/resolver-binding-linux-arm64-musl-1.11.1.tgz",
      "integrity": "sha512-RyMIx6Uf53hhOtJDIamSbTskA99sPHS96wxVE/bJtePJJtpdKGXO1wY90oRdXuYOGOTuqjT8ACccMc4K6QmT3w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-ppc64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-ppc64-gnu/-/resolver-binding-linux-ppc64-gnu-1.11.1.tgz",
      "integrity": "sha512-D8Vae74A4/a+mZH0FbOkFJL9DSK2R6TFPC9M+jCWYia/q2einCubX10pecpDiTmkJVUH+y8K3BZClycD8nCShA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-riscv64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-gnu/-/resolver-binding-linux-riscv64-gnu-1.11.1.tgz",
      "integrity": "sha512-frxL4OrzOWVVsOc96+V3aqTIQl1O2TjgExV4EKgRY09AJ9leZpEg8Ak9phadbuX0BA4k8U5qtvMSQQGGmaJqcQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-riscv64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-musl/-/resolver-binding-linux-riscv64-musl-1.11.1.tgz",
      "integrity": "sha512-mJ5vuDaIZ+l/acv01sHoXfpnyrNKOk/3aDoEdLO/Xtn9HuZlDD6jKxHlkN8ZhWyLJsRBxfv9GYM2utQ1SChKew==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-s390x-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-s390x-gnu/-/resolver-binding-linux-s390x-gnu-1.11.1.tgz",
      "integrity": "sha512-kELo8ebBVtb9sA7rMe1Cph4QHreByhaZ2QEADd9NzIQsYNQpt9UkM9iqr2lhGr5afh885d/cB5QeTXSbZHTYPg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-x64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-gnu/-/resolver-binding-linux-x64-gnu-1.11.1.tgz",
      "integrity": "sha512-C3ZAHugKgovV5YvAMsxhq0gtXuwESUKc5MhEtjBpLoHPLYM+iuwSj3lflFwK3DPm68660rZ7G8BMcwSro7hD5w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-x64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-musl/-/resolver-binding-linux-x64-musl-1.11.1.tgz",
      "integrity": "sha512-rV0YSoyhK2nZ4vEswT/QwqzqQXw5I6CjoaYMOX0TqBlWhojUf8P94mvI7nuJTeaCkkds3QE4+zS8Ko+GdXuZtA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-wasm32-wasi": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-wasm32-wasi/-/resolver-binding-wasm32-wasi-1.11.1.tgz",
      "integrity": "sha512-5u4RkfxJm+Ng7IWgkzi3qrFOvLvQYnPBmjmZQ8+szTK/b31fQCnleNl1GgEt7nIsZRIf5PLhPwT0WM+q45x/UQ==",
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@napi-rs/wasm-runtime": "^0.2.11"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@unrs/resolver-binding-win32-arm64-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-arm64-msvc/-/resolver-binding-win32-arm64-msvc-1.11.1.tgz",
      "integrity": "sha512-nRcz5Il4ln0kMhfL8S3hLkxI85BXs3o8EYoattsJNdsX4YUU89iOkVn7g0VHSRxFuVMdM4Q1jEpIId1Ihim/Uw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@unrs/resolver-binding-win32-ia32-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-ia32-msvc/-/resolver-binding-win32-ia32-msvc-1.11.1.tgz",
      "integrity": "sha512-DCEI6t5i1NmAZp6pFonpD5m7i6aFrpofcp4LA2i8IIq60Jyo28hamKBxNrZcyOwVOZkgsRp9O2sXWBWP8MnvIQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@unrs/resolver-binding-win32-x64-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-x64-msvc/-/resolver-binding-win32-x64-msvc-1.11.1.tgz",
      "integrity": "sha512-lrW200hZdbfRtztbygyaq/6jP6AKE8qQN2KvPcJ+x7wiD038YtnYtZ82IMNJ69GJibV7bwL3y9FgK+5w/pYt6g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/abort-controller": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz",
      "integrity": "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
      "license": "MIT",
      "dependencies": {
        "event-target-shim": "^5.0.0"
      },
      "engines": {
        "node": ">=6.5"
      }
    },
    "node_modules/acorn": {
      "version": "8.16.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.16.0.tgz",
      "integrity": "sha512-UVJyE9MttOsBQIDKw1skb9nAwQuR5wuGD3+82K6JgJlm/Y+KI92oNsMNGZCYdDsVtRHSak0pcV5Dno5+4jh9sw==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/agentkeepalive": {
      "version": "4.6.0",
      "resolved": "https://registry.npmjs.org/agentkeepalive/-/agentkeepalive-4.6.0.tgz",
      "integrity": "sha512-kja8j7PjmncONqaTsB8fQ+wE2mSU2DJ9D4XKoJ5PFWIdRMa6SLSN1ff4mOr4jCbfRSsxR4keIiySJU0N9T5hIQ==",
      "license": "MIT",
      "dependencies": {
        "humanize-ms": "^1.2.1"
      },
      "engines": {
        "node": ">= 8.0.0"
      }
    },
    "node_modules/ajv": {
      "version": "6.14.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.14.0.tgz",
      "integrity": "sha512-IWrosm/yrn43eiKqkfkHis7QioDleaXQHdDVPKg0FSwwd/DuvyX79TZnFOnYpB7dcsFAMmtFztZuXPDvSePkFw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true,
      "license": "Python-2.0"
    },
    "node_modules/aria-query": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/aria-query/-/aria-query-5.3.2.tgz",
      "integrity": "sha512-COROpnaoap1E2F000S62r6A60uHZnmlvomhfyT2DlTcrY1OrBKn2UhH7qn5wTC9zMvD0AY7csdPSNwKP+7WiQw==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/array-buffer-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/array-buffer-byte-length/-/array-buffer-byte-length-1.0.2.tgz",
      "integrity": "sha512-LHE+8BuR7RYGDKvnrmcuSq3tDcKv9OFEXQt/HpbZhY7V6h0zlUXutnAD82GiFx9rdieCMjkvtcsPqBwgUl1Iiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "is-array-buffer": "^3.0.5"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array-includes": {
      "version": "3.1.9",
      "resolved": "https://registry.npmjs.org/array-includes/-/array-includes-3.1.9.tgz",
      "integrity": "sha512-FmeCCAenzH0KH381SPT5FZmiA/TmpndpcaShhfgEN9eCVjnFBqq3l1xrI42y8+PPLI6hypzou4GXw00WHmPBLQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.24.0",
        "es-object-atoms": "^1.1.1",
        "get-intrinsic": "^1.3.0",
        "is-string": "^1.1.1",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array-union": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/array-union/-/array-union-2.1.0.tgz",
      "integrity": "sha512-HGyxoOTYUyCM6stUe6EJgnd4EoewAI7zMdfqO+kGjnlZmBDz/cR5pf8r/cR4Wq60sL/p0IkcjUEEPwS3GFrIyw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/array.prototype.findlast": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/array.prototype.findlast/-/array.prototype.findlast-1.2.5.tgz",
      "integrity": "sha512-CVvd6FHg1Z3POpBLxO6E6zr+rSKEQ9L6rZHAaY7lLfhKsWYUBBOuMs0e9o24oopj6H+geRCX0YJ+TJLBK2eHyQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.2",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.findlastindex": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/array.prototype.findlastindex/-/array.prototype.findlastindex-1.2.6.tgz",
      "integrity": "sha512-F/TKATkzseUExPlfvmwQKGITM3DGTK+vkAsCZoDc5daVygbJBnjEUCbgkAvVFsgfXfX4YIqZ/27G3k3tdXrTxQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.9",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "es-shim-unscopables": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.flat": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/array.prototype.flat/-/array.prototype.flat-1.3.3.tgz",
      "integrity": "sha512-rwG/ja1neyLqCuGZ5YYrznA62D4mZXg0i1cIskIUKSiqF3Cje9/wXAls9B9s1Wa2fomMsIv8czB8jZcPmxCXFg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.flatmap": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/array.prototype.flatmap/-/array.prototype.flatmap-1.3.3.tgz",
      "integrity": "sha512-Y7Wt51eKJSyi80hFrJCePGGNo5ktJCslFuboqJsbf57CCPcm5zztluPlc4/aD8sWsKvlwatezpV4U1efk8kpjg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.tosorted": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/array.prototype.tosorted/-/array.prototype.tosorted-1.1.4.tgz",
      "integrity": "sha512-p6Fx8B7b7ZhL/gmUsAy0D15WhvDccw3mnGNbZpi3pmeJdxtWsj2jEaI4Y6oo3XiHfzuSgPwKc04MYt6KgvC/wA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.3",
        "es-errors": "^1.3.0",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/arraybuffer.prototype.slice": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/arraybuffer.prototype.slice/-/arraybuffer.prototype.slice-1.0.4.tgz",
      "integrity": "sha512-BNoCY6SXXPQ7gF2opIP4GBE+Xw7U+pHMYKuzjgCN3GwiaIR09UUeKfheyIry77QtrCBlC0KK0q5/TER/tYh3PQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.1",
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "is-array-buffer": "^3.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/ast-types-flow": {
      "version": "0.0.8",
      "resolved": "https://registry.npmjs.org/ast-types-flow/-/ast-types-flow-0.0.8.tgz",
      "integrity": "sha512-OH/2E5Fg20h2aPrbe+QL8JZQFko0YZaF+j4mnQ7BGhfavO7OpSLa8a0y9sBwomHdSbkhTS8TQNayBfnW5DwbvQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/async-function": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/async-function/-/async-function-1.0.0.tgz",
      "integrity": "sha512-hsU18Ae8CDTR6Kgu9DYf0EbCr/a5iGL0rytQDobUcdpYOKokk8LEjVphnXkDkgpi0wYVsqrXuP0bZxJaTqdgoA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "license": "MIT"
    },
    "node_modules/available-typed-arrays": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz",
      "integrity": "sha512-wvUjBtSGN7+7SjNpq/9M2Tg350UZD3q62IFZLbRAR1bSMlCo1ZaeW+BJ+D090e4hIIZLBcTDWe4Mh4jvUDajzQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "possible-typed-array-names": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/axe-core": {
      "version": "4.11.1",
      "resolved": "https://registry.npmjs.org/axe-core/-/axe-core-4.11.1.tgz",
      "integrity": "sha512-BASOg+YwO2C+346x3LZOeoovTIoTrRqEsqMa6fmfAV0P+U9mFr9NsyOEpiYvFjbc64NMrSswhV50WdXzdb/Z5A==",
      "dev": true,
      "license": "MPL-2.0",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/axobject-query": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/axobject-query/-/axobject-query-4.1.0.tgz",
      "integrity": "sha512-qIj0G9wZbMGNLjLmg1PT6v2mE9AH2zlnADJD/2tC6E00hgmhUOfEB6greHPAfLRSufHqROIUTkw6E+M3lH0PTQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/bcryptjs": {
      "version": "2.4.3",
      "resolved": "https://registry.npmjs.org/bcryptjs/-/bcryptjs-2.4.3.tgz",
      "integrity": "sha512-V/Hy/X9Vt7f3BbPJEi8BdVFMByHi+jNXrYkW3huaybV/kQ0KJg0Y6PkEMbn+zeT+i+SiKZ/HMqJGIIt4LZDqNQ==",
      "license": "MIT"
    },
    "node_modules/brace-expansion": {
      "version": "1.1.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.12.tgz",
      "integrity": "sha512-9T9UjW3r0UW5c1Q7GTwllptXwhvYmEzFhzMfZ9H7FQWt+uZePjZPjBP/W1ZEyZ1twGWom5/56TF4lPcqjnDHcg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/busboy": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/busboy/-/busboy-1.6.0.tgz",
      "integrity": "sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==",
      "dependencies": {
        "streamsearch": "^1.1.0"
      },
      "engines": {
        "node": ">=10.16.0"
      }
    },
    "node_modules/call-bind": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/call-bind/-/call-bind-1.0.8.tgz",
      "integrity": "sha512-oKlSFMcMwpUg2ednkhQ454wfWiU/ul3CkJe/PEHcTKuiX6RpbehUiFMXu13HalGZxfUwCQzZG747YXBn1im9ww==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.0",
        "es-define-property": "^1.0.0",
        "get-intrinsic": "^1.2.4",
        "set-function-length": "^1.2.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001777",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001777.tgz",
      "integrity": "sha512-tmN+fJxroPndC74efCdp12j+0rk0RHwV5Jwa1zWaFVyw2ZxAuPeG8ZgWC3Wz7uSjT3qMRQ5XHZ4COgQmsCMJAQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/client-only": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",
      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==",
      "license": "MIT"
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "license": "MIT",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/damerau-levenshtein": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/damerau-levenshtein/-/damerau-levenshtein-1.0.8.tgz",
      "integrity": "sha512-sdQSFB7+llfUcQHUQO3+B8ERRj0Oa4w9POWMI/puGtuf7gFywGmkaLCElnudfTiKZV+NvHqL0ifzdrI8Ro7ESA==",
      "dev": true,
      "license": "BSD-2-Clause"
    },
    "node_modules/data-view-buffer": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-buffer/-/data-view-buffer-1.0.2.tgz",
      "integrity": "sha512-EmKO5V3OLXh1rtK2wgXRansaK1/mtVdTUEiEI0W8RkvgT05kfxaH29PliLnpLP73yYO6142Q72QNa8Wx/A5CqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/data-view-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-byte-length/-/data-view-byte-length-1.0.2.tgz",
      "integrity": "sha512-tuhGbE6CfTM9+5ANGf+oQb72Ky/0+s3xKUpHvShfiz2RxMFgFPjsXuRLBVMtvMs15awe45SRb83D6wH4ew6wlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/inspect-js"
      }
    },
    "node_modules/data-view-byte-offset": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/data-view-byte-offset/-/data-view-byte-offset-1.0.1.tgz",
      "integrity": "sha512-BS8PfmtDGnrgYdOonGZQdLZslWIeCGFP9tpan0hi1Co2Zr2NKADsvGYA8XxuG/4UWgJ6Cjtv+YJnB6MM69QGlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/date-fns": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/date-fns/-/date-fns-3.6.0.tgz",
      "integrity": "sha512-fRHTG8g/Gif+kSh50gaGEdToemgfj74aRX3swtiouboip5JDLAyDE9F11nHMIcvOaXeOC6D7SpNhi7uFyB7Uww==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/kossnocorp"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/define-data-property": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/define-data-property/-/define-data-property-1.1.4.tgz",
      "integrity": "sha512-rBMvIzlpA8v6E+SJZoo++HAYqsLrkg7MSfIinMPFhmkorw7X+dOXVJQs+QT69zGkzMyfDnIMN2Wid1+NbL3T+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0",
        "es-errors": "^1.3.0",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/define-properties": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/define-properties/-/define-properties-1.2.1.tgz",
      "integrity": "sha512-8QmQKqEASLd5nx0U1B1okLElbUuuttJ/AnYmRXbbbGDWh6uS208EjD4Xqq/I9wK7u0v6O08XhTWnt5XtEbR6Dg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.0.1",
        "has-property-descriptors": "^1.0.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/dir-glob": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/dir-glob/-/dir-glob-3.0.1.tgz",
      "integrity": "sha512-WkrWp9GR4KXfKGYzOLmTuGVi1UWFfws377n9cc55/tb6DuqyF6pcQ5AbiHEshaDpY9v6oaSr2XCDidGmMwdzIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-type": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/doctrine": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/doctrine/-/doctrine-3.0.0.tgz",
      "integrity": "sha512-yS+Q5i3hBf7GBkd4KG8a7eBNNWNGLTaEwwYWUijIYM7zrlYDM0BFXHjjPWlWZ1Rg7UaddZeIDmi9jF3HmqiQ2w==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "esutils": "^2.0.2"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/dotenv": {
      "version": "17.3.1",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-17.3.1.tgz",
      "integrity": "sha512-IO8C/dzEb6O3F9/twg6ZLXz164a2fhTnEWb95H23Dm4OuN+92NmEAlTrupP9VW6Jm3sO26tQlqyvyi4CsnY9GA==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/eastasianwidth": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/eastasianwidth/-/eastasianwidth-0.2.0.tgz",
      "integrity": "sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/emoji-regex": {
      "version": "9.2.2",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
      "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/es-abstract": {
      "version": "1.24.1",
      "resolved": "https://registry.npmjs.org/es-abstract/-/es-abstract-1.24.1.tgz",
      "integrity": "sha512-zHXBLhP+QehSSbsS9Pt23Gg964240DPd6QCf8WpkqEXxQ7fhdZzYsocOr5u7apWonsS5EjZDmTF+/slGMyasvw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.2",
        "arraybuffer.prototype.slice": "^1.0.4",
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "data-view-buffer": "^1.0.2",
        "data-view-byte-length": "^1.0.2",
        "data-view-byte-offset": "^1.0.1",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "es-set-tostringtag": "^2.1.0",
        "es-to-primitive": "^1.3.0",
        "function.prototype.name": "^1.1.8",
        "get-intrinsic": "^1.3.0",
        "get-proto": "^1.0.1",
        "get-symbol-description": "^1.1.0",
        "globalthis": "^1.0.4",
        "gopd": "^1.2.0",
        "has-property-descriptors": "^1.0.2",
        "has-proto": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "internal-slot": "^1.1.0",
        "is-array-buffer": "^3.0.5",
        "is-callable": "^1.2.7",
        "is-data-view": "^1.0.2",
        "is-negative-zero": "^2.0.3",
        "is-regex": "^1.2.1",
        "is-set": "^2.0.3",
        "is-shared-array-buffer": "^1.0.4",
        "is-string": "^1.1.1",
        "is-typed-array": "^1.1.15",
        "is-weakref": "^1.1.1",
        "math-intrinsics": "^1.1.0",
        "object-inspect": "^1.13.4",
        "object-keys": "^1.1.1",
        "object.assign": "^4.1.7",
        "own-keys": "^1.0.1",
        "regexp.prototype.flags": "^1.5.4",
        "safe-array-concat": "^1.1.3",
        "safe-push-apply": "^1.0.0",
        "safe-regex-test": "^1.1.0",
        "set-proto": "^1.0.0",
        "stop-iteration-iterator": "^1.1.0",
        "string.prototype.trim": "^1.2.10",
        "string.prototype.trimend": "^1.0.9",
        "string.prototype.trimstart": "^1.0.8",
        "typed-array-buffer": "^1.0.3",
        "typed-array-byte-length": "^1.0.3",
        "typed-array-byte-offset": "^1.0.4",
        "typed-array-length": "^1.0.7",
        "unbox-primitive": "^1.1.0",
        "which-typed-array": "^1.1.19"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-iterator-helpers": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/es-iterator-helpers/-/es-iterator-helpers-1.2.2.tgz",
      "integrity": "sha512-BrUQ0cPTB/IwXj23HtwHjS9n7O4h9FX94b4xc5zlTHxeLgTAdzYUDyy6KdExAl9lbN5rtfe44xpjpmj9grxs5w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.24.1",
        "es-errors": "^1.3.0",
        "es-set-tostringtag": "^2.1.0",
        "function-bind": "^1.1.2",
        "get-intrinsic": "^1.3.0",
        "globalthis": "^1.0.4",
        "gopd": "^1.2.0",
        "has-property-descriptors": "^1.0.2",
        "has-proto": "^1.2.0",
        "has-symbols": "^1.1.0",
        "internal-slot": "^1.1.0",
        "iterator.prototype": "^1.1.5",
        "safe-array-concat": "^1.1.3"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-shim-unscopables": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/es-shim-unscopables/-/es-shim-unscopables-1.1.0.tgz",
      "integrity": "sha512-d9T8ucsEhh8Bi1woXCf+TIKDIROLG5WCkxg8geBCbvk22kzwC5G2OnXVMO6FUsvQlgUUXQ2itephWDLqDzbeCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-to-primitive": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-to-primitive/-/es-to-primitive-1.3.0.tgz",
      "integrity": "sha512-w+5mJ3GuFL+NjVtJlvydShqE1eN3h3PbI7/5LAsYJP/2qtuMXjfL2LpHSRqo4b4eSF5K/DH1JXKUAHSB2UW50g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7",
        "is-date-object": "^1.0.5",
        "is-symbol": "^1.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint": {
      "version": "8.57.1",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-8.57.1.tgz",
      "integrity": "sha512-ypowyDxpVSYpkXr9WPv2PAZCtNip1Mv5KTW0SCurXv/9iOpcrH9PaqUElksqEB6pChqHGDRCFTyrZlGhnLNGiA==",
      "deprecated": "This version is no longer supported. Please see https://eslint.org/version-support for other options.",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.2.0",
        "@eslint-community/regexpp": "^4.6.1",
        "@eslint/eslintrc": "^2.1.4",
        "@eslint/js": "8.57.1",
        "@humanwhocodes/config-array": "^0.13.0",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@nodelib/fs.walk": "^1.2.8",
        "@ungap/structured-clone": "^1.2.0",
        "ajv": "^6.12.4",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.2",
        "debug": "^4.3.2",
        "doctrine": "^3.0.0",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^7.2.2",
        "eslint-visitor-keys": "^3.4.3",
        "espree": "^9.6.1",
        "esquery": "^1.4.2",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^6.0.1",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "globals": "^13.19.0",
        "graphemer": "^1.4.0",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "is-path-inside": "^3.0.3",
        "js-yaml": "^4.1.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "levn": "^0.4.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.2",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3",
        "strip-ansi": "^6.0.1",
        "text-table": "^0.2.0"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-config-next": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/eslint-config-next/-/eslint-config-next-14.2.5.tgz",
      "integrity": "sha512-zogs9zlOiZ7ka+wgUnmcM0KBEDjo4Jis7kxN1jvC0N4wynQ2MIx/KBkg4mVF63J5EK4W0QMCn7xO3vNisjaAoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@next/eslint-plugin-next": "14.2.5",
        "@rushstack/eslint-patch": "^1.3.3",
        "@typescript-eslint/parser": "^5.4.2 || ^6.0.0 || 7.0.0 - 7.2.0",
        "eslint-import-resolver-node": "^0.3.6",
        "eslint-import-resolver-typescript": "^3.5.2",
        "eslint-plugin-import": "^2.28.1",
        "eslint-plugin-jsx-a11y": "^6.7.1",
        "eslint-plugin-react": "^7.33.2",
        "eslint-plugin-react-hooks": "^4.5.0 || 5.0.0-canary-7118f5dd7-20230705"
      },
      "peerDependencies": {
        "eslint": "^7.23.0 || ^8.0.0",
        "typescript": ">=3.3.1"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-import-resolver-node": {
      "version": "0.3.9",
      "resolved": "https://registry.npmjs.org/eslint-import-resolver-node/-/eslint-import-resolver-node-0.3.9.tgz",
      "integrity": "sha512-WFj2isz22JahUv+B788TlO3N6zL3nNJGU8CcZbPZvVEkBPaJdCV4vy5wyghty5ROFbCRnm132v8BScu5/1BQ8g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "debug": "^3.2.7",
        "is-core-module": "^2.13.0",
        "resolve": "^1.22.4"
      }
    },
    "node_modules/eslint-import-resolver-node/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-import-resolver-typescript": {
      "version": "3.10.1",
      "resolved": "https://registry.npmjs.org/eslint-import-resolver-typescript/-/eslint-import-resolver-typescript-3.10.1.tgz",
      "integrity": "sha512-A1rHYb06zjMGAxdLSkN2fXPBwuSaQ0iO5M/hdyS0Ajj1VBaRp0sPD3dn1FhME3c/JluGFbwSxyCfqdSbtQLAHQ==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "@nolyfill/is-core-module": "1.0.39",
        "debug": "^4.4.0",
        "get-tsconfig": "^4.10.0",
        "is-bun-module": "^2.0.0",
        "stable-hash": "^0.0.5",
        "tinyglobby": "^0.2.13",
        "unrs-resolver": "^1.6.2"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint-import-resolver-typescript"
      },
      "peerDependencies": {
        "eslint": "*",
        "eslint-plugin-import": "*",
        "eslint-plugin-import-x": "*"
      },
      "peerDependenciesMeta": {
        "eslint-plugin-import": {
          "optional": true
        },
        "eslint-plugin-import-x": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-module-utils": {
      "version": "2.12.1",
      "resolved": "https://registry.npmjs.org/eslint-module-utils/-/eslint-module-utils-2.12.1.tgz",
      "integrity": "sha512-L8jSWTze7K2mTg0vos/RuLRS5soomksDPoJLXIslC7c8Wmut3bx7CPpJijDcBZtxQ5lrbUdM+s0OlNbz0DCDNw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "debug": "^3.2.7"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependenciesMeta": {
        "eslint": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-module-utils/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-plugin-import": {
      "version": "2.32.0",
      "resolved": "https://registry.npmjs.org/eslint-plugin-import/-/eslint-plugin-import-2.32.0.tgz",
      "integrity": "sha512-whOE1HFo/qJDyX4SnXzP4N6zOWn79WhnCUY/iDR0mPfQZO8wcYE4JClzI2oZrhBnnMUCBCHZhO6VQyoBU95mZA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rtsao/scc": "^1.1.0",
        "array-includes": "^3.1.9",
        "array.prototype.findlastindex": "^1.2.6",
        "array.prototype.flat": "^1.3.3",
        "array.prototype.flatmap": "^1.3.3",
        "debug": "^3.2.7",
        "doctrine": "^2.1.0",
        "eslint-import-resolver-node": "^0.3.9",
        "eslint-module-utils": "^2.12.1",
        "hasown": "^2.0.2",
        "is-core-module": "^2.16.1",
        "is-glob": "^4.0.3",
        "minimatch": "^3.1.2",
        "object.fromentries": "^2.0.8",
        "object.groupby": "^1.0.3",
        "object.values": "^1.2.1",
        "semver": "^6.3.1",
        "string.prototype.trimend": "^1.0.9",
        "tsconfig-paths": "^3.15.0"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependencies": {
        "eslint": "^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9"
      }
    },
    "node_modules/eslint-plugin-import/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-plugin-import/node_modules/doctrine": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/doctrine/-/doctrine-2.1.0.tgz",
      "integrity": "sha512-35mSku4ZXK0vfCuHEDAwt55dg2jNajHZ1odvF+8SSr82EsZY4QmXfuWso8oEd8zRhVObSN18aM0CjSdoBX7zIw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "esutils": "^2.0.2"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/eslint-plugin-import/node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/eslint-plugin-jsx-a11y": {
      "version": "6.10.2",
      "resolved": "https://registry.npmjs.org/eslint-plugin-jsx-a11y/-/eslint-plugin-jsx-a11y-6.10.2.tgz",
      "integrity": "sha512-scB3nz4WmG75pV8+3eRUQOHZlNSUhFNq37xnpgRkCCELU3XMvXAxLk1eqWWyE22Ki4Q01Fnsw9BA3cJHDPgn2Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "aria-query": "^5.3.2",
        "array-includes": "^3.1.8",
        "array.prototype.flatmap": "^1.3.2",
        "ast-types-flow": "^0.0.8",
        "axe-core": "^4.10.0",
        "axobject-query": "^4.1.0",
        "damerau-levenshtein": "^1.0.8",
        "emoji-regex": "^9.2.2",
        "hasown": "^2.0.2",
        "jsx-ast-utils": "^3.3.5",
        "language-tags": "^1.0.9",
        "minimatch": "^3.1.2",
        "object.fromentries": "^2.0.8",
        "safe-regex-test": "^1.0.3",
        "string.prototype.includes": "^2.0.1"
      },
      "engines": {
        "node": ">=4.0"
      },
      "peerDependencies": {
        "eslint": "^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9"
      }
    },
    "node_modules/eslint-plugin-react": {
      "version": "7.37.5",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react/-/eslint-plugin-react-7.37.5.tgz",
      "integrity": "sha512-Qteup0SqU15kdocexFNAJMvCJEfa2xUKNV4CC1xsVMrIIqEy3SQ/rqyxCWNzfrd3/ldy6HMlD2e0JDVpDg2qIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-includes": "^3.1.8",
        "array.prototype.findlast": "^1.2.5",
        "array.prototype.flatmap": "^1.3.3",
        "array.prototype.tosorted": "^1.1.4",
        "doctrine": "^2.1.0",
        "es-iterator-helpers": "^1.2.1",
        "estraverse": "^5.3.0",
        "hasown": "^2.0.2",
        "jsx-ast-utils": "^2.4.1 || ^3.0.0",
        "minimatch": "^3.1.2",
        "object.entries": "^1.1.9",
        "object.fromentries": "^2.0.8",
        "object.values": "^1.2.1",
        "prop-types": "^15.8.1",
        "resolve": "^2.0.0-next.5",
        "semver": "^6.3.1",
        "string.prototype.matchall": "^4.0.12",
        "string.prototype.repeat": "^1.0.0"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependencies": {
        "eslint": "^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7"
      }
    },
    "node_modules/eslint-plugin-react-hooks": {
      "version": "5.0.0-canary-7118f5dd7-20230705",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-5.0.0-canary-7118f5dd7-20230705.tgz",
      "integrity": "sha512-AZYbMo/NW9chdL7vk6HQzQhT+PvTAEVqWk9ziruUoW2kAOcN5qNyelv70e0F1VNQAbvutOC9oc+xfWycI9FxDw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "eslint": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0"
      }
    },
    "node_modules/eslint-plugin-react/node_modules/doctrine": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/doctrine/-/doctrine-2.1.0.tgz",
      "integrity": "sha512-35mSku4ZXK0vfCuHEDAwt55dg2jNajHZ1odvF+8SSr82EsZY4QmXfuWso8oEd8zRhVObSN18aM0CjSdoBX7zIw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "esutils": "^2.0.2"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/eslint-plugin-react/node_modules/resolve": {
      "version": "2.0.0-next.6",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-2.0.0-next.6.tgz",
      "integrity": "sha512-3JmVl5hMGtJ3kMmB3zi3DL25KfkCEyy3Tw7Gmw7z5w8M9WlwoPFnIvwChzu1+cF3iaK3sp18hhPz8ANeimdJfA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "is-core-module": "^2.16.1",
        "node-exports-info": "^1.6.0",
        "object-keys": "^1.1.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/eslint-plugin-react/node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/eslint-scope": {
      "version": "7.2.2",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-7.2.2.tgz",
      "integrity": "sha512-dOt21O7lTMhDM+X9mB4GX+DZrZtCUJPL/wlcTqxyrx5IvO0IYtILdtrQGQp+8n5S0gwSVmOf9NQrjMOgfQZlIg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/espree": {
      "version": "9.6.1",
      "resolved": "https://registry.npmjs.org/espree/-/espree-9.6.1.tgz",
      "integrity": "sha512-oruZaFkjorTpF32kDSI5/75ViwGeZginGGy2NoOSg3Q9bnwlnmDm4HLnkl0RE3n+njDXR037aY1+x58Z/zFdwQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "acorn": "^8.9.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^3.4.1"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esquery": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.7.0.tgz",
      "integrity": "sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/event-target-shim": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz",
      "integrity": "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fastq": {
      "version": "1.20.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.1.tgz",
      "integrity": "sha512-GGToxJ/w1x32s/D2EKND7kTil4n8OVk/9mycTc4VDza13lOvpUZTGX3mFSCtV9ksdGBVzvsyAVLM6mHFThxXxw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/file-entry-cache": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-6.0.1.tgz",
      "integrity": "sha512-7Gps/XWymbLk2QLYK4NzpMOrYjMhdIxXuIvy2QBsLE6ljuodKvdkWs/cpyJJ3CVIVpH0Oi1Hvg1ovbMzLdFBBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flat-cache": "^3.0.4"
      },
      "engines": {
        "node": "^10.12.0 || >=12.0.0"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/flat-cache": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-3.2.0.tgz",
      "integrity": "sha512-CYcENa+FtcUKLmhhqyctpclsq7QF38pKjZHsGNiSQF5r4FtoKDWabFDl3hzaEQMvT1LHEysw5twgLvpYYb4vbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.3",
        "rimraf": "^3.0.2"
      },
      "engines": {
        "node": "^10.12.0 || >=12.0.0"
      }
    },
    "node_modules/flatted": {
      "version": "3.3.4",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.3.4.tgz",
      "integrity": "sha512-3+mMldrTAPdta5kjX2G2J7iX4zxtnwpdA8Tr2ZSjkyPSanvbZAcy6flmtnXbEybHrDcU9641lxrMfFuUxVz9vA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/for-each": {
      "version": "0.3.5",
      "resolved": "https://registry.npmjs.org/for-each/-/for-each-0.3.5.tgz",
      "integrity": "sha512-dKx12eRCVIzqCxFGplyFKJMPvLEWgmNtUrpTiJIR5u97zEhRG8ySrtboPHZXx7daLxQVrl643cTzbab2tkQjxg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/foreground-child": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.1.tgz",
      "integrity": "sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "cross-spawn": "^7.0.6",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/form-data": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-4.0.5.tgz",
      "integrity": "sha512-8RipRLol37bNs2bhoV67fiTEvdTrbMUYcFTiy3+wuuOnUog2QBHCZWXDRijWQfAkhBj2Uf5UnVaiWwA5vdd82w==",
      "license": "MIT",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.2",
        "mime-types": "^2.1.12"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/form-data-encoder": {
      "version": "1.7.2",
      "resolved": "https://registry.npmjs.org/form-data-encoder/-/form-data-encoder-1.7.2.tgz",
      "integrity": "sha512-qfqtYan3rxrnCk1VYaA4H+Ms9xdpPqvLZa6xmMgFvhO32x7/3J/ExcTd6qpxM0vH2GdMI+poehyBZvqfMTto8A==",
      "license": "MIT"
    },
    "node_modules/formdata-node": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/formdata-node/-/formdata-node-4.4.1.tgz",
      "integrity": "sha512-0iirZp3uVDjVGt9p49aTaqjk84TrglENEDuqfdlZQ1roC9CWlPk6Avf8EEnZNcAqPonwkG35x4n3ww/1THYAeQ==",
      "license": "MIT",
      "dependencies": {
        "node-domexception": "1.0.0",
        "web-streams-polyfill": "4.0.0-beta.3"
      },
      "engines": {
        "node": ">= 12.20"
      }
    },
    "node_modules/fs.realpath": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/fs.realpath/-/fs.realpath-1.0.0.tgz",
      "integrity": "sha512-OO0pH2lK6a0hZnAdau5ItzHPI6pUlvI7jMVnxUQRtw4owF2wk8lOSabtGDCTP4Ggrg2MbGnWO9X8K1t4+fGMDw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/function.prototype.name": {
      "version": "1.1.8",
      "resolved": "https://registry.npmjs.org/function.prototype.name/-/function.prototype.name-1.1.8.tgz",
      "integrity": "sha512-e5iwyodOHhbMr/yNrc7fDYG4qlbIvI5gajyzPnb5TCwyhjApznQh1BMFou9b30SevY43gCJKXycoCBjMbsuW0Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "functions-have-names": "^1.2.3",
        "hasown": "^2.0.2",
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/functions-have-names": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/functions-have-names/-/functions-have-names-1.2.3.tgz",
      "integrity": "sha512-xckBUXyTIqT97tq2x2AMb+g163b5JFysYk0x4qxNFwbfQkmNZoiRHb6sPzI9/QV33WeuvVYBUIiD4NzNIyqaRQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/generator-function": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/generator-function/-/generator-function-2.0.1.tgz",
      "integrity": "sha512-SFdFmIJi+ybC0vjlHN0ZGVGHc3lgE0DxPAT0djjVg+kjOnSqclqmj0KQ7ykTOLP6YxoqOvuAODGdcHJn+43q3g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/get-symbol-description": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/get-symbol-description/-/get-symbol-description-1.1.0.tgz",
      "integrity": "sha512-w9UMqWwJxHNOvoNzSJ2oPF5wvYcvP7jUvYzhp67yEhTi17ZDBBC1z9pTdGuzjD+EFIqLSYRweZjqfiPzQ06Ebg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-tsconfig": {
      "version": "4.13.6",
      "resolved": "https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.13.6.tgz",
      "integrity": "sha512-shZT/QMiSHc/YBLxxOkMtgSid5HFoauqCE3/exfsEcwg1WkeqjG+V40yBbBrsD+jW2HDXcs28xOfcbm2jI8Ddw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "resolve-pkg-maps": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/privatenumber/get-tsconfig?sponsor=1"
      }
    },
    "node_modules/glob": {
      "version": "10.3.10",
      "resolved": "https://registry.npmjs.org/glob/-/glob-10.3.10.tgz",
      "integrity": "sha512-fa46+tv1Ak0UPK1TOy/pZrIybNNt4HCv7SDzwyfiOZkvZLEbjsZkJBPtDHVshZjbecAoAGSC20MjLDG/qr679g==",
      "deprecated": "Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "foreground-child": "^3.1.0",
        "jackspeak": "^2.3.5",
        "minimatch": "^9.0.1",
        "minipass": "^5.0.0 || ^6.0.2 || ^7.0.0",
        "path-scurry": "^1.10.1"
      },
      "bin": {
        "glob": "dist/esm/bin.mjs"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/glob/node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/glob/node_modules/minimatch": {
      "version": "9.0.9",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.9.tgz",
      "integrity": "sha512-OBwBN9AL4dqmETlpS2zasx+vTeWclWzkblfZk7KTA5j3jeOONz/tRCnZomUyvNg83wL5Zv9Ss6HMJXAgL8R2Yg==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.2"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/globals": {
      "version": "13.24.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-13.24.0.tgz",
      "integrity": "sha512-AhO5QUcj8llrbG09iWhPU2B204J1xnPeL8kQmVorSsy+Sjj1sk8gIyh6cUocGmH4L0UuhAJy+hJMRA4mgA4mFQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "type-fest": "^0.20.2"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/globalthis": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/globalthis/-/globalthis-1.0.4.tgz",
      "integrity": "sha512-DpLKbNU4WylpxJykQujfCcwYWiV/Jhm50Goo0wrVILAv5jOr9d+H+UR3PhSCD2rCCEIg0uc+G+muBTwD54JhDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-properties": "^1.2.1",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/globby": {
      "version": "11.1.0",
      "resolved": "https://registry.npmjs.org/globby/-/globby-11.1.0.tgz",
      "integrity": "sha512-jhIXaOzy1sb8IyocaruWSn1TjmnBVs8Ayhcy83rmxNJ8q2uWKCAj3CnJY+KpGSXCueAPc0i05kVvVKtP1t9S3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-union": "^2.1.0",
        "dir-glob": "^3.0.1",
        "fast-glob": "^3.2.9",
        "ignore": "^5.2.0",
        "merge2": "^1.4.1",
        "slash": "^3.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "license": "ISC"
    },
    "node_modules/graphemer": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/graphemer/-/graphemer-1.4.0.tgz",
      "integrity": "sha512-EtKwoO6kxCL9WO5xipiHTZlSzBm7WLT627TqC/uVRd0HKmq8NXyebnNYxDoBi7wt8eTWrUrKXCOVaFq9x1kgag==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/has-bigints": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-bigints/-/has-bigints-1.1.0.tgz",
      "integrity": "sha512-R3pbpkcIqv2Pm3dUwgjclDRVmWpTJW2DcMzcIhEXEx1oh/CEMObMm3KLmRJOdvhM7o4uQBnwr8pzRK2sJWIqfg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/has-property-descriptors": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-property-descriptors/-/has-property-descriptors-1.0.2.tgz",
      "integrity": "sha512-55JNKuIW+vq4Ke1BjOTjM2YctQIvCT7GFzHwmfZPGo5wnrgkid0YQtnAleFSqumZm4az3n2BS+erby5ipJdgrg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-proto": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/has-proto/-/has-proto-1.2.0.tgz",
      "integrity": "sha512-KIL7eQPfHQRC8+XluaIw7BHUwwqL19bQn4hzNgdr+1wXoU0KKj6rufu47lhY7KbJR2C6T6+PfyN0Ea7wkSS+qQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/humanize-ms": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/humanize-ms/-/humanize-ms-1.2.1.tgz",
      "integrity": "sha512-Fl70vYtsAFb/C06PTS9dZBo7ihau+Tu/DNCk/OyHhea07S+aeMWpFFkUaXRa8fI+ScZbEI8dfSxwY7gxZ9SAVQ==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.0.0"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/inflight": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/inflight/-/inflight-1.0.6.tgz",
      "integrity": "sha512-k92I/b08q4wvFscXCLvqfsHCrjrF7yiXsQuIVvVE7N82W3+aqpzuUdBbfhWcy/FZR3/4IgflMgKLOsvPDrGCJA==",
      "deprecated": "This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "once": "^1.3.0",
        "wrappy": "1"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/internal-slot": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/internal-slot/-/internal-slot-1.1.0.tgz",
      "integrity": "sha512-4gd7VpWNQNB4UKKCFFVcp1AVv+FMOgs9NKzjHKusc8jTMhd5eL1NqQqOpE0KzMds804/yHlglp3uxgluOqAPLw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "hasown": "^2.0.2",
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/is-array-buffer": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/is-array-buffer/-/is-array-buffer-3.0.5.tgz",
      "integrity": "sha512-DDfANUiiG2wC1qawP66qlTugJeL5HyzMpfr8lLK+jMQirGzNod0B12cFB/9q838Ru27sBwfw78/rdoU7RERz6A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-async-function": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-async-function/-/is-async-function-2.1.1.tgz",
      "integrity": "sha512-9dgM/cZBnNvjzaMYHVoxxfPj2QXt22Ev7SuuPrs+xav0ukGB0S6d4ydZdEiM48kLx5kDV+QBPrpVnFyefL8kkQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "async-function": "^1.0.0",
        "call-bound": "^1.0.3",
        "get-proto": "^1.0.1",
        "has-tostringtag": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-bigint": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/is-bigint/-/is-bigint-1.1.0.tgz",
      "integrity": "sha512-n4ZT37wG78iz03xPRKJrHTdZbe3IicyucEtdRsV5yglwc3GyUfbAfpSeD0FJ41NbUNSt5wbhqfp1fS+BgnvDFQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-bigints": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-boolean-object": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/is-boolean-object/-/is-boolean-object-1.2.2.tgz",
      "integrity": "sha512-wa56o2/ElJMYqjCjGkXri7it5FbebW5usLw/nPmCMs5DeZ7eziSYZhSmPRn0txqeW4LnAmQQU7FgqLpsEFKM4A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-bun-module": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/is-bun-module/-/is-bun-module-2.0.0.tgz",
      "integrity": "sha512-gNCGbnnnnFAUGKeZ9PdbyeGYJqewpmc2aKHUEMO5nQPWU9lOmv7jcmQIv+qHD8fXW6W7qfuCwX4rY9LNRjXrkQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "semver": "^7.7.1"
      }
    },
    "node_modules/is-callable": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/is-callable/-/is-callable-1.2.7.tgz",
      "integrity": "sha512-1BC0BVFhS/p0qtw6enp8e+8OD0UrK0oFLztSjNzhcKA3WDuJxxAPXzPuPtKkjEY9UUoEWlX/8fgKeu2S8i9JTA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.16.1",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.1.tgz",
      "integrity": "sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-data-view": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/is-data-view/-/is-data-view-1.0.2.tgz",
      "integrity": "sha512-RKtWF8pGmS87i2D6gqQu/l7EYRlVdfzemCJN/P3UOs//x1QE7mfhvzHIApBTRf7axvT6DMGwSwBXYCT0nfB9xw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "get-intrinsic": "^1.2.6",
        "is-typed-array": "^1.1.13"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-date-object": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/is-date-object/-/is-date-object-1.1.0.tgz",
      "integrity": "sha512-PwwhEakHVKTdRNVOw+/Gyh0+MzlCl4R6qKvkhuvLtPMggI1WAHt9sOwZxQLSGpUaDnrdyDsomoRgNnCfKNSXXg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-finalizationregistry": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-finalizationregistry/-/is-finalizationregistry-1.1.1.tgz",
      "integrity": "sha512-1pC6N8qWJbWoPtEjgcL2xyhQOP491EQjeUo3qTKcmV8YSDDJrOepfG8pcC7h/QgnQHYSv0mJ3Z/ZWxmatVrysg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-fullwidth-code-point": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-generator-function": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/is-generator-function/-/is-generator-function-1.1.2.tgz",
      "integrity": "sha512-upqt1SkGkODW9tsGNG5mtXTXtECizwtS2kA161M+gJPc1xdb/Ax629af6YrTwcOeQHbewrPNlE5Dx7kzvXTizA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.4",
        "generator-function": "^2.0.0",
        "get-proto": "^1.0.1",
        "has-tostringtag": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-map": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-map/-/is-map-2.0.3.tgz",
      "integrity": "sha512-1Qed0/Hr2m+YqxnM09CjA2d/i6YZNfF6R2oRAOj36eUdS6qIV/huPJNSEpKbupewFs+ZsJlxsjjPbc0/afW6Lw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-negative-zero": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-negative-zero/-/is-negative-zero-2.0.3.tgz",
      "integrity": "sha512-5KoIu2Ngpyek75jXodFvnafB6DJgr3u8uuK0LEZJjrU19DrMD3EVERaR8sjz8CCGgpZvxPl9SuE1GMVPFHx1mw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/is-number-object": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-number-object/-/is-number-object-1.1.1.tgz",
      "integrity": "sha512-lZhclumE1G6VYD8VHe35wFaIif+CTy5SJIi5+3y4psDgWu4wPDoBhF8NxUOinEc7pHgiTsT6MaBb92rKhhD+Xw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-path-inside": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/is-path-inside/-/is-path-inside-3.0.3.tgz",
      "integrity": "sha512-Fd4gABb+ycGAmKou8eMftCupSir5lRxqf4aD/vd0cD2qc4HL07OjCeuHMr8Ro4CoMaeCKDB0/ECBOVWjTwUvPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-regex": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/is-regex/-/is-regex-1.2.1.tgz",
      "integrity": "sha512-MjYsKHO5O7mCsmRGxWcLWheFqN9DJ/2TmngvjKXihe6efViPqc274+Fx/4fYj/r03+ESvBdTXK0V6tA3rgez1g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-set": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-set/-/is-set-2.0.3.tgz",
      "integrity": "sha512-iPAjerrse27/ygGLxw+EBR9agv9Y6uLeYVJMu+QNCoouJ1/1ri0mGrcWpfCqFZuzzx3WjtwxG098X+n4OuRkPg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-shared-array-buffer": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/is-shared-array-buffer/-/is-shared-array-buffer-1.0.4.tgz",
      "integrity": "sha512-ISWac8drv4ZGfwKl5slpHG9OwPNty4jOWPRIhBpxOoD+hqITiwuipOQ2bNthAzwA3B4fIjO4Nln74N0S9byq8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-string": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-string/-/is-string-1.1.1.tgz",
      "integrity": "sha512-BtEeSsoaQjlSPBemMQIrY1MY0uM6vnS1g5fmufYOtnxLGUZM2178PKbhsk7Ffv58IX+ZtcvoGwccYsh0PglkAA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-symbol": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-symbol/-/is-symbol-1.1.1.tgz",
      "integrity": "sha512-9gGx6GTtCQM73BgmHQXfDmLtfjjTUDSyoxTCbp5WtoixAhfgsDirWIcVQ/IHpvI5Vgd5i/J5F7B9cN/WlVbC/w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "has-symbols": "^1.1.0",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-typed-array": {
      "version": "1.1.15",
      "resolved": "https://registry.npmjs.org/is-typed-array/-/is-typed-array-1.1.15.tgz",
      "integrity": "sha512-p3EcsicXjit7SaskXHs1hA91QxgTw46Fv6EFKKGS5DRFLD8yKnohjF3hxoju94b/OcMZoQukzpPpBE9uLVKzgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "which-typed-array": "^1.1.16"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakmap": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/is-weakmap/-/is-weakmap-2.0.2.tgz",
      "integrity": "sha512-K5pXYOm9wqY1RgjpL3YTkF39tni1XajUIkawTLUo9EZEVUFga5gSQJF8nNS7ZwJQ02y+1YCNYcMh+HIf1ZqE+w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakref": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-weakref/-/is-weakref-1.1.1.tgz",
      "integrity": "sha512-6i9mGWSlqzNMEqpCp93KwRS1uUOodk2OJ6b+sq7ZPDSy2WuI5NFIxp/254TytR8ftefexkWn5xNiHUNpPOfSew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakset": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/is-weakset/-/is-weakset-2.0.4.tgz",
      "integrity": "sha512-mfcwb6IzQyOKTs84CQMrOwW4gQcaTOAWJ0zzJCl2WSPDrWk/OzDaImWFH3djXhb24g4eudZfLRozAvPGw4d9hQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/isarray": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/isarray/-/isarray-2.0.5.tgz",
      "integrity": "sha512-xHjhDr3cNBK0BzdUJSPXZntQUx/mwMS5Rw4A7lPJ90XGAO6ISP/ePDNuo0vhqOZU+UD5JoodwCAAoZQd3FeAKw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/iterator.prototype": {
      "version": "1.1.5",
      "resolved": "https://registry.npmjs.org/iterator.prototype/-/iterator.prototype-1.1.5.tgz",
      "integrity": "sha512-H0dkQoCa3b2VEeKQBOxFph+JAbcrQdE7KC0UkqwpLmv2EC4P41QXP+rqo9wYodACiG5/WM5s9oDApTU8utwj9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-object-atoms": "^1.0.0",
        "get-intrinsic": "^1.2.6",
        "get-proto": "^1.0.0",
        "has-symbols": "^1.1.0",
        "set-function-name": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/jackspeak": {
      "version": "2.3.6",
      "resolved": "https://registry.npmjs.org/jackspeak/-/jackspeak-2.3.6.tgz",
      "integrity": "sha512-N3yCS/NegsOBokc8GAdM8UcmfsKiSS8cipheD/nivzr700H+nsMOxJjQnvwOcRYVuFkdH0wGUvW2WbXGmrZGbQ==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "@isaacs/cliui": "^8.0.2"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      },
      "optionalDependencies": {
        "@pkgjs/parseargs": "^0.11.0"
      }
    },
    "node_modules/jose": {
      "version": "4.15.9",
      "resolved": "https://registry.npmjs.org/jose/-/jose-4.15.9.tgz",
      "integrity": "sha512-1vUQX+IdDMVPj4k8kOxgUqlcK518yluMuGZwqlr44FS1ppZB/5GWh4rZG89erpOBOJjU/OBsnCVFfapsRz6nEA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/panva"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/js-yaml": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.1.1.tgz",
      "integrity": "sha512-qQKT4zQxXl8lLwBtHMWwaTcGfFOZviOJet3Oy/xmGk2gZH677CJM9EvtfdSkgWcATZhj/55JZ0rmy3myCT5lsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/json-buffer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz",
      "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-stable-stringify-without-jsonify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",
      "integrity": "sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json5": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/json5/-/json5-1.0.2.tgz",
      "integrity": "sha512-g1MWMLBiz8FKi1e4w0UyVL3w+iJceWAFBAaBnnGKOpNa5f8TLktkbre1+s6oICydWAm+HRUGTmI+//xv2hvXYA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "minimist": "^1.2.0"
      },
      "bin": {
        "json5": "lib/cli.js"
      }
    },
    "node_modules/jsx-ast-utils": {
      "version": "3.3.5",
      "resolved": "https://registry.npmjs.org/jsx-ast-utils/-/jsx-ast-utils-3.3.5.tgz",
      "integrity": "sha512-ZZow9HBI5O6EPgSJLUb8n2NKgmVWTwCvHGwFuJlMjvLFqlGG6pjirPhtdsseaLZjSibD8eegzmYpUZwoIlj2cQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-includes": "^3.1.6",
        "array.prototype.flat": "^1.3.1",
        "object.assign": "^4.1.4",
        "object.values": "^1.1.6"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/keyv": {
      "version": "4.5.4",
      "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
      "integrity": "sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "json-buffer": "3.0.1"
      }
    },
    "node_modules/language-subtag-registry": {
      "version": "0.3.23",
      "resolved": "https://registry.npmjs.org/language-subtag-registry/-/language-subtag-registry-0.3.23.tgz",
      "integrity": "sha512-0K65Lea881pHotoGEa5gDlMxt3pctLi2RplBb7Ezh4rRdLEOtgi7n4EwK9lamnUCkKBqaeKRVebTq6BAxSkpXQ==",
      "dev": true,
      "license": "CC0-1.0"
    },
    "node_modules/language-tags": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/language-tags/-/language-tags-1.0.9.tgz",
      "integrity": "sha512-MbjN408fEndfiQXbFQ1vnd+1NoLDsnQW41410oQBXiyXDMYH5z505juWa4KUE1LqxRC7DgOgZDbKLxHIwm27hA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "language-subtag-registry": "^0.3.20"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/levn": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/levn/-/levn-0.4.1.tgz",
      "integrity": "sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1",
        "type-check": "~0.4.0"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/locate-path": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz",
      "integrity": "sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-locate": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/lodash.merge": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz",
      "integrity": "sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-6.0.0.tgz",
      "integrity": "sha512-Jo6dJ04CmSjuznwJSS3pUeWmd/H0ffTlkXXgwZi+eq1UCmqQwCh+eLsYOYCwY991i2Fah4h1BEMCx4qThGbsiA==",
      "license": "ISC",
      "dependencies": {
        "yallist": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz",
      "integrity": "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/minimist": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.8.tgz",
      "integrity": "sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.3",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.3.tgz",
      "integrity": "sha512-tEBHqDnIoM/1rXME1zgka9g6Q2lcoCkxHLuc7ODJ5BxbP5d4c2Z5cGgtXAku59200Cx7diuHTOYfSBD8n6mm8A==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.11",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
      "integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/napi-postinstall": {
      "version": "0.3.4",
      "resolved": "https://registry.npmjs.org/napi-postinstall/-/napi-postinstall-0.3.4.tgz",
      "integrity": "sha512-PHI5f1O0EP5xJ9gQmFGMS6IZcrVvTjpXjz7Na41gTE7eE2hK11lg04CECCYEEjdc17EV4DO+fkGEtt7TpTaTiQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "napi-postinstall": "lib/cli.js"
      },
      "engines": {
        "node": "^12.20.0 || ^14.18.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/napi-postinstall"
      }
    },
    "node_modules/natural-compare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz",
      "integrity": "sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/next": {
      "version": "14.2.5",
      "resolved": "https://registry.npmjs.org/next/-/next-14.2.5.tgz",
      "integrity": "sha512-0f8aRfBVL+mpzfBjYfQuLWh2WyAwtJXCRfkPF4UJ5qd2YwrHczsrSzXU4tRMV0OAxR8ZJZWPFn6uhSC56UTsLA==",
      "deprecated": "This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.",
      "license": "MIT",
      "dependencies": {
        "@next/env": "14.2.5",
        "@swc/helpers": "0.5.5",
        "busboy": "1.6.0",
        "caniuse-lite": "^1.0.30001579",
        "graceful-fs": "^4.2.11",
        "postcss": "8.4.31",
        "styled-jsx": "5.1.1"
      },
      "bin": {
        "next": "dist/bin/next"
      },
      "engines": {
        "node": ">=18.17.0"
      },
      "optionalDependencies": {
        "@next/swc-darwin-arm64": "14.2.5",
        "@next/swc-darwin-x64": "14.2.5",
        "@next/swc-linux-arm64-gnu": "14.2.5",
        "@next/swc-linux-arm64-musl": "14.2.5",
        "@next/swc-linux-x64-gnu": "14.2.5",
        "@next/swc-linux-x64-musl": "14.2.5",
        "@next/swc-win32-arm64-msvc": "14.2.5",
        "@next/swc-win32-ia32-msvc": "14.2.5",
        "@next/swc-win32-x64-msvc": "14.2.5"
      },
      "peerDependencies": {
        "@opentelemetry/api": "^1.1.0",
        "@playwright/test": "^1.41.2",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "sass": "^1.3.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        },
        "@playwright/test": {
          "optional": true
        },
        "sass": {
          "optional": true
        }
      }
    },
    "node_modules/next-auth": {
      "version": "4.24.13",
      "resolved": "https://registry.npmjs.org/next-auth/-/next-auth-4.24.13.tgz",
      "integrity": "sha512-sgObCfcfL7BzIK76SS5TnQtc3yo2Oifp/yIpfv6fMfeBOiBJkDWF3A2y9+yqnmJ4JKc2C+nMjSjmgDeTwgN1rQ==",
      "license": "ISC",
      "dependencies": {
        "@babel/runtime": "^7.20.13",
        "@panva/hkdf": "^1.0.2",
        "cookie": "^0.7.0",
        "jose": "^4.15.5",
        "oauth": "^0.9.15",
        "openid-client": "^5.4.0",
        "preact": "^10.6.3",
        "preact-render-to-string": "^5.1.19",
        "uuid": "^8.3.2"
      },
      "peerDependencies": {
        "@auth/core": "0.34.3",
        "next": "^12.2.5 || ^13 || ^14 || ^15 || ^16",
        "nodemailer": "^7.0.7",
        "react": "^17.0.2 || ^18 || ^19",
        "react-dom": "^17.0.2 || ^18 || ^19"
      },
      "peerDependenciesMeta": {
        "@auth/core": {
          "optional": true
        },
        "nodemailer": {
          "optional": true
        }
      }
    },
    "node_modules/node-domexception": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/node-domexception/-/node-domexception-1.0.0.tgz",
      "integrity": "sha512-/jKZoMpw0F8GRwl4/eLROPA3cfcXtLApP0QzLmUT/HuPCZWyB7IY9ZrMeKw2O/nFIqPQB3PVM9aYm0F312AXDQ==",
      "deprecated": "Use your platform's native DOMException instead",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/jimmywarting"
        },
        {
          "type": "github",
          "url": "https://paypal.me/jimmywarting"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=10.5.0"
      }
    },
    "node_modules/node-exports-info": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/node-exports-info/-/node-exports-info-1.6.0.tgz",
      "integrity": "sha512-pyFS63ptit/P5WqUkt+UUfe+4oevH+bFeIiPPdfb0pFeYEu/1ELnJu5l+5EcTKYL5M7zaAa7S8ddywgXypqKCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array.prototype.flatmap": "^1.3.3",
        "es-errors": "^1.3.0",
        "object.entries": "^1.1.9",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/node-exports-info/node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/node-fetch": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-2.7.0.tgz",
      "integrity": "sha512-c4FRfUm/dbcWZ7U+1Wq0AwCyFL+3nt2bEw05wfxSz+DWpWsitgmSgYmy2dQdWyKC1694ELPqMs/YzUSNozLt8A==",
      "license": "MIT",
      "dependencies": {
        "whatwg-url": "^5.0.0"
      },
      "engines": {
        "node": "4.x || >=6.0.0"
      },
      "peerDependencies": {
        "encoding": "^0.1.0"
      },
      "peerDependenciesMeta": {
        "encoding": {
          "optional": true
        }
      }
    },
    "node_modules/oauth": {
      "version": "0.9.15",
      "resolved": "https://registry.npmjs.org/oauth/-/oauth-0.9.15.tgz",
      "integrity": "sha512-a5ERWK1kh38ExDEfoO6qUHJb32rd7aYmPHuyCu3Fta/cnICvYmgd2uhuKXvPD+PXB+gCEYYEaQdIRAjCOwAKNA==",
      "license": "MIT"
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-2.2.0.tgz",
      "integrity": "sha512-gScRMn0bS5fH+IuwyIFgnh9zBdo4DV+6GhygmWM9HyNJSgS0hScp1f5vjtm7oIIOiT9trXrShAkLFSc2IqKNgw==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object-keys": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/object-keys/-/object-keys-1.1.1.tgz",
      "integrity": "sha512-NuAESUOUMrlIXOfHKzD6bpPu3tYt3xvjNdRIQ+FeT0lNb4K8WR70CaDxhuNguS2XG+GjkyMwOzsN5ZktImfhLA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.assign": {
      "version": "4.1.7",
      "resolved": "https://registry.npmjs.org/object.assign/-/object.assign-4.1.7.tgz",
      "integrity": "sha512-nK28WOo+QIjBkDduTINE4JkF/UJJKyf2EJxvJKfblDpyg0Q+pkOHNTL0Qwy6NP6FhE/EnzV73BxxqcJaXY9anw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0",
        "has-symbols": "^1.1.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object.entries": {
      "version": "1.1.9",
      "resolved": "https://registry.npmjs.org/object.entries/-/object.entries-1.1.9.tgz",
      "integrity": "sha512-8u/hfXFRBD1O0hPUjioLhoWFHRmt6tKA4/vZPyckBr18l1KE9uHrFaFaUi8MDRTpi4uak2goyPTSNJLXX2k2Hw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.fromentries": {
      "version": "2.0.8",
      "resolved": "https://registry.npmjs.org/object.fromentries/-/object.fromentries-2.0.8.tgz",
      "integrity": "sha512-k6E21FzySsSK5a21KRADBd/NGneRegFO5pLHfdQLpRDETUNJueLXs3WCzyQ3tFRDYgbq3KHGXfTbi2bs8WQ6rQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.2",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object.groupby": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/object.groupby/-/object.groupby-1.0.3.tgz",
      "integrity": "sha512-+Lhy3TQTuzXI5hevh8sBGqbmurHbbIjAi0Z4S63nthVLmLxfbj4T54a4CfZrXIrt9iP4mVAPYMo/v99taj3wjQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.values": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/object.values/-/object.values-1.2.1.tgz",
      "integrity": "sha512-gXah6aZrcUxjWg2zR2MwouP2eHlCBzdV4pygudehaKXSGW4v2AsRQUK+lwwXhii6KFZcunEnmSUoYp5CXibxtA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/oidc-token-hash": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/oidc-token-hash/-/oidc-token-hash-5.2.0.tgz",
      "integrity": "sha512-6gj2m8cJZ+iSW8bm0FXdGF0YhIQbKrfP4yWTNzxc31U6MOjfEmB1rHvlYvxI1B7t7BCi1F2vYTT6YhtQRG4hxw==",
      "license": "MIT",
      "engines": {
        "node": "^10.13.0 || >=12.0.0"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/openid-client": {
      "version": "5.7.1",
      "resolved": "https://registry.npmjs.org/openid-client/-/openid-client-5.7.1.tgz",
      "integrity": "sha512-jDBPgSVfTnkIh71Hg9pRvtJc6wTwqjRkN88+gCFtYWrlP4Yx2Dsrow8uPi3qLr/aeymPF3o2+dS+wOpglK04ew==",
      "license": "MIT",
      "dependencies": {
        "jose": "^4.15.9",
        "lru-cache": "^6.0.0",
        "object-hash": "^2.2.0",
        "oidc-token-hash": "^5.0.3"
      },
      "funding": {
        "url": "https://github.com/sponsors/panva"
      }
    },
    "node_modules/optionator": {
      "version": "0.9.4",
      "resolved": "https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz",
      "integrity": "sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "deep-is": "^0.1.3",
        "fast-levenshtein": "^2.0.6",
        "levn": "^0.4.1",
        "prelude-ls": "^1.2.1",
        "type-check": "^0.4.0",
        "word-wrap": "^1.2.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/own-keys": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/own-keys/-/own-keys-1.0.1.tgz",
      "integrity": "sha512-qFOyK5PjiWZd+QQIh+1jhdb9LpxTF0qs7Pm8o5QHYZ0M3vKqSqzsZaEB6oWlxZ+q2sJBMI/Ktgd2N5ZwQoRHfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "get-intrinsic": "^1.2.6",
        "object-keys": "^1.1.1",
        "safe-push-apply": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz",
      "integrity": "sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-limit": "^3.0.2"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-is-absolute": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/path-is-absolute/-/path-is-absolute-1.0.1.tgz",
      "integrity": "sha512-AVbw3UJ2e9bq64vSaS9Am0fje1Pa8pbGqTTsmXfaIiMpnr5DlDhfJOuLj9Sf95ZPVDAUerDfEk88MPmPe7UCQg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/path-scurry": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-1.11.1.tgz",
      "integrity": "sha512-Xa4Nw17FS9ApQFJ9umLiJS4orGjm7ZzwUrwamcGQuHSzDyth9boKDaycYdDcZDuqYATXw4HFXgaqWTctW/v1HA==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "lru-cache": "^10.2.0",
        "minipass": "^5.0.0 || ^6.0.2 || ^7.0.0"
      },
      "engines": {
        "node": ">=16 || 14 >=14.18"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/path-scurry/node_modules/lru-cache": {
      "version": "10.4.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/path-type": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-type/-/path-type-4.0.0.tgz",
      "integrity": "sha512-gDKb8aZMDeD/tZWs9P6+q0J9Mwkdl6xMV8TjnGP3qJVJ06bdMgkbBlLU8IdfOsIsFz2BW1rNVT3XuNEl8zPAvw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
      "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/possible-typed-array-names": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/possible-typed-array-names/-/possible-typed-array-names-1.1.0.tgz",
      "integrity": "sha512-/+5VFTchJDoVj3bhoqi6UeymcD00DAwb1nJwamzPvHEszJ4FpF6SNNbUbOS8yI56qHzdV8eK0qEfOSiodkTdxg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/postcss": {
      "version": "8.4.31",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.4.31.tgz",
      "integrity": "sha512-PS08Iboia9mts/2ygV3eLpY5ghnUcfLV/EXTOW1E2qYxJKGGBUtNjN76FYHnMs36RmARn41bC0AZmn+rR0OVpQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.6",
        "picocolors": "^1.0.0",
        "source-map-js": "^1.0.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/preact": {
      "version": "10.28.4",
      "resolved": "https://registry.npmjs.org/preact/-/preact-10.28.4.tgz",
      "integrity": "sha512-uKFfOHWuSNpRFVTnljsCluEFq57OKT+0QdOiQo8XWnQ/pSvg7OpX5eNOejELXJMWy+BwM2nobz0FkvzmnpCNsQ==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/preact"
      }
    },
    "node_modules/preact-render-to-string": {
      "version": "5.2.6",
      "resolved": "https://registry.npmjs.org/preact-render-to-string/-/preact-render-to-string-5.2.6.tgz",
      "integrity": "sha512-JyhErpYOvBV1hEPwIxc/fHWXPfnEGdRKxc8gFdAZ7XV4tlzyzG847XAyEZqoDnynP88akM4eaHcSOzNcLWFguw==",
      "license": "MIT",
      "dependencies": {
        "pretty-format": "^3.8.0"
      },
      "peerDependencies": {
        "preact": ">=10"
      }
    },
    "node_modules/prelude-ls": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz",
      "integrity": "sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/pretty-format": {
      "version": "3.8.0",
      "resolved": "https://registry.npmjs.org/pretty-format/-/pretty-format-3.8.0.tgz",
      "integrity": "sha512-WuxUnVtlWL1OfZFQFuqvnvs6MiAGk9UNsBostyBOB0Is9wb5uRESevA6rnl/rkksXaGX3GzZhPup5d6Vp1nFew==",
      "license": "MIT"
    },
    "node_modules/prisma": {
      "version": "5.22.0",
      "resolved": "https://registry.npmjs.org/prisma/-/prisma-5.22.0.tgz",
      "integrity": "sha512-vtpjW3XuYCSnMsNVBjLMNkTj6OZbudcPPTPYHqX0CJfpcdWciI1dM8uHETwmDxxiqEwCIE6WvXucWUetJgfu/A==",
      "devOptional": true,
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/engines": "5.22.0"
      },
      "bin": {
        "prisma": "build/index.js"
      },
      "engines": {
        "node": ">=16.13"
      },
      "optionalDependencies": {
        "fsevents": "2.3.3"
      }
    },
    "node_modules/prop-types": {
      "version": "15.8.1",
      "resolved": "https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz",
      "integrity": "sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.4.0",
        "object-assign": "^4.1.1",
        "react-is": "^16.13.1"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-is": {
      "version": "16.13.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz",
      "integrity": "sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/reflect.getprototypeof": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/reflect.getprototypeof/-/reflect.getprototypeof-1.0.10.tgz",
      "integrity": "sha512-00o4I+DVrefhv+nX0ulyi3biSHCPDe+yLv5o/p6d/UVlirijB8E16FtfwSAi4g3tcqrQ4lRAqQSoFEZJehYEcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.9",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0",
        "get-intrinsic": "^1.2.7",
        "get-proto": "^1.0.1",
        "which-builtin-type": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/regexp.prototype.flags": {
      "version": "1.5.4",
      "resolved": "https://registry.npmjs.org/regexp.prototype.flags/-/regexp.prototype.flags-1.5.4.tgz",
      "integrity": "sha512-dYqgNSZbDwkaJ2ceRd9ojCGjBq+mOm9LmtXnAnEGyHhN/5R7iDW2TRw3h+o/jCFxus3P2LfWIIiwowAjANm7IA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-errors": "^1.3.0",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "set-function-name": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve": {
      "version": "1.22.11",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.11.tgz",
      "integrity": "sha512-RfqAvLnMl313r7c9oclB1HhUEAezcpLjz95wFH4LVuhk9JF/r22qmVP9AMmOU4vMX7Q8pN8jwNg/CSpdFnMjTQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-core-module": "^2.16.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/resolve-pkg-maps": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz",
      "integrity": "sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/privatenumber/resolve-pkg-maps?sponsor=1"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rimraf": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/rimraf/-/rimraf-3.0.2.tgz",
      "integrity": "sha512-JZkJMZkAGFFPP2YqXZXPbMlMBgsxzE8ILs4lMIX/2o0L9UBw9O/Y3o6wFw/i9YLapcUJWwqbi3kdxIPdC62TIA==",
      "deprecated": "Rimraf versions prior to v4 are no longer supported",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "glob": "^7.1.3"
      },
      "bin": {
        "rimraf": "bin.js"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/rimraf/node_modules/glob": {
      "version": "7.2.3",
      "resolved": "https://registry.npmjs.org/glob/-/glob-7.2.3.tgz",
      "integrity": "sha512-nFR0zLpU2YCaRxwoCJvL6UvCH2JFyFVIvwTLsIf21AuHlMskA1hhTdk+LlYJtOlYt9v6dvszD2BGRqBL+iQK9Q==",
      "deprecated": "Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "fs.realpath": "^1.0.0",
        "inflight": "^1.0.4",
        "inherits": "2",
        "minimatch": "^3.1.1",
        "once": "^1.3.0",
        "path-is-absolute": "^1.0.0"
      },
      "engines": {
        "node": "*"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/safe-array-concat": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/safe-array-concat/-/safe-array-concat-1.1.3.tgz",
      "integrity": "sha512-AURm5f0jYEOydBj7VQlVvDrjeFgthDdEF5H1dP+6mNpoXOMo1quQqJ4wvJDyRZ9+pO3kGWoOdmV08cSv2aJV6Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.2",
        "get-intrinsic": "^1.2.6",
        "has-symbols": "^1.1.0",
        "isarray": "^2.0.5"
      },
      "engines": {
        "node": ">=0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/safe-push-apply": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/safe-push-apply/-/safe-push-apply-1.0.0.tgz",
      "integrity": "sha512-iKE9w/Z7xCzUMIZqdBsp6pEQvwuEebH4vdpjcDWnyzaI6yl6O9FHvVpmGelvEHNsoY6wGblkxR6Zty/h00WiSA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "isarray": "^2.0.5"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/safe-regex-test": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/safe-regex-test/-/safe-regex-test-1.1.0.tgz",
      "integrity": "sha512-x/+Cz4YrimQxQccJf5mKEbIa1NzeCRNI5Ecl/ekmlYaampdNLPalVyIcCZNNH3MvmqBugV5TMYZXv0ljslUlaw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-regex": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/semver": {
      "version": "7.7.4",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.7.4.tgz",
      "integrity": "sha512-vFKC2IEtQnVhpT78h1Yp8wzwrf8CM+MzKMHGJZfBtzhZNycRFnXsHk6E5TxIkkMsgNS7mdX3AGB7x2QM2di4lA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/set-function-length": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/set-function-length/-/set-function-length-1.2.2.tgz",
      "integrity": "sha512-pgRc4hJ4/sNjWCSS9AmnS40x3bNMDTknHgL5UaMBTMyJnU90EgWh1Rz+MC9eFu4BuN/UwZjKQuY/1v3rM7HMfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2",
        "get-intrinsic": "^1.2.4",
        "gopd": "^1.0.1",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/set-function-name": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/set-function-name/-/set-function-name-2.0.2.tgz",
      "integrity": "sha512-7PGFlmtwsEADb0WYyvCMa1t+yke6daIG4Wirafur5kcf+MhUnPms1UeR0CKQdTZD81yESwMHbtn+TR+dMviakQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-errors": "^1.3.0",
        "functions-have-names": "^1.2.3",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/set-proto": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/set-proto/-/set-proto-1.0.0.tgz",
      "integrity": "sha512-RJRdvCo6IAnPdsvP/7m6bsQqNnn1FCBX5ZNtFL98MmFF/4xAIJTIg1YbHW5DC2W5SKZanrC6i4HsJqlajw/dZw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/side-channel": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.0.tgz",
      "integrity": "sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3",
        "side-channel-list": "^1.0.0",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.0.tgz",
      "integrity": "sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/signal-exit": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
      "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
      "dev": true,
      "license": "ISC",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/slash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/slash/-/slash-3.0.0.tgz",
      "integrity": "sha512-g9Q1haeby36OSStwb4ntCGGGaKsaVSjQ68fBxoQcutl5fS1vuY18H3wSt3jFyFtrkx+Kz0V1G85A4MyAdDMi2Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/stable-hash": {
      "version": "0.0.5",
      "resolved": "https://registry.npmjs.org/stable-hash/-/stable-hash-0.0.5.tgz",
      "integrity": "sha512-+L3ccpzibovGXFK+Ap/f8LOS0ahMrHTf3xu7mMLSpEGU0EO9ucaysSylKo9eRDFNhWve/y275iPmIZ4z39a9iA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/stop-iteration-iterator": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/stop-iteration-iterator/-/stop-iteration-iterator-1.1.0.tgz",
      "integrity": "sha512-eLoXW/DHyl62zxY4SCaIgnRhuMr6ri4juEYARS8E6sCEqzKpOiE521Ucofdx+KnDZl5xmvGYaaKCk5FEOxJCoQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "internal-slot": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/streamsearch": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/streamsearch/-/streamsearch-1.1.0.tgz",
      "integrity": "sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==",
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/string-width": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-5.1.2.tgz",
      "integrity": "sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eastasianwidth": "^0.2.0",
        "emoji-regex": "^9.2.2",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/string-width-cjs": {
      "name": "string-width",
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/string-width/node_modules/ansi-regex": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.2.2.tgz",
      "integrity": "sha512-Bq3SmSpyFHaWjPk8If9yc6svM8c56dB5BAtW4Qbw5jHTwwXXcTLoRMkpDJp6VL0XzlWaCHTXrkFURMYmD0sLqg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/string-width/node_modules/strip-ansi": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.2.0.tgz",
      "integrity": "sha512-yDPMNjp4WyfYBkHnjIRLfca1i6KMyGCtsVgoKe/z1+6vukgaENdgGBZt+ZmKPc4gavvEZ5OgHfHdrazhgNyG7w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^6.2.2"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/string.prototype.includes": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/string.prototype.includes/-/string.prototype.includes-2.0.1.tgz",
      "integrity": "sha512-o7+c9bW6zpAdJHTtujeePODAhkuicdAryFsfVKwA+wGw89wJ4GTY484WTucM9hLtDEOpOvI+aHnzqnC5lHp4Rg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.3"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/string.prototype.matchall": {
      "version": "4.0.12",
      "resolved": "https://registry.npmjs.org/string.prototype.matchall/-/string.prototype.matchall-4.0.12.tgz",
      "integrity": "sha512-6CC9uyBL+/48dYizRf7H7VAYCMCNTBeM78x/VTUe9bFEaxBepPJDa1Ow99LqI/1yF7kuy7Q3cQsYMrcjGUcskA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.6",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0",
        "get-intrinsic": "^1.2.6",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "internal-slot": "^1.1.0",
        "regexp.prototype.flags": "^1.5.3",
        "set-function-name": "^2.0.2",
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.repeat": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/string.prototype.repeat/-/string.prototype.repeat-1.0.0.tgz",
      "integrity": "sha512-0u/TldDbKD8bFCQ/4f5+mNRrXwZ8hg2w7ZR8wa16e8z9XpePWl3eGEcUD0OXpEH/VJH/2G3gjUtR3ZOiBe2S/w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-properties": "^1.1.3",
        "es-abstract": "^1.17.5"
      }
    },
    "node_modules/string.prototype.trim": {
      "version": "1.2.10",
      "resolved": "https://registry.npmjs.org/string.prototype.trim/-/string.prototype.trim-1.2.10.tgz",
      "integrity": "sha512-Rs66F0P/1kedk5lyYyH9uBzuiI/kNRmwJAR9quK6VOtIpZ2G+hMZd+HQbbv25MgCA6gEffoMZYxlTod4WcdrKA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.2",
        "define-data-property": "^1.1.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-object-atoms": "^1.0.0",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.trimend": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/string.prototype.trimend/-/string.prototype.trimend-1.0.9.tgz",
      "integrity": "sha512-G7Ok5C6E/j4SGfyLCloXTrngQIQU3PWtXGst3yM7Bea9FRURf1S42ZHlZZtsNque2FN2PoUhfZXYLNWwEr4dLQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.2",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.trimstart": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/string.prototype.trimstart/-/string.prototype.trimstart-1.0.8.tgz",
      "integrity": "sha512-UXSH262CSZY1tfu3G3Secr6uGLCFVPMhIqHjlgCUtCCcgihYc/xKs9djMTMUOb2j1mVSeU8EU6NWc/iQKU6Gfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi-cjs": {
      "name": "strip-ansi",
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-bom": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/strip-bom/-/strip-bom-3.0.0.tgz",
      "integrity": "sha512-vavAMRXOgBVNF6nyEEmL3DBK19iRpDcoIwW+swQ+CbGiu7lju6t+JklA1MHweoWtadgt4ISVUsXLyDq34ddcwA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/strip-json-comments": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
      "integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/styled-jsx": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.1.tgz",
      "integrity": "sha512-pW7uC1l4mBZ8ugbiZrcIsiIvVx1UmTfw7UkC3Um2tmfUq9Bhk8IiyEIPl6F8agHgjzku6j0xQEZbfA5uSgSaCw==",
      "license": "MIT",
      "dependencies": {
        "client-only": "0.0.1"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "peerDependencies": {
        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0"
      },
      "peerDependenciesMeta": {
        "@babel/core": {
          "optional": true
        },
        "babel-plugin-macros": {
          "optional": true
        }
      }
    },
    "node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/text-table": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/text-table/-/text-table-0.2.0.tgz",
      "integrity": "sha512-N+8UisAXDGk8PFXP4HAzVR9nbfmVJ3zYLAWiTIoqC5v5isinhr+r5uaO8+7r3BMfuNIufIsA7RdpVgacC2cSpw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.15",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.15.tgz",
      "integrity": "sha512-j2Zq4NyQYG5XMST4cbs02Ak8iJUdxRM0XI5QyxXuZOzKOINmWurp3smXu3y5wDcJrptwpSjgXHzIQxR0omXljQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.3"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
      "integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/tr46": {
      "version": "0.0.3",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-0.0.3.tgz",
      "integrity": "sha512-N3WMsuqV66lT30CrXNbEjx4GEwlow3v6rr4mCcv6prnfwhS01rkgyFdjPNBYd9br7LpXV1+Emh01fHnq2Gdgrw==",
      "license": "MIT"
    },
    "node_modules/ts-api-utils": {
      "version": "1.4.3",
      "resolved": "https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-1.4.3.tgz",
      "integrity": "sha512-i3eMG77UTMD0hZhgRS562pv83RC6ukSAC2GMNWc+9dieh/+jDM5u5YG+NHX6VNDRHQcHwmsTHctP9LhbC3WxVw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=16"
      },
      "peerDependencies": {
        "typescript": ">=4.2.0"
      }
    },
    "node_modules/tsconfig-paths": {
      "version": "3.15.0",
      "resolved": "https://registry.npmjs.org/tsconfig-paths/-/tsconfig-paths-3.15.0.tgz",
      "integrity": "sha512-2Ac2RgzDe/cn48GvOe3M+o82pEFewD3UPbyoUHHdKasHwJKjds4fLXWf/Ux5kATBKN20oaFGu+jbElp1pos0mg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/json5": "^0.0.29",
        "json5": "^1.0.2",
        "minimist": "^1.2.6",
        "strip-bom": "^3.0.0"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/type-check": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz",
      "integrity": "sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/type-fest": {
      "version": "0.20.2",
      "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.20.2.tgz",
      "integrity": "sha512-Ne+eE4r0/iWnpAxD852z3A+N0Bt5RN//NjJwRd2VFHEmrywxf5vsZlh4R6lixl6B+wz/8d+maTSAkN1FIkI3LQ==",
      "dev": true,
      "license": "(MIT OR CC0-1.0)",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/typed-array-buffer": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/typed-array-buffer/-/typed-array-buffer-1.0.3.tgz",
      "integrity": "sha512-nAYYwfY3qnzX30IkA6AQZjVbtK6duGontcQm1WSG1MD94YLqK0515GNApXkoxKOWMusVssAHWLh9SeaoefYFGw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-typed-array": "^1.1.14"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/typed-array-byte-length": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/typed-array-byte-length/-/typed-array-byte-length-1.0.3.tgz",
      "integrity": "sha512-BaXgOuIxz8n8pIq3e7Atg/7s+DpiYrxn4vdot3w9KbnBhcRQq6o3xemQdIfynqSeXeDrF32x+WvfzmOjPiY9lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "for-each": "^0.3.3",
        "gopd": "^1.2.0",
        "has-proto": "^1.2.0",
        "is-typed-array": "^1.1.14"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typed-array-byte-offset": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/typed-array-byte-offset/-/typed-array-byte-offset-1.0.4.tgz",
      "integrity": "sha512-bTlAFB/FBYMcuX81gbL4OcpH5PmlFHqlCCpAl8AlEzMz5k53oNDvN8p1PNOWLEmI2x4orp3raOFB51tv9X+MFQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "for-each": "^0.3.3",
        "gopd": "^1.2.0",
        "has-proto": "^1.2.0",
        "is-typed-array": "^1.1.15",
        "reflect.getprototypeof": "^1.0.9"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typed-array-length": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/typed-array-length/-/typed-array-length-1.0.7.tgz",
      "integrity": "sha512-3KS2b+kL7fsuk/eJZ7EQdnEmQoaho/r6KUef7hxvltNA5DR8NAUM+8wJMbJyZ4G9/7i3v5zPBIMN5aybAh2/Jg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "for-each": "^0.3.3",
        "gopd": "^1.0.1",
        "is-typed-array": "^1.1.13",
        "possible-typed-array-names": "^1.0.0",
        "reflect.getprototypeof": "^1.0.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/unbox-primitive": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/unbox-primitive/-/unbox-primitive-1.1.0.tgz",
      "integrity": "sha512-nWJ91DjeOkej/TA8pXQ3myruKpKEYgqvpw9lz4OPHj/NWFNluYrjbz9j01CJ8yKQd2g4jFoOkINCTW2I5LEEyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-bigints": "^1.0.2",
        "has-symbols": "^1.1.0",
        "which-boxed-primitive": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/undici-types": {
      "version": "6.21.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",
      "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
      "license": "MIT"
    },
    "node_modules/unrs-resolver": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/unrs-resolver/-/unrs-resolver-1.11.1.tgz",
      "integrity": "sha512-bSjt9pjaEBnNiGgc9rUiHGKv5l4/TGzDmYw3RhnkJGtLhbnnA/5qJj7x3dNDCRx/PJxu774LlH8lCOlB4hEfKg==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "dependencies": {
        "napi-postinstall": "^0.3.0"
      },
      "funding": {
        "url": "https://opencollective.com/unrs-resolver"
      },
      "optionalDependencies": {
        "@unrs/resolver-binding-android-arm-eabi": "1.11.1",
        "@unrs/resolver-binding-android-arm64": "1.11.1",
        "@unrs/resolver-binding-darwin-arm64": "1.11.1",
        "@unrs/resolver-binding-darwin-x64": "1.11.1",
        "@unrs/resolver-binding-freebsd-x64": "1.11.1",
        "@unrs/resolver-binding-linux-arm-gnueabihf": "1.11.1",
        "@unrs/resolver-binding-linux-arm-musleabihf": "1.11.1",
        "@unrs/resolver-binding-linux-arm64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-arm64-musl": "1.11.1",
        "@unrs/resolver-binding-linux-ppc64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-riscv64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-riscv64-musl": "1.11.1",
        "@unrs/resolver-binding-linux-s390x-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-x64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-x64-musl": "1.11.1",
        "@unrs/resolver-binding-wasm32-wasi": "1.11.1",
        "@unrs/resolver-binding-win32-arm64-msvc": "1.11.1",
        "@unrs/resolver-binding-win32-ia32-msvc": "1.11.1",
        "@unrs/resolver-binding-win32-x64-msvc": "1.11.1"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/uuid": {
      "version": "8.3.2",
      "resolved": "https://registry.npmjs.org/uuid/-/uuid-8.3.2.tgz",
      "integrity": "sha512-+NYs2QeMWy+GWFOEm9xnn6HCDp0l7QBD7ml8zLUmJ+93Q5NF0NocErnwkTkXVFNiX3/fpC6afS8Dhb/gz7R7eg==",
      "license": "MIT",
      "bin": {
        "uuid": "dist/bin/uuid"
      }
    },
    "node_modules/web-streams-polyfill": {
      "version": "4.0.0-beta.3",
      "resolved": "https://registry.npmjs.org/web-streams-polyfill/-/web-streams-polyfill-4.0.0-beta.3.tgz",
      "integrity": "sha512-QW95TCTaHmsYfHDybGMwO5IJIM93I/6vTRk+daHTWFPhwh+C8Cg7j7XyKrwrj8Ib6vYXe0ocYNrmzY4xAAN6ug==",
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-3.0.1.tgz",
      "integrity": "sha512-2JAn3z8AR6rjK8Sm8orRC0h/bcl/DqL7tRPdGZ4I1CjdF+EaMLmYxBHyXuKL849eucPFhvBoxMsflfOb8kxaeQ==",
      "license": "BSD-2-Clause"
    },
    "node_modules/whatwg-url": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-5.0.0.tgz",
      "integrity": "sha512-saE57nupxk6v3HY35+jzBwYa0rKSy0XR8JSxZPwgLr7ys0IBzhGviA1/TUGJLmSVqs8pb9AnvICXEuOHLprYTw==",
      "license": "MIT",
      "dependencies": {
        "tr46": "~0.0.3",
        "webidl-conversions": "^3.0.0"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/which-boxed-primitive": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/which-boxed-primitive/-/which-boxed-primitive-1.1.1.tgz",
      "integrity": "sha512-TbX3mj8n0odCBFVlY8AxkqcHASw3L60jIuF8jFP78az3C2YhmGvqbHBpAjTRH2/xqYunrJ9g1jSyjCjpoWzIAA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-bigint": "^1.1.0",
        "is-boolean-object": "^1.2.1",
        "is-number-object": "^1.1.1",
        "is-string": "^1.1.1",
        "is-symbol": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-builtin-type": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/which-builtin-type/-/which-builtin-type-1.2.1.tgz",
      "integrity": "sha512-6iBczoX+kDQ7a3+YJBnh3T+KZRxM/iYNPXicqk66/Qfm1b93iu+yOImkg0zHbj5LNOcNv1TEADiZ0xa34B4q6Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "function.prototype.name": "^1.1.6",
        "has-tostringtag": "^1.0.2",
        "is-async-function": "^2.0.0",
        "is-date-object": "^1.1.0",
        "is-finalizationregistry": "^1.1.0",
        "is-generator-function": "^1.0.10",
        "is-regex": "^1.2.1",
        "is-weakref": "^1.0.2",
        "isarray": "^2.0.5",
        "which-boxed-primitive": "^1.1.0",
        "which-collection": "^1.0.2",
        "which-typed-array": "^1.1.16"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-collection": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/which-collection/-/which-collection-1.0.2.tgz",
      "integrity": "sha512-K4jVyjnBdgvc86Y6BkaLZEN933SwYOuBFkdmBu9ZfkcAbdVbpITnDmjvZ/aQjRXQrv5EPkTnD1s39GiiqbngCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-map": "^2.0.3",
        "is-set": "^2.0.3",
        "is-weakmap": "^2.0.2",
        "is-weakset": "^2.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-typed-array": {
      "version": "1.1.20",
      "resolved": "https://registry.npmjs.org/which-typed-array/-/which-typed-array-1.1.20.tgz",
      "integrity": "sha512-LYfpUkmqwl0h9A2HL09Mms427Q1RZWuOHsukfVcKRq9q95iQxdw0ix1JQrqbcDR9PH1QDwf5Qo8OZb5lksZ8Xg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "for-each": "^0.3.5",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/word-wrap": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz",
      "integrity": "sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/wrap-ansi": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-8.1.0.tgz",
      "integrity": "sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^6.1.0",
        "string-width": "^5.0.1",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs": {
      "name": "wrap-ansi",
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/wrap-ansi-cjs/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi/node_modules/ansi-regex": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.2.2.tgz",
      "integrity": "sha512-Bq3SmSpyFHaWjPk8If9yc6svM8c56dB5BAtW4Qbw5jHTwwXXcTLoRMkpDJp6VL0XzlWaCHTXrkFURMYmD0sLqg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/wrap-ansi/node_modules/ansi-styles": {
      "version": "6.2.3",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.3.tgz",
      "integrity": "sha512-4Dj6M28JB+oAH8kFkTLUo+a2jwOFkuqb3yucU0CANcRRUbxS0cP0nZYCGjcc3BNXwRIsUVmDGgzawme7zvJHvg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/wrap-ansi/node_modules/strip-ansi": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.2.0.tgz",
      "integrity": "sha512-yDPMNjp4WyfYBkHnjIRLfca1i6KMyGCtsVgoKe/z1+6vukgaENdgGBZt+ZmKPc4gavvEZ5OgHfHdrazhgNyG7w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^6.2.2"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/yallist": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-4.0.0.tgz",
      "integrity": "sha512-3wdGidZyq5PB084XLES5TpOSRA3wjXAlIWMhum2kRcv/41Sn2emQ0dycQW4uZXLejwKvg6EsvbdlVL+FYEct7A==",
      "license": "ISC"
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/zod": {
      "version": "3.25.76",
      "resolved": "https://registry.npmjs.org/zod/-/zod-3.25.76.tgz",
      "integrity": "sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    }
  }
}

```

### File: `package.json`

```json
{
  "name": "job-hunter-os",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.26.0",
    "@prisma/client": "^5.16.1",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^17.3.1",
    "next": "14.2.5",
    "next-auth": "^4.24.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "prisma": "^5.16.1",
    "typescript": "^5"
  }
}

```

### File: `prisma/migrations/20260308210000_add_career_profile_agent/migration.sql`

```sql
-- Agent 1: Career Profile Agent
-- Additive migration for onboarding + profile memory entities

-- CreateEnum
CREATE TYPE "CandidateIntakeStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM (
  'PROJECT',
  'COURSE',
  'INTERVIEW',
  'WORK_EXPERIENCE',
  'EXERCISE',
  'CERTIFICATION',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "InterviewStoryType" AS ENUM (
  'BEHAVIORAL',
  'TECHNICAL',
  'LEADERSHIP',
  'FAILURE',
  'PROJECT',
  'CONFLICT',
  'OWNERSHIP'
);

-- AlterTable
ALTER TABLE "CandidateSkill"
ADD COLUMN "lastUsedAt" TIMESTAMP(3),
ADD COLUMN "interviewConfidence" INTEGER,
ADD COLUMN "productionConfidence" INTEGER,
ADD COLUMN "selfReportedOnly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "profileNotes" TEXT;

-- CreateTable
CREATE TABLE "CandidateIntake" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "CandidateIntakeStatus" NOT NULL DEFAULT 'DRAFT',
  "targetTitle" TEXT,
  "fallbackTitles" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "minimumSalaryIls" INTEGER,
  "idealSalaryMinIls" INTEGER,
  "idealSalaryMaxIls" INTEGER,
  "acceptableCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "conditionalCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "unacceptableCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "workModes" "WorkMode"[] DEFAULT ARRAY['HYBRID'::"WorkMode", 'ONSITE'::"WorkMode", 'REMOTE'::"WorkMode"],
  "roleSeniorityTarget" TEXT,
  "constraintsNotes" TEXT,
  "topTargetCompanies" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferredStages" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferredDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "avoidDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferredTeamTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "avoidIndustries" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "strongestTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "weakestTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "stressfulInterviewTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "missingMaterials" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "confidenceRecruiterInterview" INTEGER,
  "confidenceTechnicalInterview" INTEGER,
  "confidenceCaseInterview" INTEGER,
  "confidenceBehavioralInterview" INTEGER,
  "hebrewCommunicationConfidence" INTEGER,
  "englishCommunicationConfidence" INTEGER,
  "writingConfidence" INTEGER,
  "liveInterviewConfidence" INTEGER,
  "preferredOutreachTone" TEXT,
  "preferredPositioningStyle" TEXT,
  "outreachAvoidances" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CandidateIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEvidence" (
  "id" TEXT NOT NULL,
  "candidateSkillId" TEXT NOT NULL,
  "evidenceType" "EvidenceType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "outcome" TEXT,
  "evidenceDate" TIMESTAMP(3),
  "credibility" INTEGER,
  "url" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SkillEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceEpisode" (
  "id" TEXT NOT NULL,
  "candidateProfileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "organization" TEXT,
  "context" TEXT,
  "technicalOwnership" TEXT,
  "collaborators" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "dataScale" TEXT,
  "toolingStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "tradeoffs" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "impact" TEXT,
  "biggestChallenge" TEXT,
  "resolution" TEXT,
  "interviewConfidence" INTEGER,
  "externallyUsable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ExperienceEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewStory" (
  "id" TEXT NOT NULL,
  "candidateProfileId" TEXT NOT NULL,
  "type" "InterviewStoryType" NOT NULL DEFAULT 'PROJECT',
  "title" TEXT NOT NULL,
  "situation" TEXT NOT NULL,
  "task" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "confidence" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InterviewStory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateIntake_userId_key" ON "CandidateIntake"("userId");

-- AddForeignKey
ALTER TABLE "CandidateIntake"
ADD CONSTRAINT "CandidateIntake_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence"
ADD CONSTRAINT "SkillEvidence_candidateSkillId_fkey"
FOREIGN KEY ("candidateSkillId") REFERENCES "CandidateSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceEpisode"
ADD CONSTRAINT "ExperienceEpisode_candidateProfileId_fkey"
FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewStory"
ADD CONSTRAINT "InterviewStory_candidateProfileId_fkey"
FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

```

### File: `prisma/migrations/migration_lock.toml`

```toml
provider = "postgresql"

```

### File: `prisma/schema.prisma`

```prisma
// Prisma Schema — Job Hunter OS
// Production-grade schema for Meital's personal job search operating system

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth ───────────────────────────────────────────────────────────────────

model User {
  id               String           @id @default(cuid())
  email            String           @unique
  name             String?
  passwordHash     String
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  candidateProfile CandidateProfile?
  candidateIntake  CandidateIntake?
}

// ─── Candidate Profile ───────────────────────────────────────────────────────

model CandidateProfile {
  id                   String    @id @default(cuid())
  userId               String    @unique
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Identity
  fullName             String
  headline             String?
  bio                  String?
  location             String    @default("Israel")
  linkedinUrl          String?
  githubUrl            String?
  portfolioUrl         String?
  languages            String[]  @default(["Hebrew", "English"])

  // Compensation targets
  targetSalaryMin      Int?
  targetSalaryIdeal    Int?
  targetSalaryCurrency String    @default("ILS")

  // Search preferences (stored as JSON for flexibility)
  workModePrefs        Json      @default("[\"hybrid\",\"onsite\",\"remote\"]")
  targetCities         Json      @default("[\"Tel Aviv\",\"Herzliya\",\"Haifa\",\"Ramat Gan\",\"Ra'anana\",\"Remote\"]")
  targetCompanyStages  Json      @default("[\"startup\",\"growth\",\"public\",\"enterprise\"]")
  targetIndustries     Json      @default("[]")
  noGoCompanies        String[]  @default([])
  rolePreferences      Json      @default("[\"Data Scientist\",\"AI Engineer\",\"AI Analyst\",\"Data Analyst\",\"Analytics Engineer\",\"ML Engineer\"]")

  // Scoring weights (user-configurable, 0–100 each)
  weightSpeed          Int       @default(25)   // speed to interview
  weightFit            Int       @default(30)   // role fit
  weightSalary         Int       @default(25)   // compensation upside
  weightUpside         Int       @default(20)   // career upside

  // Narrative & outreach preferences
  outreachVoice        String?   // e.g. "concise and direct", "warm and personal"
  uniqueAngles         String[]  @default([])   // differentiating narrative angles

  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relations
  skills               CandidateSkill[]
  projects             Project[]
  experienceEpisodes   ExperienceEpisode[]
  interviewStories     InterviewStory[]
  applications         Application[]
  resumeVersions       ResumeVersion[]
  experiments          Experiment[]
}

model CandidateIntake {
  id                           String                @id @default(cuid())
  userId                       String                @unique
  user                         User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  status                       CandidateIntakeStatus @default(DRAFT)
  targetTitle                  String?
  fallbackTitles               String[]              @default([])
  minimumSalaryIls             Int?
  idealSalaryMinIls            Int?
  idealSalaryMaxIls            Int?
  acceptableCities             String[]              @default([])
  conditionalCities            String[]              @default([])
  unacceptableCities           String[]              @default([])
  workModes                    WorkMode[]            @default([HYBRID, ONSITE, REMOTE])
  roleSeniorityTarget          String?
  constraintsNotes             String?
  topTargetCompanies           String[]              @default([])
  preferredStages              String[]              @default([])
  preferredDomains             String[]              @default([])
  avoidDomains                 String[]              @default([])
  preferredTeamTypes           String[]              @default([])
  avoidIndustries              String[]              @default([])
  strongestTopics              String[]              @default([])
  weakestTopics                String[]              @default([])
  stressfulInterviewTypes      String[]              @default([])
  missingMaterials             String[]              @default([])
  confidenceRecruiterInterview Int?
  confidenceTechnicalInterview Int?
  confidenceCaseInterview      Int?
  confidenceBehavioralInterview Int?
  hebrewCommunicationConfidence Int?
  englishCommunicationConfidence Int?
  writingConfidence            Int?
  liveInterviewConfidence      Int?
  preferredOutreachTone        String?
  preferredPositioningStyle    String?
  outreachAvoidances           String[]              @default([])
  completedAt                  DateTime?
  createdAt                    DateTime              @default(now())
  updatedAt                    DateTime              @updatedAt
}

enum CandidateIntakeStatus {
  DRAFT
  COMPLETED
}

// ─── Skills ──────────────────────────────────────────────────────────────────

model Skill {
  id             String           @id @default(cuid())
  name           String           @unique
  canonicalName  String
  category       SkillCategory
  createdAt      DateTime         @default(now())
  candidateSkills CandidateSkill[]
}

enum SkillCategory {
  PROGRAMMING_LANGUAGE
  ML_FRAMEWORK
  DATA_TOOL
  BI_TOOL
  CLOUD
  DATABASE
  MOBILE
  OTHER
}

model CandidateSkill {
  id                 String           @id @default(cuid())
  candidateProfileId String
  candidateProfile   CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  skillId            String
  skill              Skill            @relation(fields: [skillId], references: [id])
  proficiency        ProficiencyLevel @default(INTERMEDIATE)
  lastUsedAt         DateTime?
  interviewConfidence Int?
  productionConfidence Int?
  selfReportedOnly   Boolean          @default(true)
  profileNotes       String?
  evidenceNote       String?
  priority           Int              @default(50)  // 0–100, higher = more prominent on CV
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
  evidenceRecords    SkillEvidence[]

  @@unique([candidateProfileId, skillId])
}

enum ProficiencyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

model SkillEvidence {
  id               String       @id @default(cuid())
  candidateSkillId String
  candidateSkill   CandidateSkill @relation(fields: [candidateSkillId], references: [id], onDelete: Cascade)
  evidenceType     EvidenceType
  title            String
  description      String?
  outcome          String?
  evidenceDate     DateTime?
  credibility      Int?
  url              String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

enum EvidenceType {
  PROJECT
  COURSE
  INTERVIEW
  WORK_EXPERIENCE
  EXERCISE
  CERTIFICATION
  OTHER
}

// ─── Projects ────────────────────────────────────────────────────────────────

model Project {
  id                 String           @id @default(cuid())
  candidateProfileId String
  candidateProfile   CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)

  name               String
  shortSummary       String
  longDescription    String?
  impactMetrics      Json             @default("[]")  // [{metric, value, context}]
  techTags           String[]         @default([])
  roleTags           String[]         @default([])    // which role families this is relevant for
  bulletBank         Json             @default("[]")  // [{text, roleTag, strength}]
  interviewStory     String?          // STAR format story
  confidenceLevel    Int              @default(70)    // 0–100
  evidenceLinks      String[]         @default([])
  displayOrder       Int              @default(0)

  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}

model ExperienceEpisode {
  id                  String           @id @default(cuid())
  candidateProfileId  String
  candidateProfile    CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  title               String
  organization        String?
  context             String?
  technicalOwnership  String?
  collaborators       String[]         @default([])
  dataScale           String?
  toolingStack        String[]         @default([])
  tradeoffs           String[]         @default([])
  impact              String?
  biggestChallenge    String?
  resolution          String?
  interviewConfidence Int?
  externallyUsable    Boolean          @default(true)
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
}

model InterviewStory {
  id                 String             @id @default(cuid())
  candidateProfileId String
  candidateProfile   CandidateProfile   @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  type               InterviewStoryType @default(PROJECT)
  title              String
  situation          String
  task               String
  action             String
  result             String
  topics             String[]           @default([])
  confidence         Int?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

enum InterviewStoryType {
  BEHAVIORAL
  TECHNICAL
  LEADERSHIP
  FAILURE
  PROJECT
  CONFLICT
  OWNERSHIP
}

// ─── Companies ───────────────────────────────────────────────────────────────

model Company {
  id             String        @id @default(cuid())
  name           String        @unique
  website        String?
  careersUrl     String?
  hqLocation     String?
  israelPresence Boolean       @default(true)
  industry       String?
  stage          CompanyStage?
  notes          String?
  sourceData     Json          @default("{}")  // raw data from public sources
  isWatchlisted  Boolean       @default(false)

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  jobs           Job[]
  applications   Application[]
  contacts       OutreachContact[]
}

enum CompanyStage {
  SEED
  SERIES_A
  SERIES_B
  SERIES_C_PLUS
  GROWTH
  PUBLIC
  ENTERPRISE
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

model Job {
  id                  String      @id @default(cuid())
  companyId           String?
  company             Company?    @relation(fields: [companyId], references: [id])

  // Core job data
  title               String
  normalizedTitle     String?
  rawDescription      String
  normalizedDescription String?

  // Source info
  source              JobSource
  sourceUrl           String?
  atsPlatform         String?     // greenhouse, lever, comeet, etc
  externalId          String?     // ATS-native job ID for dedup

  // Location & logistics
  location            String?
  workMode            WorkMode?
  employmentType      EmploymentType?
  salaryRangeMin      Int?
  salaryRangeMax      Int?
  salaryCurrency      String?

  // Extracted structured data
  keywords            String[]    @default([])
  requiredSkills      String[]    @default([])
  niceToHaveSkills    String[]    @default([])
  seniority           String?

  // Status
  isActive            Boolean     @default(true)
  postedAt            DateTime?
  expiresAt           DateTime?

  // Hidden opportunity metadata
  isHiddenOpportunity Boolean     @default(false)
  hiddenOpportunitySignal String?

  // Dedup hash (company + normalized title + location)
  dedupHash           String?     @unique

  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  scores              JobScore[]
  applications        Application[]
  resumeVersions      ResumeVersion[]
  outreachMessages    OutreachMessage[]
}

enum JobSource {
  MANUAL_PASTE
  MANUAL_URL
  GREENHOUSE
  LEVER
  COMEET
  COMPANY_CAREERS
  USER_UPLOAD
  HIDDEN_LEAD
  REFERRAL
}

enum WorkMode {
  ONSITE
  HYBRID
  REMOTE
  FLEXIBLE
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
}

// ─── Job Scoring ─────────────────────────────────────────────────────────────

model JobScore {
  id                 String           @id @default(cuid())
  jobId              String
  job                Job              @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidateProfileId String

  // Composite score
  totalScore         Float            // 0–100
  recommendation     ScoreRecommendation

  // Deterministic sub-scores (each 0–100 with weight)
  roleFamilyScore    Float
  mustHaveSkillScore Float
  niceToHaveScore    Float
  seniorityScore     Float
  projectScore       Float
  domainScore        Float
  locationScore      Float
  salaryScore        Float

  // Meta
  confidence         Float            // 0–1 how confident the scoring is
  breakdown          Json             // full scored breakdown for UI display
  strengths          String[]         @default([])
  risks              String[]         @default([])
  llmExplanation     String?          // LLM-generated narrative explanation
  llmRawResponse     String?          // raw model response for debugging

  scoredAt           DateTime         @default(now())

  @@unique([jobId, candidateProfileId])
}

enum ScoreRecommendation {
  STRONG_APPLY
  APPLY
  STRETCH_APPLY
  LOW_PRIORITY
  SKIP
}

// ─── Resume Versions ─────────────────────────────────────────────────────────

model ResumeVersion {
  id                   String           @id @default(cuid())
  candidateProfileId   String
  candidateProfile     CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  jobId                String?
  job                  Job?             @relation(fields: [jobId], references: [id])

  name                 String           // e.g. "CV_Voyantis_DataScientist_v1"
  roleFamily           String
  language             String           @default("en")
  templateName         String           @default("standard")

  // Generated content
  summaryText          String
  selectedProjectIds   String[]         @default([])
  selectedSkillIds     String[]         @default([])
  insertedKeywords     String[]         @default([])
  bulletVariants       Json             @default("[]")  // final bullet set used
  generationPrompt     String?          // system prompt used (for auditability)
  generationMetadata   Json             @default("{}")

  // Quality & status
  qualityScore         Float?           // 0–100 automated quality check
  qualityIssues        String[]         @default([])
  status               ResumeStatus     @default(DRAFT)

  // Files
  fileUrl              String?
  fileFormat           String?          // pdf, docx, txt

  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  applications         Application[]
}

enum ResumeStatus {
  DRAFT
  REVIEWED
  APPROVED
  USED
  ARCHIVED
}

// ─── Outreach ─────────────────────────────────────────────────────────────────

model OutreachContact {
  id              String          @id @default(cuid())
  companyId       String?
  company         Company?        @relation(fields: [companyId], references: [id])

  fullName        String
  source          String          // how we found this contact (user-provided, public page, etc)
  sourceUrl       String?
  title           String?
  contactType     ContactType
  relationshipType RelationshipType @default(UNKNOWN)
  priorityScore   Int             @default(50)  // 0–100
  confidence      Float           @default(0.7)
  notes           String?
  linkedinUrl     String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  messages        OutreachMessage[]
}

enum ContactType {
  RECRUITER
  HIRING_MANAGER
  TEAM_MEMBER
  ALUMNI
  FOUNDER
  ANALYTICS_LEAD
  ENGINEERING_MANAGER
  TA_PARTNER
  OTHER
}

enum RelationshipType {
  FIRST_DEGREE
  SECOND_DEGREE
  THIRD_DEGREE
  ALUMNI
  COLD
  UNKNOWN
}

model OutreachMessage {
  id              String          @id @default(cuid())
  contactId       String
  contact         OutreachContact @relation(fields: [contactId], references: [id], onDelete: Cascade)
  jobId           String?
  job             Job?            @relation(fields: [jobId], references: [id])

  messageType     MessageType
  channel         MessageChannel
  draftText       String
  status          MessageStatus   @default(DRAFT)
  tone            String?
  characterCount  Int?
  metadata        Json            @default("{}")

  sentAt          DateTime?
  repliedAt       DateTime?
  replyText       String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum MessageType {
  CONNECTION_REQUEST
  REFERRAL_ASK
  DIRECT_RECRUITER_INTRO
  POST_APPLICATION_NUDGE
  INTERVIEW_THANK_YOU
  REACTIVATION
  LINKEDIN_DM
}

enum MessageChannel {
  LINKEDIN
  EMAIL
  WHATSAPP
  OTHER
}

enum MessageStatus {
  DRAFT
  REVIEWED
  SENT
  REPLIED
  NO_RESPONSE
  DECLINED
}

// ─── Applications CRM ─────────────────────────────────────────────────────────

model Application {
  id                 String           @id @default(cuid())
  candidateProfileId String
  candidateProfile   CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)
  companyId          String?
  company            Company?         @relation(fields: [companyId], references: [id])
  jobId              String?
  job                Job?             @relation(fields: [jobId], references: [id])
  resumeVersionId    String?
  resumeVersion      ResumeVersion?   @relation(fields: [resumeVersionId], references: [id])

  // Core tracking
  status             ApplicationStatus @default(WISHLIST)
  priority           Priority          @default(MEDIUM)

  // Source
  source             String?
  sourceUrl          String?

  // Timing
  appliedAt          DateTime?
  followUpDueAt      DateTime?
  nextActionAt       DateTime?
  nextAction         String?

  // Compensation
  salaryNotes        String?
  salaryExpected     Int?

  // Notes and context
  notes              String?
  recruiterName      String?
  recruiterEmail     String?

  // Outcome
  rejectionReason    String?
  offerAmount        Int?

  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  stageEvents        ApplicationStageEvent[]
}

enum ApplicationStatus {
  WISHLIST
  APPLIED
  RECRUITER_SCREEN
  TECHNICAL_INTERVIEW
  CASE_STUDY
  FINAL_INTERVIEW
  OFFER
  ACCEPTED
  REJECTED
  WITHDRAWN
  ON_HOLD
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model ApplicationStageEvent {
  id            String      @id @default(cuid())
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  stageName     String
  eventAt       DateTime    @default(now())
  notes         String?
  metadata      Json        @default("{}")
}

// ─── Source Ingestion Runs ───────────────────────────────────────────────────

model IngestionRun {
  id             String          @id @default(cuid())
  sourceName     String
  status         IngestionStatus
  recordsFound   Int             @default(0)
  recordsCreated Int             @default(0)
  recordsUpdated Int             @default(0)
  recordsSkipped Int             @default(0)
  errorCount     Int             @default(0)
  startedAt      DateTime        @default(now())
  completedAt    DateTime?
  logs           Json            @default("[]")
}

enum IngestionStatus {
  RUNNING
  COMPLETED
  FAILED
  PARTIAL
}

// ─── Experiments / Learning ──────────────────────────────────────────────────

model Experiment {
  id                 String           @id @default(cuid())
  candidateProfileId String
  candidateProfile   CandidateProfile @relation(fields: [candidateProfileId], references: [id], onDelete: Cascade)

  experimentType     String           // e.g. "resume_summary_variant", "outreach_tone"
  hypothesis         String
  variantA           Json
  variantB           Json
  status             ExperimentStatus @default(ACTIVE)
  result             Json?
  conclusion         String?

  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}

enum ExperimentStatus {
  ACTIVE
  CONCLUDED
  PAUSED
}

```

### File: `prisma/seed.js`

```js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env" });

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(
    process.env.SEED_PASSWORD || "changeme123",
    12
  );

  const user = await db.user.upsert({
    where: { email: "meital@jobhunter.local" },
    update: {},
    create: {
      email: "meital@jobhunter.local",
      name: "Meital Abadi",
      passwordHash,
    },
  });

  const profile = await db.candidateProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: "Meital Abadi",
      headline:
        "Data Scientist & AI Engineer | Technion B.Sc. | NLP · ML · LLM Pipelines",
      bio: "Recent Technion Data Science graduate focused on end-to-end ML and NLP systems.",
      location: "Israel",
      targetSalaryMin: 18000,
      targetSalaryIdeal: 25000,
      targetSalaryCurrency: "ILS",
      workModePrefs: ["hybrid", "onsite"],
      targetCities: [
        "Tel Aviv",
        "Herzliya",
        "Haifa",
        "Ramat Gan",
        "Ra'anana",
        "Remote",
      ],
      rolePreferences: [
        "Data Scientist",
        "AI Engineer",
        "AI Analyst",
        "Data Analyst",
        "Analytics Engineer",
        "ML Engineer",
      ],
      weightSpeed: 25,
      weightFit: 30,
      weightSalary: 25,
      weightUpside: 20,
      outreachVoice: "concise, direct, confident — mention Technion naturally",
      uniqueAngles: [
        "End-to-end NLP pipeline with LLM extraction and BI reporting",
        "Product mindset from building a Flutter/Firebase marketplace app",
        "Business intelligence ownership in a real B2B operations environment",
      ],
    },
  });

  const skills = [
    { name: "Python", canonicalName: "python", category: "PROGRAMMING_LANGUAGE", priority: 95 },
    { name: "SQL", canonicalName: "sql", category: "DATABASE", priority: 90 },
    { name: "Scikit-learn", canonicalName: "scikit-learn", category: "ML_FRAMEWORK", priority: 90 },
    { name: "NLP", canonicalName: "nlp", category: "ML_FRAMEWORK", priority: 92 },
    { name: "LLM Pipelines", canonicalName: "llm", category: "ML_FRAMEWORK", priority: 92 },
    { name: "Prompt Engineering", canonicalName: "prompt engineering", category: "ML_FRAMEWORK", priority: 88 },
    { name: "Tableau", canonicalName: "tableau", category: "BI_TOOL", priority: 80 },
    { name: "Power BI", canonicalName: "power bi", category: "BI_TOOL", priority: 78 },
    { name: "Flutter", canonicalName: "flutter", category: "MOBILE", priority: 70 },
    { name: "Firebase", canonicalName: "firebase", category: "CLOUD", priority: 70 },
    { name: "Airtable", canonicalName: "airtable", category: "OTHER", priority: 65 },
  ];

  for (const item of skills) {
    const skill = await db.skill.upsert({
      where: { name: item.name },
      update: {},
      create: {
        name: item.name,
        canonicalName: item.canonicalName,
        category: item.category,
      },
    });

    await db.candidateSkill.upsert({
      where: {
        candidateProfileId_skillId: {
          candidateProfileId: profile.id,
          skillId: skill.id,
        },
      },
      update: {},
      create: {
        candidateProfileId: profile.id,
        skillId: skill.id,
        proficiency: item.priority >= 85 ? "ADVANCED" : "INTERMEDIATE",
        priority: item.priority,
      },
    });
  }

  const projects = [
    {
      name: "CIC Protest Analysis Pipeline",
      shortSummary:
        "End-to-end NLP pipeline: scraping, LLM extraction, and stakeholder BI reporting.",
      longDescription:
        "Processed large article sets with prompt-engineered extraction flows and delivered BI outputs.",
      techTags: ["Python", "NLP", "LLM", "web scraping", "prompt engineering", "BI"],
      roleTags: ["Data Scientist", "AI Engineer", "ML Engineer"],
      bulletBank: [],
      displayOrder: 1,
    },
    {
      name: "Israeli Line BI System",
      shortSummary:
        "Built Airtable-based business intelligence system across customers, orders, and invoicing.",
      longDescription:
        "Designed operations workflows and analytics views for a live B2B company process.",
      techTags: ["Airtable", "BI", "analytics", "operations"],
      roleTags: ["Data Analyst", "AI Analyst", "Analytics Engineer"],
      bulletBank: [],
      displayOrder: 2,
    },
    {
      name: "BALI Marketplace App",
      shortSummary:
        "Built Flutter/Firebase marketplace app with real-time features and push notifications.",
      longDescription:
        "Implemented authentication, listings, seller profile logic, and product UX flows.",
      techTags: ["Flutter", "Firebase", "mobile", "product"],
      roleTags: ["AI Engineer", "Data Scientist"],
      bulletBank: [],
      displayOrder: 3,
    },
  ];

  for (const project of projects) {
    const exists = await db.project.findFirst({
      where: { candidateProfileId: profile.id, name: project.name },
    });
    if (exists) continue;

    await db.project.create({
      data: {
        candidateProfileId: profile.id,
        ...project,
        impactMetrics: [],
        evidenceLinks: [],
      },
    });
  }

  console.log("Seed complete");
  console.log("Login: meital@jobhunter.local");
  console.log(`Password: ${process.env.SEED_PASSWORD || "changeme123"}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

```

### File: `prisma/seed.ts`

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash(
    process.env.SEED_PASSWORD || "changeme123",
    12
  );

  const user = await db.user.upsert({
    where: { email: "meital@jobhunter.local" },
    update: {},
    create: {
      email: "meital@jobhunter.local",
      name: "Meital Abadi",
      passwordHash,
    },
  });

  console.log("✓ User created:", user.email);

  const profile = await db.candidateProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: "Meital Abadi",
      headline: "Data Scientist & AI Engineer | Technion B.Sc. | NLP · ML · LLM Pipelines",
      bio: "Recent Technion Data Science graduate with hands-on experience building end-to-end NLP pipelines, ML models, and business intelligence systems.",
      location: "Israel",
      targetSalaryMin: 18000,
      targetSalaryIdeal: 25000,
      targetSalaryCurrency: "ILS",
      workModePrefs: ["hybrid", "onsite"],
      targetCities: ["Tel Aviv", "Herzliya", "Haifa", "Ramat Gan", "Ra'anana", "Remote"],
      rolePreferences: ["Data Scientist", "AI Engineer", "AI Analyst", "Data Analyst", "Analytics Engineer", "ML Engineer"],
      weightSpeed: 25,
      weightFit: 30,
      weightSalary: 25,
      weightUpside: 20,
      outreachVoice: "concise, direct, confident — always mention Technion",
      uniqueAngles: [
        "End-to-end NLP pipeline (CIC): web scraping → LLM extraction → stakeholder BI reporting",
        "Product + data mindset from building BALI marketplace app (Flutter/Firebase)",
        "Business systems ownership at Israeli Line — designed complete Airtable BI infrastructure",
      ],
      noGoCompanies: [],
    },
  });

  console.log("✓ Profile created:", profile.id);

  // Seed skills
  const SKILLS = [
    { name: "Python",            canonical: "python",           category: "PROGRAMMING_LANGUAGE" as const, priority: 95 },
    { name: "SQL",               canonical: "sql",              category: "DATABASE"              as const, priority: 90 },
    { name: "Pandas",            canonical: "pandas",           category: "ML_FRAMEWORK"          as const, priority: 88 },
    { name: "NumPy",             canonical: "numpy",            category: "ML_FRAMEWORK"          as const, priority: 85 },
    { name: "Scikit-learn",      canonical: "scikit-learn",     category: "ML_FRAMEWORK"          as const, priority: 90 },
    { name: "TensorFlow",        canonical: "tensorflow",       category: "ML_FRAMEWORK"          as const, priority: 75 },
    { name: "PyTorch",           canonical: "pytorch",          category: "ML_FRAMEWORK"          as const, priority: 78 },
    { name: "NLP",               canonical: "nlp",              category: "ML_FRAMEWORK"          as const, priority: 92 },
    { name: "LLM Pipelines",     canonical: "llm",              category: "ML_FRAMEWORK"          as const, priority: 92 },
    { name: "Prompt Engineering",canonical: "prompt engineering",category: "ML_FRAMEWORK"         as const, priority: 88 },
    { name: "Tableau",           canonical: "tableau",          category: "BI_TOOL"               as const, priority: 80 },
    { name: "Power BI",          canonical: "power bi",         category: "BI_TOOL"               as const, priority: 78 },
    { name: "Plotly",            canonical: "plotly",           category: "BI_TOOL"               as const, priority: 75 },
    { name: "Dash",              canonical: "dash",             category: "BI_TOOL"               as const, priority: 72 },
    { name: "Flutter",           canonical: "flutter",          category: "MOBILE"                as const, priority: 70 },
    { name: "Firebase",          canonical: "firebase",         category: "CLOUD"                 as const, priority: 70 },
    { name: "Airtable",          canonical: "airtable",         category: "OTHER"                 as const, priority: 65 },
  ];

  for (const s of SKILLS) {
    const skill = await db.skill.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, canonicalName: s.canonical, category: s.category },
    });
    await db.candidateSkill.upsert({
      where: { candidateProfileId_skillId: { candidateProfileId: profile.id, skillId: skill.id } },
      update: {},
      create: {
        candidateProfileId: profile.id,
        skillId: skill.id,
        proficiency: s.priority >= 85 ? "ADVANCED" : "INTERMEDIATE",
        priority: s.priority,
      },
    });
  }
  console.log("✓ Skills seeded:", SKILLS.length);

  // Seed projects
  const PROJECTS = [
    {
      name: "CIC Protest Analysis Pipeline",
      shortSummary: "End-to-end NLP pipeline: web scraping → large-scale article processing → LLM feature extraction → BI reporting for stakeholders.",
      longDescription: "Built a complete data pipeline for the CIC research project. Scraped thousands of news articles, processed them at scale using LLM-based feature extraction with custom prompt engineering, implemented quality control and reprocessing flows, and delivered BI dashboards for stakeholder reporting.",
      techTags: ["Python", "NLP", "LLM", "web scraping", "prompt engineering", "data pipeline", "machine learning", "BI"],
      roleTags: ["Data Scientist", "AI Engineer", "ML Engineer"],
      bulletBank: [
        { text: "Built end-to-end NLP pipeline processing 10,000+ news articles using custom LLM extraction with iterative prompt engineering", roleTag: "AI Engineer", strength: 95 },
        { text: "Designed quality control and reprocessing flows ensuring >95% extraction accuracy across diverse article formats", roleTag: "Data Scientist", strength: 90 },
        { text: "Delivered stakeholder BI dashboards coordinating data exports and visualization for research team", roleTag: "AI Analyst", strength: 85 },
      ],
      confidence: 90,
      displayOrder: 1,
    },
    {
      name: "Israeli Line BI System",
      shortSummary: "Complete Airtable-based business management system for B2B company: customers, orders, invoices, suppliers — interconnected with dashboards.",
      longDescription: "Designed and built a full business operations system for Israeli Line, a B2B signage and display company. Includes customer management, order tracking, invoice automation, supplier management, and connected dashboards with automated workflows.",
      techTags: ["Airtable", "BI", "analytics", "business intelligence", "operations", "workflow automation", "dashboards"],
      roleTags: ["Data Analyst", "AI Analyst", "Analytics Engineer"],
      bulletBank: [
        { text: "Architected complete business intelligence system managing customers, orders, and invoices for B2B operations", roleTag: "Data Analyst", strength: 85 },
        { text: "Built automated workflow triggers reducing manual data entry by connecting supplier, order, and finance modules", roleTag: "Analytics Engineer", strength: 80 },
      ],
      confidence: 85,
      displayOrder: 2,
    },
    {
      name: "BALI Marketplace App",
      shortSummary: "Full-stack Flutter/Firebase marketplace app with push notifications, real-time features, seller profiles, and boost mechanics.",
      longDescription: "Built BALI, a mobile marketplace application from scratch. Implemented Flutter UI, Firebase Firestore for real-time data, Cloud Messaging for push notifications, seller profile system, listing boost mechanics, and complete authentication flow.",
      techTags: ["Flutter", "Firebase", "mobile", "Firestore", "Cloud Messaging", "app development", "product"],
      roleTags: ["Data Scientist", "AI Engineer"],
      bulletBank: [
        { text: "Built production mobile marketplace app (Flutter/Firebase) with real-time listings, push notifications, and seller analytics", roleTag: "Data Scientist", strength: 75 },
      ],
      confidence: 80,
      displayOrder: 3,
    },
  ];

  for (const p of PROJECTS) {
    await db.project.create({
      data: { candidateProfileId: profile.id, ...p, impactMetrics: [], evidenceLinks: [] },
    });
  }
  console.log("✓ Projects seeded:", PROJECTS.length);

  console.log("\n✅ Seed complete!");
  console.log("   Login: meital@jobhunter.local");
  console.log("   Password:", process.env.SEED_PASSWORD || "changeme123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

```

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

### File: `types/next-auth.d.ts`

```ts
// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
  }
}

```
