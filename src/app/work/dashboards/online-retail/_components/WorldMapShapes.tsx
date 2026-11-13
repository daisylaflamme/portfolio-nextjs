import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldTopo from "@/data/world-110m.topo.json";

/**
 * The world outlines (Natural Earth 1:110m), projected once per server process and drawn on
 * the server. Each path carries data-map-country; the client card colours them from the
 * current data with a scoped stylesheet, so no path data travels to the browser as JSON.
 */
export const MAP_WIDTH = 640;
type Props = { name: string };
const topo = worldTopo as unknown as Topology<{ countries: GeometryCollection<Props> }>;

const world = feature(topo, topo.objects.countries);
const projection = geoEqualEarth().fitWidth(MAP_WIDTH, world);
const path = geoPath(projection).digits(1);
const [[, y0], [, y1]] = path.bounds(world);
export const MAP_HEIGHT = Math.ceil(y1 - y0) + 2;
projection.translate([projection.translate()[0], projection.translate()[1] - y0 + 1]);
const SHAPES = world.features.map((f) => ({ name: f.properties.name, d: path(f) ?? "" }));

/** Country names on the map (for the "not on the map" footnote). */
export const MAP_COUNTRIES = SHAPES.map((s) => s.name);

export default function WorldMapShapes() {
  return (
    <g data-map-shapes>
      {SHAPES.map((s) => (
        <path key={s.name} d={s.d} data-map-country={s.name} strokeWidth={0.5} />
      ))}
    </g>
  );
}
