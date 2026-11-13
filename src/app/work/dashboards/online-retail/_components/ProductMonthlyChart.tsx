"use client";

import { scaleLinear } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import ChartCard from "@/components/charts/ChartCard";
import MarkLayer, { type Mark } from "@/components/charts/MarkLayer";
import { useElementWidth } from "@/components/charts/useElementWidth";
import { count, money, moneyShort, monthLabel, monthShort, rangeLabel } from "@/lib/dashboards/online-retail/format";
import type { ProductMonthly } from "@/lib/dashboards/online-retail/types";

const HEIGHT = 220;
const M = { top: 12, right: 12, bottom: 26, left: 52 };

/** One product's monthly revenue across the whole period, with the From–To range shaded. Live only. */
export default function ProductMonthlyChart({ product, where }: { product: ProductMonthly; where: string }) {
  const { ref, width, measured } = useElementWidth<HTMLDivElement>(720);
  const points = product.months;
  const n = points.length;
  const x = scaleLinear().domain([0, Math.max(1, n - 1)]).range([M.left, width - M.right]);
  const step = n > 1 ? x(1) - x(0) : width;
  const y = scaleLinear().domain([0, Math.max(10, ...points.map((p) => p.revenue)) * 1.08]).nice(4).range([HEIGHT - M.bottom, M.top]);
  type P = (typeof points)[number];
  const linePath = line<P>().x((_, i) => x(i)).y((p) => y(p.revenue)).curve(curveMonotoneX)(points) ?? "";
  const areaPath = area<P>().x((_, i) => x(i)).y0(y(0)).y1((p) => y(p.revenue)).curve(curveMonotoneX)(points) ?? "";
  const first = points.findIndex((p) => p.inRange);
  const last = points.length - 1 - [...points].reverse().findIndex((p) => p.inRange);
  const inRange = points.filter((p) => p.inRange);
  const total = inRange.reduce((s, p) => s + p.revenue, 0);
  const units = inRange.reduce((s, p) => s + p.units, 0);
  const peak = points.reduce((b, p) => (p.revenue > b.revenue ? p : b), points[0]);
  const range = first >= 0 ? rangeLabel(points[first].month, points[last].month) : "";
  const summary = `Line chart of monthly revenue for ${product.description}, ${where}. ${range}: ${money(total)} from ${count(units)} units. Peak ${money(peak.revenue)} in ${monthLabel(peak.month)}.`;
  const everyN = width < 520 ? 12 : 6;

  const marks: Mark[] = points.map((p, i) => ({
    key: p.month,
    label: `${monthLabel(p.month)}: ${money(p.revenue)}, ${count(p.units)} units, ${count(p.orders)} orders`,
    x: x(i) - step / 2,
    y: M.top,
    w: step,
    h: HEIGHT - M.top - M.bottom,
    anchorX: x(i),
    anchorY: y(p.revenue),
  }));

  return (
    <ChartCard
      title={`Monthly sales: ${product.description}`}
      description={
        <>
          {product.code} · {product.category} · {where}. {range}: {money(total)} from {count(units)} units.
        </>
      }
      table={{
        caption: `Monthly sales of ${product.description}, ${where}`,
        columns: ["Month", "Revenue", "Units", "Orders"],
        rows: points.map((p) => [monthLabel(p.month), money(p.revenue), count(p.units), count(p.orders)]),
      }}
      footnote="Whole period shown; the From–To range is shaded. Categories don’t apply to one product."
    >
      <div ref={ref} className="relative" style={{ height: HEIGHT }} data-chart data-chart-ready={measured ? "true" : undefined}>
        <svg role="img" aria-label={summary} viewBox={`0 0 ${width} ${HEIGHT}`} className="block h-full w-full overflow-visible">
          {first >= 0 ? (
            <rect
              x={x(first) - step / 2}
              y={M.top}
              width={(last - first + 1) * step}
              height={HEIGHT - M.top - M.bottom}
              className="fill-accent stroke-accent"
              fillOpacity={0.1}
              strokeDasharray="4 4"
            />
          ) : null}
          {y.ticks(4).map((t) => (
            <g key={t}>
              <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} className="stroke-line" />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">
                {moneyShort(t)}
              </text>
            </g>
          ))}
          {points.map((p, i) =>
            i % everyN === 0 || i === n - 1 ? (
              <text key={p.month} x={x(i)} y={HEIGHT - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-muted font-mono text-[11px]">
                {monthShort(p.month)}
              </text>
            ) : null,
          )}
          <path d={areaPath} className="fill-accent" fillOpacity={0.14} />
          <path d={linePath} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
        {measured ? <MarkLayer marks={marks} label={`Monthly sales values for ${product.description}`} width={width} /> : null}
      </div>
    </ChartCard>
  );
}
