/**
 * URL state for the dashboard: ?from=2010-01&to=2011-12&country=germany&category=kitchen-dining.
 * Countries and categories travel as slugs so shared links stay readable. Anything missing
 * or invalid falls back to the defaults (the whole period, all countries, all categories),
 * so every link renders.
 */
import type { DashboardMeta, Filters } from "./types.ts";

export const ALL = "all";

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

/** "Home décor & signs" → "home-decor-signs", "United Kingdom" → "united-kingdom". */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function defaultFilters(meta: DashboardMeta): Filters {
  return { from: meta.months[0], to: meta.months[meta.months.length - 1], country: ALL, category: ALL };
}

function read(source: ParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const v = source[key];
  return Array.isArray(v) ? v[0] : v;
}

function fromSlug(options: string[], slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  return options.find((o) => slugify(o) === slug);
}

export function parseFilters(meta: DashboardMeta, source: ParamSource): Filters {
  const d = defaultFilters(meta);
  const fromRaw = read(source, "from");
  const toRaw = read(source, "to");
  let from = fromRaw && meta.months.includes(fromRaw) ? fromRaw : d.from;
  let to = toRaw && meta.months.includes(toRaw) ? toRaw : d.to;
  // A reversed range isn't a range: show the whole period rather than guess.
  if (from > to) [from, to] = [d.from, d.to];
  return {
    from,
    to,
    country: fromSlug(meta.countries, read(source, "country")) ?? d.country,
    category: fromSlug(meta.categories, read(source, "category")) ?? d.category,
  };
}

/** Query string for the filters, leaving out values that equal the defaults ("" when all are). */
export function serializeFilters(meta: DashboardMeta, f: Filters): string {
  const d = defaultFilters(meta);
  const q = new URLSearchParams();
  if (f.from !== d.from) q.set("from", f.from);
  if (f.to !== d.to) q.set("to", f.to);
  if (f.country !== ALL) q.set("country", slugify(f.country));
  if (f.category !== ALL) q.set("category", slugify(f.category));
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Keeps a range valid when one end moves: the other end follows if they would cross. */
export function withRange(f: Filters, patch: { from?: string; to?: string }): Filters {
  let { from, to } = { from: patch.from ?? f.from, to: patch.to ?? f.to };
  if (from > to) {
    if (patch.from !== undefined) to = from;
    else from = to;
  }
  return { ...f, from, to };
}
