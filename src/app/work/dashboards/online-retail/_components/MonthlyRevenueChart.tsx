"use client";

import { useState, type PointerEvent } from "react";
import { scaleLinear } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import ChartCard from "@/components/charts/ChartCard";
import MarkLayer, { type Mark } from "@/components/charts/MarkLayer";
import { useElementWidth } from "@/components/charts/useElementWidth";
import { count, money, moneyShort, monthLabel, monthLong, monthShort, rangeLabel } from "@/lib/dashboards/online-retail/format";
import type { DashboardMeta, MonthPoint } from "@/lib/dashboards/online-retail/types";
import { useFilters } from "./useFilters";

const HEIGHT = 240;
const M = { top: 12, right: 12, bottom: 26, left: 52 };

interface Props {
  meta: DashboardMeta;
  points: MonthPoint[];
  /** e.g. "Dec 2011 covers 1–9 December only." */
  partialNote: string;
  /** "all countries" or the country, for the summary. */
  scopeLabel: string;
}

/**
 * Revenue for every month of the data, with the From–To range shaded. Dragging across the
 * chart sets the range; the From/To selects above are the keyboard path, and each month is
 * also a focusable mark with its value.
 */
export default function MonthlyRevenueChart({ meta, points, partialNote, scopeLabel }: Props) {
  const { filters, update } = useFilters(meta);
  const { ref, width, measured } = useElementWidth<HTMLDivElement>(720);
  const [drag, setDrag] = useState<{ start: number; end: number } | null>(null);

  const n = points.length;
  const x = scaleLinear().domain([0, Math.max(1, n - 1)]).range([M.left, width - M.right]);
  const step = n > 1 ? x(1) - x(0) : width;
  const yMax = Math.max(1, ...points.map((p) => p.revenue)) * 1.08;
  const y = scaleLinear().domain([0, yMax]).nice(4).range([HEIGHT - M.bottom, M.top]);
  const linePath = line<MonthPoint>().x((_, i) => x(i)).y((p) => y(p.revenue)).curve(curveMonotoneX)(points) ?? "";
  const areaPath =
    area<MonthPoint>().x((_, i) => x(i)).y0(y(0)).y1((p) => y(p.revenue)).curve(curveMonotoneX)(points) ?? "";

  const fromIndex = points.findIndex((p) => p.month === filters.from);
  const toIndex = points.findIndex((p) => p.month === filters.to);
  const [a, b] = drag ? [Math.min(drag.start, drag.end), Math.max(drag.start, drag.end)] : [fromIndex, toIndex];
  const bandX = x(a) - step / 2;
  const bandW = (b - a + 1) * step;
  const everyN = width < 520 ? 12 : 6;
  const ticks = points.map((p, i) => ({ p, i })).filter(({ i }) => i % everyN === 0 || i === n - 1);
  // Drop the tick before the last one when they would collide.
  if (ticks.length > 2 && ticks[ticks.length - 1].i - ticks[ticks.length - 2].i < everyN / 2) ticks.splice(ticks.length - 2, 1);

  const indexAt = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(n - 1, Math.round((e.clientX - box.left - M.left) / step)));
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const i = indexAt(e);
    setDrag({ start: i, end: i });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const i = indexAt(e);
    if (i !== drag.end) setDrag({ ...drag, end: i });
  };
  const onPointerUp = () => {
    if (!drag) return;
    // A tap without a drag keeps the range (so focusing or hovering a month never changes it).
    if (drag.start !== drag.end) {
      update({ ...filters, from: points[Math.min(drag.start, drag.end)].month, to: points[Math.max(drag.start, drag.end)].month });
    }
    setDrag(null);
  };

  const inRange = points.filter((p) => p.inRange);
  const total = inRange.reduce((s, p) => s + p.revenue, 0);
  const peak = points.reduce((best, p) => (p.revenue > best.revenue ? p : best), points[0]);
  const summary = `Line chart of monthly revenue for ${scopeLabel}, ${rangeLabel(points[0].month, points[n - 1].month)}. Peak ${money(peak.revenue)} in ${monthLong(peak.month)}. The selected range, ${rangeLabel(filters.from, filters.to)}, is shaded: ${money(total)} over ${inRange.length} months.`;

  const marks: Mark[] = points.map((p, i) => ({
    key: p.month,
    label: `${monthLabel(p.month)}: ${money(p.revenue)}, ${count(p.orders)} orders${p.inRange ? "" : " (outside the selected range)"}`,
    x: x(i) - step / 2,
    y: M.top,
    w: step,
    h: HEIGHT - M.top - M.bottom,
    anchorX: x(i),
    anchorY: y(p.revenue),
  }));

  return (
    <ChartCard
      title="Monthly revenue"
      description={<>Selected: {rangeLabel(filters.from, filters.to)}, {money(total)}.</>}
      table={{
        caption: `Monthly revenue and orders, ${scopeLabel}`,
        columns: ["Month", "Revenue", "Orders", "In range"],
        rows: points.map((p) => [monthLabel(p.month), money(p.revenue), count(p.orders), p.inRange ? "yes" : "no"]),
      }}
      footnote={
        <>
          Drag across the chart to set the date range (keyboard: the From/To selects above). {partialNote}
        </>
      }
    >
      <div
        ref={ref}
        className="relative cursor-crosshair select-none"
        style={{ height: HEIGHT, touchAction: "pan-y" }}
        data-chart
        data-chart-ready={measured ? "true" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
      >
        <svg role="img" aria-label={summary} viewBox={`0 0 ${width} ${HEIGHT}`} className="block h-full w-full overflow-visible">
          {a >= 0 && b >= 0 ? (
            <rect
              x={Math.max(M.left - step / 2, bandX)}
              y={M.top}
              width={Math.max(0, Math.min(bandW, width - M.right + step / 2 - bandX))}
              height={HEIGHT - M.top - M.bottom}
              className="fill-accent stroke-accent"
              fillOpacity={0.1}
              strokeDasharray="4 4"
              data-range-band
            />
          ) : null}
          {y.ticks(4).map((t) => (
            <g key={t}>
              <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} className="stroke-line" />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">
                {t >= 1e6 ? `£${+(t / 1e6).toFixed(1)}M` : moneyShort(t)}
              </text>
            </g>
          ))}
          {ticks.map(({ p, i }) => (
            <text key={p.month} x={x(i)} y={HEIGHT - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-muted font-mono text-[11px]">
              {monthShort(p.month)}
            </text>
          ))}
          <path d={areaPath} className="fill-accent" fillOpacity={0.14} />
          <path d={linePath} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
        {measured ? <MarkLayer marks={marks} label="Monthly revenue values" width={width} /> : null}
      </div>
    </ChartCard>
  );
}
