import { SkillCategory } from "@prisma/client";

export function normalizeTextList(values?: string[] | null): string[] {
  if (!values || values.length === 0) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const cleaned = raw.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function toTitleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeSkillName(input: string): {
  displayName: string;
  canonicalName: string;
} {
  const cleaned = input.trim().replace(/\s+/g, " ");
  return {
    displayName: toTitleCase(cleaned),
    canonicalName: cleaned.toLowerCase(),
  };
}

const CATEGORY_LOOKUP: Record<string, SkillCategory> = {
  language: SkillCategory.PROGRAMMING_LANGUAGE,
  "programming language": SkillCategory.PROGRAMMING_LANGUAGE,
  framework: SkillCategory.ML_FRAMEWORK,
  ml: SkillCategory.ML_FRAMEWORK,
  "ml framework": SkillCategory.ML_FRAMEWORK,
  ai: SkillCategory.ML_FRAMEWORK,
  data: SkillCategory.DATA_TOOL,
  analytics: SkillCategory.DATA_TOOL,
  "data tool": SkillCategory.DATA_TOOL,
  bi: SkillCategory.BI_TOOL,
  "bi tool": SkillCategory.BI_TOOL,
  cloud: SkillCategory.CLOUD,
  database: SkillCategory.DATABASE,
  infra: SkillCategory.CLOUD,
  infrastructure: SkillCategory.CLOUD,
  mobile: SkillCategory.MOBILE,
};

export function normalizeSkillCategory(input?: string): SkillCategory {
  if (!input) return SkillCategory.OTHER;
  const key = input.trim().toLowerCase();
  return CATEGORY_LOOKUP[key] ?? SkillCategory.OTHER;
}

export function parseDateOrNull(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
