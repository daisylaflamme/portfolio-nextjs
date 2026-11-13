import { geoEqualEarth, geoPath } from "d3-geo";
import { scaleLog } from "d3-scale";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldTopo from "@/data/world-110m.topo.json";
import ChartCard from "@/components/charts/ChartCard";
import BarList from "@/components/charts/BarList";
import { countryLabel, mapName } from "@/lib/dashboards/online-retail/countries";
import { count, money, moneyShort, percent } from "@/lib/dashboards/online-retail/format";
import type { CountryRevenue as Row } from "@/lib/dashboards/online-retail/types";

const W = 640;
type Props = { name: string };
const topo = worldTopo as unknown as Topology<{ countries: GeometryCollection<Props> }>;

// The outlines never change, so they are projected once per server process.
const world = feature(topo, topo.objects.countries);
const projection = geoEqualEarth().fitWidth(W, world);
const path = geoPath(projection).digits(1);
const [[, y0], [, y1]] = path.bounds(world);
const H = Math.ceil(y1 - y0) + 2;
projection.translate([projection.translate()[0], projection.translate()[1] - y0 + 1]);
const SHAPES = world.features.map((f) => ({ name: f.properties.name, d: path(f) ?? "" }));
const ON_MAP = new Set(SHAPES.map((s) => s.name));

interface CountryRevenueProps {
  rows: Row[];
  /** The country filter, or "all". */
  selected: string;
  /** e.g. "Dec 2009 – Dec 2011, all categories" */
  context: string;
}

/**
 * Revenue by country: a world choropleth drawn on the server (d3-geo, Natural Earth
 * outlines), plus a ranked list that carries the exact values and the keyboard path.
 */
export default function CountryRevenue({ rows, selected, context }: CountryRevenueProps) {
  const byMapName = new Map(rows.map((r) => [mapName(r.country), r]));
  const positive = rows.filter((r) => r.revenue > 0);
  const opacity = scaleLog()
    .domain([Math.max(1, Math.min(...positive.map((r) => r.revenue))), Math.max(2, ...positive.map((r) => r.revenue))])
    .range([0.25, 1])
    .clamp(true);
  const offMap = rows.filter((r) => !ON_MAP.has(mapName(r.country)));
  const filtered = selected !== "all";

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
      <svg role="img" aria-label={summary} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full rounded-xl bg-surface-2" data-world-map>
        {SHAPES.map((s) => {
          const r = byMapName.get(s.name);
          return (
            <path
              key={s.name}
              d={s.d}
              className={r ? "fill-accent stroke-bg" : "fill-surface stroke-line"}
              fillOpacity={r ? opacity(Math.max(1, r.revenue)) : 1}
              strokeWidth={0.5}
            />
          );
        })}
        {/* The selected country again on top, outlined, so its border isn't hidden by neighbours. */}
        {filtered
          ? SHAPES.filter((s) => byMapName.get(s.name)?.country === selected).map((s) => (
              <path key={`${s.name}-outline`} d={s.d} fill="none" className="stroke-fg" strokeWidth={1.75} data-selected-country />
            ))
          : null}
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
