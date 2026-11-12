import { format } from "d3-format";

const usd0 = format("$,.0f");
const usd2 = format("$,.2f");
const int = format(",d");
const pct0 = format(".0%");

/** $1.18M, $236k, $149: short money for tiles and axis labels. */
export function moneyShort(v: number): string {
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${Math.round(v / 1e3)}k`;
  return usd0(v);
}

/** $1,176,469: full dollars for tables and labels. */
export const money = (v: number) => usd0(v);
/** $89.99 */
export const price = (v: number) => usd2(v);
/** 7,890 */
export const count = (v: number) => int(Math.round(v));
/** 49% (input 0–1) */
export const percent = (v: number) => pct0(v);
/** 1.6× */
export const times = (v: number) => `${v.toFixed(1)}×`;

/** "2012-04-21" → "Apr 21" (UTC, so the server and browser agree). */
export function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** "2012-04-21" → "Saturday, April 21" */
export function longDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}
