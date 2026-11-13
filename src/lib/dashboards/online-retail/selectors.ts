/**
 * Pure selectors over the Online Retail snapshot. Every number on the dashboard comes from
 * one of these, through the DataSource in snapshotSource.ts. Server-only: the snapshot is
 * 1.3 MB, so pages pass the selected results to the browser, never the snapshot.
 */
import type {
  BasketView,
  CohortsView,
  CountryRevenue,
  DashboardMeta,
  Filters,
  KpiValues,
  Kpis,
  MonthPoint,
  OnlineRetailCategories,
  OnlineRetailSnapshot,
  ProductRow,
  ProductsView,
  ReturnsView,
  SegmentsView,
} from "./types.ts";
import { ALL } from "./params.ts";

export { ALL };

/** Cohort heatmap columns: months since the first order. */
export const COHORT_MONTHS = 12;
/** A country needs this many orders in the range to get a return rate. */
export const RETURNS_MIN_ORDERS = 50;

type Row = OnlineRetailSnapshot["monthCountry"]["rows"][number];

export function dashboardMeta(s: OnlineRetailSnapshot): DashboardMeta {
  const m = s.meta;
  return {
    months: m.months,
    countries: m.countries,
    topCountries: m.topCountries,
    categories: m.categories,
    dateRange: m.dateRange,
    source: m.source,
    sourceUrl: m.sourceUrl,
    licenseUrl: m.licenseUrl,
    categoryMethod: m.categoryMethod,
  };
}

/** Month × country rows for the filters' category ("all" uses monthCountry), as [month, country, revenue, units, orders, returnsValue, returnLines]. */
function cells(s: OnlineRetailSnapshot, category: string): Row[] {
  if (category === ALL) return s.monthCountry.rows;
  return s.monthCountryCategory.rows
    .filter((r) => r[2] === category)
    .map(([month, country, , revenue, units, orders, returnsValue, returnLines]) => [
      month,
      country,
      revenue,
      units,
      orders,
      returnsValue,
      returnLines,
    ]);
}

const inMonths = (month: string, from: string, to: string) => month >= from && month <= to;
const inCountry = (country: string, filter: string) => filter === ALL || country === filter;

function totals(rows: Row[]): KpiValues {
  let revenue = 0;
  let units = 0;
  let orders = 0;
  let returnsValue = 0;
  for (const r of rows) {
    revenue += r[2];
    units += r[3];
    orders += r[4];
    returnsValue += r[5];
  }
  return {
    revenue,
    orders,
    units,
    averageOrderValue: orders ? revenue / orders : 0,
    returnsValue,
    returnRate: revenue ? returnsValue / revenue : 0,
  };
}

/** The months of equal length straight before `from`, or null if the data starts later. */
export function previousRange(months: string[], from: string, to: string): { from: string; to: string } | null {
  const i = months.indexOf(from);
  const j = months.indexOf(to);
  if (i < 0 || j < i) return null;
  const length = j - i + 1;
  if (i - length < 0) return null;
  return { from: months[i - length], to: months[i - 1] };
}

export function selectKpis(s: OnlineRetailSnapshot, f: Filters): Kpis {
  const rows = cells(s, f.category).filter((r) => inCountry(r[1], f.country));
  const current = totals(rows.filter((r) => inMonths(r[0], f.from, f.to)));
  const prev = previousRange(s.meta.months, f.from, f.to);
  return {
    current,
    previous: prev ? totals(rows.filter((r) => inMonths(r[0], prev.from, prev.to))) : null,
    previousRange: prev,
  };
}

/** Every month in the data (the line shows the whole period), flagged when inside From–To. */
export function selectMonthlyRevenue(s: OnlineRetailSnapshot, f: Filters): MonthPoint[] {
  const byMonth = new Map(s.meta.months.map((m) => [m, { revenue: 0, orders: 0 }]));
  for (const r of cells(s, f.category)) {
    if (!inCountry(r[1], f.country)) continue;
    const m = byMonth.get(r[0]);
    if (!m) continue;
    m.revenue += r[2];
    m.orders += r[4];
  }
  return s.meta.months.map((month) => ({ month, ...(byMonth.get(month) ?? { revenue: 0, orders: 0 }), inRange: inMonths(month, f.from, f.to) }));
}

