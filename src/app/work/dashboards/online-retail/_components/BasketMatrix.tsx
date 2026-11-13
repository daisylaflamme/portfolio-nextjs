import ChartCard from "@/components/charts/ChartCard";
import { count, percent } from "@/lib/dashboards/online-retail/format";
import type { BasketView } from "@/lib/dashboards/online-retail/types";

/** Shading stays in a range where body text keeps 4.5:1 contrast in both themes. */
const MIN_OPACITY = 0.06;
const MAX_OPACITY = 0.42;

/**
 * The ten best-selling products against each other: each cell is the share of orders that
 * contain both. A real table, so screen readers announce the row and column products.
 */
export default function BasketMatrix({ view, where }: { view: BasketView; where: string }) {
  const { products, share, counts } = view;
  const max = Math.max(0, ...share.flat().map((v) => v ?? 0));
  const pairs = products
    .flatMap((a, i) => products.slice(i + 1).map((b, k) => ({ a, b, share: share[i][i + 1 + k] ?? 0, orders: counts[i][i + 1 + k] ?? 0 })))
    .sort((p, q) => q.share - p.share);
  const top = pairs[0];
  const caption = top
    ? `Share of ${count(view.orders)} orders containing both products, ${where}. Rows and columns are the top 10 products by revenue, numbered in revenue order. The most common pair is ${top.a.description} and ${top.b.description}, in ${percent(top.share)} of orders.`
    : `Share of orders containing both products, ${where}.`;

  return (
    <ChartCard
      title="Bought together: top 10 products"
      description={
        top ? (
          <>
            Share of orders containing both products. Darker means more often. Top pair: {top.a.description} + {top.b.description} (
            {percent(top.share)}).
          </>
        ) : null
      }
      table={{
        caption: `Pairs of top-10 products by share of orders, ${where}, most first`,
        columns: ["Pair", "Share of orders", "Orders"],
        rows: pairs.map((p) => [`${p.a.description} + ${p.b.description}`, percent(p.share, 2), count(p.orders)]),
      }}
      footnote={`On its own: ${products
        .slice(0, 3)
        .map((p) => `${p.description} is in ${percent(p.share)} of orders`)
        .join("; ")}.`}
    >
      <div
        role="region"
        aria-label="Bought-together matrix (scrolls sideways)"
        tabIndex={0}
        className="relative max-w-full overflow-x-auto rounded-lg"
        data-basket-matrix
      >
        <table className="w-full min-w-[34rem] border-separate border-spacing-[3px] text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <td className="w-32 sm:w-48" />
              {products.map((p, j) => (
                <th key={p.code} scope="col" className="px-0.5 py-1 text-center font-mono font-normal text-muted">
                  <span aria-hidden="true">{j + 1}</span>
                  <span className="sr-only">{p.description}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((a, i) => (
              <tr key={a.code}>
                <th scope="row" className="max-w-32 truncate pr-2 sm:max-w-48 text-left text-xs font-normal text-fg" title={a.description}>
                  <span aria-hidden="true" className="font-mono text-muted">{i + 1}. </span>
                  {a.description}
                </th>
                {products.map((b, j) => {
                  const v = share[i][j];
                  if (v === null) {
                    return (
                      <td key={b.code} className="h-9 rounded bg-surface-2 text-center font-mono text-muted">
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">same product</span>
                      </td>
                    );
                  }
                  const op = max ? MIN_OPACITY + (v / max) * (MAX_OPACITY - MIN_OPACITY) : MIN_OPACITY;
                  return (
                    <td key={b.code} className="relative h-9 overflow-hidden rounded bg-surface-2 text-center font-mono text-fg">
                      <span aria-hidden="true" className="absolute inset-0 bg-accent" style={{ opacity: op }} />
                      <span className="relative">{percent(v)}</span>
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
