// lib/analytics/queries.ts
// Analytics query helpers for conversion tracking and feedback insights

import { db } from "../db";

export interface ConversionMetrics {
  totalJobsIngested: number;
  totalApplicationsSent: number;
  totalOutreachDrafts: number;
  totalRecruiterResponses: number;
  totalScreeningCalls: number;
  totalInterviews: number;
  totalRejections: number;
  responseRate: number;
  interviewRate: number;
}

export interface BreakdownItem {
  label: string;
  applications: number;
  responses: number;
  interviews: number;
  responseRate: number;
  interviewRate: number;
}

export async function getConversionMetrics(candidateProfileId: string): Promise<ConversionMetrics> {
  const [
    totalJobsIngested,
    totalApplicationsSent,
    totalOutreachDrafts,
    totalRecruiterResponses,
    totalScreeningCalls,
    totalInterviews,
    totalRejections,
  ] = await Promise.all([
    db.job.count({ where: { isActive: true } }),
    db.application.count({
      where: { candidateProfileId, status: { not: "WISHLIST" } },
    }),
    db.outreachMessage.count({ where: { status: { not: "DRAFT" } } }),
    db.application.count({
      where: {
        candidateProfileId,
        status: { in: ["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW", "OFFER", "ACCEPTED"] },
      },
    }),
    db.application.count({
      where: { candidateProfileId, status: "RECRUITER_SCREEN" },
    }),
    db.application.count({
      where: {
        candidateProfileId,
        status: { in: ["TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW"] },
      },
    }),
    db.application.count({
      where: { candidateProfileId, status: "REJECTED" },
    }),
  ]);

  const responseRate = totalApplicationsSent > 0
    ? Math.round((totalRecruiterResponses / totalApplicationsSent) * 1000) / 10
    : 0;
  const interviewRate = totalApplicationsSent > 0
    ? Math.round((totalInterviews / totalApplicationsSent) * 1000) / 10
    : 0;

  return {
    totalJobsIngested,
    totalApplicationsSent,
    totalOutreachDrafts,
    totalRecruiterResponses,
    totalScreeningCalls,
    totalInterviews,
    totalRejections,
    responseRate,
    interviewRate,
  };
}

export async function getBreakdownBySource(candidateProfileId: string): Promise<BreakdownItem[]> {
  const apps = await db.application.findMany({
    where: { candidateProfileId, status: { not: "WISHLIST" } },
    include: { job: { select: { source: true } } },
  });

  const groups = new Map<string, { apps: number; responses: number; interviews: number }>();

  for (const app of apps) {
    const source = app.job?.source || app.source || "manual";
    const entry = groups.get(source) || { apps: 0, responses: 0, interviews: 0 };
    entry.apps++;

    const responseStatuses = ["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW", "OFFER", "ACCEPTED"];
    if (responseStatuses.includes(app.status)) entry.responses++;

    const interviewStatuses = ["TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW"];
    if (interviewStatuses.includes(app.status)) entry.interviews++;

    groups.set(source, entry);
  }

  return Array.from(groups.entries()).map(([label, data]) => ({
    label,
    applications: data.apps,
    responses: data.responses,
    interviews: data.interviews,
    responseRate: data.apps > 0 ? Math.round((data.responses / data.apps) * 1000) / 10 : 0,
    interviewRate: data.apps > 0 ? Math.round((data.interviews / data.apps) * 1000) / 10 : 0,
  }));
}

export async function getBreakdownByRoleFamily(candidateProfileId: string): Promise<BreakdownItem[]> {
  const apps = await db.application.findMany({
    where: { candidateProfileId, status: { not: "WISHLIST" } },
    include: {
      resumeVersion: { select: { roleFamily: true } },
      job: { select: { title: true } },
    },
  });

  const groups = new Map<string, { apps: number; responses: number; interviews: number }>();

  for (const app of apps) {
    const roleFamily = app.resumeVersion?.roleFamily || inferRoleFamily(app.job?.title || "");
    const entry = groups.get(roleFamily) || { apps: 0, responses: 0, interviews: 0 };
    entry.apps++;

    const responseStatuses = ["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW", "OFFER", "ACCEPTED"];
    if (responseStatuses.includes(app.status)) entry.responses++;

    const interviewStatuses = ["TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW"];
    if (interviewStatuses.includes(app.status)) entry.interviews++;

    groups.set(roleFamily, entry);
  }

  return Array.from(groups.entries()).map(([label, data]) => ({
    label,
    applications: data.apps,
    responses: data.responses,
    interviews: data.interviews,
    responseRate: data.apps > 0 ? Math.round((data.responses / data.apps) * 1000) / 10 : 0,
    interviewRate: data.apps > 0 ? Math.round((data.interviews / data.apps) * 1000) / 10 : 0,
  }));
}

