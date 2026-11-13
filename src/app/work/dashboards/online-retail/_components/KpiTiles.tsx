import type { Kpis, KpiValues } from "@/lib/dashboards/online-retail/types";
import { change, count, money, moneyExact, moneyShort, percent, rangeLabel } from "@/lib/dashboards/online-retail/format";

interface Tile {
  id: string;
  label: string;
  value: string;
  full: string;
  /** "+12.3%" or "+0.4 pts", or null with no earlier period. */
  delta: string | null;
  direction: "up" | "down" | "flat";
  note: string;
}

function relative(cur: number, prev: number | undefined): { delta: string | null; direction: Tile["direction"] } {
  if (prev === undefined || prev === 0) return { delta: null, direction: "flat" };
  const v = (cur - prev) / prev;
  return { delta: change(v), direction: v > 0.0005 ? "up" : v < -0.0005 ? "down" : "flat" };
}

function points(cur: number, prev: number | undefined): { delta: string | null; direction: Tile["direction"] } {
  if (prev === undefined) return { delta: null, direction: "flat" };
  const v = (cur - prev) * 100;
  const s = `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} pts`;
  return { delta: s, direction: v > 0.05 ? "up" : v < -0.05 ? "down" : "flat" };
}

/** Revenue, orders, average order value and return rate, each against the previous period of equal length. */
export default function KpiTiles({ kpis, categorySelected }: { kpis: Kpis; categorySelected: boolean }) {
  const c: KpiValues = kpis.current;
  const p = kpis.previous ?? undefined;
  const compared = kpis.previousRange ? `vs ${rangeLabel(kpis.previousRange.from, kpis.previousRange.to)}` : null;
  const tiles: Tile[] = [
    { id: "revenue", label: "Revenue", value: moneyShort(c.revenue), full: money(c.revenue), ...relative(c.revenue, p?.revenue), note: `${count(c.units)} units` },
    {
      id: "orders",
      label: "Orders",
      value: count(c.orders),
      full: count(c.orders),
      ...relative(c.orders, p?.orders),
      note: categorySelected ? "orders with this category" : "unique invoices",
    },
    {
      id: "aov",
      label: "Average order value",
      value: moneyExact(c.averageOrderValue),
      full: moneyExact(c.averageOrderValue),
      ...relative(c.averageOrderValue, p?.averageOrderValue),
      note: "revenue ÷ orders",
    },
    {
      id: "return-rate",
      label: "Return rate",
      value: percent(c.returnRate),
      full: percent(c.returnRate),
      ...points(c.returnRate, p?.returnRate),
      note: `${moneyShort(c.returnsValue)} cancelled`,
    },
  ];

  return (
    <section aria-label="Key metrics">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.id} data-kpi={t.id} className="flex min-w-0 flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3.5">
            <dt className="text-[13px] text-muted">{t.label}</dt>
            <dd className="font-display text-[1.5rem] font-bold leading-tight text-fg sm:text-[1.65rem]" title={t.full} data-kpi-value>
              <span aria-hidden="true">{t.value}</span>
              <span className="sr-only">{t.full}</span>
            </dd>
            <dd className="font-mono text-xs text-muted" data-kpi-change>
              {t.delta && compared ? (
                <>
                  <span aria-hidden="true">{t.direction === "up" ? "▲ " : t.direction === "down" ? "▼ " : ""}</span>
                  <span className="text-fg">{t.delta}</span> {compared}
                </>
              ) : (
                "no earlier period to compare"
              )}
            </dd>
            <dd className="text-xs text-muted">{t.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
