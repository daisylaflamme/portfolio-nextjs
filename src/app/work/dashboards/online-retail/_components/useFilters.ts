"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseFilters, serializeFilters } from "@/lib/dashboards/online-retail/params";
import type { DashboardMeta, Filters } from "@/lib/dashboards/online-retail/types";

const FILTER_KEYS = ["from", "to", "country", "category"];

/**
 * The dashboard's filters, read from the query string, and a way to change them.
 *
 * Unlike Larry's Secret (which filters data already in the browser), every number here is
 * computed on the server from the snapshot, so a change goes through router.replace: Next
 * re-renders the page on the server with the new query and streams the result in, without
 * a scroll jump. The transition's pending flag lets the filters say "Updating…".
 */
export function useFilters(meta: DashboardMeta) {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const filters = useMemo(() => parseFilters(meta, new URLSearchParams(search.toString())), [meta, search]);

  const update = useCallback(
    (next: Filters) => {
      // Keep a tab's own parameters (the Products tab's ?q= and ?product=) across filter changes.
      const extra = new URLSearchParams(search.toString());
      for (const key of FILTER_KEYS) extra.delete(key);
      const query = [serializeFilters(meta, next).slice(1), extra.toString()].filter(Boolean).join("&");
      const url = `${pathname}${query ? `?${query}` : ""}`;
      startTransition(() => router.replace(url, { scroll: false }));
    },
    [meta, pathname, router, search],
  );

  return { filters, update, pending, query: serializeFilters(meta, filters) };
}
