import ChartCard from "@/components/charts/ChartCard";
import BarList from "@/components/charts/BarList";
import { count, money, percent } from "@/lib/dashboards/online-retail/format";
import type { SegmentsView } from "@/lib/dashboards/online-retail/types";

/** What each segment means, from the scoring rules in the snapshot's meta. */
const MEANING: Record<string, string> = {
  Champions: "ordered recently and often, spend the most",
  Loyal: "order regularly",
  Promising: "ordered recently, not often yet",
  "At risk": "used to order often, gone quiet",
  Lost: "few orders, long ago",
};

/** RFM segments as bars; opacity steps follow the segment order and the text carries the values. */
export default function SegmentBars({ view, where }: { view: SegmentsView; where: string }) {
  const lead = [...view.rows].sort((a, b) => b.customers - a.customers)[0];
  return (
    <ChartCard
      title="Customer segments"
      description={`Scored on recency, frequency and spend over the whole period. ${count(view.customers)} customers, ${where}.`}
      table={{
        caption: `Customer segments, ${where}`,
        columns: ["Segment", "Customers", "Share", "Days since last order", "Orders", "Revenue"],
        rows: view.rows.map((r) => [
          r.segment,
          count(r.customers),
          percent(r.share),
          count(r.avgRecencyDays),
          r.avgOrders.toFixed(1),
          money(r.avgRevenue),
        ]),
      }}
      footnote={`Averages per customer. Recency counts days to ${view.referenceDate}, the day after the last order in the data. Customers without an ID aren’t scored.`}
    >
      <BarList
        summary={`Bar chart of customers by segment, ${where}. The largest is ${lead?.segment} with ${count(lead?.customers ?? 0)} customers, ${percent(lead?.share ?? 0)}.`}
        marksLabel="Customer segment values"
        rows={view.rows.map((r, i) => ({
          key: r.segment,
          label: `${r.segment}: ${MEANING[r.segment] ?? ""}`,
          value: r.customers,
          valueText: `${count(r.customers)} · ${percent(r.share, 0)}`,
          description: `${r.segment} (${MEANING[r.segment] ?? ""}): ${count(r.customers)} customers, ${percent(r.share)}; on average ${count(r.avgRecencyDays)} days since the last order, ${r.avgOrders.toFixed(1)} orders, ${money(r.avgRevenue)} revenue`,
          opacity: 1 - i * 0.15,
        }))}
      />
    </ChartCard>
  );
}
