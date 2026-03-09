// lib/scoring/action-recommendation.ts
// Decision layer on top of the deterministic scoring engine
// Determines action priority and detects hard blockers
// Uses deterministic logic first, LLM only for short narrative summaries

import { Job, CandidateProfile, CandidateSkill, Skill, Project } from "@prisma/client";
import type { ActionDecision, Blocker, ActionRecommendationType } from "../schemas";
import type { ScoringResult } from "./engine";

type CandidateWithRelations = CandidateProfile & {
  skills: (CandidateSkill & { skill: Skill })[];
  projects: Project[];
};

// ─── Blocker detection ───────────────────────────────────────────────────────

function detectLocationBlocker(job: Job, candidate: CandidateWithRelations): Blocker | null {
  const jobLocation = (job.location || "").toLowerCase();
  if (!jobLocation || jobLocation === "remote") return null;

  const targetCities = (candidate.targetCities as string[]).map((c) => c.toLowerCase());
  const workModes = (candidate.workModePrefs as string[]).map((m) => m.toLowerCase());

  // If job is onsite-only and candidate doesn't want onsite
  if (job.workMode === "ONSITE" && !workModes.includes("onsite")) {
    return {
      type: "LOCATION",
      description: `Job requires onsite in ${job.location} but you prefer ${workModes.join("/")}`,
      severity: "HARD",
    };
  }

  // If location is clearly outside Israel and candidate targets Israel
  const outsideIsrael = ["new york", "london", "berlin", "san francisco", "usa", "uk", "us",
    "united states", "united kingdom", "germany", "france", "singapore", "india"];
  const isOutside = outsideIsrael.some((loc) => jobLocation.includes(loc));
  const targetsIsrael = targetCities.some((c) =>
    ["tel aviv", "herzliya", "haifa", "ramat gan", "ra'anana", "remote", "israel"].includes(c)
  );

  if (isOutside && targetsIsrael && !workModes.includes("remote")) {
    return {
      type: "LOCATION",
      description: `Job is located in ${job.location} — outside your target geography`,
      severity: "HARD",
    };
  }

  return null;
}

function detectLanguageBlocker(job: Job, candidate: CandidateWithRelations): Blocker | null {
  const desc = job.rawDescription.toLowerCase();
  const candidateLanguages = (candidate.languages || ["hebrew", "english"]).map((l) => l.toLowerCase());

  // Check for mandatory language requirements the candidate doesn't have
  const languageRequirements = [
    { lang: "german", pattern: /\b(?:german|deutsch)\b.*(?:required|must|mandatory|fluent)/i },
    { lang: "french", pattern: /\b(?:french|français)\b.*(?:required|must|mandatory|fluent)/i },
    { lang: "spanish", pattern: /\b(?:spanish|español)\b.*(?:required|must|mandatory|fluent)/i },
    { lang: "chinese", pattern: /\b(?:chinese|mandarin)\b.*(?:required|must|mandatory|fluent)/i },
    { lang: "japanese", pattern: /\b(?:japanese)\b.*(?:required|must|mandatory|fluent)/i },
    { lang: "arabic", pattern: /\b(?:arabic|ערבית)\b.*(?:required|must|mandatory|fluent)/i },
  ];

  for (const { lang, pattern } of languageRequirements) {
    if (pattern.test(desc) && !candidateLanguages.includes(lang)) {
      return {
        type: "LANGUAGE",
        description: `Mandatory ${lang} language requirement — you don't list it`,
        severity: "HARD",
      };
    }
  }

  return null;
}

function detectExperienceBlocker(job: Job): Blocker | null {
  const desc = job.rawDescription.toLowerCase();

  // Extract years of experience requirements
  const yearsPatterns = [
    /(\d+)\+?\s*(?:years?|yr|yrs)\s*(?:of\s*)?(?:experience|exp)/i,
    /(?:minimum|at least|min)\s*(\d+)\s*(?:years?|yr|yrs)/i,
    /(\d+)\s*(?:שנות|שנים)\s*(?:ניסיון)/i,
  ];

  for (const pattern of yearsPatterns) {
    const match = desc.match(pattern);
    if (match) {
      const years = parseInt(match[1], 10);
      // Meital is a recent grad — 5+ years is a hard blocker, 3-4 is soft
      if (years >= 7) {
        return {
          type: "EXPERIENCE",
          description: `Requires ${years}+ years of experience — far beyond recent graduate range`,
          severity: "HARD",
        };
      }
      if (years >= 5) {
        return {
          type: "EXPERIENCE",
          description: `Requires ${years}+ years — significant stretch for a recent graduate`,
          severity: "SOFT",
        };
      }
    }
  }

  // Seniority level check
  const seniority = (job.seniority || "").toUpperCase();
  if (seniority === "PRINCIPAL" || seniority === "LEAD") {
    return {
      type: "EXPERIENCE",
      description: `${seniority}-level role — likely requires extensive experience`,
      severity: "HARD",
    };
  }

  return null;
}

