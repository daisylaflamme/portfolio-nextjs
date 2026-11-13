/**
 * The one Claude call: streams a short summary for a prompt. Server-only (reads
 * ANTHROPIC_API_KEY through the SDK). Errors surface as SummaryError with a message that's
 * safe to show visitors.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { SummaryPrompt } from "./prompt.ts";

export const DEFAULT_MODEL = "claude-opus-5-5";
/** Small, but leaves room for adaptive thinking, which can't be turned off on Claude Opus 5.5. */
export const MAX_TOKENS = 1024;
/** Models that accept the server-side refusal fallback (fallbacks: "default"). */
const FALLBACK_MODELS = new Set(["claude-fable-5-2", "claude-fable-5-1", "claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5"]);

export class SummaryError extends Error {
  readonly status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "SummaryError";
    this.status = status;
  }
}

/** Streams text for a prompt; throws SummaryError when no complete summary comes back. */
export type Streamer = (prompt: SummaryPrompt, model: string, signal: AbortSignal) => AsyncIterable<string>;

export function summaryModel(env: Record<string, string | undefined> = process.env): string {
  return env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}

export function createClaudeStreamer(client: Anthropic = new Anthropic()): Streamer {
  return async function* stream(prompt, model, signal) {
    const fallback = FALLBACK_MODELS.has(model);
    let message;
    try {
      const stream = client.beta.messages.stream(
        {
          model,
          max_tokens: MAX_TOKENS,
          output_config: { effort: "low" },
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }],
          ...(fallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
        },
        { signal },
      );
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
      }
      message = await stream.finalMessage();
    } catch (error) {
      throw toSummaryError(error);
    }
    if (message.stop_reason === "refusal") throw new SummaryError("Claude declined to summarize this view.");
    if (message.stop_reason === "max_tokens") throw new SummaryError("The summary was cut off. Try again.");
  };
}

function toSummaryError(error: unknown): Error {
  if (error instanceof Anthropic.APIUserAbortError) return error;
  if (error instanceof Anthropic.RateLimitError) return new SummaryError("The summary service is busy. Try again in a minute.", 503);
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new SummaryError("Summaries are unavailable right now.", 503);
  }
  if (error instanceof Anthropic.APIError) return new SummaryError("The summary service had a problem. Try again.", 502);
  return new SummaryError("The summary couldn’t be written. Try again.", 502);
}
