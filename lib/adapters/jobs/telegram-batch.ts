// lib/adapters/jobs/telegram-batch.ts
// Splits raw pasted Telegram channel text into individual job post candidates
// Handles multiple formats: forwarded messages, plain text blocks, mixed

import { createHash } from "crypto";
import type { ParsedJobCandidate, BatchParseResult } from "../../schemas";
import { db } from "../../db";

// ─── Splitting strategies ────────────────────────────────────────────────────

// Common Telegram forwarding patterns
const FORWARDED_HEADER = /^(?:Forwarded from|הועבר מ)[:\s]+.+$/m;
const CHANNEL_HEADER = /^[\p{L}\p{N}\s_-]+(?:\s*·\s*\d{1,2}:\d{2})?$/mu;
const DATE_SEPARATOR = /^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}$/m;
const HEAVY_SEPARATOR = /^[─━═—\-]{3,}$/m;
const EMOJI_HEADER = /^[🔵🟢🟡🔴📌📋💼🏢💻🚀⭐✨📢📣🆕]+\s*.+$/m;

// Job-like patterns that indicate start of a new post
const JOB_TITLE_PATTERN = /^(?:(?:looking for|hiring|we['']re hiring|open position|job opening|דרוש|מחפשים|משרה)\s*[:\-–]?\s*)/i;
const COMPANY_INTRO = /^(?:about|at|join)\s+[\p{L}][\p{L}\s&\-\.]{1,50}\s*[:\-–]/iu;
const APPLY_LINK_PATTERN = /(?:apply|submit|send|cv|resume|הגש|שלח)[:\s]*(?:https?:\/\/|mailto:)/i;
const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;

interface SplitCandidate {
  rawText: string;
  startIndex: number;
}

function splitByMultipleNewlines(text: string): SplitCandidate[] {
  // Split on 3+ consecutive newlines (common Telegram paste separator)
  const blocks = text.split(/\n{3,}/);
  let currentIndex = 0;
  const candidates: SplitCandidate[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed.length >= 30) { // Minimum viable job post length
      candidates.push({ rawText: trimmed, startIndex: currentIndex });
    }
    currentIndex += block.length + 3; // approximate
  }

  return candidates;
}

function splitByForwardedHeaders(text: string): SplitCandidate[] {
  const lines = text.split("\n");
  const candidates: SplitCandidate[] = [];
  let currentBlock: string[] = [];
  let blockStart = 0;
  let charIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeader = FORWARDED_HEADER.test(line) || HEAVY_SEPARATOR.test(line);

    if (isHeader && currentBlock.length > 0) {
      const text = currentBlock.join("\n").trim();
      if (text.length >= 30) {
        candidates.push({ rawText: text, startIndex: blockStart });
      }
      currentBlock = [];
      blockStart = charIndex;
    }

    currentBlock.push(line);
    charIndex += line.length + 1;
  }

  // Last block
  const lastText = currentBlock.join("\n").trim();
  if (lastText.length >= 30) {
    candidates.push({ rawText: lastText, startIndex: blockStart });
  }

  return candidates;
}

function splitByEmojiHeaders(text: string): SplitCandidate[] {
  const lines = text.split("\n");
  const candidates: SplitCandidate[] = [];
  let currentBlock: string[] = [];
  let blockStart = 0;
  let charIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isEmojiStart = EMOJI_HEADER.test(line) && currentBlock.length > 3;

    if (isEmojiStart) {
      const text = currentBlock.join("\n").trim();
      if (text.length >= 30) {
        candidates.push({ rawText: text, startIndex: blockStart });
      }
      currentBlock = [];
      blockStart = charIndex;
    }

    currentBlock.push(line);
    charIndex += line.length + 1;
  }

  const lastText = currentBlock.join("\n").trim();
  if (lastText.length >= 30) {
    candidates.push({ rawText: lastText, startIndex: blockStart });
  }

  return candidates;
}

// Heuristic: pick the best split strategy based on detected patterns
function bestSplit(text: string): SplitCandidate[] {
  const hasForwardedHeaders = FORWARDED_HEADER.test(text);
  const hasHeavySeparators = (text.match(HEAVY_SEPARATOR) || []).length >= 2;
  const hasEmojiHeaders = (text.match(EMOJI_HEADER) || []).length >= 2;
  const tripleNewlineBlocks = text.split(/\n{3,}/).filter((b) => b.trim().length >= 30);

  // Prefer the strategy that produces the most reasonable splits
  const strategies: { name: string; results: SplitCandidate[] }[] = [];

  if (hasForwardedHeaders || hasHeavySeparators) {
    strategies.push({ name: "forwarded", results: splitByForwardedHeaders(text) });
  }
  if (hasEmojiHeaders) {
    strategies.push({ name: "emoji", results: splitByEmojiHeaders(text) });
  }
  if (tripleNewlineBlocks.length >= 2) {
    strategies.push({ name: "newlines", results: splitByMultipleNewlines(text) });
  }

  // Fallback: if no strategy found multiple posts, treat entire text as one
  if (strategies.length === 0) {
    return [{ rawText: text.trim(), startIndex: 0 }];
  }

  // Pick the strategy with the most splits (but at least 2 to be meaningful)
  strategies.sort((a, b) => b.results.length - a.results.length);
  return strategies[0].results;
}

// ─── Job candidate extraction ────────────────────────────────────────────────

function extractLinks(text: string): string[] {
  return (text.match(URL_PATTERN) || []).map((url) => url.replace(/[)\].,;]+$/, ""));
}

