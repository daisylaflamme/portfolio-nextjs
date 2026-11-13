/**
 * Strict validation for "Summarize this view" requests. The body may hold only the tab and
 * the filters (in the URL's format); never numbers. Anything unknown or invalid is rejected
 * rather than replaced by a default, so junk can't fill the cache or spend the daily cap.
 */
import { ONLINE_RETAIL_TABS, type TabId } from "../content.ts";
import { ALL, parseFilters, slugify } from "../params.ts";
import type { DashboardMeta, Filters } from "../types.ts";

export interface SummaryRequest {
  tab: TabId;
  filters: Filters;
}

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

/** Largest request body the route accepts, in bytes. */
export const MAX_BODY_BYTES = 1024;
const MAX_STRING = 64;
const FILTER_KEYS = ["from", "to", "country", "category"] as const;
const TAB_IDS = ONLINE_RETAIL_TABS.map((t) => t.id);

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function parseSummaryRequest(body: unknown, meta: DashboardMeta): Parsed<SummaryRequest> {
  if (!isRecord(body)) return { ok: false, error: "Body must be a JSON object." };
  const unknownKeys = Object.keys(body).filter((k) => k !== "tab" && k !== "filters");
  if (unknownKeys.length) return { ok: false, error: `Unknown field: ${unknownKeys[0]}.` };

  const { tab, filters = {} } = body;
  if (typeof tab !== "string" || !TAB_IDS.includes(tab as TabId)) return { ok: false, error: "Unknown tab." };
  if (!isRecord(filters)) return { ok: false, error: "filters must be an object." };
  const unknownFilters = Object.keys(filters).filter((k) => !(FILTER_KEYS as readonly string[]).includes(k));
  if (unknownFilters.length) return { ok: false, error: `Unknown filter: ${unknownFilters[0]}.` };

  const raw: Record<string, string | undefined> = {};
  for (const key of FILTER_KEYS) {
    const v = filters[key];
    if (v === undefined || v === null) continue;
    if (typeof v !== "string" || v.length === 0 || v.length > MAX_STRING) return { ok: false, error: `Invalid ${key}.` };
    raw[key] = v;
  }
  for (const key of ["from", "to"] as const) {
    if (raw[key] !== undefined && !meta.months.includes(raw[key])) return { ok: false, error: `Invalid ${key}.` };
  }
  if (raw.from && raw.to && raw.from > raw.to) return { ok: false, error: "from must not be after to." };
  if (raw.country !== undefined && raw.country !== ALL && !meta.countries.some((c) => slugify(c) === raw.country)) {
    return { ok: false, error: "Unknown country." };
  }
  if (raw.category !== undefined && raw.category !== ALL && !meta.categories.some((c) => slugify(c) === raw.category)) {
    return { ok: false, error: "Unknown category." };
  }
  // Everything is known to be valid now, so the URL parser yields the canonical filters.
  return { ok: true, value: { tab: tab as TabId, filters: parseFilters(meta, raw) } };
}
