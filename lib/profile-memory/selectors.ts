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
