import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { rangeLabel } from "@/lib/dashboards/online-retail/format";
import CohortHeatmap from "../_components/CohortHeatmap";
import SegmentBars from "../_components/SegmentBars";
import { ScopeNote, readFilters, scope, tabMetadata, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("customers");

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const [cohorts, segments] = await Promise.all([source.cohorts(filters), source.segments(filters)]);

  return (
    <>
      <ScopeNote>
        {cohorts.live
          ? `Cohorts that first ordered in ${rangeLabel(filters.from, filters.to)}${filters.category === "all" ? "" : ` from ${filters.category}`}${filters.country === "all" ? "" : ` in ${countryLabel(filters.country)}`}, followed to the end of the range. Segments are scored over the whole period, all categories, by each customer’s first order country.`
          : `Cohorts that first ordered in ${rangeLabel(filters.from, filters.to)}, followed to the end of the range. Customer views count every category, and segments are scored over the whole period.`}
        {cohorts.fallback
          ? ` Customer data covers all countries together and the top ${source.meta.topCountries.length} by revenue; ${countryLabel(filters.country)} isn’t one of them, so all countries are shown.`
          : null}
      </ScopeNote>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <CohortHeatmap view={cohorts} where={scope(cohorts.scope)} />
        <SegmentBars view={segments} where={scope(segments.scope)} />
      </div>
    </>
  );
}
