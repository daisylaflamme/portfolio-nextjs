/**
 * Shape of src/data/larrys-secret.json (built by scripts/build_larrys_data.py).
 * Anonymized and aggregated: no customer names or raw transactions.
 */

export interface LarrysMeta {
  title: string;
  source: string;
  /** ISO dates, first and last day of sales. */
  dateRange: [string, string];
  /** Fiscal weeks present in the data, ascending. */
  weeks: number[];
  rawLines: number;
  duplicateLinesRemoved: number;
  lines: number;
  transactions: number;
  loyaltyCustomers: number;
  /** Loyalty customers whose home zip had fewer than 3 customers (left off the map). */
  loyaltyCustomersInSmallZips: number;
  /** Average line amount across all lines, in dollars. */
  overallAvgLine: number;
  discountTiers2013: {
    workbook1: Thresholds;
    workbook2: Thresholds;
    labels: [string, string, string];
  };
}

export interface Store {
  id: number;
  name: string;
  city: string;
  zip: string;
}

export interface Sku {
  id: string;
  name: string;
  cost: number;
  listPrice: number;
}

/** Store × fiscal week × SKU totals. Revenue and cost in dollars. */
export interface StoreWeekSku {
  store: number;
  week: number;
  sku: string;
  revenue: number;
  cost: number;
  units: number;
  lines: number;
}

export interface DailyRow {
  store: number;
  /** ISO date. */
  date: string;
  week: number;
  revenue: number;
  transactions: number;
  items: number;
  loyaltyTransactions: number;
}

/** Units and revenue sold at one price, per store and SKU (whole period). */
export interface PricePoint {
  store: number;
  sku: string;
  price: number;
  units: number;
  revenue: number;
}

/** Transactions at a store that contained both SKUs (a < b). Whole period. */
export interface BasketPair {
  store: number;
  a: string;
  b: string;
  transactions: number;
}

export interface SkuTransactions {
  store: number;
  sku: string;
  transactions: number;
}

export interface LoyaltyCustomer {
  /** Anonymous id (C001…), shuffled so it carries no link to the source. */
  id: string;
  avgLine: number;
  spend: number;
  transactions: number;
  homeStore: number;
  /** avgLine ÷ meta.overallAvgLine, the 2013 workbook's discount metric. */
  ratio: number;
  ageBand: string;
}

export interface LoyaltyZip {
  zip: string;
  place: string;
  county: string;
  lat: number;
  lon: number;
  customers: number;
  population: number;
  medianAge: number;
  avgIncome: number;
}

export interface LarrysData {
  meta: LarrysMeta;
  stores: Store[];
  skus: Sku[];
  storeWeekSku: StoreWeekSku[];
  daily: DailyRow[];
  pricePoints: PricePoint[];
  basketPairs: BasketPair[];
  skuTransactions: SkuTransactions[];
  loyaltyCustomers: LoyaltyCustomer[];
  loyaltyZips: LoyaltyZip[];
}

/**
 * What the browser needs: no zip/demographic rows (the map is drawn on the server), no
 * per-SKU transaction counts, and only each loyalty customer's ratio and home store.
 */
export type ClientLarrysData = Omit<LarrysData, "loyaltyCustomers" | "loyaltyZips" | "skuTransactions"> & {
  loyaltyCustomers: Pick<LoyaltyCustomer, "homeStore" | "ratio">[];
};

export type StoreFilter = number | "all";

export interface Filters {
  store: StoreFilter;
  /** Inclusive fiscal-week range. Omit for all weeks. */
  weeks?: [number, number];
}

/** Discount thresholds as multiples of the overall average line: t1 < t2 < t3. */
export type Thresholds = [number, number, number];
