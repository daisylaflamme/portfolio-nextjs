/**
 * One-off: builds src/data/world-110m.topo.json, the country outlines for the Online
 * Retail dashboard's revenue map.
 *
 * Source: world-atlas 2.0.2 (countries-110m.json), which packages Natural Earth's 1:110m
 * Admin 0 countries (public domain). Antarctica is dropped (no sales there, and it would take
 * a fifth of the map's height); only each country's name is kept.
 *
 * Usage: node scripts/build-world.mjs
 */
import { statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SOURCE = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
const OUT = fileURLToPath(new URL("../src/data/world-110m.topo.json", import.meta.url));

console.log("Downloading", SOURCE);
const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`Download failed: ${res.status}`);
const topo = await res.json();

const countries = topo.objects.countries;
countries.geometries = countries.geometries
  .filter((g) => g.properties?.name !== "Antarctica")
  .map((g) => ({ type: g.type, arcs: g.arcs, properties: { name: g.properties.name } }));
// The land object duplicates the country arcs as one shape; the page merges countries itself.
delete topo.objects.land;

writeFileSync(OUT, JSON.stringify(topo));
console.log("Wrote", OUT, `${Math.round(statSync(OUT).size / 1024)} KB,`, countries.geometries.length, "countries");
