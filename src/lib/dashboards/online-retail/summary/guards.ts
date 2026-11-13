/**
 * Cost guards for summaries: a per-IP rate limit, a daily cap on Claude calls, and a cache.
 * Cache hits count toward neither limit. The in-memory versions are per server instance;
 * with the live database, the cap and cache are shared through Postgres (summaryStore.ts).
 */
import { serializeFilters } from "../params.ts";
import type { DashboardMeta } from "../types.ts";
import { PROMPT_VERSION } from "./prompt.ts";
import type { SummaryRequest } from "./validate.ts";

export const RATE_LIMIT = { requests: 5, windowMs: 10 * 60_000 };
export const SUMMARY_DAILY_CAP = 200;

type Clock = () => number;

/** Sliding window per key (an IP address). */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: Clock;
  private readonly maxKeys: number;

  constructor(limit = RATE_LIMIT.requests, windowMs = RATE_LIMIT.windowMs, now: Clock = Date.now, maxKeys = 10_000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
    this.maxKeys = maxKeys;
  }

  /** Records a request; ok false (with seconds to wait) when the key is over the limit. */
  take(key: string): { ok: true } | { ok: false; retryAfter: number } {
    const t = this.now();
    const recent = (this.hits.get(key) ?? []).filter((h) => t - h < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return { ok: false, retryAfter: Math.max(1, Math.ceil((recent[0] + this.windowMs - t) / 1000)) };
    }
    recent.push(t);
    this.hits.delete(key);
    this.hits.set(key, recent);
    // Bounded memory: drop the oldest keys (Map keeps insertion order).
    while (this.hits.size > this.maxKeys) this.hits.delete(this.hits.keys().next().value as string);
    return { ok: true };
  }
}

export interface DailyCap {
  /** Counts one Claude call; false when today's cap is already used up. */
  take(): Promise<boolean>;
}

const utcDay = (t: number) => new Date(t).toISOString().slice(0, 10);

export class MemoryDailyCap implements DailyCap {
  private day = "";
  private calls = 0;
  private readonly cap: number;
  private readonly now: Clock;

  constructor(cap = SUMMARY_DAILY_CAP, now: Clock = Date.now) {
    this.cap = cap;
    this.now = now;
  }

  async take(): Promise<boolean> {
    const d = utcDay(this.now());
    if (d !== this.day) {
      this.day = d;
      this.calls = 0;
    }
    if (this.calls >= this.cap) return false;
    this.calls += 1;
    return true;
  }
}

export interface SummaryCache {
  get(key: string): Promise<string | undefined>;
  set(key: string, summary: string, model: string): Promise<void>;
}

/** Least-recently-used in-memory cache. */
export class MemoryCache implements SummaryCache {
  private entries = new Map<string, string>();
  private readonly max: number;

  constructor(max = 500) {
    this.max = max;
  }

  async get(key: string) {
    const v = this.entries.get(key);
    if (v !== undefined) {
      this.entries.delete(key);
      this.entries.set(key, v);
    }
    return v;
  }

  async set(key: string, summary: string) {
    this.entries.delete(key);
    this.entries.set(key, summary);
    while (this.entries.size > this.max) this.entries.delete(this.entries.keys().next().value as string);
  }
}

/** Same tab, filters, model and prompt version → same summary (the data never changes). */
export function summaryCacheKey(req: SummaryRequest, meta: DashboardMeta, model: string): string {
  return [req.tab, serializeFilters(meta, req.filters) || "?", model, PROMPT_VERSION].join("|");
}

/** The client's IP as Vercel (and most proxies) report it. */
export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
}