function guessTitle(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Try to find a title-like first line (short, possibly with emoji)
  for (const line of lines.slice(0, 3)) {
    const cleaned = line.replace(/[🔵🟢🟡🔴📌📋💼🏢💻🚀⭐✨📢📣🆕]+/g, "").trim();
    if (cleaned.length >= 5 && cleaned.length <= 120 && !cleaned.includes("http")) {
      return cleaned;
    }
  }

  // Fallback: use first meaningful line
  const first = lines.find((l) => l.length >= 5 && l.length <= 120);
  return first || "Untitled Position";
}

function guessCompany(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Pattern: "Company:" or "חברה:" or "at Company"
  for (const line of lines.slice(0, 5)) {
    const companyMatch = line.match(/(?:company|חברה|at|@)\s*[:\-–]?\s*([\p{L}][\p{L}\s&\-\.]{1,50})/iu);
    if (companyMatch) return companyMatch[1].trim();
  }

  // Pattern: look for company name in second line if first line is title
  if (lines.length >= 2) {
    const secondLine = lines[1].replace(/[🔵🟢🟡🔴📌📋💼🏢💻🚀⭐✨📢📣🆕]+/g, "").trim();
    if (secondLine.length >= 2 && secondLine.length <= 60 && !secondLine.includes("http")) {
      return secondLine;
    }
  }

  return "Unknown Company";
}

function guessLocation(text: string): string | undefined {
  const lower = text.toLowerCase();
  const israelCities = [
    "tel aviv", "תל אביב", "herzliya", "הרצליה", "ramat gan", "רמת גן",
    "haifa", "חיפה", "ra'anana", "רעננה", "petah tikva", "פתח תקווה",
    "beer sheva", "באר שבע", "netanya", "נתניה", "jerusalem", "ירושלים",
    "bnei brak", "בני ברק", "kfar saba", "כפר סבא", "holon", "חולון",
  ];

  for (const city of israelCities) {
    if (lower.includes(city)) return city;
  }

  if (lower.includes("remote") || lower.includes("מרחוק")) return "Remote";
  if (lower.includes("hybrid") || lower.includes("היברידי")) return "Hybrid";

  return undefined;
}

function assessConfidence(text: string): number {
  let score = 0.5;

  // Has job-related keywords
  const jobKeywords = ["experience", "requirements", "responsibilities", "qualifications",
    "ניסיון", "דרישות", "תחומי אחריות", "skills", "salary", "apply", "הגש", "cv", "resume"];
  const matches = jobKeywords.filter((kw) => text.toLowerCase().includes(kw));
  score += Math.min(0.3, matches.length * 0.06);

  // Has a link (likely application URL)
  if (URL_PATTERN.test(text)) score += 0.1;

  // Reasonable length
  if (text.length >= 100 && text.length <= 5000) score += 0.1;
  if (text.length < 50) score -= 0.3;

  return Math.max(0, Math.min(1, Math.round(score * 100) / 100));
}

function generateWarnings(text: string, title: string, company: string): string[] {
  const warnings: string[] = [];

  if (title === "Untitled Position") warnings.push("Could not extract job title");
  if (company === "Unknown Company") warnings.push("Could not extract company name");
  if (text.length < 80) warnings.push("Very short post - may be incomplete");
  if (!URL_PATTERN.test(text)) warnings.push("No application link found");
  if (text.length > 5000) warnings.push("Very long post - may contain multiple jobs");

  return warnings;
}

// ─── Dedup hash ──────────────────────────────────────────────────────────────

export function buildDedupHash(companyName: string, title: string, location?: string): string {
  const normalized = `${companyName.toLowerCase().trim()}_${title.toLowerCase().trim()}_${(location || "").toLowerCase().trim()}`;
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

// ─── Main parse function ─────────────────────────────────────────────────────

export async function parseTelegramBatch(
  rawBatchText: string,
  source: "telegram" | "manual" = "telegram"
): Promise<BatchParseResult> {
  const parseErrors: string[] = [];

  // Step 1: Split into individual posts
  const splits = bestSplit(rawBatchText);

  if (splits.length === 0) {
    return { candidates: [], totalFound: 0, parseErrors: ["No job posts detected in input"] };
  }

  // Step 2: Convert each split to a parsed candidate
  const candidates: ParsedJobCandidate[] = [];
  const seenHashes = new Set<string>();

  for (let i = 0; i < splits.length; i++) {
    try {
      const { rawText } = splits[i];
      const title = guessTitle(rawText);
      const company = guessCompany(rawText);
      const location = guessLocation(rawText);
      const links = extractLinks(rawText);
      const confidence = assessConfidence(rawText);
      const warnings = generateWarnings(rawText, title, company);
      const dedupHash = buildDedupHash(company, title, location);

      // Check in-batch duplicate
      let inBatchDuplicateIndex: number | undefined;
      if (seenHashes.has(dedupHash)) {
        inBatchDuplicateIndex = candidates.findIndex((c) => c.dedupHash === dedupHash);
        warnings.push("Duplicate within batch");
      }
      seenHashes.add(dedupHash);

      // Check DB duplicate
      let isDuplicate = false;
      let duplicateOfJobId: string | undefined;
      const existingJob = await db.job.findFirst({ where: { dedupHash } });
      if (existingJob) {
        isDuplicate = true;
        duplicateOfJobId = existingJob.id;
      }

      candidates.push({
        title,
        company,
        location,
        rawText,
        source,
        possibleExternalLinks: links,
        confidence,
        parseWarnings: warnings,
        dedupHash,
        isDuplicate,
        duplicateOfJobId,
        inBatchDuplicateIndex,
      });
    } catch (err) {
      parseErrors.push(`Failed to parse block ${i + 1}: ${(err as Error).message}`);
    }
  }

  return {
    candidates,
    totalFound: splits.length,
    parseErrors,
  };
}
