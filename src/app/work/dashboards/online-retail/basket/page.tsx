import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { BasketTabView } from "../_components/views";
import { readFilters, tabMetadata, viewKey, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("basket");

export default async function BasketPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const basket = await source.basket(filters);
  return <BasketTabView key={viewKey(filters)} meta={source.meta} initial={{ dashboard: { filters, basket } }} />;
}
