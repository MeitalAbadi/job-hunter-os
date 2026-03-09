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
    "TELEGRAM",
  ]),
});

export type ManualJobIngest = z.infer<typeof ManualJobIngestSchema>;

// ─── Batch Ingestion ──────────────────────────────────────────────────────────

export const BatchIngestInputSchema = z.object({
  rawBatchText: z.string().min(20).max(500000),
  source: z.enum(["TELEGRAM", "MANUAL_PASTE"]).default("TELEGRAM"),
  channelName: z.string().max(200).optional(),
});

export type BatchIngestInput = z.infer<typeof BatchIngestInputSchema>;

export const ParsedJobCandidateSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  rawText: z.string(),
  source: z.literal("telegram").or(z.literal("manual")),
  possibleExternalLinks: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  parseWarnings: z.array(z.string()),
  dedupHash: z.string().optional(),
  isDuplicate: z.boolean().optional(),
  duplicateOfJobId: z.string().optional(),
  inBatchDuplicateIndex: z.number().optional(),
});

export type ParsedJobCandidate = z.infer<typeof ParsedJobCandidateSchema>;

export const BatchParseResultSchema = z.object({
  candidates: z.array(ParsedJobCandidateSchema),
  totalFound: z.number(),
  parseErrors: z.array(z.string()),
});

export type BatchParseResult = z.infer<typeof BatchParseResultSchema>;

// ─── Action Recommendation ───────────────────────────────────────────────────

export const ActionRecommendationSchema = z.enum([
  "APPLY_NOW",
  "APPLY_THIS_WEEK",
  "STRETCH_APPLY",
  "OPTIONAL",
  "SKIP_ONLY_IF_CLEAR_BLOCKER",
]);

export type ActionRecommendationType = z.infer<typeof ActionRecommendationSchema>;

export const BlockerSchema = z.object({
  type: z.enum(["LOCATION", "LANGUAGE", "EXPERIENCE", "MANDATORY_SKILL", "SALARY"]),
  description: z.string(),
  severity: z.enum(["HARD", "SOFT"]),
});

export type Blocker = z.infer<typeof BlockerSchema>;

export const ActionDecisionSchema = z.object({
  actionRecommendation: ActionRecommendationSchema,
  blockers: z.array(BlockerSchema),
  blockersSummary: z.string(),
  whyApply: z.string(),
  whyNotApply: z.string(),
});

export type ActionDecision = z.infer<typeof ActionDecisionSchema>;

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
  actionRecommendation: z.enum(["APPLY_NOW", "APPLY_THIS_WEEK", "STRETCH_APPLY", "OPTIONAL", "SKIP_ONLY_IF_CLEAR_BLOCKER"]).optional(),
  workMode: z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["score", "postedAt", "createdAt"]).default("score"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type JobsQuery = z.infer<typeof JobsQuerySchema>;
