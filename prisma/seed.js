const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env" });

const db = new PrismaClient();

async function main() {
  const singleUserEmail =
    process.env.SINGLE_USER_EMAIL || "meital@jobhunter.local";
  const singleUserName =
    process.env.SINGLE_USER_NAME || "Meital Abadi";
  const singleUserPassword =
    process.env.SINGLE_USER_PASSWORD ||
    process.env.SEED_PASSWORD ||
    "changeme123";

  const passwordHash = await bcrypt.hash(
    singleUserPassword,
    12
  );

  const user = await db.user.upsert({
    where: { email: singleUserEmail },
    update: {
      name: singleUserName,
      passwordHash,
    },
    create: {
      email: singleUserEmail,
      name: singleUserName,
      passwordHash,
    },
  });

  const profile = await db.candidateProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: singleUserName,
      headline:
        "Data Scientist & AI Engineer | Technion B.Sc. | NLP · ML · LLM Pipelines",
      bio: "Recent Technion Data Science graduate focused on end-to-end ML and NLP systems.",
      location: "Israel",
      targetSalaryMin: 18000,
      targetSalaryIdeal: 25000,
      targetSalaryCurrency: "ILS",
      workModePrefs: ["hybrid", "onsite"],
      targetCities: [
        "Tel Aviv",
        "Herzliya",
        "Haifa",
        "Ramat Gan",
        "Ra'anana",
        "Remote",
      ],
      rolePreferences: [
        "Data Scientist",
        "AI Engineer",
        "AI Analyst",
        "Data Analyst",
        "Analytics Engineer",
        "ML Engineer",
      ],
      weightSpeed: 25,
      weightFit: 30,
      weightSalary: 25,
      weightUpside: 20,
      outreachVoice: "concise, direct, confident — mention Technion naturally",
      uniqueAngles: [
        "End-to-end NLP pipeline with LLM extraction and BI reporting",
        "Product mindset from building a Flutter/Firebase marketplace app",
        "Business intelligence ownership in a real B2B operations environment",
      ],
    },
  });

  const skills = [
    { name: "Python", canonicalName: "python", category: "PROGRAMMING_LANGUAGE", priority: 95 },
    { name: "SQL", canonicalName: "sql", category: "DATABASE", priority: 90 },
    { name: "Scikit-learn", canonicalName: "scikit-learn", category: "ML_FRAMEWORK", priority: 90 },
    { name: "NLP", canonicalName: "nlp", category: "ML_FRAMEWORK", priority: 92 },
    { name: "LLM Pipelines", canonicalName: "llm", category: "ML_FRAMEWORK", priority: 92 },
    { name: "Prompt Engineering", canonicalName: "prompt engineering", category: "ML_FRAMEWORK", priority: 88 },
    { name: "Tableau", canonicalName: "tableau", category: "BI_TOOL", priority: 80 },
    { name: "Power BI", canonicalName: "power bi", category: "BI_TOOL", priority: 78 },
    { name: "Flutter", canonicalName: "flutter", category: "MOBILE", priority: 70 },
    { name: "Firebase", canonicalName: "firebase", category: "CLOUD", priority: 70 },
    { name: "Airtable", canonicalName: "airtable", category: "OTHER", priority: 65 },
  ];

  for (const item of skills) {
    const skill = await db.skill.upsert({
      where: { name: item.name },
      update: {},
      create: {
        name: item.name,
        canonicalName: item.canonicalName,
        category: item.category,
      },
    });

    await db.candidateSkill.upsert({
      where: {
        candidateProfileId_skillId: {
          candidateProfileId: profile.id,
          skillId: skill.id,
        },
      },
      update: {},
      create: {
        candidateProfileId: profile.id,
        skillId: skill.id,
        proficiency: item.priority >= 85 ? "ADVANCED" : "INTERMEDIATE",
        priority: item.priority,
      },
    });
  }

  const projects = [
    {
      name: "CIC Protest Analysis Pipeline",
      shortSummary:
        "End-to-end NLP pipeline: scraping, LLM extraction, and stakeholder BI reporting.",
      longDescription:
        "Processed large article sets with prompt-engineered extraction flows and delivered BI outputs.",
      techTags: ["Python", "NLP", "LLM", "web scraping", "prompt engineering", "BI"],
      roleTags: ["Data Scientist", "AI Engineer", "ML Engineer"],
      bulletBank: [],
      displayOrder: 1,
    },
    {
      name: "Israeli Line BI System",
      shortSummary:
        "Built Airtable-based business intelligence system across customers, orders, and invoicing.",
      longDescription:
        "Designed operations workflows and analytics views for a live B2B company process.",
      techTags: ["Airtable", "BI", "analytics", "operations"],
      roleTags: ["Data Analyst", "AI Analyst", "Analytics Engineer"],
      bulletBank: [],
      displayOrder: 2,
    },
    {
      name: "BALI Marketplace App",
      shortSummary:
        "Built Flutter/Firebase marketplace app with real-time features and push notifications.",
      longDescription:
        "Implemented authentication, listings, seller profile logic, and product UX flows.",
      techTags: ["Flutter", "Firebase", "mobile", "product"],
      roleTags: ["AI Engineer", "Data Scientist"],
      bulletBank: [],
      displayOrder: 3,
    },
  ];

  for (const project of projects) {
    const exists = await db.project.findFirst({
      where: { candidateProfileId: profile.id, name: project.name },
    });
    if (exists) continue;

    await db.project.create({
      data: {
        candidateProfileId: profile.id,
        ...project,
        impactMetrics: [],
        evidenceLinks: [],
      },
    });
  }

  console.log("Seed complete");
  console.log(`Single user: ${singleUserEmail}`);
  console.log(`Password: ${singleUserPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
