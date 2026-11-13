"use client";

import { useMemo } from "react";
import { useDashboard } from "./DashboardProvider";
import ChartCard from "@/components/charts/ChartCard";
import BarList from "@/components/charts/BarList";
import { selectProducts } from "@/lib/dashboards/larrys/selectors";
import { count, money, moneyShort, percent } from "@/lib/dashboards/larrys/format";

export default function ProductBars({ className }: { className?: string }) {
  const { data, filters } = useDashboard();
  const products = useMemo(() => selectProducts(data, filters), [data, filters]);
  const top = products[0];
  const bestMargin = products.reduce((a, b) => (b.margin > a.margin ? b : a), products[0]);

  return (
    <ChartCard
      className={className}
      title="Products: revenue and margin"
      description={<>Bars show revenue; the second number is gross margin. Highest margin: {bestMargin.name} ({percent(bestMargin.margin)}).</>}
      table={{
        caption: "Revenue, units and gross margin by product",
        columns: ["Product", "Revenue", "Units", "Gross margin"],
        rows: products.map((p) => [p.name, money(p.revenue), count(p.units), percent(p.margin)]),
      }}
    >
      <BarList
        summary={`Bar chart of revenue by product. ${top.name} sells the most, ${money(top.revenue)}. ${bestMargin.name} has the highest gross margin, ${percent(bestMargin.margin)}.`}
        marksLabel="Product revenue values"
        rows={products.map((p) => ({
          key: p.id,
          label: p.name,
          value: p.revenue,
          valueText: `${moneyShort(p.revenue)} · ${percent(p.margin)}`,
          description: `${p.name}: ${money(p.revenue)} revenue, ${count(p.units)} units, ${percent(p.margin)} gross margin`,
        }))}
      />
    </ChartCard>
  );
}
