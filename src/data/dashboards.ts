import type { FeaturedWorkItem, WorkItem } from "./types";
import {
  RETAIL_DASHBOARD_PATH,
  RETAIL_DASHBOARD_SOURCE,
  RETAIL_DASHBOARD_STACK,
  RETAIL_DASHBOARD_SUMMARY,
  RETAIL_DASHBOARD_TITLE,
} from "../lib/dashboards/larrys/content.ts";
import {
  ONLINE_RETAIL_DATA_NOTE,
  ONLINE_RETAIL_PATH,
  ONLINE_RETAIL_STACK,
  ONLINE_RETAIL_SUMMARY,
  ONLINE_RETAIL_TITLE,
} from "../lib/dashboards/online-retail/content.ts";

/**
 * Dashboards for /work/dashboards: screenshots and short write-ups. The original
 * Tableau Public embeds are gone, so nothing here links to them.
 *
 * Images: copy the archive files into public/images/archive/dashboards/ and run
 * `npm run images:archive`.
 */
const img = (name: string) => `/images/archive/dashboards/${name}.webp`;

/** The live React + D3 dashboard, shown as the featured card above the archive. */
export const retailDashboard: FeaturedWorkItem = {
  id: "retail-sales-dashboard",
  title: RETAIL_DASHBOARD_TITLE,
  eyebrow: "// featured · live dashboard",
  summary: RETAIL_DASHBOARD_SUMMARY,
  year: 2026,
  href: RETAIL_DASHBOARD_PATH,
  // Framed captures from `npm run screenshots` (scripts/screenshots.config.mjs).
  heroImage: "/images/projects/retail-dashboard/retail-dashboard-hero.webp",
  images: [
    "/images/projects/retail-dashboard/retail-dashboard-desktop.webp",
    "/images/projects/retail-dashboard/retail-dashboard-phone.webp",
  ],
  imageAlt: "Larry’s Secret retail sales dashboard in dark theme on a laptop and a phone: store filters, KPI tiles and charts",
  tags: ["react", "typescript", "d3", "nextjs", "accessibility", "data-visualization", "retail"],
  stack: RETAIL_DASHBOARD_STACK,
  role: "Designer and engineer (solo)",
  dates: "2026",
  problem:
    "Larry’s Secret, a five-store clothing chain around Boston, needed to know which stores and products drive revenue and margin, what customers buy together, and which loyalty customers should get a discount. The data: four weeks of register receipts from April 2012.",
  whatIBuilt: [
    "A typed data layer over anonymized, aggregated sales data, with pure, unit-tested selectors for every number on the page.",
    "Charts drawn as SVG by React, with D3 used only for scales, shapes and the map projection; heavier panels load as separate chunks.",
    "A what-if simulator for the loyalty discount rule, with two preset rules and live tier counts.",
    "Accessible by design: a summary and a data table for every chart, keyboard tooltips, a real table for the basket matrix, and shareable URL state.",
    "A server-rendered map of where loyalty customers live, drawn from MassGIS town boundaries.",
  ],
  source: RETAIL_DASHBOARD_SOURCE,
  before: "retail-kpi-dashboard",
};

/** The second live dashboard, below Larry's Secret. */
export const onlineRetailDashboard: FeaturedWorkItem = {
  id: "online-retail-dashboard",
  title: ONLINE_RETAIL_TITLE,
  eyebrow: "// live dashboard · 1M+ invoice lines",
  summary: ONLINE_RETAIL_SUMMARY,
  year: 2026,
  href: ONLINE_RETAIL_PATH,
  // Framed captures from `npm run screenshots` (scripts/screenshots.config.mjs).
  heroImage: "/images/projects/online-retail-dashboard/online-retail-dashboard-hero.webp",
  images: [
    "/images/projects/online-retail-dashboard/online-retail-dashboard-desktop.webp",
    "/images/projects/online-retail-dashboard/online-retail-dashboard-phone.webp",
  ],
  imageAlt:
    "Online retail dashboard in dark theme on a laptop and a phone: section tabs, filters, KPI tiles, a monthly revenue line and a world map of revenue by country",
  tags: ["react", "typescript", "d3", "nextjs", "accessibility", "data-visualization", "retail"],
  stack: ONLINE_RETAIL_STACK,
  role: "Designer and engineer (solo)",
  dates: "2026",
  problem:
    "Two years of a UK online gift retailer’s orders, about a million invoice lines, are too much to ship to a browser. The dashboard needed to stay fast with every filter while answering where revenue comes from, which products and baskets matter, whether customers come back, and where returns are high.",
  whatIBuilt: [
    "A Python cleaning script with documented rules (cancellations kept as returns, guest orders kept out of customer metrics) that turns 1.07M invoice lines into a 1.3 MB aggregated snapshot, plus CSVs for a database load.",
    "Five server-rendered tabs that share filters through the URL. After the first render, a filter change is one GraphQL request in which each chart asks for exactly its fields, with depth and complexity limits and CDN caching.",
    "A typed DataSource behind every number: the committed snapshot by default, or Postgres through a read-only role and parameterized queries. An AI “Summarize this view” panel (Claude API) sends only server-computed totals, behind validation, rate limits, a daily cap and a cache. Both are built and tested, and switched off on the live site for now.",
    "Accessible by design: a summary and a data table for every chart, keyboard paths for every interaction, real tables for the matrix and heatmap, and notes wherever a filter doesn’t apply.",
    "Built with Claude Code as my coding partner. I owned the architecture and the decisions (snapshot vs Postgres vs in-browser data, why GraphQL, the guard rails, all recorded in an ADR) and directed and checked the work.",
  ],
  source: ONLINE_RETAIL_DATA_NOTE,
};

