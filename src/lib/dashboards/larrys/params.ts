/**
 * URL state for the dashboard: ?store=424&t=1,1.6,2.2&sku=S4803.
 * Anything missing or invalid falls back to the defaults, so every link renders.
 */
import { isValidThresholds } from "./selectors.ts";
import type { ClientLarrysData, StoreFilter, Thresholds } from "./types.ts";

export interface DashboardParams {
  store: StoreFilter;
  thresholds: Thresholds;
  sku: string;
}

/** Slider ranges from the design (multiples of the overall average line). */
export const THRESHOLD_RANGES: readonly { min: number; max: number }[] = [
  { min: 0.8, max: 1.6 },
  { min: 1.2, max: 3.0 },
  { min: 1.6, max: 3.5 },
];
export const THRESHOLD_STEP = 0.1;

export const DEFAULT_SKU = "S7310";

/** Rounds to the slider step (one decimal). */
export const toStep = (v: number) => Math.round(v * 10) / 10;

export function defaultParams(data: ClientLarrysData): DashboardParams {
  return { store: "all", thresholds: [...data.meta.discountTiers2013.workbook1], sku: DEFAULT_SKU };
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(source: ParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const v = source[key];
  return Array.isArray(v) ? v[0] : v;
}

function parseThresholds(value: string | undefined): Thresholds | null {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length !== 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p.trim()))) return null;
  const t = parts.map((p) => toStep(Number(p)));
  const inRange = t.every((v, i) => v >= THRESHOLD_RANGES[i].min && v <= THRESHOLD_RANGES[i].max);
  return inRange && isValidThresholds(t) ? t : null;
}

export function parseDashboardParams(data: ClientLarrysData, source: ParamSource): DashboardParams {
  const defaults = defaultParams(data);
  const storeRaw = read(source, "store");
  const storeId = storeRaw && /^\d+$/.test(storeRaw) ? Number(storeRaw) : NaN;
  const store = data.stores.some((s) => s.id === storeId) ? storeId : defaults.store;
  const skuRaw = read(source, "sku");
  const sku = skuRaw && data.skus.some((s) => s.id === skuRaw) ? skuRaw : defaults.sku;
  const thresholds = parseThresholds(read(source, "t")) ?? defaults.thresholds;
  return { store, thresholds, sku };
}

/** Query string for the params, leaving out values that equal the defaults. */
export function serializeDashboardParams(data: ClientLarrysData, p: DashboardParams): string {
  const d = defaultParams(data);
  const q = new URLSearchParams();
  if (p.store !== d.store) q.set("store", String(p.store));
  if (p.thresholds.some((v, i) => v !== d.thresholds[i])) q.set("t", p.thresholds.join(","));
  if (p.sku !== d.sku) q.set("sku", p.sku);
  const s = q.toString();
  return s ? `?${s.replaceAll("%2C", ",")}` : "";
}

/**
 * Sets one threshold from a slider, keeping t1 < t2 < t3: the moved value is clamped
 * to its range and to one step inside its neighbours.
 */
export function withThreshold(t: Thresholds, index: 0 | 1 | 2, value: number): Thresholds {
  const range = THRESHOLD_RANGES[index];
  let lo = range.min;
  let hi = range.max;
  if (index > 0) lo = Math.max(lo, toStep(t[index - 1] + THRESHOLD_STEP));
  if (index < 2) hi = Math.min(hi, toStep(t[index + 1] - THRESHOLD_STEP));
  const next: Thresholds = [...t];
  next[index] = toStep(Math.min(hi, Math.max(lo, value)));
  return next;
}
