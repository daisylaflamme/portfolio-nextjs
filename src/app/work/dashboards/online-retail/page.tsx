import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import type { OverviewData } from "@/lib/dashboards/online-retail/graphql/operations";
import { OverviewView } from "./_components/views";
import WorldMapShapes, { MAP_COUNTRIES, MAP_HEIGHT, MAP_WIDTH } from "./_components/WorldMapShapes";
import { partialMonthNote, readFilters, tabMetadata, viewKey, type SearchParams } from "./_components/server";

export const metadata = tabMetadata("overview");

/** First render on the server, straight from the DataSource; later filter changes refetch through GraphQL. */
export default async function OverviewPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const [kpis, monthlyRevenue, countries] = await Promise.all([
    source.kpis(filters),
    source.monthlyRevenue(filters),
    source.countries(filters),
  ]);
  const initial: OverviewData = { dashboard: { filters, kpis, monthlyRevenue, countries } };

  return (
    <OverviewView
      key={viewKey(filters)}
      meta={source.meta}
      initial={initial}
      partialNote={partialMonthNote()}
      map={{ width: MAP_WIDTH, height: MAP_HEIGHT, shapes: <WorldMapShapes />, countries: MAP_COUNTRIES }}
    />
  );
}
