import Link from "next/link";
import { count, money } from "@/lib/dashboards/online-retail/format";
import type { ProductSearchRow } from "@/lib/dashboards/online-retail/types";

interface Props {
  /** The Products tab's path. */
  action: string;
  /** Current filters as query pairs, carried as hidden fields so a search keeps them. */
  hidden: [string, string][];
  query: string;
  results: ProductSearchRow[] | null;
  /** The product whose monthly chart is shown, if any. */
  selected: string | null;
  /** Builds the link that shows a product's monthly sales. */
  productHref: (code: string) => string;
  context: string;
}

/**
 * "Find any product": a plain GET form, so it works before hydration and every search is a
 * shareable link. Runs against the live database only (the snapshot has the top 200).
 */
export default function ProductSearch({ action, hidden, query, results, selected, productHref, context }: Props) {
  return (
    <section aria-labelledby="product-search-title" className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:p-5" data-product-search>
      <h2 id="product-search-title" className="font-display text-lg font-semibold leading-snug text-fg sm:text-xl">
        Find any product
      </h2>
      <p className="text-sm text-muted">Search every product by name or stock code; results are those sold in {context}.</p>
      <form method="get" action={action} role="search" aria-label="Find any product" className="flex flex-wrap items-end gap-2">
        {hidden.map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-[13px] text-muted sm:max-w-sm">
          Product name or code
          <input
            type="search"
            name="q"
            defaultValue={query}
            maxLength={80}
            placeholder="e.g. teapot"
            className="min-h-11 w-full rounded-lg border border-field bg-bg px-2.5 text-sm text-fg placeholder:text-muted"
          />
        </label>
        <button type="submit" className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 font-mono text-sm text-on-accent hover:opacity-90">
          search
        </button>
      </form>
      {results === null ? null : results.length === 0 ? (
        <p role="status" className="text-sm text-muted">
          No products matching “{query}” sold in {context}.
        </p>
      ) : (
        <>
          <p role="status" className="text-[13px] text-muted">
            {results.length === 1 ? "1 product matches" : `${count(results.length)} products match`} “{query}”
            {results.length >= 25 ? " (the 25 with the most revenue)" : ""}.
          </p>
          <div role="region" aria-label="Search results (scrolls sideways)" tabIndex={0} className="relative max-w-full overflow-x-auto rounded-md">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <caption className="sr-only">Products matching “{query}”, {context}</caption>
              <thead>
                <tr className="border-b border-line text-[13px] text-muted">
                  <th scope="col" className="py-2 pr-3 font-semibold">Product</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Units</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.code} className="border-b border-line last:border-0">
                    <th scope="row" className="py-1 pr-3 font-normal">
                      <Link
                        href={productHref(r.code)}
                        scroll={false}
                        // Up to 25 links: prefetching each would query the database for nothing.
                        prefetch={false}
                        aria-current={r.code === selected ? "true" : undefined}
                        className="inline-flex min-h-11 items-center gap-1.5 text-fg underline underline-offset-4 hover:text-accent aria-[current=true]:font-semibold"
                      >
                        {r.description}
                        <span className="font-mono text-[11px] text-muted no-underline">{r.code}</span>
                        <span className="sr-only">: show monthly sales</span>
                      </Link>
                    </th>
                    <td className="py-1 pr-3 text-[13px] text-body">{r.category}</td>
                    <td className="py-1 pr-3 text-right font-mono text-[13px] text-body">{count(r.units)}</td>
                    <td className="py-1 pr-3 text-right font-mono text-[13px] text-body">{money(r.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
