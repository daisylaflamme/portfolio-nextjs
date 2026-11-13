/**
 * GraphQL schema (SDL) for the Online Retail dashboard. It mirrors the DataSource
 * (../source.ts) one to one: every Dashboard field is one DataSource method, with the
 * same field names as the view types in ../types.ts, so a fragment that selects a whole
 * view type returns exactly that TypeScript type.
 */
export const typeDefs = /* GraphQL */ `
  "Filter values in the URL's format: months as YYYY-MM, country and category as slugs (e.g. united-kingdom, home-decor-signs). Missing or invalid values fall back to the defaults, exactly like the dashboard's query string."
  input FiltersInput {
    from: String
    to: String
    country: String
    category: String
  }

  type Query {
    "Filter options and the data's source and licence."
    meta: Meta!
    "Where the numbers come from: the committed snapshot or the live database."
    source: Source!
    "Every view of the dashboard for one set of filters."
    dashboard(filters: FiltersInput): Dashboard!
  }

  type Meta {
    months: [String!]!
    countries: [String!]!
    topCountries: [String!]!
    categories: [String!]!
    dateRange: [String!]!
    source: String!
    sourceUrl: String!
    licenseUrl: String!
    categoryMethod: String!
  }

  type Source {
    "live or snapshot: what this deployment is configured for."
    kind: String!
    "live or snapshot: what it can serve right now (a live source reports snapshot while the database is unreachable)."
    status: String!
  }

  "The filters actually applied, after validation (country and category as names, or all)."
  type Filters {
    from: String!
    to: String!
    country: String!
    category: String!
  }

  type Dashboard {
    filters: Filters!
    kpis: Kpis!
    monthlyRevenue: [MonthPoint!]!
    countries: [CountryRevenue!]!
    topProducts: ProductsView!
    basket: BasketView!
    cohorts: CohortsView!
    segments: SegmentsView!
    returns: ReturnsView!
    "Live database only; null on the snapshot."
    searchProducts(query: String!): [ProductSearchRow!]
    "Live database only; null on the snapshot or for an unknown code."
    productMonthly(code: String!): ProductMonthly
  }

  type KpiValues {
    revenue: Float!
    orders: Int!
    units: Int!
    averageOrderValue: Float!
    returnsValue: Float!
    returnRate: Float!
  }

  type MonthRange {
    from: String!
    to: String!
  }

  type Kpis {
    current: KpiValues!
    previous: KpiValues
    previousRange: MonthRange
  }

  type MonthPoint {
    month: String!
    revenue: Float!
    orders: Int!
    inRange: Boolean!
  }

  type CountryRevenue {
    country: String!
    revenue: Float!
    orders: Int!
    share: Float!
  }

  type ProductRow {
    code: String!
    description: String!
    category: String!
    units: Int!
    revenue: Float!
    share: Float!
  }

  type ProductsView {
    scope: String!
    fromYear: Int!
    toYear: Int!
    exact: Boolean!
    productCount: Int
    totalRevenue: Float!
    curve: [Float!]
    rows: [ProductRow!]!
    rangeKind: String!
  }

  type BasketProduct {
    code: String!
    description: String!
    orders: Int!
    share: Float!
  }

  type BasketView {
    scope: String!
    fallback: Boolean!
    orders: Int!
    products: [BasketProduct!]!
    "share[i][j]: share of orders containing both products; null on the diagonal."
    share: [[Float]!]!
    counts: [[Float]!]!
    live: Boolean!
  }

  type CohortRow {
    cohort: String!
    size: Int!
    cells: [Float]!
  }

  type CohortsView {
    scope: String!
    fallback: Boolean!
    maxMonths: Int!
    rows: [CohortRow!]!
    live: Boolean!
  }

  type SegmentRow {
    segment: String!
    customers: Int!
    share: Float!
    avgRecencyDays: Float!
    avgOrders: Float!
    avgRevenue: Float!
  }

  type SegmentsView {
    scope: String!
    fallback: Boolean!
    customers: Int!
    referenceDate: String!
    rows: [SegmentRow!]!
  }

  type ReturnRow {
    country: String!
    revenue: Float!
    returnsValue: Float!
    returnLines: Int!
    orders: Int!
    rate: Float!
  }

  type ReturnsOverall {
    revenue: Float!
    returnsValue: Float!
    rate: Float!
  }

  type ReturnsView {
    minOrders: Int!
    rows: [ReturnRow!]!
    excluded: Int!
    overall: ReturnsOverall!
  }

  type ProductSearchRow {
    code: String!
    description: String!
    category: String!
    units: Int!
    revenue: Float!
  }

  type ProductMonth {
    month: String!
    units: Int!
    revenue: Float!
    orders: Int!
    inRange: Boolean!
  }

  type ProductMonthly {
    code: String!
    description: String!
    category: String!
    months: [ProductMonth!]!
  }
`;
