/**
 * Where the dashboard's numbers come from. Pages talk to a DataSource, never to the
 * snapshot or the database directly. data.ts picks one in a single place: Postgres
 * (postgresSource.ts) when ONLINE_RETAIL_DATABASE_URL is set, otherwise the committed
 * snapshot (snapshotSource.ts). Every method takes the same Filters and resolves to a
 * small, serializable view the page can hand to its charts.
 */
import type {
  BasketView,
  CohortsView,
  CountryRevenue,
  DashboardMeta,
  Filters,
  Kpis,
  MonthPoint,
  ProductMonthly,
  ProductSearchRow,
  ProductsView,
  ReturnsView,
  SegmentsView,
} from "./types.ts";

/** "live" when the numbers come from the database, "snapshot" from the committed JSON. */
export type SourceKind = "live" | "snapshot";

export interface DataSource {
  readonly kind: SourceKind;
  /** Filter options and source details. */
  readonly meta: DashboardMeta;
  /** What the page should say it shows: a live source reports "snapshot" while the database is unreachable. */
  status(): Promise<SourceKind>;
  /** Revenue, orders, average order value and return rate, with the previous period of equal length. */
  kpis(filters: Filters): Promise<Kpis>;
  /** Every month of the data for the country and category, flagged when inside From–To. */
  monthlyRevenue(filters: Filters): Promise<MonthPoint[]>;
  /** Revenue by country for From–To and the category; the country filter only highlights. */
  countries(filters: Filters): Promise<CountryRevenue[]>;
  /** Products ranked by revenue (snapshot: by calendar year; live: by month). */
  topProducts(filters: Filters): Promise<ProductsView>;
  /** Top-10 products bought together (snapshot: whole period, all categories; live: all filters). */
  basket(filters: Filters): Promise<BasketView>;
  /** Monthly first-order cohorts that started in From–To, with retention up to `to`. */
  cohorts(filters: Filters): Promise<CohortsView>;
  /** RFM segments (whole period). */
  segments(filters: Filters): Promise<SegmentsView>;
  /** Return rate by country for From–To and the category. */
  returns(filters: Filters): Promise<ReturnsView>;
  /** Free-text product search with sales for the filters. Live only. */
  searchProducts?(query: string, filters: Filters): Promise<ProductSearchRow[]>;
  /** One product's monthly sales for the country (whole period). Live only; null if the code is unknown. */
  productMonthly?(code: string, filters: Filters): Promise<ProductMonthly | null>;
}
