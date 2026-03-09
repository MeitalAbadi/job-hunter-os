// lib/llm/provider.ts
// Server-side only. Never import this in client components.
// All API keys stay on the server.

import Anthropic from "@anthropic-ai/sdk";
import { z, ZodSchema } from "zod";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  taskName?: string;         // for logging
  maxRetries?: number;
}

export interface LLMStructuredOptions<T> extends LLMRequestOptions {
  schema: ZodSchema<T>;
  repairPrompt?: string;     // if first parse fails, prompt to try to fix it
}

export interface LLMResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  durationMs: number;
}

export interface LLMStructuredResponse<T> extends LLMResponse {
  data: T;
  rawText: string;
  retries: number;
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export class LLMValidationError extends Error {
  constructor(
    message: string,
    public readonly rawText: string,
    public readonly zodError: z.ZodError
  ) {
    super(message);
    this.name = "LLMValidationError";
  }
}

export class LLMProviderError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "LLMProviderError";
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new LLMProviderError("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Core text completion ─────────────────────────────────────────────────────

export async function llmComplete(options: LLMRequestOptions): Promise<LLMResponse> {
  const client = getClient();
  const maxRetries = options.maxRetries ?? 2;
  const start = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: options.maxTokens ?? 2000,
        system: options.systemPrompt,
        messages: [{ role: "user", content: options.userPrompt }],
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

      return {
        text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        durationMs: Date.now() - start,
      };
    } catch (error) {
      if (attempt === maxRetries) {
        throw new LLMProviderError(
          `LLM request failed after ${maxRetries + 1} attempts`,
          error
        );
      }
      await sleep(Math.pow(2, attempt) * 500); // exponential backoff
    }
  }

  throw new LLMProviderError("Unreachable");
}

// ─── Structured output with Zod validation ────────────────────────────────────

export async function llmStructured<T>(
  options: LLMStructuredOptions<T>
): Promise<LLMStructuredResponse<T>> {
  const maxRetries = options.maxRetries ?? 2;
  const start = Date.now();
  let lastError: Error | null = null;
  let lastRawText = "";

  const systemWithJsonInstruction = `${options.systemPrompt}

CRITICAL OUTPUT REQUIREMENT:
You MUST respond with ONLY valid JSON that matches the exact schema described.
Do NOT include any text before or after the JSON.
Do NOT use markdown code fences.
Do NOT include any explanation outside the JSON.
If you are uncertain about a value, use a reasonable default — do not omit required fields.`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const userPrompt =
      attempt > 0 && options.repairPrompt
        ? `${options.repairPrompt}\n\nPrevious invalid response:\n${lastRawText}\n\nPlease return ONLY valid JSON now.`
        : options.userPrompt;

    try {
      const response = await llmComplete({
        systemPrompt: systemWithJsonInstruction,
        userPrompt,
        maxTokens: options.maxTokens,
        taskName: options.taskName,
        maxRetries: 0, // handle retries at this level
      });

      lastRawText = response.text;
      const cleaned = stripJsonFences(response.text);

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch (jsonErr) {
        lastError = new LLMValidationError(
          "Response was not valid JSON",
          lastRawText,
          new z.ZodError([])
        );
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 300);
          continue;
        }
        throw lastError;
      }

      const validation = options.schema.safeParse(parsed);
      if (!validation.success) {
        lastError = new LLMValidationError(
          "Response failed schema validation",
          lastRawText,
          validation.error
        );
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 300);
          continue;
        }
        throw lastError;
      }

      return {
        data: validation.data,
        rawText: lastRawText,
        usage: response.usage,
        durationMs: Date.now() - start,
        text: response.text,
        retries: attempt,
      };
    } catch (error) {
      if (error instanceof LLMValidationError || error instanceof LLMProviderError) {
        throw error;
      }
      lastError = new LLMProviderError("Unexpected error in LLM call", error);
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 500);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new LLMProviderError("Unreachable");
}
