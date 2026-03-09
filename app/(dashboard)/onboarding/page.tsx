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
