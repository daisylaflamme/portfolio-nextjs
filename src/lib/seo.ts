import type { Metadata } from "next";

export const SITE_URL = "https://www.daisylaflamme.net";
export const SITE_NAME = "Daisy Laflamme";

/**
 * Every public page, in sitemap order. Layouts build their metadata from this and
 * src/app/sitemap.ts lists it, so adding a page here keeps both in sync.
 */
export interface PageInfo {
  path: string;
  title: string;
  description: string;
  /** Sitemap priority, 0–1. */
  priority: number;
}

export type PageKey =
  | "home"
  | "work"
  | "dashboards"
  | "marketingDesign"
  | "presentations"
  | "about"
  | "resume"
  | "contact";

export const PAGES: Record<PageKey, PageInfo> = {
  home: {
    path: "/",
    title: "Daisy Laflamme | Senior Frontend & UI Engineer",
    description:
      "Daisy Laflamme is a senior frontend and UI engineer building accessible, high-performance interfaces for multi-brand e-commerce, marketing, and product teams with React, Next.js, Angular, and TypeScript.",
    priority: 1,
  },
  work: {
    path: "/work/web-engineering",
    title: "Web engineering",
    description:
      "Case studies by Daisy Laflamme: multi-brand e-commerce UI, checkout and payments, accessibility-first components, maps, CMS tools and AI products.",
    priority: 0.9,
  },
  dashboards: {
    path: "/work/dashboards",
    title: "Dashboards",
    description:
      "Dashboards by Daisy Laflamme: Tableau retail KPI and market basket analysis, customer segmentation, demographics maps and project tracking mockups.",
    priority: 0.7,
  },
  marketingDesign: {
    path: "/work/marketing-design",
    title: "Marketing and design",
    description:
      "Marketing and graphic design by Daisy Laflamme: campaign landing pages, logos and identity concepts, campaign ads and web banners, flyers, posters and illustration.",
    priority: 0.7,
  },
  presentations: {
    path: "/work/presentations",
    title: "Presentations",
    description:
      "Presentations by Daisy Laflamme: a JavaScript learning platform for women, a usability study and redesign, a retail KPI dashboard, Smart TV app research and a website plan.",
    priority: 0.6,
  },
  about: {
    path: "/about",
    title: "About",
    description:
      "Senior UI / Front-End Engineer with over a decade of experience designing and building interfaces for large-scale e-commerce and complex systems.",
    priority: 0.8,
  },
  resume: {
    path: "/resume",
    title: "Résumé",
    description:
      "Résumé of Daisy Laflamme, senior front-end and UI engineer: experience, skills and education across e-commerce, payments, accessibility and design systems.",
    priority: 0.8,
  },
  contact: {
    path: "/contact",
    title: "Contact",
    description:
      "Get in touch with Daisy Laflamme, senior front-end and UI engineer based in Braintree, MA and available for remote work.",
    priority: 0.7,
  },
};

/**
 * Per-page metadata: title (the root layout's template adds " | Daisy Laflamme"),
 * description, canonical URL and Open Graph tags that point at this page.
 * Next replaces openGraph wholesale in child segments, so every field is set here.
 */
export function pageMetadata({ title, description, path }: PageInfo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
    },
  };
}
