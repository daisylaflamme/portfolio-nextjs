"use client";

import { useMemo, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
import { useDashboard } from "./DashboardProvider";
import ChartCard from "@/components/charts/ChartCard";
import { selectBasketMatrix } from "@/lib/dashboards/larrys/selectors";
import { count } from "@/lib/dashboards/larrys/format";

/** Shading stays in a range where body text keeps 4.5:1 contrast in both themes. */
const MIN_OPACITY = 0.06;
const MAX_OPACITY = 0.42;

export default function BasketMatrix({ className }: { className?: string }) {
  const { data, filters } = useDashboard();
  const m = useMemo(() => selectBasketMatrix(data, filters), [data, filters]);
  // False in the server HTML, true once hydrated: marks the chart ready for tests and screenshots.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const store = filters.store === "all" ? "all stores" : data.stores.find((s) => s.id === filters.store)?.name;

  const pairs = m.products
    .flatMap((a, i) => m.products.slice(i + 1).map((b, k) => ({ a, b, n: m.counts[i][i + 1 + k] ?? 0 })))
    .sort((p, q) => q.n - p.n);

  const caption = m.top
    ? `Transactions containing both products, ${store}. Rows and columns are numbered in revenue order. The top pair is ${m.top.a.name} and ${m.top.b.name}, ${count(m.top.transactions)} transactions.`
    : `Transactions containing both products, ${store}.`;

  return (
    <ChartCard
      className={className}
      title="Bought together"
      description={
        m.top ? (
          <>
            Transactions containing both products. Top pair: {m.top.a.name} + {m.top.b.name} ({count(m.top.transactions)}).
          </>
        ) : null
      }
      table={{
        caption: "Product pairs by shared transactions, most first",
        columns: ["Pair", "Transactions"],
        rows: pairs.map((p) => [`${p.a.name} + ${p.b.name}`, count(p.n)]),
      }}
    >
      <div
        role="region"
        aria-label="Bought-together matrix (scrolls sideways)"
        tabIndex={0}
        // relative: keeps the absolutely positioned sr-only labels inside the scroll box.
        className="relative max-w-full overflow-x-auto rounded-lg"
        data-chart
        data-chart-ready={hydrated ? "true" : undefined}
      >
        <table className="w-full min-w-[30rem] border-separate border-spacing-[3px] text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <td className="w-36" />
              {m.products.map((p, j) => (
                <th key={p.id} scope="col" className="px-0.5 py-1 text-center font-mono font-normal text-muted">
                  <span aria-hidden="true">{j + 1}</span>
                  <span className="sr-only">{p.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.products.map((a, i) => (
              <tr key={a.id}>
                <th scope="row" className="max-w-36 truncate pr-2 text-left text-xs font-normal text-fg" title={a.name}>
                  <span aria-hidden="true" className="font-mono text-muted">{i + 1}. </span>
                  {a.name}
                </th>
                {m.products.map((b, j) => {
                  const n = m.counts[i][j];
                  if (n === null) {
                    return (
                      <td key={b.id} className="h-9 rounded bg-surface-2 text-center font-mono text-muted">
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">same product</span>
                      </td>
                    );
                  }
                  const op = m.max ? MIN_OPACITY + (n / m.max) * (MAX_OPACITY - MIN_OPACITY) : MIN_OPACITY;
                  return (
                    <td key={b.id} className="relative h-9 overflow-hidden rounded bg-surface-2 text-center font-mono text-fg">
                      <span aria-hidden="true" className="absolute inset-0 bg-accent" style={{ opacity: op }} />
                      <span className="relative">{count(n)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
