import { onlineRetailSource as source } from "@/lib/dashboards/online-retail/data";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { count, money } from "@/lib/dashboards/online-retail/format";
import { productShareFor } from "@/lib/dashboards/online-retail/selectors";
import ParetoChart from "../_components/ParetoChart";
import ProductTable from "../_components/ProductTable";
import { ScopeNote, readFilters, scope, tabMetadata, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("products");

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = await readFilters(searchParams);
  const view = await source.topProducts(filters);
  const years = view.fromYear === view.toYear ? String(view.fromYear) : `${view.fromYear}–${view.toYear}`;
  const where = scope(view.scope);
  const category = filters.category === "all" ? null : filters.category;

  return (
    <>
      <ScopeNote>
        Products are ranked by calendar year: {years}, the years your From–To range touches.
        {view.exact
          ? null
          : ` For ${countryLabel(view.scope)}, totals add up each year’s top 200, so a product outside one year’s top 200 is undercounted, and there’s no 80/20 curve (it covers all countries and the top 5 only).`}
        {category ? ` The table shows ${category} only; the 80/20 view covers every category.` : null}
      </ScopeNote>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        {view.curve && view.productCount ? (
          <ParetoChart
            curve={view.curve}
            productCount={view.productCount}
            share80={productShareFor(view.curve, 0.8)}
            context={`${where}, ${years}`}
          />
        ) : null}
        <ProductTable
          rows={view.rows}
          caption={`Top products by revenue, ${where}, ${years}${category ? `, ${category}` : ""}. Total revenue ${money(view.totalRevenue)}${view.productCount ? ` from ${count(view.productCount)} products` : ""}.`}
        />
      </div>
    </>
  );
}
