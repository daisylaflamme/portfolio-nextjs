import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { tabById, tabPath } from "@/lib/dashboards/online-retail/content";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { count, money, rangeLabel } from "@/lib/dashboards/online-retail/format";
import { serializeFilters } from "@/lib/dashboards/online-retail/params";
import { productShareFor } from "@/lib/dashboards/online-retail/selectors";
import ParetoChart from "../_components/ParetoChart";
import ProductTable from "../_components/ProductTable";
import ProductSearch from "../_components/ProductSearch";
import ProductMonthlyChart from "../_components/ProductMonthlyChart";
import { ScopeNote, context, readFilters, scope, tabMetadata, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("products");

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** The Products tab's own parameters: ?q= (search text) and ?product= (a stock code). */
function readProductParams(params: Record<string, string | string[] | undefined>) {
  const q = (first(params.q) ?? "").trim().slice(0, 80);
  const product = first(params.product)?.trim().toUpperCase() ?? "";
  return { q, product: /^[A-Z0-9]{1,12}$/.test(product) ? product : null };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const params = await searchParams;
  const filters = await readFilters(searchParams);
  const { q, product } = readProductParams(params);
  // Live-only features: present on the Postgres source, and only while the database answers.
  const { searchProducts, productMonthly } = source;
  const live = Boolean(searchProducts && productMonthly) && (await source.status()) === "live";

  const [view, results, monthly] = await Promise.all([
    source.topProducts(filters),
    live && q && searchProducts ? searchProducts.call(source, q, filters) : Promise.resolve(null),
    live && product && productMonthly ? productMonthly.call(source, product, filters) : Promise.resolve(null),
  ]);

  const years = view.fromYear === view.toYear ? String(view.fromYear) : `${view.fromYear}–${view.toYear}`;
  const period = view.rangeKind === "months" ? rangeLabel(filters.from, filters.to) : years;
  const where = scope(view.scope);
  const category = filters.category === "all" ? null : filters.category;

  // Links and the search form keep the filters (and the search text).
  const path = tabPath(tabById("products"));
  const filterPairs = [...new URLSearchParams(serializeFilters(source.meta, filters).slice(1))] as [string, string][];
  const productHref = (code: string) => {
    const qs = new URLSearchParams(filterPairs);
    if (q) qs.set("q", q);
    qs.set("product", code);
    return `${path}?${qs.toString()}`;
  };

  return (
    <>
      <ScopeNote>
        {view.rangeKind === "months"
          ? `Products are ranked for ${period} exactly${category ? `, within ${category}` : ""}.`
          : `Products are ranked by calendar year: ${years}, the years your From–To range touches.`}
        {view.exact
          ? null
          : ` For ${countryLabel(view.scope)}, totals add up each year’s top 200, so a product outside one year’s top 200 is undercounted, and there’s no 80/20 curve (it covers all countries and the top 5 only).`}
        {category && view.rangeKind === "years" ? ` The table shows ${category} only; the 80/20 view covers every category.` : null}
        {live ? null : " Searching every product needs the live database; this view uses the snapshot’s top products."}
      </ScopeNote>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        {live ? (
          <ProductSearch
            action={path}
            hidden={filterPairs}
            query={q}
            results={results}
            selected={product}
            productHref={productHref}
            context={`${context(filters)}, ${where}`}
          />
        ) : null}
        {monthly && monthly.months.some((m) => m.units > 0) ? <ProductMonthlyChart product={monthly} where={where} /> : null}
        {monthly && !monthly.months.some((m) => m.units > 0) ? (
          <p role="status" className="text-sm text-muted">
            {monthly.description} ({monthly.code}) has no sales in {where}.
          </p>
        ) : null}
        {live && product && !monthly ? (
          <p role="status" className="text-sm text-muted">
            No product with code {product}.
          </p>
        ) : null}
        {view.curve && view.productCount ? (
          <ParetoChart
            curve={view.curve}
            productCount={view.productCount}
            share80={productShareFor(view.curve, 0.8)}
            context={`${where}, ${period}`}
          />
        ) : null}
        <ProductTable
          rows={view.rows}
          caption={`Top products by revenue, ${where}, ${period}${category ? `, ${category}` : ""}. Total revenue ${money(view.totalRevenue)}${view.productCount ? ` from ${count(view.productCount)} products` : ""}.`}
        />
      </div>
    </>
  );
}
