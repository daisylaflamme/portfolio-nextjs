"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { operationVariables } from "@/lib/dashboards/online-retail/graphql/operations";
import { parseFilters, serializeFilters } from "@/lib/dashboards/online-retail/params";
import type { DashboardMeta, Filters } from "@/lib/dashboards/online-retail/types";
import { changeFilters, usePending } from "./dashboardStore";

const FILTER_KEYS = ["from", "to", "country", "category"];

/**
 * The dashboard's filters, read from the query string, and a way to change them.
 *
 * A change rewrites the URL (history.replaceState, so no server render) and refetches the
 * current tab through GraphQL in one request (dashboardStore.ts). Shared links and tab
 * links still render on the server from the same query string.
 */
export function useFilters(meta: DashboardMeta) {
  const search = useSearchParams();
  const pathname = usePathname();
  const pending = usePending();
  const filters = useMemo(() => parseFilters(meta, new URLSearchParams(search.toString())), [meta, search]);

  const update = useCallback(
    (next: Filters) => {
      // Keep a tab's own parameters (the Products tab's ?q= and ?product=) across filter changes.
      const extra = new URLSearchParams(search.toString());
      for (const key of FILTER_KEYS) extra.delete(key);
      const query = [serializeFilters(meta, next).slice(1), extra.toString()].filter(Boolean).join("&");
      const url = `${pathname}${query ? `?${query}` : ""}`;
      void changeFilters(url, operationVariables(meta, next, { q: extra.get("q"), product: extra.get("product") }));
    },
    [meta, pathname, search],
  );

  return { filters, update, pending, query: serializeFilters(meta, filters) };
}
