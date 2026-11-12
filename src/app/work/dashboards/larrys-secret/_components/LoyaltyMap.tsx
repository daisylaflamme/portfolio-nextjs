import { geoMercator, geoPath } from "d3-geo";
import { scaleSqrt } from "d3-scale";
import { merge, mesh } from "topojson-client";
import type {
  GeometryCollection,
  MultiPolygon as TopoMultiPolygon,
  Polygon as TopoPolygon,
  Topology,
} from "topojson-specification";
import townsTopo from "@/data/ma-towns.topo.json";
import { larrysData } from "@/lib/dashboards/larrys/data";
import { placeLabel, selectLoyaltyTowns } from "@/lib/dashboards/larrys/selectors";
import { count, money } from "@/lib/dashboards/larrys/format";
import ChartCard from "./ChartCard";
import MapMarks from "./MapMarks";
import type { Mark } from "./MarkLayer";

const W = 600;
const H = 450;
const PAD = 20;

type TownProps = { TOWN: string };
const topo = townsTopo as unknown as Topology<{ towns: GeometryCollection<TownProps> }>;

/**
 * Where loyalty customers live, drawn on the server: town outlines (MassGIS) cropped to
 * the area around the customers' zips, with a dot per zip sized by customer count.
 * The browser gets plain SVG; only the focusable dot layer is a client component.
 */
export default function LoyaltyMap({ className }: { className?: string }) {
  const towns = selectLoyaltyTowns(larrysData, { store: "all" });
  const total = towns.reduce((s, z) => s + z.customers, 0);

  // Fit the projection to the customers' zips, with a margin, and crop the towns to it.
  const lons = towns.map((z) => z.lon);
  const lats = towns.map((z) => z.lat);
  const [x0, x1] = [Math.min(...lons) - 0.12, Math.max(...lons) + 0.12];
  const [y0, y1] = [Math.min(...lats) - 0.08, Math.max(...lats) + 0.08];
  const frame = {
    type: "MultiPoint" as const,
    coordinates: [
      [x0, y0],
      [x1, y1],
    ],
  };
  // A fixed 4:3 frame: the zips span more latitude than longitude, so the fit is set by
  // the height and the extra width shows neighbouring towns for context.
  const projection = geoMercator()
    .fitExtent(
      [
        [PAD, PAD],
        [W - PAD, H - PAD],
      ],
      frame,
    )
    .clipExtent([
      [0, 0],
      [W, H],
    ]);
  const path = geoPath(projection).digits(0);

  // Two paths instead of 351: the land (towns merged) and the town borders, each shared
  // border drawn once. Keeps the server-rendered SVG small.
  const land = path(merge(topo, topo.objects.towns.geometries as (TopoPolygon | TopoMultiPolygon)[])) ?? "";
  const borders = path(mesh(topo, topo.objects.towns, (a, b) => a !== b)) ?? "";

  const r = scaleSqrt()
    .domain([0, Math.max(...towns.map((z) => z.customers))])
    .range([0, 16]);

  const dots = towns.map((z) => {
    const [cx, cy] = projection([z.lon, z.lat]) ?? [0, 0];
    return { z, cx, cy, r: Math.max(3.5, r(z.customers)) };
  });

  const marks: Mark[] = dots.map(({ z, cx, cy, r: rad }) => {
    const hit = Math.max(24, rad * 2);
    return {
      key: z.zip,
      label: `${placeLabel(z.place)} (${z.zip}): ${count(z.customers)} loyalty customers, average income ${money(z.avgIncome)}`,
      x: cx - hit / 2,
      y: cy - hit / 2,
      w: hit,
      h: hit,
      anchorX: cx,
      anchorY: cy - rad,
    };
  });

  const top6 = towns.slice(0, 6);
  const summary = `Map of eastern Massachusetts towns with a dot for each home zip code of loyalty customers, sized by count. ${count(total)} customers in ${towns.length} zip codes; the most live in ${placeLabel(towns[0].place)} (${towns[0].customers}).`;

  return (
    <ChartCard
      className={className}
      title="Where loyalty customers live"
      description="Home zip codes with 3 or more loyalty customers, all stores."
      table={{
        caption: "Loyalty customers by home zip code, with course demographics",
        columns: ["Town (zip)", "Customers", "Population", "Median age", "Avg income"],
        rows: towns.map((z) => [
          `${placeLabel(z.place)} (${z.zip})`,
          count(z.customers),
          count(z.population),
          z.medianAge.toFixed(1),
          money(z.avgIncome),
        ]),
      }}
      footnote={
        <>
          Town boundaries: MassGIS (Bureau of Geographic Information). {count(larrysData.meta.loyaltyCustomersInSmallZips)}{" "}
          customers in zip codes with fewer than 3 are not shown. Income is average gross income from the course’s
          Massachusetts demographics sheet.
        </>
      }
    >
      <div className="relative">
        <svg role="img" aria-label={summary} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full rounded-xl bg-surface-2">
          <path d={land} className="fill-surface stroke-line" strokeWidth={1} />
          <path d={borders} fill="none" className="stroke-line" strokeWidth={0.75} />
          <g className="fill-accent stroke-bg" fillOpacity={0.75} strokeWidth={1.25}>
            {[...dots]
              .sort((a, b) => b.r - a.r)
              .map(({ z, cx, cy, r: rad }) => (
                <circle key={z.zip} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={rad.toFixed(1)} />
              ))}
          </g>
        </svg>
        <MapMarks marks={marks} viewWidth={W} label="Loyalty customer zip codes" />
      </div>
      <ol className="flex flex-col text-sm" aria-label="Top towns by loyalty customers">
        {top6.map((z) => (
          <li key={z.zip} className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-4 border-t border-line py-2">
            <span className="truncate text-fg">{placeLabel(z.place)}</span>
            <span className="font-mono text-muted">{count(z.customers)} customers</span>
            <span className="w-16 text-right font-mono text-muted">{`$${Math.round(z.avgIncome / 1000)}k`}</span>
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
