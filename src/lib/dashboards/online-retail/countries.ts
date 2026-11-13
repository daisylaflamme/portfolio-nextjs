/**
 * Country names as the dataset spells them, mapped to friendlier labels and to the names
 * in the world map (src/data/world-110m.topo.json, Natural Earth via world-atlas).
 */

/** Labels shown on the page; anything not listed shows as the dataset spells it. */
const LABELS: Record<string, string> = {
  EIRE: "Ireland",
  USA: "United States",
  RSA: "South Africa",
  Korea: "South Korea",
  "Czech Republic": "Czechia",
};

/** Dataset name → world map name, where they differ. */
const MAP_NAMES: Record<string, string> = {
  EIRE: "Ireland",
  USA: "United States of America",
  RSA: "South Africa",
  Korea: "South Korea",
  "Czech Republic": "Czechia",
};

export function countryLabel(name: string): string {
  return name === "all" ? "All countries" : (LABELS[name] ?? name);
}

/** The world map's name for a dataset country (the map may not have it, e.g. Singapore at 1:110m). */
export function mapName(name: string): string {
  return MAP_NAMES[name] ?? name;
}