function detectMandatorySkillBlocker(job: Job, candidate: CandidateWithRelations): Blocker | null {
  const requiredSkills = job.requiredSkills || [];
  if (requiredSkills.length === 0) return null;

  const candidateSkillNames = candidate.skills.map((s) => s.skill.canonicalName.toLowerCase());

  // Hard-to-learn mandatory tools that you clearly don't have
  const hardMandatoryTools = [
    "salesforce", "sap", "java", "c++", "c#", ".net", "ruby", "rust", "go", "golang",
    "swift", "kotlin", "objective-c", "scala", "haskell", "erlang", "cobol",
    "embedded", "fpga", "verilog", "assembly",
  ];

  const hardMissing = requiredSkills.filter((skill) => {
    const lower = skill.toLowerCase();
    const isMandatoryHard = hardMandatoryTools.some((t) => lower.includes(t));
    const candidateHas = candidateSkillNames.some((cs) => cs.includes(lower) || lower.includes(cs));
    return isMandatoryHard && !candidateHas;
  });

  if (hardMissing.length >= 2) {
    return {
      type: "MANDATORY_SKILL",
      description: `Missing mandatory skills you cannot credibly claim: ${hardMissing.join(", ")}`,
      severity: "HARD",
    };
  }

  return null;
}

function detectSalaryBlocker(job: Job, candidate: CandidateWithRelations): Blocker | null {
  const salaryMax = job.salaryRangeMax;
  const targetMin = candidate.targetSalaryMin;

  if (!salaryMax || !targetMin) return null;

  // Same currency assumption
  if (salaryMax < targetMin * 0.7) {
    return {
      type: "SALARY",
      description: `Max salary ${salaryMax} is significantly below your minimum ${targetMin}`,
      severity: "HARD",
    };
  }

  if (salaryMax < targetMin) {
    return {
      type: "SALARY",
      description: `Max salary ${salaryMax} is below your stated minimum ${targetMin}`,
      severity: "SOFT",
    };
  }

  return null;
}

// ─── Action recommendation logic ─────────────────────────────────────────────

function determineAction(
  totalScore: number,
  blockers: Blocker[],
  _scoringResult: ScoringResult
): ActionRecommendationType {
  const hardBlockers = blockers.filter((b) => b.severity === "HARD");
  const softBlockers = blockers.filter((b) => b.severity === "SOFT");

  // Hard blockers present → only skip if truly impossible
  if (hardBlockers.length >= 2) return "SKIP_ONLY_IF_CLEAR_BLOCKER";
  if (hardBlockers.length === 1 && totalScore < 50) return "SKIP_ONLY_IF_CLEAR_BLOCKER";

  // High score path
  if (totalScore >= 75) {
    if (hardBlockers.length === 0) return "APPLY_NOW";
    return "APPLY_THIS_WEEK"; // High score but has one hard blocker - still worth trying
  }

  if (totalScore >= 60) {
    if (hardBlockers.length === 0 && softBlockers.length <= 1) return "APPLY_THIS_WEEK";
    return "STRETCH_APPLY";
  }

  if (totalScore >= 45) {
    if (hardBlockers.length === 0) return "STRETCH_APPLY";
    return "OPTIONAL";
  }

  if (totalScore >= 30) {
    if (hardBlockers.length === 0) return "OPTIONAL";
    return "SKIP_ONLY_IF_CLEAR_BLOCKER";
  }

  return "SKIP_ONLY_IF_CLEAR_BLOCKER";
}

function buildWhyApply(scoringResult: ScoringResult, job: Job): string {
  const reasons: string[] = [];

  if (scoringResult.strengths.length > 0) {
    reasons.push(...scoringResult.strengths.slice(0, 3));
  }

  if (scoringResult.totalScore >= 70) {
    reasons.push(`Strong overall fit score: ${scoringResult.totalScore}/100`);
  }

  if (job.workMode === "REMOTE" || job.workMode === "FLEXIBLE") {
    reasons.push(`Flexible work mode: ${job.workMode}`);
  }

  return reasons.join("; ") || "Score indicates potential fit";
}

function buildWhyNotApply(blockers: Blocker[], scoringResult: ScoringResult): string {
  const reasons: string[] = [];

  for (const blocker of blockers) {
    reasons.push(blocker.description);
  }

  if (scoringResult.risks.length > 0 && reasons.length < 3) {
    reasons.push(...scoringResult.risks.slice(0, 2));
  }

  return reasons.join("; ") || "No significant concerns";
}

// ─── Main function ───────────────────────────────────────────────────────────

export function computeActionDecision(
  job: Job,
  candidate: CandidateWithRelations,
  scoringResult: ScoringResult
): ActionDecision {
  // Detect all blockers
  const blockers: Blocker[] = [];

  const locationBlocker = detectLocationBlocker(job, candidate);
  if (locationBlocker) blockers.push(locationBlocker);

  const languageBlocker = detectLanguageBlocker(job, candidate);
  if (languageBlocker) blockers.push(languageBlocker);

  const experienceBlocker = detectExperienceBlocker(job);
  if (experienceBlocker) blockers.push(experienceBlocker);

  const skillBlocker = detectMandatorySkillBlocker(job, candidate);
  if (skillBlocker) blockers.push(skillBlocker);

  const salaryBlocker = detectSalaryBlocker(job, candidate);
  if (salaryBlocker) blockers.push(salaryBlocker);

  // Determine action
  const actionRecommendation = determineAction(
    scoringResult.totalScore,
    blockers,
    scoringResult
  );

  const blockersSummary = blockers.length > 0
    ? blockers.map((b) => `[${b.severity}] ${b.type}: ${b.description}`).join(" | ")
    : "No blockers detected";

  const whyApply = buildWhyApply(scoringResult, job);
  const whyNotApply = buildWhyNotApply(blockers, scoringResult);

  return {
    actionRecommendation,
    blockers,
    blockersSummary,
    whyApply,
    whyNotApply,
  };
}

// ─── Check if job should get auto-resume ─────────────────────────────────────

export function shouldAutoGenerateResume(action: ActionRecommendationType): boolean {
  return ["APPLY_NOW", "APPLY_THIS_WEEK", "STRETCH_APPLY"].includes(action);
}
