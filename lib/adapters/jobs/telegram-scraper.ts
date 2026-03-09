// lib/adapters/jobs/telegram-scraper.ts
// Scrapes the public Telegram channel page (t.me/s/channelName) for job posts
// No API key needed - uses the publicly accessible web preview

import { db } from "../../db";
import { buildDedupHash } from "./telegram-batch";

const CHANNEL_BASE_URL = "https://t.me/s/secretdatajobs";

export interface ScrapedTelegramJob {
  title: string;
  company: string;
  location: string;
  postedDate: string;
  skills: string[];
  seniority: string;
  externalUrl: string;
  telegramMessageId: string;
  rawText: string;
  dedupHash: string;
  isNew: boolean;
}

export interface ScrapeResult {
  jobs: ScrapedTelegramJob[];
  totalScraped: number;
  newJobs: number;
  duplicates: number;
  errors: string[];
  scrapedAt: string;
}

/**
 * Parse a single message block's HTML into a structured job object.
 * The t.me/s/ page has each message in a tgme_widget_message_text div with:
 *   <b>Title</b><br/>Company<br/>Location<br/>Date<br/>ㅤ<br/><i>Skills</i><br/>ㅤ<br/>Seniority<br/>ㅤ<br/><a href="url">url</a>
 */
function parseMessageHtml(messageHtml: string, messageId: string): ScrapedTelegramJob | null {
  try {
    // Extract title from <b> tags
    const titleMatch = messageHtml.match(/<b>([^<]+)<\/b>/);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "";

    if (!title || title.length < 3) return null;

    // Extract skills from <i> tags
    const skillsMatch = messageHtml.match(/<i>([^<]+)<\/i>/);
    const skills = skillsMatch
      ? skillsMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Extract URL from <a href="...">
    const urlMatch = messageHtml.match(/<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>/);
    const externalUrl = urlMatch ? urlMatch[1] : "";

    // Split by <br/> to get the text lines
    const textContent = messageHtml
      .replace(/<b>[^<]*<\/b>/g, "")
      .replace(/<i>[^<]*<\/i>/g, "")
      .replace(/<a[^>]*>[^<]*<\/a>/g, "")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/ㅤ/g, "") // Remove invisible characters
      .trim();

    const lines = textContent
      .split("\n")
      .map((l) => decodeHtmlEntities(l.trim()))
      .filter((l) => l.length > 0);

    // Typically: Company, Location, Date, then Seniority
    const company = lines[0] || "Unknown Company";
    const location = lines[1] || "";
    const postedDate = lines[2] || "";
    // Seniority is typically the last non-empty line
    const seniority = lines.length > 3 ? lines[lines.length - 1] : "";

    // Build raw text for ingestion
    const rawText = [
      title,
      company,
      location,
      postedDate,
      "",
      skills.join(", "),
      "",
      seniority,
      "",
      externalUrl,
    ].join("\n");

    const dedupHash = buildDedupHash(company, title, location);

    return {
      title,
      company,
      location,
      postedDate,
      skills,
      seniority,
      externalUrl,
      telegramMessageId: messageId,
      rawText,
      dedupHash,
      isNew: true, // Will be set after DB check
    };
  } catch {
    return null;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Scrape the most recent messages from the Telegram channel's public page.
 * Returns parsed job postings with dedup status.
 */
export async function scrapeTelegramChannel(): Promise<ScrapeResult> {
  const errors: string[] = [];
  const scrapedAt = new Date().toISOString();

  let html: string;
  try {
    const response = await fetch(CHANNEL_BASE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    html = await response.text();
  } catch (err) {
    return {
      jobs: [],
      totalScraped: 0,
      newJobs: 0,
      duplicates: 0,
      errors: [`Failed to fetch channel page: ${(err as Error).message}`],
      scrapedAt,
    };
  }

  // Extract all message blocks
  const messagePattern =
    /data-post="secretdatajobs\/(\d+)"[\s\S]*?<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g;

  const jobs: ScrapedTelegramJob[] = [];
  let match;

  while ((match = messagePattern.exec(html)) !== null) {
    const messageId = match[1];
    const messageHtml = match[2];

    const job = parseMessageHtml(messageHtml, messageId);
    if (job) {
      jobs.push(job);
    }
  }

  if (jobs.length === 0) {
    errors.push("No job posts found on the channel page");
    return { jobs, totalScraped: 0, newJobs: 0, duplicates: 0, errors, scrapedAt };
  }

  // Check dedup against DB
  let newCount = 0;
  let dupCount = 0;

  for (const job of jobs) {
    const existing = await db.job.findFirst({
      where: {
        OR: [
          { dedupHash: job.dedupHash },
          { telegramMessageId: job.telegramMessageId },
        ],
      },
    });

    if (existing) {
      job.isNew = false;
      dupCount++;
    } else {
      job.isNew = true;
      newCount++;
    }
  }

  return {
    jobs,
    totalScraped: jobs.length,
    newJobs: newCount,
    duplicates: dupCount,
    errors,
    scrapedAt,
  };
}

/**
 * Get the last scraped Telegram message ID from DB to avoid re-processing
 */
export async function getLastTelegramMessageId(): Promise<number | null> {
  const lastJob = await db.job.findFirst({
    where: {
      source: "TELEGRAM",
      telegramMessageId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { telegramMessageId: true },
  });

  return lastJob?.telegramMessageId ? parseInt(lastJob.telegramMessageId, 10) : null;
}
