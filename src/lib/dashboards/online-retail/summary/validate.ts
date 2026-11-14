/**
 * Strict validation for "Summarize this view" requests. The body may hold only the tab and
 * the filters (in the URL's format); never numbers. Anything unknown or invalid is rejected
 * rather than replaced by a default, so junk can't fill the cache or spend the daily cap.
 */
import { ONLINE_RETAIL_TABS, type TabId } from "../content.ts";
import { parseFiltersStrict } from "../params.ts";
import type { DashboardMeta, Filters } from "../types.ts";

export interface SummaryRequest {
  tab: TabId;
  filters: Filters;
}

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

/** Largest request body the route accepts, in bytes. */
export const MAX_BODY_BYTES = 1024;
const TAB_IDS = ONLINE_RETAIL_TABS.map((t) => t.id);

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function parseSummaryRequest(body: unknown, meta: DashboardMeta): Parsed<SummaryRequest> {
  if (!isRecord(body)) return { ok: false, error: "Body must be a JSON object." };
  const unknownKeys = Object.keys(body).filter((k) => k !== "tab" && k !== "filters");
  if (unknownKeys.length) return { ok: false, error: `Unknown field: ${unknownKeys[0]}.` };

  const { tab, filters } = body;
  if (typeof tab !== "string" || !TAB_IDS.includes(tab as TabId)) return { ok: false, error: "Unknown tab." };
  // The same strict filter rules as the GraphQL API.
  const parsed = parseFiltersStrict(meta, filters);
  return parsed.ok ? { ok: true, value: { tab: tab as TabId, filters: parsed.value } } : parsed;
}
