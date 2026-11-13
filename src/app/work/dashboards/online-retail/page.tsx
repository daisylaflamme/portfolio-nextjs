import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import KpiTiles from "./_components/KpiTiles";
import MonthlyRevenueChart from "./_components/MonthlyRevenueChart";
import CountryRevenue from "./_components/CountryRevenue";
import { context, partialMonthNote, readFilters, scope, tabMetadata, type SearchParams } from "./_components/server";

export const metadata = tabMetadata("overview");

export default async function OverviewPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const [kpis, months, countries] = await Promise.all([
    source.kpis(filters),
    source.monthlyRevenue(filters),
    source.countries(filters),
  ]);

  return (
    <>
      <KpiTiles kpis={kpis} categorySelected={filters.category !== "all"} />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <MonthlyRevenueChart
          meta={source.meta}
          points={months}
          partialNote={partialMonthNote()}
          scopeLabel={`${scope(filters.country)}, ${filters.category === "all" ? "all categories" : filters.category}`}
        />
        <CountryRevenue rows={countries} selected={filters.country} context={context(filters)} />
      </div>
    </>
  );
}
