"use client";

import { useDeferredValue, useId, useState } from "react";
import { count, money, percent } from "@/lib/dashboards/online-retail/format";
import type { ProductRow } from "@/lib/dashboards/online-retail/types";

interface Props {
  rows: ProductRow[];
  caption: string;
}

/**
 * The ranked products as a real table with a search box. At most 200 rows, so it renders
 * them all (no virtualization needed); the box scrolls sideways on phones.
 */
export default function ProductTable({ rows, caption }: Props) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const id = useId();
  const q = deferred.trim().toLowerCase();
  const shown = rows
    .map((r, i) => ({ ...r, rank: i + 1 }))
    .filter((r) => !q || r.description.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));

  return (
    <section aria-labelledby={`${id}-title`} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <h2 id={`${id}-title`} className="font-display text-lg font-semibold leading-snug text-fg sm:text-xl">
          Top products
        </h2>
        <label className="flex flex-col gap-1 text-[13px] text-muted">
          Search products
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. lantern"
            aria-describedby={`${id}-count`}
            className="min-h-11 w-56 max-w-full rounded-lg border border-field bg-bg px-2.5 text-sm text-fg placeholder:text-muted"
          />
        </label>
      </div>
      <p id={`${id}-count`} role="status" className="text-[13px] text-muted" data-product-count>
        {q ? `${count(shown.length)} of ${count(rows.length)} products match “${deferred.trim()}”` : `${count(rows.length)} products`}
      </p>
      <div role="region" aria-label={`${caption} (scrolls sideways)`} tabIndex={0} className="relative max-h-[36rem] max-w-full overflow-auto rounded-md">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-line text-[13px] text-muted">
              <th scope="col" className="py-2 pr-3 font-semibold">#</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Product</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Units</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Revenue</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">Share</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.code} className="border-b border-line last:border-0">
                <td className="py-2 pr-3 font-mono text-[13px] text-muted">{r.rank}</td>
                <th scope="row" className="py-2 pr-3 font-normal text-fg">
                  {r.description}
                  <span className="ml-1.5 font-mono text-[11px] text-muted">{r.code}</span>
                </th>
                <td className="py-2 pr-3 text-[13px] text-body">{r.category}</td>
                <td className="py-2 pr-3 text-right font-mono text-[13px] text-body">{count(r.units)}</td>
                <td className="py-2 pr-3 text-right font-mono text-[13px] text-body">{money(r.revenue)}</td>
                <td className="py-2 pr-3 text-right font-mono text-[13px] text-body">{percent(r.share, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 ? <p className="py-6 text-center text-sm text-muted">No products match.</p> : null}
      </div>
    </section>
  );
}