/** Revenue by country for the months and category, largest first (the country filter only highlights). */
export function selectCountries(s: OnlineRetailSnapshot, f: Filters): CountryRevenue[] {
  const byCountry = new Map<string, { revenue: number; orders: number }>();
  for (const r of cells(s, f.category)) {
    if (!inMonths(r[0], f.from, f.to)) continue;
    const c = byCountry.get(r[1]) ?? { revenue: 0, orders: 0 };
    c.revenue += r[2];
    c.orders += r[4];
    byCountry.set(r[1], c);
  }
  const total = [...byCountry.values()].reduce((a, c) => a + c.revenue, 0);
  return [...byCountry]
    .map(([country, c]) => ({ country, ...c, share: total ? c.revenue / total : 0 }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

const yearOf = (month: string) => Number(month.slice(0, 4));

/** Basket, cohort and segment data exist for "all" and the top-5 countries only. */
function customerScope(s: OnlineRetailSnapshot, country: string): { scope: string; fallback: boolean } {
  if (country === ALL || s.meta.topCountries.includes(country)) return { scope: country, fallback: false };
  return { scope: ALL, fallback: true };
}

export function selectTopProducts(s: OnlineRetailSnapshot, c: OnlineRetailCategories, f: Filters): ProductsView {
  const fromYear = yearOf(f.from);
  const toYear = yearOf(f.to);
  const scope = f.country;
  const exact = scope === ALL || s.meta.topCountries.includes(scope);
  const category = (code: string) => c.codes[code] ?? "Uncategorized";
  let raw: { code: string; units: number; revenue: number }[];
  let productCount: number | null = null;
  let totalRevenue: number;
  let curve: number[] | null = null;

  if (exact) {
    const key = (r: readonly [string, number, number, ...unknown[]]) => r[0] === scope && r[1] === fromYear && r[2] === toYear;
    const span = s.productSpans.rows.find(key);
    productCount = span?.[3] ?? 0;
    totalRevenue = span?.[4] ?? 0;
    curve = s.productCurves.rows.find(key)?.[3] ?? null;
    raw = s.topProductsSpan.rows.filter(key).map(([, , , code, units, revenue]) => ({ code, units, revenue }));
  } else {
    const sums = new Map<string, { units: number; revenue: number }>();
    for (const [rScope, year, code, units, revenue] of s.topProducts.rows) {
      if (rScope !== scope || year < fromYear || year > toYear) continue;
      const p = sums.get(code) ?? { units: 0, revenue: 0 };
      p.units += units;
      p.revenue += revenue;
      sums.set(code, p);
    }
    raw = [...sums].map(([code, p]) => ({ code, ...p })).sort((a, b) => b.revenue - a.revenue).slice(0, 200);
    totalRevenue = s.monthCountry.rows
      .filter((r) => r[1] === scope && yearOf(r[0]) >= fromYear && yearOf(r[0]) <= toYear)
      .reduce((a, r) => a + r[2], 0);
  }

  const rows: ProductRow[] = raw
    .map((p) => ({
      ...p,
      description: s.products[p.code] ?? p.code,
      category: category(p.code),
      share: totalRevenue ? p.revenue / totalRevenue : 0,
    }))
    .filter((p) => f.category === ALL || p.category === f.category);
  return { scope, fromYear, toYear, exact, productCount, totalRevenue, curve, rows };
}

/** Smallest share of products that brings in at least `target` of revenue, from a Pareto curve. */
export function productShareFor(curve: number[], target = 0.8): number {
  const i = curve.findIndex((v) => v >= target);
  return (i < 0 ? curve.length : i + 1) / 100;
}

export function selectBasket(s: OnlineRetailSnapshot, f: Filters): BasketView {
  const { scope, fallback } = customerScope(s, f.country);
  const top = s.basketTopProducts.rows.filter((r) => r[0] === scope);
  const index = new Map(top.map((r, i) => [r[1], i]));
  const n = top.length;
  const share: (number | null)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? null : 0)));
  const counts: (number | null)[][] = share.map((row) => row.map((v) => (v === null ? null : 0)));
  for (const [rScope, a, b, orders, sh] of s.basketTopPairs.rows) {
    if (rScope !== scope) continue;
    const i = index.get(a);
    const j = index.get(b);
    if (i === undefined || j === undefined) continue;
    share[i][j] = share[j][i] = sh;
    counts[i][j] = counts[j][i] = orders;
  }
  // Basket shares cover the whole period and all categories, so the base is every order in the scope.
  const orders = s.monthCountry.rows.filter((r) => inCountry(r[1], scope)).reduce((a, r) => a + r[4], 0);
  return {
    scope,
    fallback,
    orders,
    products: top.map(([, code, o, sh]) => ({ code, description: s.products[code] ?? code, orders: o, share: sh })),
    share,
    counts,
  };
}

