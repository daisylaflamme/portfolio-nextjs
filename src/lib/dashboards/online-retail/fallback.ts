/**
 * Wraps the live source so a database problem never breaks the page: any failed call is
 * logged and answered from the snapshot instead, and status() reports "snapshot" until the
 * database answers again (checked at most every 30 seconds).
 */
import type { DataSource, SourceKind } from "./source.ts";
import type { Filters, ProductMonthly, ProductSearchRow } from "./types.ts";

const RECHECK_MS = 30_000;

export function withSnapshotFallback(
  live: DataSource,
  snapshot: DataSource,
  ping: () => Promise<unknown>,
  log: (message: string, error: unknown) => void = (m, e) => console.error(m, e),
): DataSource {
  let failedAt = 0;
  let checked: { at: number; kind: SourceKind } | null = null;

  function guard<A extends unknown[], R>(name: string, call: (...args: A) => Promise<R>, fallback: (...args: A) => Promise<R>) {
    return async (...args: A): Promise<R> => {
      try {
        return await call(...args);
      } catch (error) {
        failedAt = Date.now();
        checked = { at: failedAt, kind: "snapshot" };
        log(`[online-retail] live ${name} failed; answering from the snapshot`, error);
        return fallback(...args);
      }
    };
  }

  const pick = <K extends keyof DataSource>(name: K) => {
    const l = live[name] as unknown as (...args: unknown[]) => Promise<unknown>;
    const s = snapshot[name] as unknown as (...args: unknown[]) => Promise<unknown>;
    return guard(String(name), l.bind(live), s.bind(snapshot)) as DataSource[K];
  };

  return {
    kind: "live",
    meta: live.meta,
    async status() {
      const now = Date.now();
      if (checked && now - checked.at < RECHECK_MS) return checked.kind;
      try {
        await ping();
        checked = { at: now, kind: "live" };
      } catch (error) {
        checked = { at: now, kind: "snapshot" };
        if (now - failedAt > RECHECK_MS) log("[online-retail] database unreachable; showing the snapshot", error);
        failedAt = now;
      }
      return checked.kind;
    },
    kpis: pick("kpis"),
    monthlyRevenue: pick("monthlyRevenue"),
    countries: pick("countries"),
    topProducts: pick("topProducts"),
    basket: pick("basket"),
    cohorts: pick("cohorts"),
    segments: pick("segments"),
    returns: pick("returns"),
    // Live-only features: on failure there's nothing to fall back to, so they come back empty.
    searchProducts: live.searchProducts
      ? guard<[string, Filters], ProductSearchRow[]>("searchProducts", live.searchProducts.bind(live), async () => [])
      : undefined,
    productMonthly: live.productMonthly
      ? guard<[string, Filters], ProductMonthly | null>("productMonthly", live.productMonthly.bind(live), async () => null)
      : undefined,
  };
}
