import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES).map((page) => ({
    url: `${SITE_URL}${page.path}`,
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
