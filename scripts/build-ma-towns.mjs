/**
 * One-off: builds src/data/ma-towns.topo.json, the Massachusetts town outlines for
 * the retail dashboard's loyalty map.
 *
 * Source: MassGIS (Bureau of Geographic Information), "Municipalities" survey
 * boundaries (townssurvey_shp.zip), public data. Simplified with mapshaper (run
 * through npx, not a project dependency) and reprojected to WGS84.
 *
 * Usage: node scripts/build-ma-towns.mjs
 */
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE =
  "https://s3.us-east-1.amazonaws.com/download.massgis.digital.mass.gov/shapefiles/state/townssurvey_shp.zip";
const OUT = fileURLToPath(new URL("../src/data/ma-towns.topo.json", import.meta.url));

const dir = mkdtempSync(join(tmpdir(), "ma-towns-"));
try {
  const zip = join(dir, "towns.zip");
  console.log("Downloading", SOURCE);
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  // bsdtar (Windows 10+, macOS) reads zip files; elsewhere use unzip.
  if (process.platform === "linux") execFileSync("unzip", ["-q", zip, "-d", dir]);
  else execFileSync("tar", ["-xf", zip, "-C", dir]);

  // Paths are quoted because the command runs through a shell (needed for npx on Windows).
  const q = (p) => `"${p}"`;
  const command = [
    "npx -y mapshaper@0.6.102",
    // One multipart polygon per town, with the generalized coastline.
    "-i", q(join(dir, "TOWNSSURVEY_POLYM_GENCOAST.shp")), "name=towns",
    "-filter-fields TOWN",
    "-proj wgs84",
    "-simplify 2% keep-shapes",
    "-o", q(OUT), "format=topojson quantization=20000",
  ].join(" ");
  execSync(command, { stdio: "inherit" });
  console.log("Wrote", OUT, `${Math.round(statSync(OUT).size / 1024)} KB`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
