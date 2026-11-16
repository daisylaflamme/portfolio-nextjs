"use client";

import { useMemo } from "react";
import { useDashboard } from "./DashboardProvider";
import ChartCard from "@/components/charts/ChartCard";
import BarList from "@/components/charts/BarList";
import { selectRevenueByStore } from "@/lib/dashboards/larrys/selectors";
import { money, moneyShort, percent } from "@/lib/dashboards/larrys/format";

export default function StoreBars({ className }: { className?: string }) {
  const { data, filters } = useDashboard();
  const stores = useMemo(() => selectRevenueByStore(data, filters), [data, filters]);
  const total = stores.reduce((s, r) => s + r.revenue, 0);
  const filtered = filters.store !== "all";
  const top = stores[0];

  return (
    <ChartCard
      className={className}
      title="Revenue by store"
      description={filtered ? "The selected store is highlighted; the others are shown for comparison." : "All five stores, largest first."}
      table={{
        caption: "Revenue by store, April 2012",
        columns: ["Store", "Revenue", "Share"],
        rows: stores.map((s) => [s.name, money(s.revenue), percent(s.revenue / total)]),
      }}
    >
      <BarList
        summary={`Bar chart of revenue by store. ${top.name} leads with ${money(top.revenue)}, ${percent(top.revenue / total)} of the total.`}
        marksLabel="Store revenue values"
        rows={stores.map((s) => ({
          key: String(s.id),
          label: s.name,
          value: s.revenue,
          valueText: moneyShort(s.revenue),
          description: `${s.name}: ${money(s.revenue)}, ${percent(s.revenue / total)} of revenue${filtered && s.active ? " (selected)" : ""}`,
          dim: filtered && !s.active,
          note: filtered && s.active ? "selected" : undefined,
        }))}
      />
    </ChartCard>
  );
}
