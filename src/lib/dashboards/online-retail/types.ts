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
