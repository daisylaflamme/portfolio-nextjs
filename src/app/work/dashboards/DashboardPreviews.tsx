import { larrysData } from "@/lib/dashboards/larrys/data";
import { selectDailyRevenue, selectKpis } from "@/lib/dashboards/larrys/selectors";
import { money, moneyShort, percent } from "@/lib/dashboards/larrys/format";
import { onlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { defaultFilters } from "@/lib/dashboards/online-retail/params";
import {
  count as gbpCount,
  moneyShort as gbpShort,
  percent as gbpPercent,
} from "@/lib/dashboards/online-retail/format";

/**
 * Previews drawn from the real numbers, shown on a featured card until its framed
 * screenshot exists. Decorative: the card's text and link carry the meaning.
 */
function Preview({ tiles, bars }: { tiles: [string, string][]; bars: { key: string; value: number }[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div aria-hidden="true" className="flex h-full flex-col gap-3 p-4 sm:p-6">
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-surface px-3 py-2">
            <div className="text-[11px] text-muted">{label}</div>
            <div className="font-display text-lg font-bold text-fg sm:text-xl">{value}</div>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${bars.length * 10} 100`} preserveAspectRatio="none" className="min-h-28 w-full flex-1 rounded-lg border border-line bg-surface">
        {bars.map((b, i) => {
          const h = (b.value / max) * 86;
          return <rect key={b.key} x={i * 10 + 2} y={96 - h} width={6} height={h} rx={1.5} className="fill-accent" />;
        })}
      </svg>
    </div>
  );
}

export function LarrysPreview() {
  const k = selectKpis(larrysData, { store: "all" });
  const days = selectDailyRevenue(larrysData, { store: "all" });
  return (
    <Preview
      tiles={[
        ["Revenue", moneyShort(k.revenue)],
        ["Gross margin", percent(k.grossMargin)],
        ["Avg basket", money(k.avgBasket)],
      ]}
      bars={days.map((d) => ({ key: d.date, value: d.revenue }))}
    />
  );
}

export async function OnlineRetailPreview() {
  const filters = defaultFilters(onlineRetailSource.meta);
  const [k, months] = await Promise.all([onlineRetailSource.kpis(filters), onlineRetailSource.monthlyRevenue(filters)]);
  return (
    <Preview
      tiles={[
        ["Revenue", gbpShort(k.current.revenue)],
        ["Orders", gbpCount(k.current.orders)],
        ["Return rate", gbpPercent(k.current.returnRate)],
      ]}
      bars={months.map((m) => ({ key: m.month, value: m.revenue }))}
    />
  );
}
