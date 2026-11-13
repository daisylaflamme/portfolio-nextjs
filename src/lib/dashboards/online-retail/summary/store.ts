/**
 * Postgres-backed cache and daily cap for summaries (db/online-retail/005_ai_summaries.sql),
 * used when ONLINE_RETAIL_DATABASE_URL is set so the guards hold across server instances.
 * Writes run in an explicit READ WRITE transaction: the reader role's sessions are read-only
 * by default, and its grants allow writing only these two tables.
 */
import type { Query } from "../sql.ts";
import { MemoryCache, SUMMARY_DAILY_CAP, type DailyCap, type SummaryCache } from "./guards.ts";

/** Runs queries inside one READ WRITE transaction (BEGIN/COMMIT, ROLLBACK on error). */
export type WriteTransaction = <T>(queries: Query[]) => Promise<T[][]>;
export type ReadRunner = <T>(query: Query) => Promise<T[]>;

export const cacheGetQuery = (key: string): Query => ({
  text: "select summary from online_retail.ai_summaries where cache_key = $1",
  values: [key],
});

export const cacheSetQuery = (key: string, summary: string, model: string): Query => ({
  text: "insert into online_retail.ai_summaries (cache_key, summary, model) values ($1, $2, $3) on conflict (cache_key) do nothing",
  values: [key, summary, model],
});

/** Counts one call for today (UTC) and returns the new total. */
export const usageTakeQuery = (): Query => ({
  text: `insert into online_retail.ai_summary_usage (day, calls) values ((now() at time zone 'utc')::date, 1)
on conflict (day) do update set calls = online_retail.ai_summary_usage.calls + 1
returning calls`,
  values: [],
});

/** Memory first (fast, per instance), then Postgres (shared). */
export class PostgresCache implements SummaryCache {
  private readonly memory = new MemoryCache();
  private readonly read: ReadRunner;
  private readonly write: WriteTransaction;

  constructor(read: ReadRunner, write: WriteTransaction) {
    this.read = read;
    this.write = write;
  }

  async get(key: string) {
    const hit = await this.memory.get(key);
    if (hit) return hit;
    const [row] = await this.read<{ summary: string }>(cacheGetQuery(key));
    if (row) await this.memory.set(key, row.summary);
    return row?.summary;
  }

  async set(key: string, summary: string, model: string) {
    await this.memory.set(key, summary);
    await this.write([cacheSetQuery(key, summary, model)]);
  }
}

/** Uses the shared cap, and falls back to this instance's own count if Postgres fails. */
export class FallbackDailyCap implements DailyCap {
  private readonly primary: DailyCap;
  private readonly fallback: DailyCap;
  private readonly log: (message: string, error: unknown) => void;

  constructor(primary: DailyCap, fallback: DailyCap, log: (message: string, error: unknown) => void = (m, e) => console.error(m, e)) {
    this.primary = primary;
    this.fallback = fallback;
    this.log = log;
  }

  async take(): Promise<boolean> {
    try {
      return await this.primary.take();
    } catch (error) {
      this.log("[online-retail] shared summary cap unavailable; using this instance's count", error);
      return this.fallback.take();
    }
  }
}

export class PostgresDailyCap implements DailyCap {
  private readonly write: WriteTransaction;
  private readonly cap: number;

  constructor(write: WriteTransaction, cap = SUMMARY_DAILY_CAP) {
    this.write = write;
    this.cap = cap;
  }

  async take(): Promise<boolean> {
    const [[row]] = await this.write<{ calls: number }>([usageTakeQuery()]);
    return Number(row?.calls ?? Infinity) <= this.cap;
  }
}
