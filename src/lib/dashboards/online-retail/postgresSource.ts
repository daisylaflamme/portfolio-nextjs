/**
 * DataSource backed by Postgres (db/online-retail/), used when ONLINE_RETAIL_DATABASE_URL is
 * set. Every query comes from the parameterized builders in sql.ts and runs as the read-only
 * `online_retail_reader` role. `pg` is imported on the first query, so the snapshot path never
 * loads it. Server-only.
 */
import type { Pool } from "pg";
import type { DataSource } from "./source.ts";
import { COHORT_MONTHS, RETURNS_MIN_ORDERS, previousRange } from "./selectors.ts";
import {
  basketQuery,
  cohortsQuery,
  countryTotalsQuery,
  kpisQuery,
  monthlyQuery,
  paretoQuery,
  productInfoQuery,
  productMonthlyQuery,
  searchProductsQuery,
  segmentsQuery,
  topProductsQuery,
  type Query,
} from "./sql.ts";
import type {
  BasketView,
  CohortsView,
  CountryRevenue,
  DashboardMeta,
  Filters,
  KpiValues,
  ProductsView,
  ReturnsView,
  SegmentName,
  SegmentsView,
} from "./types.ts";

/** Runs one parameterized query and returns its rows. Injected in tests. */
export type Runner = <T>(query: Query) => Promise<T[]>;

const SEGMENTS: SegmentName[] = ["Champions", "Loyal", "Promising", "At risk", "Lost"];

