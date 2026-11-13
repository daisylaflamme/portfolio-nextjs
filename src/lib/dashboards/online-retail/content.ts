/**
 * Copy for the Online Retail dashboard, shared by its pages, seo.ts and the
 * /work/dashboards card so they stay in sync.
 */

export const ONLINE_RETAIL_PATH = "/work/dashboards/online-retail";
export const ONLINE_RETAIL_TITLE = "Online retail dashboard";
export const ONLINE_RETAIL_SUMMARY =
  "A million invoice lines, aggregated on the server: revenue, products, baskets, customer retention and returns.";
export const ONLINE_RETAIL_DESCRIPTION =
  "Interactive dashboard of two years of a UK online gift retailer’s orders, about a million invoice lines: revenue by month and country, products, baskets, customer cohorts and returns. Built with React, Next.js and D3.";
export const ONLINE_RETAIL_INTRO =
  "Two years of a UK online gift retailer’s orders, about a million invoice lines, aggregated on the server so every filter stays fast. Explore revenue, products, baskets, customer retention and returns.";
export const ONLINE_RETAIL_DATA_NOTE =
  "Data: Online Retail II, UCI Machine Learning Repository (CC BY 4.0). Cleaned and aggregated; cancellations kept as returns.";
/**
 * The stack line. Postgres and the Claude API are built in and marked optional: they switch on
 * with ONLINE_RETAIL_DATABASE_URL and ANTHROPIC_API_KEY; without them the site uses the snapshot.
 */
export const ONLINE_RETAIL_STACK = ["Next.js", "React", "TypeScript", "D3", "GraphQL", "Postgres (optional)", "Claude API (optional)"];

export type TabId = "overview" | "products" | "basket" | "customers" | "returns";

export interface DashboardTab {
  id: TabId;
  label: string;
  /** Path under ONLINE_RETAIL_PATH ("" for the overview). */
  segment: string;
  /** Page title and description for metadata. */
  title: string;
  description: string;
}

export const ONLINE_RETAIL_TABS: DashboardTab[] = [
  {
    id: "overview",
    label: "Overview",
    segment: "",
    title: ONLINE_RETAIL_TITLE,
    description: ONLINE_RETAIL_DESCRIPTION,
  },
  {
    id: "products",
    label: "Products",
    segment: "products",
    title: `Products · ${ONLINE_RETAIL_TITLE}`,
    description: "Which products bring in the revenue: an 80/20 Pareto view and a searchable ranking of the top products.",
  },
  {
    id: "basket",
    label: "Basket",
    segment: "basket",
    title: `Basket · ${ONLINE_RETAIL_TITLE}`,
    description: "Which of the ten best-selling products customers buy together, as a share of orders.",
  },
  {
    id: "customers",
    label: "Customers",
    segment: "customers",
    title: `Customers · ${ONLINE_RETAIL_TITLE}`,
    description: "Monthly customer cohorts and how many come back, plus customer segments scored on recency, frequency and spend.",
  },
  {
    id: "returns",
    label: "Returns",
    segment: "returns",
    title: `Returns · ${ONLINE_RETAIL_TITLE}`,
    description: "Cancelled orders as a share of revenue, by country.",
  },
];

export function tabPath(tab: DashboardTab): string {
  return tab.segment ? `${ONLINE_RETAIL_PATH}/${tab.segment}` : ONLINE_RETAIL_PATH;
}

export function tabById(id: TabId): DashboardTab {
  const tab = ONLINE_RETAIL_TABS.find((t) => t.id === id);
  if (!tab) throw new Error(`Unknown tab ${id}`);
  return tab;
}
