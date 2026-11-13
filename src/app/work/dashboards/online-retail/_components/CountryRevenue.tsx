"use client";

import { useId, type ReactNode } from "react";
import { scaleLog } from "d3-scale";
import ChartCard from "@/components/charts/ChartCard";
import BarList from "@/components/charts/BarList";
import { countryLabel, mapName } from "@/lib/dashboards/online-retail/countries";
import { count, money, moneyShort, percent } from "@/lib/dashboards/online-retail/format";
import type { CountryRevenue as Row } from "@/lib/dashboards/online-retail/types";

export interface WorldMap {
  width: number;
  height: number;
  /** The server-rendered outlines (WorldMapShapes): paths with data-map-country. */
  shapes: ReactNode;
  /** Country names on the map. */
  countries: string[];
}

interface CountryRevenueProps {
  rows: Row[];
  /** The country filter, or "all". */
  selected: string;
  /** e.g. "Dec 2009 – Dec 2011, all categories" */
  context: string;
  map: WorldMap;
}

/** Quotes a value for a CSS attribute selector. */
const attr = (v: string) => `"${v.replace(/["\\]/g, "\\$&")}"`;

/**
 * Revenue by country: the server-drawn world map, shaded from the current data through a
 * scoped stylesheet, plus a ranked list that carries the exact values and the keyboard path.
 */
export default function CountryRevenue({ rows, selected, context, map }: CountryRevenueProps) {
  const id = `map-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const positive = rows.filter((r) => r.revenue > 0);
  const opacity = scaleLog()
    .domain([Math.max(1, Math.min(...positive.map((r) => r.revenue))), Math.max(2, ...positive.map((r) => r.revenue))])
    .range([0.25, 1])
    .clamp(true);
  const onMap = new Set(map.countries);
  const offMap = rows.filter((r) => !onMap.has(mapName(r.country)));
  const filtered = selected !== "all";

  // Land without sales, then one rule per country with sales; the selected one is outlined.
  const css = [
    `#${id} [data-map-country]{fill:var(--surface);stroke:var(--border)}`,
    ...positive.map(
      (r) => `#${id} [data-map-country=${attr(mapName(r.country))}]{fill:var(--accent);fill-opacity:${opacity(Math.max(1, r.revenue)).toFixed(3)};stroke:var(--bg)}`,
    ),
    filtered ? `#${id} [data-map-country=${attr(mapName(selected))}]{stroke:var(--fg);stroke-width:2px}` : "",
  ].join("\n");

  const top = rows.slice(0, 8);
  if (filtered && !top.some((r) => r.country === selected)) {
    const r = rows.find((x) => x.country === selected);
    if (r) top.push(r);
  }
  const lead = rows[0];
  const summary = lead
    ? `World map shaded by revenue, ${context}. ${countryLabel(lead.country)} leads with ${money(lead.revenue)}, ${percent(lead.share)} of the total; ${rows.length} countries have sales.`
    : "No sales for this selection.";

  return (
    <ChartCard
      title="Revenue by country"
      description={filtered ? `${countryLabel(selected)} is outlined; the others are shown for comparison.` : `Darker means more revenue (log scale). ${context}.`}
      table={{
        caption: `Revenue by country, ${context}`,
        columns: ["Country", "Revenue", "Share", "Orders"],
        rows: rows.map((r) => [countryLabel(r.country), money(r.revenue), percent(r.share), count(r.orders)]),
      }}
      footnote={
        <>
          Map: Natural Earth (public domain), 1:110m.
          {offMap.length ? ` Not on the map at this scale: ${offMap.map((r) => countryLabel(r.country)).join(", ")}.` : ""}
        </>
      }
    >
      <style>{css}</style>
      <svg id={id} role="img" aria-label={summary} viewBox={`0 0 ${map.width} ${map.height}`} className="block h-auto w-full rounded-xl bg-surface-2" data-world-map>
        {map.shapes}
      </svg>
      <BarList
        summary={`Ranked revenue by country, ${context}. ${lead ? `${countryLabel(lead.country)} leads with ${money(lead.revenue)}.` : ""}`}
        marksLabel="Revenue by country values"
        rows={top.map((r) => ({
          key: r.country,
          label: countryLabel(r.country),
          value: r.revenue,
          valueText: `${moneyShort(r.revenue)} · ${percent(r.share)}`,
          description: `${countryLabel(r.country)}: ${money(r.revenue)}, ${percent(r.share)} of revenue, ${count(r.orders)} orders${filtered && r.country === selected ? " (selected)" : ""}`,
          dim: filtered && r.country !== selected,
          note: filtered && r.country === selected ? "selected" : undefined,
        }))}
        maxValue={lead?.revenue}
      />
    </ChartCard>
  );
}
