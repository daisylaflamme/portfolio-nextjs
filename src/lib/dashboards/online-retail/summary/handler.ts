/**
 * The "Summarize this view" request handler, with its dependencies injected so tests can run
 * it without a key or network. The route (src/app/api/online-retail/summary/route.ts) wires
 * the real ones.
 *
 * Order matters for cost: validate, then the cache (free), then the per-IP rate limit and the
 * daily cap, and only then recompute the facts and call Claude.
 *
 * Response: NDJSON, one event per line:
 *   {"type":"text","text":"…"}  …  {"type":"done","cached":false}
 *   or {"type":"error","message":"…"}
 */
import type { DataSource } from "../source.ts";
import { buildFacts } from "./facts.ts";
import { clientIp, summaryCacheKey, type DailyCap, type RateLimiter, type SummaryCache } from "./guards.ts";
import { buildSummaryPrompt } from "./prompt.ts";
import { SummaryError, type Streamer } from "./claude.ts";
import { MAX_BODY_BYTES, parseSummaryRequest } from "./validate.ts";

export interface SummaryDeps {
  source: DataSource;
  model: string;
  streamer: Streamer;
  cache: SummaryCache;
  limiter: RateLimiter;
  cap: DailyCap;
  log?: (message: string, error?: unknown) => void;
}

export type SummaryEvent = { type: "text"; text: string } | { type: "done"; cached: boolean } | { type: "error"; message: string };

const NDJSON = { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" };
const line = (e: SummaryEvent) => `${JSON.stringify(e)}\n`;

function errorResponse(status: number, message: string, headers: Record<string, string> = {}) {
  return new Response(line({ type: "error", message }), { status, headers: { ...NDJSON, ...headers } });
}

export async function handleSummary(request: Request, deps: SummaryDeps): Promise<Response> {
  const log = deps.log ?? ((m, e) => console.error(m, e));
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return errorResponse(415, "Send JSON.");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return errorResponse(413, "Request too large.");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return errorResponse(400, "Body must be valid JSON.");
  }
  const parsed = parseSummaryRequest(body, deps.source.meta);
  if (!parsed.ok) return errorResponse(400, parsed.error);

  const key = summaryCacheKey(parsed.value, deps.source.meta, deps.model);
  const cached = await deps.cache.get(key).catch((e) => {
    log("[online-retail] summary cache read failed", e);
    return undefined;
  });
  if (cached) return new Response(line({ type: "text", text: cached }) + line({ type: "done", cached: true }), { headers: NDJSON });

  const limit = deps.limiter.take(clientIp(request.headers));
  if (!limit.ok) {
    return errorResponse(429, "Too many summaries from this address. Try again in a few minutes.", { "retry-after": String(limit.retryAfter) });
  }
  if (!(await deps.cap.take())) return errorResponse(429, "Today’s summary limit has been reached. Try again tomorrow.");

  const facts = await buildFacts(parsed.value.tab, parsed.value.filters, deps.source);
  const prompt = buildSummaryPrompt(facts);
  const signal = request.signal;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (e: SummaryEvent) => controller.enqueue(enc.encode(line(e)));
      let summary = "";
      try {
        for await (const chunk of deps.streamer(prompt, deps.model, signal)) {
          summary += chunk;
          send({ type: "text", text: chunk });
        }
        const complete = summary.trim();
        if (!complete) throw new SummaryError("The summary came back empty. Try again.");
        send({ type: "done", cached: false });
        await deps.cache.set(key, complete, deps.model).catch((e) => log("[online-retail] summary cache write failed", e));
      } catch (error) {
        if (signal.aborted) return; // the visitor pressed stop; nothing to report
        if (!(error instanceof SummaryError)) log("[online-retail] summary failed", error);
        send({ type: "error", message: error instanceof SummaryError ? error.message : "The summary couldn’t be written. Try again." });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed by a client abort.
        }
      }
    },
  });
  return new Response(stream, { headers: NDJSON });
}
