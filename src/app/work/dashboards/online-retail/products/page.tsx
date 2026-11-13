import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import type { ProductsData } from "@/lib/dashboards/online-retail/graphql/operations";
import { ProductsTabView } from "../_components/views";
import { readFilters, tabMetadata, viewKey, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("products");

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const params = await searchParams;
  const filters = await readFilters(searchParams);
  // The tab's own parameters: ?q= (search text) and ?product= (a stock code).
  const q = (first(params.q) ?? "").trim().slice(0, 80);
  const rawProduct = first(params.product)?.trim().toUpperCase() ?? "";
  const product = /^[A-Z0-9]{1,12}$/.test(rawProduct) ? rawProduct : null;

  const status = await source.status();
  const live = status === "live";
  const { searchProducts, productMonthly } = source;
  const [topProducts, results, monthly] = await Promise.all([
    source.topProducts(filters),
    live && q && searchProducts ? searchProducts.call(source, q, filters) : Promise.resolve(null),
    live && product && productMonthly ? productMonthly.call(source, product, filters) : Promise.resolve(null),
  ]);
  const initial: ProductsData = {
    dashboard: { filters, topProducts, searchProducts: results, productMonthly: monthly },
    source: { status },
  };

  return <ProductsTabView key={viewKey(filters, `${q}|${product ?? ""}`)} meta={source.meta} initial={initial} />;
}
