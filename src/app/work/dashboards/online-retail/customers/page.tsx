import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { CustomersTabView } from "../_components/views";
import { readFilters, tabMetadata, viewKey, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("customers");

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const [cohorts, segments] = await Promise.all([source.cohorts(filters), source.segments(filters)]);
  return <CustomersTabView key={viewKey(filters)} meta={source.meta} initial={{ dashboard: { filters, cohorts, segments } }} />;
}
