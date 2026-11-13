"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  parseDashboardParams,
  serializeDashboardParams,
  type DashboardParams,
} from "@/lib/dashboards/larrys/params";
import type { ClientLarrysData, Filters } from "@/lib/dashboards/larrys/types";
import { openAllGates } from "./hydrateWhenVisible";

interface DashboardContextValue {
  data: ClientLarrysData;
  params: DashboardParams;
  filters: Filters;
  update: (patch: Partial<DashboardParams>) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

/**
 * Store, discount thresholds and product live in the query string, so every view is
 * a shareable link. Writes use history.replaceState(null, …), which Next syncs into
 * useSearchParams without a server round trip or a scroll jump (passing
 * history.state instead would skip that sync; see CLAUDE.md).
 *
 * `data` comes from the server page as a prop (the trimmed client slice), so it
 * arrives as RSC JSON instead of being bundled into every chart's JavaScript.
 */
export function DashboardProvider({ data, children }: { data: ClientLarrysData; children: ReactNode }) {
  const search = useSearchParams();
  const params = useMemo(() => parseDashboardParams(data, new URLSearchParams(search.toString())), [data, search]);

  const update = useCallback(
    (patch: Partial<DashboardParams>) => {
      // Charts not hydrated yet would otherwise re-render as placeholders until visible.
      openAllGates();
      const next = { ...params, ...patch };
      const url = `${window.location.pathname}${serializeDashboardParams(data, next)}${window.location.hash}`;
      window.history.replaceState(null, "", url);
    },
    [data, params],
  );

  const value = useMemo<DashboardContextValue>(
    () => ({ data, params, filters: { store: params.store }, update }),
    [data, params, update],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return value;
}