export async function getBreakdownByResumeTemplate(candidateProfileId: string): Promise<BreakdownItem[]> {
  const apps = await db.application.findMany({
    where: { candidateProfileId, status: { not: "WISHLIST" } },
    include: { resumeVersion: { select: { roleFamily: true, templateName: true } } },
  });

  const groups = new Map<string, { apps: number; responses: number; interviews: number }>();

  for (const app of apps) {
    const template = app.resumeVersion
      ? `${app.resumeVersion.roleFamily} / ${app.resumeVersion.templateName}`
      : "No resume";
    const entry = groups.get(template) || { apps: 0, responses: 0, interviews: 0 };
    entry.apps++;

    const responseStatuses = ["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW", "OFFER", "ACCEPTED"];
    if (responseStatuses.includes(app.status)) entry.responses++;

    const interviewStatuses = ["TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW"];
    if (interviewStatuses.includes(app.status)) entry.interviews++;

    groups.set(template, entry);
  }

  return Array.from(groups.entries()).map(([label, data]) => ({
    label,
    applications: data.apps,
    responses: data.responses,
    interviews: data.interviews,
    responseRate: data.apps > 0 ? Math.round((data.responses / data.apps) * 1000) / 10 : 0,
    interviewRate: data.apps > 0 ? Math.round((data.interviews / data.apps) * 1000) / 10 : 0,
  }));
}

export async function getOutreachImpact(candidateProfileId: string) {
  const withOutreach = await db.application.count({
    where: {
      candidateProfileId,
      status: { not: "WISHLIST" },
      job: { outreachStatus: { not: "NOT_GENERATED" } },
    },
  });
  const withOutreachResponses = await db.application.count({
    where: {
      candidateProfileId,
      status: { in: ["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW", "OFFER", "ACCEPTED"] },
      job: { outreachStatus: { not: "NOT_GENERATED" } },
    },
  });
  const withoutOutreach = await db.application.count({
    where: {
      candidateProfileId,
      status: { not: "WISHLIST" },
      job: { outreachStatus: "NOT_GENERATED" },
    },
  });
  const withoutOutreachResponses = await db.application.count({
    where: {
      candidateProfileId,
      status: { in: ["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW", "OFFER", "ACCEPTED"] },
      job: { outreachStatus: "NOT_GENERATED" },
    },
  });

  return {
    withOutreach: {
      applications: withOutreach,
      responses: withOutreachResponses,
      responseRate: withOutreach > 0 ? Math.round((withOutreachResponses / withOutreach) * 1000) / 10 : 0,
    },
    withoutOutreach: {
      applications: withoutOutreach,
      responses: withoutOutreachResponses,
      responseRate: withoutOutreach > 0 ? Math.round((withoutOutreachResponses / withoutOutreach) * 1000) / 10 : 0,
    },
  };
}

// ─── Advisory insights ───────────────────────────────────────────────────────

export async function getAdvisoryInsights(candidateProfileId: string) {
  const [byRole, bySource, byTemplate, outreach] = await Promise.all([
    getBreakdownByRoleFamily(candidateProfileId),
    getBreakdownBySource(candidateProfileId),
    getBreakdownByResumeTemplate(candidateProfileId),
    getOutreachImpact(candidateProfileId),
  ]);

  const insights: string[] = [];

  // Best performing role family
  const bestRole = byRole.sort((a, b) => b.responseRate - a.responseRate)[0];
  if (bestRole && bestRole.applications >= 3) {
    insights.push(`Best performing role family: "${bestRole.label}" with ${bestRole.responseRate}% response rate`);
  }

  // Best source
  const bestSource = bySource.sort((a, b) => b.responseRate - a.responseRate)[0];
  if (bestSource && bestSource.applications >= 3) {
    insights.push(`Best job source: "${bestSource.label}" with ${bestSource.responseRate}% response rate`);
  }

  // Outreach impact
  if (outreach.withOutreach.applications >= 3 && outreach.withoutOutreach.applications >= 3) {
    const diff = outreach.withOutreach.responseRate - outreach.withoutOutreach.responseRate;
    if (diff > 5) {
      insights.push(`Outreach improves response rate by ${Math.round(diff)}pp (${outreach.withOutreach.responseRate}% vs ${outreach.withoutOutreach.responseRate}%)`);
    }
  }

  // Best template
  const bestTemplate = byTemplate.sort((a, b) => b.responseRate - a.responseRate)[0];
  if (bestTemplate && bestTemplate.applications >= 3) {
    insights.push(`Best resume template: "${bestTemplate.label}" with ${bestTemplate.responseRate}% response rate`);
  }

  return insights;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inferRoleFamily(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("data scientist") || lower.includes("ml")) return "Data Scientist";
  if (lower.includes("ai engineer") || lower.includes("llm")) return "AI Engineer";
  if (lower.includes("data analyst") || lower.includes("bi analyst")) return "Data Analyst";
  if (lower.includes("analytics engineer") || lower.includes("dbt")) return "Analytics Engineer";
  if (lower.includes("ai analyst")) return "AI Analyst";
  if (lower.includes("ml engineer") || lower.includes("mlops")) return "ML Engineer";
  return "Other";
}
