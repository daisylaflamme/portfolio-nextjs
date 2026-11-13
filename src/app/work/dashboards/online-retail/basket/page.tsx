import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import BasketMatrix from "../_components/BasketMatrix";
import { ScopeNote, context, readFilters, scope, tabMetadata, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("basket");

export default async function BasketPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const view = await source.basket(filters);

  return (
    <>
      <ScopeNote>
        {view.live
          ? `The ten best-selling products for ${context(filters)}, ${scope(filters.country)}.`
          : "Baskets cover the whole period and every category, so From, To and Category don’t apply here."}
        {view.fallback
          ? ` Basket data covers all countries together and the top ${source.meta.topCountries.length} by revenue; ${countryLabel(filters.country)} isn’t one of them, so all countries are shown.`
          : null}
      </ScopeNote>
      <BasketMatrix view={view} where={scope(view.scope)} />
    </>
  );
}
