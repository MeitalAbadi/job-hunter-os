import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const SINGLE_USER_EMAIL =
  process.env.SINGLE_USER_EMAIL || "meital@jobhunter.local";
export const SINGLE_USER_NAME =
  process.env.SINGLE_USER_NAME || "Meital Abadi";
export const SINGLE_USER_PASSWORD =
  process.env.SINGLE_USER_PASSWORD ||
  process.env.SEED_PASSWORD ||
  "changeme123";

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
    const passwordHash = await bcrypt.hash(SINGLE_USER_PASSWORD, 10);
    user = await db.user.create({
      data: {
        email: SINGLE_USER_EMAIL,
        name: SINGLE_USER_NAME,
        passwordHash,
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

export async function authenticateSingleUser(password: string): Promise<{
  id: string;
  email: string;
  name: string;
} | null> {
  if (!password) return null;

  const context = await getOrCreateSingleUserContext();
  const user = await db.user.findUnique({
    where: { id: context.userId },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || SINGLE_USER_NAME,
  };
}