/** Cohorts that started inside From–To; cells stop at `to` (later months are outside the selection). */
export function selectCohorts(s: OnlineRetailSnapshot, f: Filters): CohortsView {
  const { scope, fallback } = customerScope(s, f.country);
  const months = s.meta.months;
  const toIndex = months.indexOf(f.to);
  const rows = new Map<string, { size: number; cells: (number | null)[] }>();
  for (const [rScope, cohort, size, since, , sh] of s.cohorts.rows) {
    if (rScope !== scope || !inMonths(cohort, f.from, f.to)) continue;
    const row = rows.get(cohort) ?? { size, cells: Array.from({ length: COHORT_MONTHS }, () => null as number | null) };
    rows.set(cohort, row);
    if (since >= 1 && since <= COHORT_MONTHS && months.indexOf(cohort) + since <= toIndex) row.cells[since - 1] = sh;
  }
  // Months with no returning customers are 0, not missing, as long as they're inside the range.
  for (const [cohort, row] of rows) {
    const start = months.indexOf(cohort);
    row.cells = row.cells.map((v, k) => (v === null && start + k + 1 <= toIndex ? 0 : v));
  }
  return {
    scope,
    fallback,
    maxMonths: COHORT_MONTHS,
    rows: [...rows].sort(([a], [b]) => a.localeCompare(b)).map(([cohort, r]) => ({ cohort, ...r })),
  };
}

/** RFM segments over the whole period (scores need every order, so From–To and category don't apply). */
export function selectSegments(s: OnlineRetailSnapshot, f: Filters): SegmentsView {
  const { scope, fallback } = customerScope(s, f.country);
  const rows = s.segments.rows
    .filter((r) => r[0] === scope)
    .map(([, segment, customers, share, avgRecencyDays, avgOrders, avgRevenue]) => ({
      segment,
      customers,
      share,
      avgRecencyDays,
      avgOrders,
      avgRevenue,
    }));
  return {
    scope,
    fallback,
    customers: rows.reduce((a, r) => a + r.customers, 0),
    referenceDate: s.meta.rfmRules.referenceDate,
    rows,
  };
}

/** Return rate (returns value ÷ revenue) by country for the months and category, highest first. */
export function selectReturns(s: OnlineRetailSnapshot, f: Filters, minOrders = RETURNS_MIN_ORDERS): ReturnsView {
  const byCountry = new Map<string, { revenue: number; returnsValue: number; returnLines: number; orders: number }>();
  for (const r of cells(s, f.category)) {
    if (!inMonths(r[0], f.from, f.to)) continue;
    const c = byCountry.get(r[1]) ?? { revenue: 0, returnsValue: 0, returnLines: 0, orders: 0 };
    c.revenue += r[2];
    c.orders += r[4];
    c.returnsValue += r[5];
    c.returnLines += r[6];
    byCountry.set(r[1], c);
  }
  const all = [...byCountry].map(([country, c]) => ({ country, ...c, rate: c.revenue ? c.returnsValue / c.revenue : 0 }));
  const rows = all.filter((c) => c.orders >= minOrders).sort((a, b) => b.rate - a.rate || b.revenue - a.revenue);
  const revenue = all.reduce((a, c) => a + c.revenue, 0);
  const returnsValue = all.reduce((a, c) => a + c.returnsValue, 0);
  return {
    minOrders,
    rows,
    excluded: all.filter((c) => c.orders < minOrders && (c.revenue > 0 || c.returnsValue > 0)).length,
    overall: { revenue, returnsValue, rate: revenue ? returnsValue / revenue : 0 },
  };
}
