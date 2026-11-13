import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import ChartCard from "@/components/charts/ChartCard";
import BarList from "@/components/charts/BarList";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { count, money, percent } from "@/lib/dashboards/online-retail/format";
import { context, tabMetadata, readFilters, type SearchParams } from "../_components/server";

export const metadata = tabMetadata("returns");

export default async function ReturnsPage({ searchParams }: { searchParams: SearchParams }) {
  const source = getOnlineRetailSource();
  const filters = await readFilters(searchParams);
  const view = await source.returns(filters);
  const ctx = context(filters);
  const selected = filters.country;
  const filtered = selected !== "all";
  const selectedRow = view.rows.find((r) => r.country === selected);
  const max = Math.max(0.001, ...view.rows.map((r) => r.rate));
  const lead = view.rows[0];

  return (
    <ChartCard
      title="Return rate by country"
      description={
        <>
          Cancelled orders as a share of revenue, countries with at least {count(view.minOrders)} orders in the range.
          Overall: {percent(view.overall.rate)} ({money(view.overall.returnsValue)} of {money(view.overall.revenue)}).
          {filtered && !selectedRow ? ` ${countryLabel(selected)} has fewer orders, so it isn’t ranked.` : null}
        </>
      }
      table={{
        caption: `Return rate by country, ${ctx}`,
        columns: ["Country", "Return rate", "Returns", "Revenue", "Orders", "Returned lines"],
        rows: view.rows.map((r) => [
          countryLabel(r.country),
          percent(r.rate),
          money(r.returnsValue),
          money(r.revenue),
          count(r.orders),
          count(r.returnLines),
        ]),
      }}
      footnote={`${view.excluded} ${view.excluded === 1 ? "country has" : "countries have"} fewer than ${count(view.minOrders)} orders in the range and ${view.excluded === 1 ? "isn’t" : "aren’t"} shown. Returns are cancellation invoices, counted in the month and country of the cancellation.`}
    >
      <BarList
        summary={
          lead
            ? `Bar chart of return rate by country, ${ctx}. ${countryLabel(lead.country)} is highest at ${percent(lead.rate)}; overall ${percent(view.overall.rate)}.`
            : "No country has enough orders in this range."
        }
        marksLabel="Return rate values"
        maxValue={max}
        rows={view.rows.map((r) => ({
          key: r.country,
          label: countryLabel(r.country),
          value: r.rate,
          valueText: `${percent(r.rate)} · ${count(r.orders)} orders`,
          description: `${countryLabel(r.country)}: ${percent(r.rate)} return rate, ${money(r.returnsValue)} returned of ${money(r.revenue)}, ${count(r.orders)} orders${r.country === selected ? " (selected)" : ""}`,
          dim: filtered && r.country !== selected,
          note: filtered && r.country === selected ? "selected" : undefined,
        }))}
      />
    </ChartCard>
  );
}
