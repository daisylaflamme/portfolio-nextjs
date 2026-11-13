import { format } from "d3-format";

const int = format(",d");
const gbp2 = format(",.2f");

/** £19,354,775: whole pounds for tables and labels. */
export function money(v: number): string {
  const s = `£${int(Math.round(Math.abs(v)))}`;
  return v < 0 ? `−${s}` : s;
}

/** £24.62: pounds and pence, e.g. an average order value. */
export function moneyExact(v: number): string {
  const s = `£${gbp2(Math.abs(v))}`;
  return v < 0 ? `−${s}` : s;
}

/** £19.35M, £236k, £149: short pounds for tiles and axis labels. */
export function moneyShort(v: number): string {
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (a >= 1e6) return `${sign}£${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e4) return `${sign}£${Math.round(a / 1e3)}k`;
  if (a >= 1e3) return `${sign}£${(a / 1e3).toFixed(1)}k`;
  return `${sign}£${Math.round(a)}`;
}

/** 39,505 */
export const count = (v: number) => int(Math.round(v));

/** 2.4% (input 0–1). One decimal, since return rates are small. */
export function percent(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}

/** +12.3% / −4.0%: a change between two periods (input 0–1, signed). */
export function change(v: number): string {
  const s = `${Math.abs(v * 100).toFixed(1)}%`;
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : "0.0%";
}

const date = (month: string) => new Date(`${month}-01T00:00:00Z`);

/** "2010-01" → "Jan 2010" (UTC, so the server and browser agree). */
export function monthLabel(month: string): string {
  return date(month).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** "2010-01" → "January 2010" */
export function monthLong(month: string): string {
  return date(month).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** "2010-01" → "Jan 10", for axis ticks and cohort rows. */
export function monthShort(month: string): string {
  return `${date(month).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })} ${month.slice(2, 4)}`;
}

/** "Dec 2009 – Nov 2010", or one month on its own. */
export function rangeLabel(from: string, to: string): string {
  return from === to ? monthLabel(from) : `${monthLabel(from)} – ${monthLabel(to)}`;
}
