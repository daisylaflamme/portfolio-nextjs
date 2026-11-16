"use client";

import { useMemo } from "react";
import { scaleLinear, scaleUtc } from "d3-scale";
import { area, line, curveMonotoneX } from "d3-shape";
import { max } from "d3-array";
import { useDashboard } from "./DashboardProvider";
import { useElementWidth } from "@/components/charts/useElementWidth";
import ChartCard from "@/components/charts/ChartCard";
import MarkLayer, { type Mark } from "@/components/charts/MarkLayer";
import { selectDailyRevenue } from "@/lib/dashboards/larrys/selectors";
import { count, longDate, money, moneyShort, shortDate } from "@/lib/dashboards/larrys/format";

const HEIGHT = 240;
const M = { top: 12, right: 12, bottom: 26, left: 48 };
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

export default function DailyRevenueChart({ className }: { className?: string }) {
  const { data, filters } = useDashboard();
  const days = useMemo(() => selectDailyRevenue(data, filters), [data, filters]);
  const { ref, width, measured } = useElementWidth<HTMLDivElement>(640);

  const [start, end] = data.meta.dateRange;
  const x = scaleUtc().domain([toDate(start), toDate(end)]).range([M.left, width - M.right]);
  const yMax = (max(days, (d) => d.revenue) ?? 0) * 1.1 || 1;
  const y = scaleLinear().domain([0, yMax]).nice(4).range([HEIGHT - M.bottom, M.top]);
  const yTicks = y.ticks(4);
  const xTicks = width < 480 ? [start, "2012-04-16", end] : [start, "2012-04-09", "2012-04-16", "2012-04-23", end];

  const linePath = line<(typeof days)[number]>()
    .x((d) => x(toDate(d.date)))
    .y((d) => y(d.revenue))
    .curve(curveMonotoneX)(days) ?? "";
  const areaPath = area<(typeof days)[number]>()
    .x((d) => x(toDate(d.date)))
    .y0(y(0))
    .y1((d) => y(d.revenue))
    .curve(curveMonotoneX)(days) ?? "";

  const peak = days.reduce((a, b) => (b.revenue > a.revenue ? b : a), days[0]);
  const total = days.reduce((s, d) => s + d.revenue, 0);
  const summary = peak
    ? `Line chart of daily revenue, ${shortDate(start)} to ${shortDate(end)}, 2012. ${count(days.length)} trading days totalling ${money(total)}. Peak ${money(peak.revenue)} on ${longDate(peak.date)}.`
    : "No sales for this selection.";

  const step = days.length > 1 ? (width - M.left - M.right) / (days.length - 1) : width;
  const marks: Mark[] = days.map((d) => {
    const cx = x(toDate(d.date));
    return {
      key: d.date,
      label: `${longDate(d.date)}: ${money(d.revenue)}, ${count(d.transactions)} transactions`,
      x: cx - step / 2,
      y: M.top,
      w: step,
      h: HEIGHT - M.top - M.bottom,
      anchorX: cx,
      anchorY: y(d.revenue),
    };
  });

  return (
    <ChartCard
      className={className}
      title="Daily revenue"
      description={peak ? <>Peak day: {longDate(peak.date)}, {money(peak.revenue)}.</> : null}
      table={{
        caption: "Daily revenue and transactions",
        columns: ["Date", "Revenue", "Transactions"],
        rows: days.map((d) => [shortDate(d.date), money(d.revenue), count(d.transactions)]),
      }}
    >
      <div ref={ref} className="relative" data-chart data-chart-ready={measured ? "true" : undefined} style={{ height: HEIGHT }}>
        <svg role="img" aria-label={summary} viewBox={`0 0 ${width} ${HEIGHT}`} className="block h-full w-full overflow-visible">
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} className="stroke-line" />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">
                {moneyShort(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={x(toDate(t))} y={HEIGHT - 6} textAnchor={t === start ? "start" : t === end ? "end" : "middle"} className="fill-muted font-mono text-[11px]">
              {shortDate(t)}
            </text>
          ))}
          <path d={areaPath} className="fill-accent" fillOpacity={0.14} />
          <path d={linePath} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" />
          {peak ? (
            <circle cx={x(toDate(peak.date))} cy={y(peak.revenue)} r={4.5} className="fill-bg stroke-accent" strokeWidth={2.5} />
          ) : null}
        </svg>
        {measured ? <MarkLayer marks={marks} label="Daily revenue values" width={width} /> : null}
      </div>
    </ChartCard>
  );
}
