/**
 * The numbers a summary may mention, recomputed on the server from the tab and filters through
 * the active DataSource (never taken from the client). Each fact is a labelled line with values
 * already formatted (£, %), so the model quotes them rather than doing arithmetic.
 */
import type { TabId } from "../content.ts";
import { tabById } from "../content.ts";
import { countryLabel } from "../countries.ts";
import { change, count, money, moneyExact, monthLabel, percent, rangeLabel } from "../format.ts";
import { productShareFor } from "../selectors.ts";
import type { DataSource } from "../source.ts";
import type { Filters, KpiValues } from "../types.ts";

export interface Facts {
  view: string;
  lines: string[];
}

const TOP = 5;

function header(tab: TabId, f: Filters, source: DataSource, kind: string): string[] {
  return [
    `View: ${tabById(tab).label}`,
    `Date range: ${rangeLabel(f.from, f.to)}`,
    `Country: ${f.country === "all" ? "all countries" : countryLabel(f.country)}`,
    `Category: ${f.category === "all" ? "all categories" : f.category}`,
    `Currency: GBP`,
    `Data: ${kind === "live" ? "live database" : "aggregated snapshot"} of Online Retail II (a UK online gift retailer)`,
  ];
}

function points(cur: number, prev: number): string {
  const v = (cur - prev) * 100;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} percentage points`;
}

function relative(cur: number, prev: number): string {
  return prev ? change((cur - prev) / prev) : "n/a";
}

async function overview(f: Filters, s: DataSource): Promise<string[]> {
  const [k, months, countries] = await Promise.all([s.kpis(f), s.monthlyRevenue(f), s.countries(f)]);
  const c: KpiValues = k.current;
  const lines = [
    `Revenue: ${money(c.revenue)}`,
    `Orders: ${count(c.orders)}${f.category === "all" ? "" : " (orders containing this category)"}`,
    `Average order value: ${moneyExact(c.averageOrderValue)}`,
    `Return rate: ${percent(c.returnRate)} (${money(c.returnsValue)} of revenue cancelled)`,
  ];
  if (k.previous && k.previousRange) {
    const p = k.previous;
    lines.push(
      `Compared with ${rangeLabel(k.previousRange.from, k.previousRange.to)}: revenue ${relative(c.revenue, p.revenue)}, orders ${relative(c.orders, p.orders)}, average order value ${relative(c.averageOrderValue, p.averageOrderValue)}, return rate ${points(c.returnRate, p.returnRate)}`,
    );
  } else {
    lines.push("Comparison: no earlier period of the same length in the data");
  }
  const inRange = months.filter((m) => m.inRange);
  const peak = inRange.reduce((b, m) => (m.revenue > b.revenue ? m : b), inRange[0]);
  if (peak) lines.push(`Highest month in the range: ${monthLabel(peak.month)}, ${money(peak.revenue)}`);
  lines.push(
    `Top countries by revenue: ${countries
      .slice(0, TOP)
      .map((r) => `${countryLabel(r.country)} ${money(r.revenue)} (${percent(r.share)})`)
      .join("; ")}`,
  );
  return lines;
}

async function products(f: Filters, s: DataSource): Promise<string[]> {
  const v = await s.topProducts(f);
  const basis =
    v.rangeKind === "months"
      ? `exactly ${rangeLabel(f.from, f.to)}`
      : `calendar years ${v.fromYear === v.toYear ? v.fromYear : `${v.fromYear}–${v.toYear}`} (the years the range touches)`;
  const lines = [`Ranking basis: ${basis}`, `Revenue in scope: ${money(v.totalRevenue)}`];
  if (v.productCount) lines.push(`Products sold: ${count(v.productCount)}`);
  if (v.curve) lines.push(`Concentration: ${percent(productShareFor(v.curve, 0.8), 0)} of products bring in 80% of revenue`);
  else lines.push("Concentration: not available for this country");
  lines.push(
    `Top products by revenue: ${v.rows
      .slice(0, TOP)
      .map((r, i) => `${i + 1}. ${r.description} ${money(r.revenue)} (${percent(r.share, 2)} of revenue)`)
      .join("; ")}`,
  );
  if (f.category !== "all" && v.rangeKind === "years") lines.push(`Note: the product list shows ${f.category} only; the concentration figure covers every category`);
  return lines;
}

async function basket(f: Filters, s: DataSource): Promise<string[]> {
  const v = await s.basket(f);
  const pairs = v.products
    .flatMap((a, i) => v.products.slice(i + 1).map((b, k) => ({ a, b, share: v.share[i][i + 1 + k] ?? 0 })))
    .sort((p, q) => q.share - p.share)
    .slice(0, TOP);
  const lines = [
    `Orders in scope: ${count(v.orders)}`,
    `Most common pairs among the top 10 products: ${pairs.map((p) => `${p.a.description} + ${p.b.description} in ${percent(p.share)} of orders`).join("; ")}`,
  ];
  if (!v.live) lines.push("Note: basket figures cover the whole period and every category, so the date range and category filters don't apply");
  if (v.fallback) lines.push("Note: there is no basket data for the selected country, so all countries are shown");
  return lines;
}

async function customers(f: Filters, s: DataSource): Promise<string[]> {
  const [c, seg] = await Promise.all([s.cohorts(f), s.segments(f)]);
  const withM1 = c.rows.filter((r) => r.cells[0] !== null);
  const m1 = withM1.reduce((a, r) => a + (r.cells[0] ?? 0) * r.size, 0) / Math.max(1, withM1.reduce((a, r) => a + r.size, 0));
  const lines = [
    `Monthly cohorts that first ordered in the range: ${c.rows.length}, ${count(c.rows.reduce((a, r) => a + r.size, 0))} customers`,
    withM1.length ? `Average share ordering again the next month: ${percent(m1)}` : "Next-month return: not available in this range",
    `Customer segments (recency, frequency and spend, whole period, ${count(seg.customers)} customers): ${seg.rows
      .map((r) => `${r.segment} ${count(r.customers)} (${percent(r.share)})`)
      .join("; ")}`,
  ];
  if (c.fallback) lines.push("Note: there is no customer data for the selected country, so all countries are shown");
  if (!c.live && f.category !== "all") lines.push("Note: customer figures count every category");
  return lines;
}

async function returns(f: Filters, s: DataSource): Promise<string[]> {
  const v = await s.returns(f);
  return [
    `Overall return rate: ${percent(v.overall.rate)} (${money(v.overall.returnsValue)} cancelled of ${money(v.overall.revenue)} revenue)`,
    `Countries ranked (at least ${count(v.minOrders)} orders): ${v.rows.length}; left out for too few orders: ${v.excluded}`,
    `Highest return rates: ${v.rows
      .slice(0, TOP)
      .map((r) => `${countryLabel(r.country)} ${percent(r.rate)} (${count(r.orders)} orders)`)
      .join("; ")}`,
  ];
}

const BUILDERS: Record<TabId, (f: Filters, s: DataSource) => Promise<string[]>> = {
  overview,
  products,
  basket,
  customers,
  returns,
};

export async function buildFacts(tab: TabId, filters: Filters, source: DataSource): Promise<Facts> {
  const kind = await source.status();
  return { view: tabById(tab).label, lines: [...header(tab, filters, source, kind), ...(await BUILDERS[tab](filters, source))] };
}
