import type { ReactNode } from "react";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { rangeLabel } from "@/lib/dashboards/online-retail/format";
import type { Filters } from "@/lib/dashboards/online-retail/types";

/** Labels and the scope note, shared by server pages and client views (no data imports). */

/** "Dec 2009 – Dec 2011, all categories" */
export function context(f: Filters): string {
  return `${rangeLabel(f.from, f.to)}, ${f.category === "all" ? "all categories" : f.category}`;
}

/** "all countries" or the country's label. */
export function scope(country: string): string {
  return country === "all" ? "all countries" : countryLabel(country);
}

/** What a view leaves out of the current filters, so nothing is applied silently. */
export function ScopeNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] leading-relaxed text-body" data-scope-note>
      {children}
    </p>
  );
}
