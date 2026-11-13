"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ONLINE_RETAIL_TABS, tabPath } from "@/lib/dashboards/online-retail/content";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { monthLabel } from "@/lib/dashboards/online-retail/format";
import { ALL, defaultFilters, withRange } from "@/lib/dashboards/online-retail/params";
import type { DashboardMeta } from "@/lib/dashboards/online-retail/types";
import { useFilters } from "./useFilters";

const noopSubscribe = () => () => {};

const fieldClass =
  "min-h-11 w-full rounded-lg border border-field bg-bg px-2.5 text-sm text-fg hover:border-fg disabled:opacity-60";

/**
 * Section tabs and filters, shared by every tab. Tabs are links that keep the query string,
 * so filters persist from one tab to the next; the current one has aria-current="page".
 */
export default function DashboardControls({ meta }: { meta: DashboardMeta }) {
  const pathname = usePathname();
  const { filters, update, pending, query } = useFilters(meta);
  // False in the server HTML, true once hydrated: tells tests the selects are live.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const defaults = defaultFilters(meta);
  const isDefault =
    filters.from === defaults.from &&
    filters.to === defaults.to &&
    filters.country === defaults.country &&
    filters.category === defaults.category;
  const countries = [...meta.countries].sort((a, b) => countryLabel(a).localeCompare(countryLabel(b)));

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Dashboard sections">
        <ul className="flex flex-wrap gap-x-5 border-b border-line text-[15px] font-semibold sm:gap-x-6">
          {ONLINE_RETAIL_TABS.map((tab) => {
            const href = tabPath(tab);
            const current = pathname === href;
            return (
              <li key={tab.id}>
                <Link
                  href={`${href}${query}`}
                  aria-current={current ? "page" : undefined}
                  scroll={false}
                  className={`-mb-px inline-flex min-h-12 items-center border-b-[3px] ${
                    current ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form
        aria-label="Filters"
        className="grid grid-cols-2 items-end gap-2.5 sm:flex sm:flex-wrap"
        onSubmit={(e) => e.preventDefault()}
        data-ready={hydrated ? "true" : undefined}
      >
        <label className="flex min-w-0 flex-col gap-1 text-[13px] text-muted sm:w-40">
          From
          <select
            className={fieldClass}
            value={filters.from}
            onChange={(e) => update(withRange(filters, { from: e.target.value }))}
          >
            {meta.months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-[13px] text-muted sm:w-40">
          To
          <select
            className={fieldClass}
            value={filters.to}
            onChange={(e) => update(withRange(filters, { to: e.target.value }))}
          >
            {meta.months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-[13px] text-muted sm:w-48">
          Country
          <select
            className={fieldClass}
            value={filters.country}
            onChange={(e) => update({ ...filters, country: e.target.value })}
          >
            <option value={ALL}>All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {countryLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-[13px] text-muted sm:w-52">
          Category
          <select
            className={fieldClass}
            value={filters.category}
            onChange={(e) => update({ ...filters, category: e.target.value })}
          >
            <option value={ALL}>All categories</option>
            {meta.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => update(defaults)}
          disabled={isDefault}
          className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-lg border border-field px-4 text-sm text-fg hover:border-fg disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
        >
          Reset
        </button>
        <p role="status" className="col-span-2 min-h-5 text-[13px] text-muted sm:col-span-1 sm:self-center" data-filters-status>
          {pending ? "Updating…" : ""}
        </p>
      </form>
    </div>
  );
}