/** A pg Pool runner for the connection string (SSL unless the host is local or sslmode=disable). */
export function poolRunner(url: string): Runner {
  let pool: Promise<Pool> | null = null;
  const getPool = () =>
    (pool ??= import("pg").then(({ default: pg }) => {
      const u = new URL(url);
      const local = ["localhost", "127.0.0.1"].includes(u.hostname) || u.searchParams.get("sslmode") === "disable";
      // pg reads sslmode from the URL and it would override the ssl option below.
      u.searchParams.delete("sslmode");
      return new pg.Pool({
        connectionString: u.toString(),
        // Supabase's pooler presents a certificate pg can't verify against Node's store.
        ssl: local ? false : { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
        statement_timeout: 5_000,
        application_name: "portfolio-online-retail",
      });
    }));
  return async <T,>(q: Query) => {
    const result = await (await getPool()).query(q.text, q.values);
    return result.rows as T[];
  };
}

function toKpis(row: Record<string, number> | undefined, prefix = ""): KpiValues {
  const revenue = row?.[`${prefix}revenue`] ?? 0;
  const orders = row?.[`${prefix}orders`] ?? 0;
  const returnsValue = row?.[`${prefix}returns_value`] ?? 0;
  return {
    revenue,
    orders,
    units: row?.[`${prefix}units`] ?? 0,
    averageOrderValue: orders ? revenue / orders : 0,
    returnsValue,
    returnRate: revenue ? returnsValue / revenue : 0,
  };
}

const ALL = "all";
const inRange = (month: string, f: Filters) => month >= f.from && month <= f.to;

export function createPostgresSource(run: Runner, meta: DashboardMeta, opts: { referenceDate: string }): DataSource {
  async function countryTotals(f: Filters) {
    const rows = await run<{ country: string; revenue: number; orders: number; returns_value: number; return_lines: number }>(
      countryTotalsQuery(f),
    );
    return rows;
  }

  return {
    kind: "live",
    meta,
    status: async () => "live",

    async kpis(f) {
      const prev = previousRange(meta.months, f.from, f.to);
      const [row] = await run<Record<string, number>>(kpisQuery(f, prev));
      return { current: toKpis(row), previous: prev ? toKpis(row, "prev_") : null, previousRange: prev };
    },

    async monthlyRevenue(f) {
      const rows = await run<{ month: string; revenue: number; orders: number }>(monthlyQuery(f));
      const byMonth = new Map(rows.map((r) => [r.month, r]));
      return meta.months.map((month) => ({
        month,
        revenue: byMonth.get(month)?.revenue ?? 0,
        orders: byMonth.get(month)?.orders ?? 0,
        inRange: inRange(month, f),
      }));
    },

    async countries(f): Promise<CountryRevenue[]> {
      const rows = (await countryTotals(f)).filter((r) => r.revenue > 0);
      const total = rows.reduce((a, r) => a + r.revenue, 0);
      return rows
        .map((r) => ({ country: r.country, revenue: r.revenue, orders: r.orders, share: total ? r.revenue / total : 0 }))
        .sort((a, b) => b.revenue - a.revenue);
    },

    async topProducts(f): Promise<ProductsView> {
      const [rows, curveRows] = await Promise.all([
        run<{ stock_code: string; description: string; category: string; units: number; revenue: number; products: number; total_revenue: number }>(
          topProductsQuery(f),
        ),
        run<{ pct: number; share: number }>(paretoQuery(f)),
      ]);
      const totalRevenue = rows[0]?.total_revenue ?? 0;
      return {
        scope: f.country,
        fromYear: Number(f.from.slice(0, 4)),
        toYear: Number(f.to.slice(0, 4)),
        exact: true,
        productCount: rows[0]?.products ?? null,
        totalRevenue,
        curve: curveRows.length === 100 ? curveRows.map((r) => r.share) : null,
        rows: rows.map((r) => ({
          code: r.stock_code,
          description: r.description,
          category: r.category,
          units: r.units,
          revenue: r.revenue,
          share: totalRevenue ? r.revenue / totalRevenue : 0,
        })),
        rangeKind: "months",
      };
    },

    async basket(f): Promise<BasketView> {
      const rows = await run<{
        a: string;
        b: string;
        a_rank: number;
        b_rank: number;
        a_description: string;
        b_description: string;
        orders: number;
        total_orders: number;
      }>(basketQuery(f));
      const orders = rows[0]?.total_orders ?? 0;
      const n = Math.max(0, ...rows.map((r) => Math.max(r.a_rank, r.b_rank)));
      const products: BasketView["products"] = Array.from({ length: n }, () => ({ code: "", description: "", orders: 0, share: 0 }));
      const share: (number | null)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? null : 0)));
      const counts: (number | null)[][] = share.map((row) => row.map((v) => (v === null ? null : 0)));
      for (const r of rows) {
        const i = r.a_rank - 1;
        const j = r.b_rank - 1;
        const s = orders ? r.orders / orders : 0;
        if (r.a === r.b) {
          products[i] = { code: r.a, description: r.a_description, orders: r.orders, share: s };
        } else {
          share[i][j] = share[j][i] = s;
          counts[i][j] = counts[j][i] = r.orders;
        }
      }
      return { scope: f.country, fallback: false, orders, products, share, counts, live: true };
    },

    async cohorts(f): Promise<CohortsView> {
      const rows = await run<{ cohort: string; months_since: number; active: number }>(cohortsQuery(f));
      const toIndex = meta.months.indexOf(f.to);
      const cohorts = new Map<string, { size: number; cells: (number | null)[] }>();
      for (const r of rows) {
        const c = cohorts.get(r.cohort) ?? { size: 0, cells: Array.from({ length: COHORT_MONTHS }, () => null as number | null) };
        cohorts.set(r.cohort, c);
        if (r.months_since === 0) c.size = r.active;
      }
      for (const r of rows) {
        const c = cohorts.get(r.cohort);
        if (!c || !c.size || r.months_since < 1 || r.months_since > COHORT_MONTHS) continue;
        c.cells[r.months_since - 1] = r.active / c.size;
      }
      // Months inside the range with nobody back are 0, not missing.
      for (const [cohort, c] of cohorts) {
        const start = meta.months.indexOf(cohort);
        c.cells = c.cells.map((v, k) => (v === null && start + k + 1 <= toIndex ? 0 : v));
      }
      return {
        scope: f.country,
        fallback: false,
        maxMonths: COHORT_MONTHS,
        rows: [...cohorts].sort(([a], [b]) => a.localeCompare(b)).map(([cohort, c]) => ({ cohort, ...c })),
        live: true,
      };
    },

    async segments(f): Promise<SegmentsView> {
      const rows = await run<{ segment: SegmentName; customers: number; avg_recency_days: number; avg_orders: number; avg_revenue: number }>(
        segmentsQuery(f),
      );
      const customers = rows.reduce((a, r) => a + r.customers, 0);
      const bySegment = new Map(rows.map((r) => [r.segment, r]));
      return {
        scope: f.country,
        fallback: false,
        customers,
        referenceDate: opts.referenceDate,
        rows: SEGMENTS.map((segment) => {
          const r = bySegment.get(segment);
          return {
            segment,
            customers: r?.customers ?? 0,
            share: customers ? (r?.customers ?? 0) / customers : 0,
            avgRecencyDays: r?.avg_recency_days ?? 0,
            avgOrders: r?.avg_orders ?? 0,
            avgRevenue: r?.avg_revenue ?? 0,
          };
        }),
      };
    },

    async returns(f): Promise<ReturnsView> {
      const all = (await countryTotals(f)).map((r) => ({
        country: r.country,
        revenue: r.revenue,
        returnsValue: r.returns_value,
        returnLines: r.return_lines,
        orders: r.orders,
        rate: r.revenue ? r.returns_value / r.revenue : 0,
      }));
      const minOrders = RETURNS_MIN_ORDERS;
      const revenue = all.reduce((a, c) => a + c.revenue, 0);
      const returnsValue = all.reduce((a, c) => a + c.returnsValue, 0);
      return {
        minOrders,
        rows: all.filter((c) => c.orders >= minOrders).sort((a, b) => b.rate - a.rate || b.revenue - a.revenue),
        excluded: all.filter((c) => c.orders < minOrders && (c.revenue > 0 || c.returnsValue > 0)).length,
        overall: { revenue, returnsValue, rate: revenue ? returnsValue / revenue : 0 },
      };
    },

    async searchProducts(query, f) {
      const q = query.trim();
      if (!q) return [];
      const rows = await run<{ stock_code: string; description: string; category: string; units: number; revenue: number }>(
        searchProductsQuery(q, f),
      );
      return rows.map((r) => ({ code: r.stock_code, description: r.description, category: r.category, units: r.units, revenue: r.revenue }));
    },

    async productMonthly(code, f) {
      const [info] = await run<{ stock_code: string; description: string; category: string }>(productInfoQuery(code));
      if (!info) return null;
      const rows = await run<{ month: string; units: number; revenue: number; orders: number }>(
        productMonthlyQuery(code, { ...f, category: ALL }),
      );
      const byMonth = new Map(rows.map((r) => [r.month, r]));
      return {
        code: info.stock_code,
        description: info.description,
        category: info.category,
        months: meta.months.map((month) => ({
          month,
          units: byMonth.get(month)?.units ?? 0,
          revenue: byMonth.get(month)?.revenue ?? 0,
          orders: byMonth.get(month)?.orders ?? 0,
          inRange: inRange(month, f),
        })),
      };
    },
  };
}
