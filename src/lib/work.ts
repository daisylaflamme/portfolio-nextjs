/**
 * The Work categories, in tab order. The header tabs, the home page "work hub" and
 * PAGES in seo.ts all use this list.
 */
export interface WorkCategory {
  id: "web-engineering" | "dashboards" | "marketing-design" | "presentations";
  label: string;
  path: string;
  /** One line for the home page tile. */
  blurb: string;
}

export const WORK_CATEGORIES: readonly WorkCategory[] = [
  {
    id: "web-engineering",
    label: "Web engineering",
    path: "/work/web-engineering",
    blurb: "E-commerce, checkout and payments, maps, design systems, CMS widgets",
  },
  {
    id: "dashboards",
    label: "Dashboards",
    path: "/work/dashboards",
    blurb: "Retail KPI, market basket and demographics dashboards",
  },
  {
    id: "marketing-design",
    label: "Marketing and design",
    path: "/work/marketing-design",
    blurb: "Logos, ad banners, flyers and illustration",
  },
  {
    id: "presentations",
    label: "Presentations",
    path: "/work/presentations",
    blurb: "UX research, HCI and learning platform proposals",
  },
];
