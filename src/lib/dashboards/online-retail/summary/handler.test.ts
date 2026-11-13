import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { onlineRetailSource as source } from "../data.ts";
import { slugify } from "../params.ts";
import { SummaryError, summaryModel, DEFAULT_MODEL, type Streamer } from "./claude.ts";
import { MemoryCache, MemoryDailyCap, RateLimiter } from "./guards.ts";
import { handleSummary, type SummaryDeps, type SummaryEvent } from "./handler.ts";
import type { SummaryPrompt } from "./prompt.ts";

const germany = source.meta.topCountries[3];
const BODY = { tab: "overview", filters: { from: "2011-01", to: "2011-06", country: slugify(germany) } };

/** A Streamer that records prompts and yields the given chunks (or throws). */
function fakeStreamer(chunks: string[] | Error): Streamer & { prompts: SummaryPrompt[] } {
  const prompts: SummaryPrompt[] = [];
  const s = async function* (prompt: SummaryPrompt) {
    prompts.push(prompt);
    if (chunks instanceof Error) throw chunks;
    for (const c of chunks) yield c;
  } as unknown as Streamer & { prompts: SummaryPrompt[] };
  s.prompts = prompts;
  return s;
}

function deps(over: Partial<SummaryDeps> = {}): SummaryDeps {
  return {
    source,
    model: "test-model",
    streamer: fakeStreamer(["Revenue was ", "£83,575."]),
    cache: new MemoryCache(),
    limiter: new RateLimiter(5, 60_000),
    cap: new MemoryDailyCap(10),
    log: () => {},
    ...over,
  };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/online-retail/summary", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function events(res: Response): Promise<SummaryEvent[]> {
  return (await res.text()).trim().split("\n").map((l) => JSON.parse(l) as SummaryEvent);
}

describe("handleSummary", () => {
  it("streams the summary as NDJSON and sends Claude only server-computed facts", async () => {
    const streamer = fakeStreamer(["Revenue was ", "£83,575."]);
    const res = await handleSummary(post(BODY), deps({ streamer }));
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /ndjson/);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.deepEqual(await events(res), [
      { type: "text", text: "Revenue was " },
      { type: "text", text: "£83,575." },
      { type: "done", cached: false },
    ]);
    assert.equal(streamer.prompts.length, 1);
    assert.match(streamer.prompts[0].user, new RegExp(`Country: ${germany}`));
    assert.match(streamer.prompts[0].user, /Date range: Jan 2011 – Jun 2011/);
  });

  it("serves a cached summary without calling Claude or spending the limits", async () => {
    const streamer = fakeStreamer(["Fresh summary."]);
    const d = deps({ streamer, limiter: new RateLimiter(1, 60_000), cap: new MemoryDailyCap(1) });
    await events(await handleSummary(post(BODY), d));
    const again = await handleSummary(post(BODY), d);
    assert.deepEqual(await events(again), [
      { type: "text", text: "Fresh summary." },
      { type: "done", cached: true },
    ]);
    assert.equal(streamer.prompts.length, 1);
  });

  it("rejects bad input before anything else", async () => {
    const streamer = fakeStreamer(["x"]);
    for (const [req, status] of [
      [post({ tab: "overview", revenue: 1 }), 400],
      [post("{not json"), 400],
      [post({ tab: "overview", filters: { note: "x".repeat(2000) } }), 413],
      [new Request("http://localhost/x", { method: "POST", body: "tab=overview" }), 415],
    ] as [Request, number][]) {
      const res = await handleSummary(req, deps({ streamer }));
      assert.equal(res.status, status);
      assert.equal((await events(res))[0].type, "error");
    }
    assert.equal(streamer.prompts.length, 0);
  });

  it("rate limits per IP with Retry-After", async () => {
    const d = deps({ limiter: new RateLimiter(1, 60_000) });
    await handleSummary(post(BODY), d);
    const other = { tab: "returns" };
    const limited = await handleSummary(post(other), d);
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 0);
    const differentIp = await handleSummary(post(other, { "x-forwarded-for": "198.51.100.1" }), d);
    assert.equal(differentIp.status, 200);
  });

  it("stops at the daily cap", async () => {
    const d = deps({ cap: new MemoryDailyCap(1) });
    assert.equal((await handleSummary(post(BODY), d)).status, 200);
    const capped = await handleSummary(post({ tab: "basket" }), d);
    assert.equal(capped.status, 429);
    assert.match(((await events(capped))[0] as { message: string }).message, /limit/);
  });

  it("reports Claude errors as a safe message and doesn't cache them", async () => {
    const cache = new MemoryCache();
    const res = await handleSummary(post(BODY), deps({ cache, streamer: fakeStreamer(new SummaryError("Claude declined to summarize this view.")) }));
    assert.deepEqual(await events(res), [{ type: "error", message: "Claude declined to summarize this view." }]);
    const res2 = await handleSummary(post(BODY), deps({ cache, streamer: fakeStreamer(new Error("socket hang up at 10.0.0.3")) }));
    const [e] = await events(res2);
    assert.equal(e.type, "error");
    assert.doesNotMatch(JSON.stringify(e), /10\.0\.0\.3/);
    assert.equal((await cache.get(`overview|?from=2011-01&to=2011-06&country=${slugify(germany)}|test-model|v1`)), undefined);
  });

  it("an empty summary is an error", async () => {
    const res = await handleSummary(post(BODY), deps({ streamer: fakeStreamer(["  "]) }));
    const all = await events(res);
    assert.equal(all.at(-1)?.type, "error");
  });
});

describe("summaryModel", () => {
  it("comes from ANTHROPIC_MODEL, defaulting to Claude Opus 5.5", () => {
    assert.equal(summaryModel({}), DEFAULT_MODEL);
    assert.equal(DEFAULT_MODEL, "claude-opus-5-5");
    assert.equal(summaryModel({ ANTHROPIC_MODEL: " claude-haiku-5-5 " }), "claude-haiku-5-5");
  });
});

describe("summariesEnabled", () => {
  it("is true only with a non-empty ANTHROPIC_API_KEY", async () => {
    const { summariesEnabled } = await import("./enabled.ts");
    assert.equal(summariesEnabled({}), false);
    assert.equal(summariesEnabled({ ANTHROPIC_API_KEY: "  " }), false);
    assert.equal(summariesEnabled({ ANTHROPIC_API_KEY: "sk-ant-test" }), true);
  });
});
