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
