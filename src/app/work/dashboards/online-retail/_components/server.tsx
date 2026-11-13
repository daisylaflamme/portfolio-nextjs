import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_NAME, pageMetadata } from "@/lib/seo";
import { onlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { tabById, tabPath, type TabId } from "@/lib/dashboards/online-retail/content";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { monthLabel, monthLong, rangeLabel } from "@/lib/dashboards/online-retail/format";
import { parseFilters } from "@/lib/dashboards/online-retail/params";
import type { Filters } from "@/lib/dashboards/online-retail/types";

/** Server helpers shared by the dashboard's tab pages. */

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function readFilters(searchParams: SearchParams): Promise<Filters> {
  return parseFilters(onlineRetailSource.meta, await searchParams);
}

export function tabMetadata(id: TabId): Metadata {
  const tab = tabById(id);
  const page = { path: tabPath(tab), title: tab.title, description: tab.description, priority: 0 };
  return {
    ...pageMetadata(page),
    twitter: { card: "summary_large_image", title: `${tab.title} | ${SITE_NAME}`, description: tab.description },
  };
}

/** "Dec 2009 – Dec 2011, all categories" */
export function context(f: Filters): string {
  return `${rangeLabel(f.from, f.to)}, ${f.category === "all" ? "all categories" : f.category}`;
}

/** "all countries" or the country's label. */
export function scope(country: string): string {
  return country === "all" ? "all countries" : countryLabel(country);
}

/** "Dec 2011 covers 1–9 December only.", from the data's last date. */
export function partialMonthNote(): string {
  const last = onlineRetailSource.meta.dateRange[1];
  const day = Number(last.slice(8, 10));
  const month = last.slice(0, 7);
  return day < 28 ? `${monthLabel(month)} covers 1–${day} ${monthLong(month).split(" ")[0]} only.` : "";
}

/** What a view leaves out of the current filters, so nothing is applied silently. */
export function ScopeNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] leading-relaxed text-body" data-scope-note>
      {children}
    </p>
  );
}
