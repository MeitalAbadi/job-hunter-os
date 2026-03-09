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
