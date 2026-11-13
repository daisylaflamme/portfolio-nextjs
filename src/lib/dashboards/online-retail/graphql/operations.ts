/**
 * The dashboard's client operations: one fragment per chart, composed into one query per tab,
 * so a filter change is a single request that asks for exactly what that tab's charts show.
 *
 * Each fragment selects its view type's whole field set, so the result types below are the
 * existing view types from ../types.ts. graphql/schema.test.ts validates every operation against
 * the schema and checks that executing it returns exactly what the DataSource returns. That's
 * the guarantee codegen would give, without the build step.
 */
import type {
  BasketView,
  CohortsView,
  CountryRevenue,
  Filters,
  Kpis,
  MonthPoint,
  ProductMonthly,
  ProductSearchRow,
  ProductsView,
  ReturnsView,
  SegmentsView,
} from "../types.ts";
import type { SourceKind } from "../source.ts";
import { serializeFilters } from "../params.ts";
import type { DashboardMeta } from "../types.ts";

export const fragments = {
  Filters: /* GraphQL */ `fragment Filters on Dashboard { filters { from to country category } }`,
  KpiTiles: /* GraphQL */ `fragment KpiTiles on Dashboard {
  kpis {
    current { revenue orders units averageOrderValue returnsValue returnRate }
    previous { revenue orders units averageOrderValue returnsValue returnRate }
    previousRange { from to }
  }
}`,
  MonthlyRevenueChart: /* GraphQL */ `fragment MonthlyRevenueChart on Dashboard { monthlyRevenue { month revenue orders inRange } }`,
  CountryRevenue: /* GraphQL */ `fragment CountryRevenue on Dashboard { countries { country revenue orders share } }`,
  TopProducts: /* GraphQL */ `fragment TopProducts on Dashboard {
  topProducts {
    scope fromYear toYear exact productCount totalRevenue curve rangeKind
    rows { code description category units revenue share }
  }
}`,
  ProductSearch: /* GraphQL */ `fragment ProductSearch on Dashboard {
  searchProducts(query: $query) @include(if: $withSearch) { code description category units revenue }
}`,
  ProductMonthlyChart: /* GraphQL */ `fragment ProductMonthlyChart on Dashboard {
  productMonthly(code: $code) @include(if: $withProduct) {
    code description category
    months { month units revenue orders inRange }
  }
}`,
  BasketMatrix: /* GraphQL */ `fragment BasketMatrix on Dashboard {
  basket { scope fallback orders share counts live products { code description orders share } }
}`,
  CohortHeatmap: /* GraphQL */ `fragment CohortHeatmap on Dashboard {
  cohorts { scope fallback maxMonths live rows { cohort size cells } }
}`,
  SegmentBars: /* GraphQL */ `fragment SegmentBars on Dashboard {
  segments { scope fallback customers referenceDate rows { segment customers share avgRecencyDays avgOrders avgRevenue } }
}`,
  ReturnBars: /* GraphQL */ `fragment ReturnBars on Dashboard {
  returns { minOrders excluded overall { revenue returnsValue rate } rows { country revenue returnsValue returnLines orders rate } }
}`,
};

type FragmentName = keyof typeof fragments;

function operation(name: string, spreads: FragmentName[], variables = "$filters: FiltersInput", extra = ""): string {
  const used: FragmentName[] = ["Filters", ...spreads];
  return [
    `query ${name}(${variables}) {\n  dashboard(filters: $filters) {\n    ${used.map((f) => `...${f}`).join("\n    ")}\n  }${extra}\n}`,
    ...used.map((f) => fragments[f]),
  ].join("\n\n");
}

export const operations = {
  overview: operation("Overview", ["KpiTiles", "MonthlyRevenueChart", "CountryRevenue"]),
  products: operation(
    "Products",
    ["TopProducts", "ProductSearch", "ProductMonthlyChart"],
    '$filters: FiltersInput, $query: String = "", $code: String = "", $withSearch: Boolean = false, $withProduct: Boolean = false',
    "\n  source { status }",
  ),
  basket: operation("Basket", ["BasketMatrix"]),
  customers: operation("Customers", ["CohortHeatmap", "SegmentBars"]),
  returns: operation("Returns", ["ReturnBars"]),
};

export type OperationName = keyof typeof operations;

/** Filter values as the API takes them: the URL's format (months, slugs). */
export interface FiltersInput {
  from?: string;
  to?: string;
  country?: string;
  category?: string;
}

interface WithFilters {
  filters: Filters;
}

export interface OverviewData {
  dashboard: WithFilters & { kpis: Kpis; monthlyRevenue: MonthPoint[]; countries: CountryRevenue[] };
}

export interface ProductsData {
  dashboard: WithFilters & {
    topProducts: ProductsView;
    /** Present when $withSearch; null on the snapshot. */
    searchProducts?: ProductSearchRow[] | null;
    /** Present when $withProduct; null on the snapshot or for an unknown code. */
    productMonthly?: ProductMonthly | null;
  };
  source: { status: SourceKind };
}

export interface BasketData {
  dashboard: WithFilters & { basket: BasketView };
}

export interface CustomersData {
  dashboard: WithFilters & { cohorts: CohortsView; segments: SegmentsView };
}

export interface ReturnsData {
  dashboard: WithFilters & { returns: ReturnsView };
}

export interface OperationData {
  overview: OverviewData;
  products: ProductsData;
  basket: BasketData;
  customers: CustomersData;
  returns: ReturnsData;
}

/** Filters as the API takes them: the same months and slugs as the URL (defaults left out). */
export function filtersToInput(meta: DashboardMeta, f: Filters): FiltersInput {
  return Object.fromEntries(new URLSearchParams(serializeFilters(meta, f).slice(1))) as FiltersInput;
}

/** Variables for one tab: the filters, plus the Products tab's search text and product code. */
export function operationVariables(meta: DashboardMeta, f: Filters, extra: { q?: string | null; product?: string | null } = {}) {
  return {
    filters: filtersToInput(meta, f),
    ...(extra.q ? { query: extra.q, withSearch: true } : {}),
    ...(extra.product ? { code: extra.product, withProduct: true } : {}),
  };
}
