import { db } from "@/lib/db";

export const SINGLE_USER_EMAIL = "meital@jobhunter.local";
export const SINGLE_USER_NAME = "Meital Abadi";

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
    user = await db.user.create({
      data: {
        email: SINGLE_USER_EMAIL,
        name: SINGLE_USER_NAME,
        passwordHash: "AUTH_DISABLED_PERSONAL_MODE",
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
