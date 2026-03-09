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
