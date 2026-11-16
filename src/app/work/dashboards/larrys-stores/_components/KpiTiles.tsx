"use client";

import { useMemo } from "react";
import { useDashboard } from "./DashboardProvider";
import { selectKpis } from "@/lib/dashboards/larrys/selectors";
import { count, moneyShort, money, percent } from "@/lib/dashboards/larrys/format";

/** The five headline numbers for the current store filter. */
export default function KpiTiles() {
  const { data, filters } = useDashboard();
  const k = useMemo(() => selectKpis(data, filters), [data, filters]);
  const weeks = data.meta.weeks.length;

  const tiles = [
    { id: "revenue", label: "Revenue", value: moneyShort(k.revenue), full: money(k.revenue), note: `${weeks} weeks` },
    { id: "margin", label: "Gross margin", value: percent(k.grossMargin), full: percent(k.grossMargin), note: `${moneyShort(k.grossProfit)} gross profit` },
    { id: "transactions", label: "Transactions", value: count(k.transactions), full: count(k.transactions), note: `${count(k.units)} units` },
    { id: "basket", label: "Average basket", value: money(k.avgBasket), full: money(k.avgBasket), note: `${k.itemsPerBasket.toFixed(1)} items` },
    { id: "loyalty", label: "Loyalty share", value: percent(k.loyaltyShare), full: percent(k.loyaltyShare), note: "of transactions" },
  ];

  return (
    <section aria-label="Key metrics">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t, i) => (
          <div
            key={t.id}
            data-kpi={t.id}
            className={`flex flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3.5 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <dt className="text-[13px] text-muted">{t.label}</dt>
            <dd className="font-display text-[1.65rem] font-bold leading-tight text-fg" title={t.full}>
              <span aria-hidden="true">{t.value}</span>
              <span className="sr-only">{t.full}</span>
            </dd>
            <dd className="font-mono text-xs text-muted">{t.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
