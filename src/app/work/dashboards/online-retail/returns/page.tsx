import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { ReturnsTabView } from "../_components/views";
import { readFilters, tabMetadata, viewKey, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("returns");

export default async function ReturnsPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const returns = await source.returns(filters);
  return <ReturnsTabView key={viewKey(filters)} initial={{ dashboard: { filters, returns } }} />;
}
