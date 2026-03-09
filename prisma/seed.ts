// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash(
    process.env.SEED_PASSWORD || "changeme123",
    12
  );

  const user = await db.user.upsert({
    where: { email: "meital@jobhunter.local" },
    update: {},
    create: {
      email: "meital@jobhunter.local",
      name: "Meital Abadi",
      passwordHash,
    },
  });

  console.log("✓ User created:", user.email);

  const profile = await db.candidateProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: "Meital Abadi",
      headline: "Data Scientist & AI Engineer | Technion B.Sc. | NLP · ML · LLM Pipelines",
      bio: "Recent Technion Data Science graduate with hands-on experience building end-to-end NLP pipelines, ML models, and business intelligence systems.",
      location: "Israel",
      targetSalaryMin: 18000,
      targetSalaryIdeal: 25000,
      targetSalaryCurrency: "ILS",
      workModePrefs: ["hybrid", "onsite"],
      targetCities: ["Tel Aviv", "Herzliya", "Haifa", "Ramat Gan", "Ra'anana", "Remote"],
      rolePreferences: ["Data Scientist", "AI Engineer", "AI Analyst", "Data Analyst", "Analytics Engineer", "ML Engineer"],
      weightSpeed: 25,
      weightFit: 30,
      weightSalary: 25,
      weightUpside: 20,
      outreachVoice: "concise, direct, confident — always mention Technion",
      uniqueAngles: [
        "End-to-end NLP pipeline (CIC): web scraping → LLM extraction → stakeholder BI reporting",
        "Product + data mindset from building BALI marketplace app (Flutter/Firebase)",
        "Business systems ownership at Israeli Line — designed complete Airtable BI infrastructure",
      ],
      noGoCompanies: [],
    },
  });

  console.log("✓ Profile created:", profile.id);

  // Seed skills
  const SKILLS = [
    { name: "Python",            canonical: "python",           category: "PROGRAMMING_LANGUAGE" as const, priority: 95 },
    { name: "SQL",               canonical: "sql",              category: "DATABASE"              as const, priority: 90 },
    { name: "Pandas",            canonical: "pandas",           category: "ML_FRAMEWORK"          as const, priority: 88 },
    { name: "NumPy",             canonical: "numpy",            category: "ML_FRAMEWORK"          as const, priority: 85 },
    { name: "Scikit-learn",      canonical: "scikit-learn",     category: "ML_FRAMEWORK"          as const, priority: 90 },
    { name: "TensorFlow",        canonical: "tensorflow",       category: "ML_FRAMEWORK"          as const, priority: 75 },
    { name: "PyTorch",           canonical: "pytorch",          category: "ML_FRAMEWORK"          as const, priority: 78 },
    { name: "NLP",               canonical: "nlp",              category: "ML_FRAMEWORK"          as const, priority: 92 },
    { name: "LLM Pipelines",     canonical: "llm",              category: "ML_FRAMEWORK"          as const, priority: 92 },
    { name: "Prompt Engineering",canonical: "prompt engineering",category: "ML_FRAMEWORK"         as const, priority: 88 },
    { name: "Tableau",           canonical: "tableau",          category: "BI_TOOL"               as const, priority: 80 },
    { name: "Power BI",          canonical: "power bi",         category: "BI_TOOL"               as const, priority: 78 },
    { name: "Plotly",            canonical: "plotly",           category: "BI_TOOL"               as const, priority: 75 },
    { name: "Dash",              canonical: "dash",             category: "BI_TOOL"               as const, priority: 72 },
    { name: "Flutter",           canonical: "flutter",          category: "MOBILE"                as const, priority: 70 },
    { name: "Firebase",          canonical: "firebase",         category: "CLOUD"                 as const, priority: 70 },
    { name: "Airtable",          canonical: "airtable",         category: "OTHER"                 as const, priority: 65 },
  ];

  for (const s of SKILLS) {
    const skill = await db.skill.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, canonicalName: s.canonical, category: s.category },
    });
    await db.candidateSkill.upsert({
      where: { candidateProfileId_skillId: { candidateProfileId: profile.id, skillId: skill.id } },
      update: {},
      create: {
        candidateProfileId: profile.id,
        skillId: skill.id,
        proficiency: s.priority >= 85 ? "ADVANCED" : "INTERMEDIATE",
        priority: s.priority,
      },
    });
  }
  console.log("✓ Skills seeded:", SKILLS.length);

  // Seed projects
  const PROJECTS = [
    {
      name: "CIC Protest Analysis Pipeline",
      shortSummary: "End-to-end NLP pipeline: web scraping → large-scale article processing → LLM feature extraction → BI reporting for stakeholders.",
      longDescription: "Built a complete data pipeline for the CIC research project. Scraped thousands of news articles, processed them at scale using LLM-based feature extraction with custom prompt engineering, implemented quality control and reprocessing flows, and delivered BI dashboards for stakeholder reporting.",
      techTags: ["Python", "NLP", "LLM", "web scraping", "prompt engineering", "data pipeline", "machine learning", "BI"],
      roleTags: ["Data Scientist", "AI Engineer", "ML Engineer"],
      bulletBank: [
        { text: "Built end-to-end NLP pipeline processing 10,000+ news articles using custom LLM extraction with iterative prompt engineering", roleTag: "AI Engineer", strength: 95 },
        { text: "Designed quality control and reprocessing flows ensuring >95% extraction accuracy across diverse article formats", roleTag: "Data Scientist", strength: 90 },
        { text: "Delivered stakeholder BI dashboards coordinating data exports and visualization for research team", roleTag: "AI Analyst", strength: 85 },
      ],
      confidence: 90,
      displayOrder: 1,
    },
    {
      name: "Israeli Line BI System",
      shortSummary: "Complete Airtable-based business management system for B2B company: customers, orders, invoices, suppliers — interconnected with dashboards.",
      longDescription: "Designed and built a full business operations system for Israeli Line, a B2B signage and display company. Includes customer management, order tracking, invoice automation, supplier management, and connected dashboards with automated workflows.",
      techTags: ["Airtable", "BI", "analytics", "business intelligence", "operations", "workflow automation", "dashboards"],
      roleTags: ["Data Analyst", "AI Analyst", "Analytics Engineer"],
      bulletBank: [
        { text: "Architected complete business intelligence system managing customers, orders, and invoices for B2B operations", roleTag: "Data Analyst", strength: 85 },
        { text: "Built automated workflow triggers reducing manual data entry by connecting supplier, order, and finance modules", roleTag: "Analytics Engineer", strength: 80 },
      ],
      confidence: 85,
      displayOrder: 2,
    },
    {
      name: "BALI Marketplace App",
      shortSummary: "Full-stack Flutter/Firebase marketplace app with push notifications, real-time features, seller profiles, and boost mechanics.",
      longDescription: "Built BALI, a mobile marketplace application from scratch. Implemented Flutter UI, Firebase Firestore for real-time data, Cloud Messaging for push notifications, seller profile system, listing boost mechanics, and complete authentication flow.",
      techTags: ["Flutter", "Firebase", "mobile", "Firestore", "Cloud Messaging", "app development", "product"],
      roleTags: ["Data Scientist", "AI Engineer"],
      bulletBank: [
        { text: "Built production mobile marketplace app (Flutter/Firebase) with real-time listings, push notifications, and seller analytics", roleTag: "Data Scientist", strength: 75 },
      ],
      confidence: 80,
      displayOrder: 3,
    },
  ];

  for (const p of PROJECTS) {
    await db.project.create({
      data: { candidateProfileId: profile.id, ...p, impactMetrics: [], evidenceLinks: [] },
    });
  }
  console.log("✓ Projects seeded:", PROJECTS.length);

  console.log("\n✅ Seed complete!");
  console.log("   Login: meital@jobhunter.local");
  console.log("   Password:", process.env.SEED_PASSWORD || "changeme123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
