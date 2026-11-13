/**
 * Shape of src/data/online-retail/snapshot.json (built by scripts/build_online_retail_data.py).
 * Aggregated only: no customer names, no Customer IDs, no raw lines. See README.md in this folder for the rules.
 */

/** A compact table: `rows` are tuples in `columns` order. */
export interface Table<Columns extends readonly string[], Row extends readonly unknown[]> {
  columns: Columns;
  rows: Row[];
}

/** "all" or a country name. */
export type Scope = string;

export type SegmentName = "Champions" | "Loyal" | "Promising" | "At risk" | "Lost";

export interface OnlineRetailMeta {
  title: string;
  source: string;
  sourceUrl: string;
  licenseUrl: string;
  currency: "GBP";
  /** ISO dates of the first and last invoice. */
  dateRange: [string, string];
  /** "YYYY-MM", ascending. */
  months: string[];
  yearNote: string;
  rawLines: number;
  /** Lines removed by each cleaning rule, in the order applied. */
  rowsRemoved: Record<string, number>;
  cleanLines: number;
  salesLines: number;
  returnLines: number;
  invoices: number;
  orders: number;
  guestOrders: number;
  /** Customers with an ID and at least one sale. */
  customers: number;
  products: number;
  revenue: number;
  units: number;
  returnsValue: number;
  /** All countries, by revenue descending. */
  countries: string[];
  topCountries: string[];
  categories: string[];
  categoryMethod: string;
  additivity: string;
  cleaningRules: string[];
  rfmRules: { referenceDate: string; scores: string; segments: Record<SegmentName, string> };
  cohortRule: string;
  productSpanRule: string;
  basketRule: string;
}

export interface OnlineRetailSnapshot {
  meta: OnlineRetailMeta;
  /** StockCode → description, for every code referenced below. */
  products: Record<string, string>;
  monthCountry: Table<
    ["month", "country", "revenue", "units", "orders", "returnsValue", "returnLines"],
    [string, string, number, number, number, number, number]
  >;
  /** `orders` = invoices containing the category, so it does not add up across categories. */
  monthCountryCategory: Table<
    ["month", "country", "category", "revenue", "units", "orders", "returnsValue", "returnLines"],
    [string, string, string, number, number, number, number, number]
  >;
  topProducts: Table<["scope", "year", "code", "units", "revenue"], [Scope, number, string, number, number]>;
  /** "all" and the top-5 countries, per contiguous span of calendar years. */
  productSpans: Table<["scope", "fromYear", "toYear", "products", "revenue"], [Scope, number, number, number, number]>;
  /** curve[i] = share of revenue from the top (i + 1)% of products by revenue; 100 points ending at 1. */
  productCurves: Table<["scope", "fromYear", "toYear", "curve"], [Scope, number, number, number[]]>;
  /** Exact top 200 by revenue per scope and span of years. */
  topProductsSpan: Table<
    ["scope", "fromYear", "toYear", "code", "units", "revenue"],
    [Scope, number, number, string, number, number]
  >;
  basketTopProducts: Table<["scope", "code", "orders", "share"], [Scope, string, number, number]>;
  basketTopPairs: Table<["scope", "a", "b", "orders", "share"], [Scope, string, string, number, number]>;
  cohorts: Table<
    ["scope", "cohort", "size", "monthsSince", "active", "share"],
    [Scope, string, number, number, number, number]
  >;
  segments: Table<
    ["scope", "segment", "customers", "share", "avgRecencyDays", "avgOrders", "avgRevenue"],
    [Scope, SegmentName, number, number, number, number, number]
  >;
}

export interface OnlineRetailCategories {
  method: string;
  categories: string[];
  /** StockCode → category. */
  codes: Record<string, string>;
}

// ---- Dashboard views ------------------------------------------------------------------------------------------

/** What the dashboard is filtered to. Months are "YYYY-MM", inclusive. */
export interface Filters {
  from: string;
  to: string;
  /** A country name from meta.countries, or "all". */
  country: string;
  /** A category from meta.categories, or "all". */
  category: string;
}

/** The parts of meta the filters and pages need (small enough to send to the browser). */
export interface DashboardMeta {
  months: string[];
  countries: string[];
  topCountries: string[];
  categories: string[];
  dateRange: [string, string];
  source: string;
  sourceUrl: string;
  licenseUrl: string;
  categoryMethod: string;
}

export interface KpiValues {
  revenue: number;
  /** Distinct invoices; with a category filter, invoices containing that category. */
  orders: number;
  units: number;
  /** revenue ÷ orders */
  averageOrderValue: number;
  returnsValue: number;
  /** returnsValue ÷ revenue */
  returnRate: number;
}

export interface Kpis {
  current: KpiValues;
  /** The same number of months straight before `from`, or null when the data starts later. */
  previous: KpiValues | null;
  previousRange: { from: string; to: string } | null;
}

export interface MonthPoint {
  month: string;
  revenue: number;
  orders: number;
  /** Inside the selected From–To range. */
  inRange: boolean;
}

export interface CountryRevenue {
  country: string;
  revenue: number;
  orders: number;
  /** Share of revenue across all countries for the same months and category. */
  share: number;
}

export interface ProductRow {
  code: string;
  description: string;
  category: string;
  units: number;
  revenue: number;
  /** Share of the scope's revenue for the same years (all categories). */
  share: number;
}

export interface ProductsView {
  /** "all" or the country the numbers are for. */
  scope: Scope;
  /** Calendar years the ranking covers (the years the From–To range touches). */
  fromYear: number;
  toYear: number;
  /**
   * True for "all" and the top-5 countries: an exact ranking for the span of years.
   * False for other countries: each year's top 200 summed, so multi-year totals can miss
   * products that were outside one year's top 200.
   */
  exact: boolean;
  /** Products sold in the scope and years; null when only the top 200 per year is known. */
  productCount: number | null;
  /** Revenue of the scope and years, all categories. */
  totalRevenue: number;
  /** Pareto curve, all categories: curve[i] = share of revenue from the top (i + 1)% of products. */
  curve: number[] | null;
  /** Ranked by revenue, filtered by category (at most 200). */
  rows: ProductRow[];
}

export interface BasketView {
  scope: Scope;
  /** True when the requested country has no basket data, so "all" is shown. */
  fallback: boolean;
  orders: number;
  products: { code: string; description: string; orders: number; share: number }[];
  /** share[i][j] = share of orders containing both products i and j; null on the diagonal. */
  share: (number | null)[][];
  /** Orders containing both products. */
  counts: (number | null)[][];
}

export interface CohortRow {
  cohort: string;
  size: number;
  /** Retention share for months since 1..maxMonths; null where that month is after `to` or past the data. */
  cells: (number | null)[];
}

export interface CohortsView {
  scope: Scope;
  fallback: boolean;
  maxMonths: number;
  rows: CohortRow[];
}

export interface SegmentRow {
  segment: SegmentName;
  customers: number;
  share: number;
  avgRecencyDays: number;
  avgOrders: number;
  avgRevenue: number;
}

export interface SegmentsView {
  scope: Scope;
  fallback: boolean;
  customers: number;
  referenceDate: string;
  rows: SegmentRow[];
}

export interface ReturnRow {
  country: string;
  revenue: number;
  returnsValue: number;
  returnLines: number;
  orders: number;
  /** returnsValue ÷ revenue */
  rate: number;
}

export interface ReturnsView {
  /** Countries need at least this many orders in the range to be ranked. */
  minOrders: number;
  rows: ReturnRow[];
  /** Countries left out for having fewer orders. */
  excluded: number;
  overall: { revenue: number; returnsValue: number; rate: number };
}
