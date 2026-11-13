import ChartCard from "@/components/charts/ChartCard";
import { count, monthLabel, monthShort, percent } from "@/lib/dashboards/online-retail/format";
import type { CohortsView } from "@/lib/dashboards/online-retail/types";

const MIN_OPACITY = 0.05;
const MAX_OPACITY = 0.45;

/**
 * Retention by monthly cohort: rows are the month customers first ordered, columns the
 * months since. A real table (row and column headers), shaded by share.
 */
export default function CohortHeatmap({ view, where }: { view: CohortsView; where: string }) {
  const columns = Array.from({ length: view.maxMonths }, (_, i) => i + 1);
  const values = view.rows.flatMap((r) => r.cells.filter((c): c is number => c !== null));
  const max = Math.max(0.01, ...values);
  const totalCustomers = view.rows.reduce((a, r) => a + r.size, 0);
  // Weighted month-1 return rate across the cohorts that have a month 1.
  const withM1 = view.rows.filter((r) => r.cells[0] !== null);
  const m1 = withM1.reduce((a, r) => a + (r.cells[0] ?? 0) * r.size, 0) / Math.max(1, withM1.reduce((a, r) => a + r.size, 0));
  const caption = `Share of each monthly cohort ordering again N months after their first order, ${where}. ${view.rows.length} cohorts, ${count(totalCustomers)} customers. On average ${percent(m1)} order again the next month.`;

  return (
    <ChartCard
      title="Cohort retention"
      description="Each row is the month customers first ordered; each column is months since. Darker means more of them came back."
      table={{
        caption: `Cohort retention, ${where}`,
        columns: ["Cohort", "Customers", ...columns.map((c) => `+${c}`)],
        rows: view.rows.map((r) => [monthLabel(r.cohort), count(r.size), ...r.cells.map((c) => (c === null ? "—" : percent(c, 0)))]),
      }}
      footnote="Blank cells are after the selected range or the end of the data. Customers without an ID (guest orders) aren’t in cohorts."
    >
      <div role="region" aria-label="Cohort retention table (scrolls sideways)" tabIndex={0} className="relative max-w-full overflow-x-auto rounded-lg" data-cohort-heatmap>
        <table className="w-full min-w-[36rem] border-separate border-spacing-[2px] text-[11px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="pr-2 text-left font-mono font-normal text-muted">Cohort</th>
              <th scope="col" className="pr-2 text-right font-mono font-normal text-muted">
                <span aria-hidden="true">n</span>
                <span className="sr-only">Customers</span>
              </th>
              {columns.map((c) => (
                <th key={c} scope="col" className="text-center font-mono font-normal text-muted">
                  <span aria-hidden="true">+{c}</span>
                  <span className="sr-only">{c} {c === 1 ? "month" : "months"} later</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((r) => (
              <tr key={r.cohort}>
                <th scope="row" className="whitespace-nowrap pr-2 text-left font-mono font-normal text-fg">
                  <span aria-hidden="true">{monthShort(r.cohort)}</span>
                  <span className="sr-only">{monthLabel(r.cohort)}</span>
                </th>
                <td className="pr-2 text-right font-mono text-muted">{count(r.size)}</td>
                {r.cells.map((c, i) =>
                  c === null ? (
                    <td key={i} className="h-7">
                      <span className="sr-only">no data</span>
                    </td>
                  ) : (
                    <td key={i} className="relative h-7 min-w-9 overflow-hidden rounded-sm bg-surface-2 text-center font-mono text-fg">
                      <span aria-hidden="true" className="absolute inset-0 bg-accent" style={{ opacity: MIN_OPACITY + (c / max) * (MAX_OPACITY - MIN_OPACITY) }} />
                      <span className="relative">{Math.round(c * 100)}</span>
                      <span className="sr-only">%</span>
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
