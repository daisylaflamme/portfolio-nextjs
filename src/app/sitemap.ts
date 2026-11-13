import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";
import { ONLINE_RETAIL_TABS, tabPath } from "@/lib/dashboards/online-retail/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = Object.values(PAGES).map((page) => ({
    url: `${SITE_URL}${page.path}`,
    changeFrequency: "monthly" as const,
    priority: page.priority,
  }));
  // The Online Retail dashboard's other tabs are pages of their own (the overview is in PAGES).
  const tabs = ONLINE_RETAIL_TABS.filter((t) => t.segment).map((t) => ({
    url: `${SITE_URL}${tabPath(t)}`,
    changeFrequency: "monthly" as const,
    priority: PAGES.onlineRetailDashboard.priority - 0.1,
  }));
  return [...pages, ...tabs];
}
