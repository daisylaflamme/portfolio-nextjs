import type { WorkItem } from "./types";

/**
 * Dashboards for /work/dashboards: screenshots and short write-ups. The original
 * Tableau Public embeds are gone, so nothing here links to them.
 *
 * Images: copy the archive files into public/images/archive/dashboards/ and run
 * `npm run images:archive`.
 */
const img = (name: string) => `/images/archive/dashboards/${name}.webp`;

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
