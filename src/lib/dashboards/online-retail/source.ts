/**
 * Where the dashboard's numbers come from. Pages talk to a DataSource, never to the
 * snapshot directly, so the JSON snapshot (snapshotSource.ts) can later be swapped for a
 * database-backed source with the same interface. Every method takes the same Filters
 * and resolves to a small, serializable view the page can hand to its charts.
 */
import type {
  BasketView,
  CohortsView,
  CountryRevenue,
  DashboardMeta,
  Filters,
  Kpis,
  MonthPoint,
  ProductsView,
  ReturnsView,
  SegmentsView,
} from "./types.ts";

export interface DataSource {
  /** Filter options and source details. */
  readonly meta: DashboardMeta;
  /** Revenue, orders, average order value and return rate, with the previous period of equal length. */
  kpis(filters: Filters): Promise<Kpis>;
  /** Every month of the data for the country and category, flagged when inside From–To. */
  monthlyRevenue(filters: Filters): Promise<MonthPoint[]>;
  /** Revenue by country for From–To and the category; the country filter only highlights. */
  countries(filters: Filters): Promise<CountryRevenue[]>;
  /** Products ranked by revenue for the calendar years From–To touches. */
  topProducts(filters: Filters): Promise<ProductsView>;
  /** Top-10 products bought together (whole period, all categories). */
  basket(filters: Filters): Promise<BasketView>;
  /** Monthly first-order cohorts that started in From–To, with retention up to `to`. */
  cohorts(filters: Filters): Promise<CohortsView>;
  /** RFM segments (whole period). */
  segments(filters: Filters): Promise<SegmentsView>;
  /** Return rate by country for From–To and the category. */
  returns(filters: Filters): Promise<ReturnsView>;
}
