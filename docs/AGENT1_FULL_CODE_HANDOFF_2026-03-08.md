# Agent 1 Full Code Handoff (Career Profile Agent)

Project path:
`/Users/meitalabadi/Desktop/Claude Learning/job-hunter`

Date:
2026-03-08

---

## 1) מה נבנה בפועל

נבנה Agent 1 כמנגנון **Candidate Memory** מלא (ולא בוט אוטונומי):

- Onboarding רב-שלבי למסך ראשון: `/onboarding`
- מסך תחזוקה שוטפת: `/profile-memory`
- שכבת API מלאה לשמירה/עדכון/שליפה של נתונים
- שכבת שירותים בשרת (`lib/profile-memory/*`) עם לוגיקה דטרמיניסטית
- הרחבת סכימת DB (Prisma) לשמירת המידע לאורך זמן
- הפרדה ברורה בין:
  - Self-reported skill level
  - Evidence-backed capability

המערכת עובדת ב-**single-user mode** (דרך `lib/auth/single-user.ts`) כדי להתאים לפרויקט המקורי שלך.

---

## 2) איך זה עובד פרקטית

### Onboarding (`/onboarding`)
- ויזרד מרובה שלבים.
- אפשר `Save Draft` בכל שלב.
- בסוף אפשר `Finalize`.
- הנתונים נשמרים בבסיס הנתונים (לא ב-client state בלבד).

### Profile Memory (`/profile-memory`)
- עדכונים נקודתיים אחרי onboarding בלי למלא הכל מחדש.
- אפשר:
  - להוסיף מיומנות
  - לעדכן רמת מיומנות
  - להוסיף Evidence (כולל course completed)
  - להוסיף Experience Episode
  - להוסיף Interview Story
  - לעדכן יעדים/constraints/readiness/communication

### Data/DB model
- `CandidateIntake`: snapshot של העדפות, יעדים, readiness, communication
- `CandidateSkill`: self report + confidence
- `SkillEvidence`: הוכחות לכל מיומנות
- `ExperienceEpisode`: פרקי ניסיון עשירים
- `InterviewStory`: סיפורי STAR מובנים לראיונות

---

## 3) Public API שנוספו

- `GET/POST/PATCH /api/onboarding`
- `GET/PATCH /api/profile-memory`
- `POST /api/profile-memory/skills`
- `PATCH /api/profile-memory/skills/[id]`
- `POST /api/profile-memory/skill-evidence`
- `POST /api/profile-memory/experience-episodes`
- `POST /api/profile-memory/interview-stories`

כל הבקשות החדשות עוברות ולידציה עם Zod.

---

## 4) קבצים שנוספו/שונו + קוד מלא

> להלן כל הקוד של Agent 1 (new + modified) כפי שקיים עכשיו בפרויקט המקורי.


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

---

## 5) סטטוס אינטגרציה שבוצע

בוצע בפועל בפרויקט המקורי:

- `npm run lint` ✅
- `npm run build` ✅
- `npm run db:push` ✅

הערה על migration:
- `prisma migrate deploy` החזיר `P3005` כי זה DB קיים שכבר רץ ללא migration history מלא (מצב נפוץ בפרויקט ותיק).
- לכן בפועל בוצע `db:push` כדי לסנכרן סכימה לקוד החדש.

---

## 6) מה לבדוק יחד עם ChatGPT בהמשך

כיווני המשך מומלצים:

1. Refinement ל-UX של ה-wizard (פחות שדות בכל מסך, יותר guidance)
2. חישוב readiness score יותר שקוף/עקבי
3. חיבור הדרגתי של ה-memory לשכבות scoring/resume/outreach
4. הוספת edit/delete מלא לכל רשומת evidence/episode/story
5. analytics על פערים בין self-report ל-evidence בפועל

