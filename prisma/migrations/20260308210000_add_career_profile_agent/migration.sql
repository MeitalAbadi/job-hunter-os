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
