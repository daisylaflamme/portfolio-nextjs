import type { Metadata } from "next";
import { SITE_NAME, pageMetadata } from "@/lib/seo";
import { onlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { tabById, tabPath, type TabId } from "@/lib/dashboards/online-retail/content";
import { monthLabel, monthLong } from "@/lib/dashboards/online-retail/format";
import { parseFilters, serializeFilters } from "@/lib/dashboards/online-retail/params";
import type { Filters } from "@/lib/dashboards/online-retail/types";

/** Server helpers shared by the dashboard's tab pages (they import the snapshot: server only). */

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function readFilters(searchParams: SearchParams): Promise<Filters> {
  return parseFilters(onlineRetailSource.meta, await searchParams);
}

/** Resets a tab's client view when a navigation brings new server data (filters and the tab's own params). */
export function viewKey(filters: Filters, extra = ""): string {
  return `${serializeFilters(onlineRetailSource.meta, filters)}|${extra}`;
}

export function tabMetadata(id: TabId): Metadata {
  const tab = tabById(id);
  const page = { path: tabPath(tab), title: tab.title, description: tab.description, priority: 0 };
  return {
    ...pageMetadata(page),
    twitter: { card: "summary_large_image", title: `${tab.title} | ${SITE_NAME}`, description: tab.description },
  };
}

/** "Dec 2011 covers 1–9 December only.", from the data's last date. */
export function partialMonthNote(): string {
  const last = onlineRetailSource.meta.dateRange[1];
  const day = Number(last.slice(8, 10));
  const month = last.slice(0, 7);
  return day < 28 ? `${monthLabel(month)} covers 1–${day} ${monthLong(month).split(" ")[0]} only.` : "";
}
