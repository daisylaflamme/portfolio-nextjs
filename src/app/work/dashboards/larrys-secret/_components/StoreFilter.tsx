"use client";

import { useDashboard } from "./DashboardProvider";
import type { StoreFilter as StoreValue } from "@/lib/dashboards/larrys/types";

/** Store pills. Each is a toggle button; the current one has aria-pressed="true". */
export default function StoreFilter() {
  const { data, params, update } = useDashboard();
  const options: { id: StoreValue; label: string }[] = [
    { id: "all", label: "All stores" },
    ...data.stores.map((s) => ({ id: s.id, label: s.name })),
  ];

  return (
    <div role="group" aria-label="Filter by store" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.id === params.store;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => update({ store: o.id })}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
              on ? "border-fg bg-fg text-bg" : "border-field bg-surface text-fg hover:border-fg"
            }`}
          >
            {on ? (
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            ) : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