export const dashboards: WorkItem[] = [
  {
    id: "retail-kpi-dashboard",
    title: "Retail KPI dashboard",
    summary: "Sales KPIs for a clothing-store chain, built to decide which products to discount.",
    year: 2013,
    images: [img("kpi1")],
    imageAlt:
      "Tableau dashboard titled Larry’s Secret with weekly store sales tables, product profitability bars and a customer discount list",
    tags: ["tableau", "data-visualization", "retail"],
    tools: ["Tableau"],
    highlights: [
      "Weekly and total sales by store.",
      "Average customer transaction compared with the overall average, to build a discount list.",
      "Each product’s share of total sales.",
    ],
    link: { label: "Slides", href: "/work/presentations#retail-kpi-dashboard" },
  },
  {
    id: "market-basket-analysis",
    title: "Market basket analysis",
    summary: "Which products the same chain’s customers buy together.",
    year: 2013,
    images: [img("bascket1")],
    imageAlt: "Tableau market basket matrix showing transaction counts for pairs of products, shaded by count",
    tags: ["tableau", "data-visualization", "retail"],
    tools: ["Tableau"],
    highlights: [
      "Product-by-product matrix of shared transactions, shaded by count.",
    ],
  },
  {
    id: "customer-segmentation",
    title: "Sales and customer segmentation",
    summary: "Sales by product category and customer segment, mapped by state.",
    year: 2013,
    images: [img("segment1")],
    imageAlt:
      "Tableau dashboard with a sales table by product sub-category and customer segment, a US map of pie charts and a stacked bar chart",
    tags: ["tableau", "data-visualization", "retail"],
    tools: ["Tableau"],
    highlights: [
      "Sales heat table across consumer, corporate, home office and small business segments.",
      "Map of segment mix by state, plus sales by product sub-category.",
    ],
  },
  {
    id: "massachusetts-demographics",
    title: "Massachusetts demographics",
    summary: "Population, median age and density by town.",
    year: 2013,
    images: [img("demographics1")],
    imageAlt: "Two Tableau maps of Massachusetts: town population as green circles, and population density",
    tags: ["tableau", "data-visualization", "demographics"],
    tools: ["Tableau"],
    highlights: [
      "Town-level population map, filterable by median age range.",
      "A second map shows population density.",
    ],
  },
  {
    id: "usa-population-table",
    title: "US population change, 2000–2010",
    summary: "Sortable table of population change by state.",
    year: 2014,
    images: [img("h9")],
    imageAlt: "Dark table titled USA Population Change from 2000 to 2010 listing states with 2000 and 2010 population and percent change",
    tags: ["javascript", "jquery", "data-visualization", "demographics"],
    tools: ["JavaScript", "jQuery Tablesorter"],
    highlights: ["Ranks states by 2000 and 2010 population, numeric change and percent change.", "Click any column to sort."],
  },
  {
    id: "project-dashboard-mockups",
    title: "Project dashboard mockups",
    summary: "Mockups for tracking progress, time and budget across projects.",
    year: 2014,
    images: [img("d1"), img("d2"), img("d3")],
    imageAlt:
      "Project dashboard mockup with progress, time-left and budget bars per project and job, and expandable issue details",
    tags: ["data-visualization", "ux-research"],
    highlights: [
      "Progress, time-left and budget bars per project and job.",
      "Issue counts that expand into details and requested actions.",
    ],
  },
];
