"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { larrysData } from "@/lib/dashboards/larrys/data";
import {
  parseDashboardParams,
  serializeDashboardParams,
  type DashboardParams,
} from "@/lib/dashboards/larrys/params";
import type { Filters, LarrysData } from "@/lib/dashboards/larrys/types";

interface DashboardContextValue {
  data: LarrysData;
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
 */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const search = useSearchParams();
  const params = useMemo(() => parseDashboardParams(larrysData, new URLSearchParams(search.toString())), [search]);

  const update = useCallback(
    (patch: Partial<DashboardParams>) => {
      const next = { ...params, ...patch };
      const url = `${window.location.pathname}${serializeDashboardParams(larrysData, next)}${window.location.hash}`;
      window.history.replaceState(null, "", url);
    },
    [params],
  );

  const value = useMemo<DashboardContextValue>(
    () => ({ data: larrysData, params, filters: { store: params.store }, update }),
    [params, update],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return value;
}
