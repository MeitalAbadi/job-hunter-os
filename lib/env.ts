// lib/env.ts
// Validates all required environment variables at startup
// Fails fast with clear error messages

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // DB
  DATABASE_URL: requireEnv("DATABASE_URL"),

  // LLM — server-side only
  ANTHROPIC_API_KEY: requireEnv("ANTHROPIC_API_KEY"),

  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};
