// lib/daily-queue/selectors.ts
// Query helpers for the daily action queue
// Generates prioritized lists for the execution dashboard

import { db } from "../db";
import type { ActionRecommendation } from "@prisma/client";

export interface QueueJob {
  id: string;
  title: string;
  company: { id: string; name: string } | null;
  location: string | null;
  workMode: string | null;
  score: number;
  actionRecommendation: string | null;
  whyApply: string | null;
  blockersSummary: string | null;
  outreachStatus: string;
  hasResume: boolean;
  hasApplication: boolean;
  createdAt: Date;
  sourceUrl: string | null;
}

export interface FollowUp {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  lastStageDate: Date;
  daysSinceUpdate: number;
  recruiterName: string | null;
  nextAction: string | null;
}

export interface StaleOpportunity {
  id: string;
  title: string;
  company: string | null;
  score: number;
  actionRecommendation: string | null;
  daysSinceIngestion: number;
  createdAt: Date;
}

// ─── Apply Today (APPLY_NOW) ─────────────────────────────────────────────────

export async function getApplyTodayJobs(candidateProfileId: string): Promise<QueueJob[]> {
  return getJobsByAction(candidateProfileId, "APPLY_NOW");
}

// ─── Apply This Week (APPLY_THIS_WEEK) ──────────────────────────────────────

export async function getApplyThisWeekJobs(candidateProfileId: string): Promise<QueueJob[]> {
  return getJobsByAction(candidateProfileId, "APPLY_THIS_WEEK");
}

// ─── Helper: get jobs by action recommendation ──────────────────────────────

async function getJobsByAction(
  candidateProfileId: string,
  actionRecommendation: string
): Promise<QueueJob[]> {
  const scores = await db.jobScore.findMany({
    where: {
      candidateProfileId,
      actionRecommendation: actionRecommendation as ActionRecommendation,
    },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true } },
          _count: { select: { applications: true, resumeVersions: true } },
        },
      },
    },
    orderBy: { totalScore: "desc" },
  });

  return scores.map((s) => ({
    id: s.job.id,
    title: s.job.title,
    company: s.job.company,
    location: s.job.location,
    workMode: s.job.workMode,
    score: s.totalScore,
    actionRecommendation: s.actionRecommendation,
    whyApply: s.whyApply,
    blockersSummary: s.blockersSummary,
    outreachStatus: s.job.outreachStatus,
    hasResume: s.job._count.resumeVersions > 0,
    hasApplication: s.job._count.applications > 0,
    createdAt: s.job.createdAt,
    sourceUrl: s.job.sourceUrl,
  }));
}

// ─── Needs Outreach ──────────────────────────────────────────────────────────

export async function getNeedsOutreachJobs(candidateProfileId: string): Promise<QueueJob[]> {
  const scores = await db.jobScore.findMany({
    where: {
      candidateProfileId,
      actionRecommendation: { in: ["APPLY_NOW", "APPLY_THIS_WEEK", "STRETCH_APPLY"] },
      job: {
        outreachStatus: "NOT_GENERATED",
        isActive: true,
      },
    },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true } },
          _count: { select: { applications: true, resumeVersions: true } },
        },
      },
    },
    orderBy: { totalScore: "desc" },
    take: 20,
  });

  return scores.map((s) => ({
    id: s.job.id,
    title: s.job.title,
    company: s.job.company,
    location: s.job.location,
    workMode: s.job.workMode,
    score: s.totalScore,
    actionRecommendation: s.actionRecommendation,
    whyApply: s.whyApply,
    blockersSummary: s.blockersSummary,
    outreachStatus: s.job.outreachStatus,
    hasResume: s.job._count.resumeVersions > 0,
    hasApplication: s.job._count.applications > 0,
    createdAt: s.job.createdAt,
    sourceUrl: s.job.sourceUrl,
  }));
}

// ─── Follow-Ups ──────────────────────────────────────────────────────────────

export async function getFollowUps(
  candidateProfileId: string,
  thresholdDays = 7
): Promise<FollowUp[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

  const apps = await db.application.findMany({
    where: {
      candidateProfileId,
      status: {
        in: ["APPLIED", "RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "CASE_STUDY", "FINAL_INTERVIEW", "ON_HOLD"],
      },
      updatedAt: { lt: cutoffDate },
    },
    include: {
      company: { select: { name: true } },
      job: { select: { title: true } },
      stageEvents: {
        orderBy: { eventAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  return apps.map((app) => {
    const lastEvent = app.stageEvents[0];
    const lastDate = lastEvent?.eventAt || app.updatedAt;
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: app.id,
      companyName: app.company?.name || "Unknown",
      jobTitle: app.job?.title || app.notes || "Unknown Role",
      status: app.status,
      lastStageDate: lastDate,
      daysSinceUpdate: daysSince,
      recruiterName: app.recruiterName,
      nextAction: app.nextAction,
    };
  });
}

// ─── Stale Opportunities ─────────────────────────────────────────────────────

export async function getStaleOpportunities(
  candidateProfileId: string,
  staleDays = 5
): Promise<StaleOpportunity[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - staleDays);

  const jobs = await db.job.findMany({
    where: {
      isActive: true,
      createdAt: { lt: cutoffDate },
      applications: { none: {} },
      scores: {
        some: {
          candidateProfileId,
          actionRecommendation: { in: ["APPLY_NOW", "APPLY_THIS_WEEK", "STRETCH_APPLY"] },
        },
      },
    },
    include: {
      company: { select: { name: true } },
      scores: {
        where: { candidateProfileId },
        select: { totalScore: true, actionRecommendation: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company?.name || null,
    score: job.scores[0]?.totalScore ?? 0,
    actionRecommendation: job.scores[0]?.actionRecommendation ?? null,
    daysSinceIngestion: Math.floor((Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    createdAt: job.createdAt,
  }));
}

// ─── Full queue data ─────────────────────────────────────────────────────────

export async function getDailyQueueData(candidateProfileId: string) {
  const [applyToday, applyThisWeek, needsOutreach, followUps, staleOpportunities] =
    await Promise.all([
      getApplyTodayJobs(candidateProfileId),
      getApplyThisWeekJobs(candidateProfileId),
      getNeedsOutreachJobs(candidateProfileId),
      getFollowUps(candidateProfileId),
      getStaleOpportunities(candidateProfileId),
    ]);

  return {
    applyToday,
    applyThisWeek,
    needsOutreach,
    followUps,
    staleOpportunities,
  };
}
