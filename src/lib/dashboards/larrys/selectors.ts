/**
 * Pure selectors for the Larry's Secret dashboard. Every selector takes the dataset
 * and the current filters, so the page, the tests and the OG image all compute the
 * same numbers.
 *
 * Grain notes: storeWeekSku and daily have a fiscal week, so the week range applies
 * to them. Price points, basket pairs and loyalty customers are whole-period
 * aggregates; they honor the store filter only. Loyalty towns have no store at all.
 */
import type {
  ClientLarrysData,
  Filters,
  LarrysData,
  LoyaltyZip,
  Sku,
  StoreFilter,
  Thresholds,
} from "./types.ts";

const matchesStore = (store: StoreFilter, id: number) => store === "all" || store === id;

const matchesWeek = (weeks: Filters["weeks"], week: number) =>
  !weeks || (week >= weeks[0] && week <= weeks[1]);

const matches = (f: Filters, row: { store: number; week: number }) =>
  matchesStore(f.store, row.store) && matchesWeek(f.weeks, row.week);

/** Rounds to cents so floating-point sums print and compare cleanly. */
const cents = (v: number) => Math.round(v * 100) / 100;

export interface Kpis {
  revenue: number;
  cost: number;
  grossProfit: number;
  /** 0–1. */
  grossMargin: number;
  units: number;
  transactions: number;
  /** Revenue ÷ transactions. */
  avgBasket: number;
  /** Units ÷ transactions. */
  itemsPerBasket: number;
  loyaltyTransactions: number;
  /** 0–1, share of transactions with a loyalty number. */
  loyaltyShare: number;
}

export function selectKpis(data: ClientLarrysData, f: Filters): Kpis {
  let revenue = 0;
  let cost = 0;
  let units = 0;
  for (const r of data.storeWeekSku) {
    if (!matches(f, r)) continue;
    revenue += r.revenue;
    cost += r.cost;
    units += r.units;
  }
  let transactions = 0;
  let loyaltyTransactions = 0;
  for (const d of data.daily) {
    if (!matches(f, d)) continue;
    transactions += d.transactions;
    loyaltyTransactions += d.loyaltyTransactions;
  }
  revenue = cents(revenue);
  cost = cents(cost);
  return {
    revenue,
    cost,
    grossProfit: cents(revenue - cost),
    grossMargin: revenue ? (revenue - cost) / revenue : 0,
    units,
    transactions,
    avgBasket: transactions ? revenue / transactions : 0,
    itemsPerBasket: transactions ? units / transactions : 0,
    loyaltyTransactions,
    loyaltyShare: transactions ? loyaltyTransactions / transactions : 0,
  };
}

export interface DailyPoint {
  date: string;
  revenue: number;
  transactions: number;
}

/** Revenue per day across the selected stores, in date order. */
export function selectDailyRevenue(data: ClientLarrysData, f: Filters): DailyPoint[] {
  const byDate = new Map<string, DailyPoint>();
  for (const d of data.daily) {
    if (!matches(f, d)) continue;
    const p = byDate.get(d.date) ?? { date: d.date, revenue: 0, transactions: 0 };
    p.revenue += d.revenue;
    p.transactions += d.transactions;
    byDate.set(d.date, p);
  }
  return [...byDate.values()]
    .map((p) => ({ ...p, revenue: cents(p.revenue) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface StoreRevenue {
  id: number;
  name: string;
  revenue: number;
  /** True when the store filter includes this store (others are shown dimmed). */
  active: boolean;
}

/** Every store's revenue (week range applied), largest first, with the filter marked. */
export function selectRevenueByStore(data: ClientLarrysData, f: Filters): StoreRevenue[] {
  const totals = new Map<number, number>();
  for (const r of data.storeWeekSku) {
    if (!matchesWeek(f.weeks, r.week)) continue;
    totals.set(r.store, (totals.get(r.store) ?? 0) + r.revenue);
  }
  return data.stores
    .map((s) => ({
      id: s.id,
      name: s.name,
      revenue: cents(totals.get(s.id) ?? 0),
      active: matchesStore(f.store, s.id),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ProductRevenue {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  units: number;
  /** 0–1. */
  margin: number;
}

/** Revenue, units and gross margin per product, largest revenue first. */
export function selectProducts(data: ClientLarrysData, f: Filters): ProductRevenue[] {
  const totals = new Map<string, { revenue: number; cost: number; units: number }>();
  for (const r of data.storeWeekSku) {
    if (!matches(f, r)) continue;
    const t = totals.get(r.sku) ?? { revenue: 0, cost: 0, units: 0 };
    t.revenue += r.revenue;
    t.cost += r.cost;
    t.units += r.units;
    totals.set(r.sku, t);
  }
  return data.skus
    .map((s) => {
      const t = totals.get(s.id) ?? { revenue: 0, cost: 0, units: 0 };
      return {
        id: s.id,
        name: s.name,
        revenue: cents(t.revenue),
        cost: cents(t.cost),
        units: t.units,
        margin: t.revenue ? (t.revenue - t.cost) / t.revenue : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue || a.id.localeCompare(b.id));
}

export interface BasketMatrix {
  /** Products in row/column order (by revenue for the filter). */
  products: Sku[];
  /** counts[i][j]: transactions with both products; null on the diagonal. */
  counts: (number | null)[][];
  max: number;
  top: { a: Sku; b: Sku; transactions: number } | null;
}

/** Symmetric "bought together" matrix. Whole period: the week range does not apply. */
export function selectBasketMatrix(data: ClientLarrysData, f: Filters): BasketMatrix {
  const order = selectProducts(data, { store: f.store }).map((p) => p.id);
  const skuById = new Map(data.skus.map((s) => [s.id, s]));
  const products = order.map((id) => skuById.get(id)).filter((s): s is Sku => Boolean(s));
  const index = new Map(order.map((id, i) => [id, i]));
  const counts: (number | null)[][] = order.map((_, i) => order.map((__, j) => (i === j ? null : 0)));
  for (const p of data.basketPairs) {
    if (!matchesStore(f.store, p.store)) continue;
    const i = index.get(p.a);
    const j = index.get(p.b);
    if (i === undefined || j === undefined || i === j) continue;
    counts[i][j] = (counts[i][j] ?? 0) + p.transactions;
    counts[j][i] = (counts[j][i] ?? 0) + p.transactions;
  }
  let max = 0;
  let top: BasketMatrix["top"] = null;
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const n = counts[i][j] ?? 0;
      if (n > max) {
        max = n;
        top = { a: products[i], b: products[j], transactions: n };
      }
    }
  }
  return { products, counts, max, top };
}

export interface PriceBucket {
  price: number;
  units: number;
  revenue: number;
  /** The SKU's list price; every other price is a markdown. */
  isFullPrice: boolean;
}

/** Units sold at each price for one product, lowest price first. Whole period. */
export function selectPricePoints(data: ClientLarrysData, f: Filters, skuId: string): PriceBucket[] {
  const sku = data.skus.find((s) => s.id === skuId);
  const totals = new Map<number, { units: number; revenue: number }>();
  for (const p of data.pricePoints) {
    if (p.sku !== skuId || !matchesStore(f.store, p.store)) continue;
    const t = totals.get(p.price) ?? { units: 0, revenue: 0 };
    t.units += p.units;
    t.revenue += p.revenue;
    totals.set(p.price, t);
  }
  return [...totals.entries()]
    .map(([price, t]) => ({
      price,
      units: t.units,
      revenue: cents(t.revenue),
      isFullPrice: sku ? price === sku.listPrice : false,
    }))
    .sort((a, b) => a.price - b.price);
}

/** True when 0 < t1 < t2 < t3, the only valid tier order. */
export function isValidThresholds(t: readonly number[]): t is Thresholds {
  return (
    t.length === 3 &&
    t.every((v) => Number.isFinite(v)) &&
    t[0] > 0 &&
    t[0] < t[1] &&
    t[1] < t[2]
  );
}

export const TIER_LABELS = ["No discount", "10%", "20%", "40%"] as const;

export interface DiscountTiers {
  /** Customers per tier, in TIER_LABELS order. */
  counts: [number, number, number, number];
  total: number;
  qualifying: number;
}

/**
 * The 2013 workbook rule: a loyalty customer whose ratio (their average line ÷ the
 * overall average line) is above t1 gets 10%, above t2 20%, above t3 40%. Customers
 * are filtered by home store. Throws on thresholds that are not strictly increasing.
 */
export function selectDiscountTiers(
  data: ClientLarrysData,
  f: Filters,
  thresholds: Thresholds,
): DiscountTiers {
  if (!isValidThresholds(thresholds)) {
    throw new RangeError(`Thresholds must satisfy 0 < t1 < t2 < t3, got ${String(thresholds)}`);
  }
  const [t1, t2, t3] = thresholds;
  const counts: [number, number, number, number] = [0, 0, 0, 0];
  for (const c of data.loyaltyCustomers) {
    if (!matchesStore(f.store, c.homeStore)) continue;
    const tier = c.ratio > t3 ? 3 : c.ratio > t2 ? 2 : c.ratio > t1 ? 1 : 0;
    counts[tier]++;
  }
  const total = counts[0] + counts[1] + counts[2] + counts[3];
  return { counts, total, qualifying: total - counts[0] };
}

/**
 * Towns where loyalty customers live (zips with 3+ customers), most customers first.
 * The zip data carries no store, so the filters are accepted for a uniform signature
 * but do not change the result.
 */
export function selectLoyaltyTowns(data: LarrysData, f: Filters): LoyaltyZip[] {
  void f;
  return [...data.loyaltyZips].sort(
    (a, b) => b.customers - a.customers || a.place.localeCompare(b.place),
  );
}

/** "JamaicaPlain" → "Jamaica Plain": the course data drops spaces in place names. */
export function placeLabel(place: string): string {
  return place.replace(/([a-z])([A-Z])/g, "$1 $2");
}
