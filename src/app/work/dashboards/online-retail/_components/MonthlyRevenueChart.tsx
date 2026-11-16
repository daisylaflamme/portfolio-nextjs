"use client";

import { useState, type PointerEvent } from "react";
import { scaleLinear } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import ChartCard from "@/components/charts/ChartCard";
import { Axes, axisMargins, fitXTicks } from "@/components/charts/axis";
import MarkLayer, { type Mark } from "@/components/charts/MarkLayer";
import { useElementWidth } from "@/components/charts/useElementWidth";
import { count, money, moneyShort, monthLabel, monthLong, monthShort, rangeLabel } from "@/lib/dashboards/online-retail/format";
import type { DashboardMeta, MonthPoint } from "@/lib/dashboards/online-retail/types";
import { useFilters } from "./useFilters";

const HEIGHT = 240;

/** "£2M", "£1.5M", "£500k": short pounds for the y axis. */
const yLabel = (t: number) => (t >= 1e6 ? `£${+(t / 1e6).toFixed(1)}M` : moneyShort(t));

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
  // Margin convention: the y ticks decide the left gutter, so no label overlaps the plot.
  const yMax = Math.max(1, ...points.map((p) => p.revenue)) * 1.08;
  const y = scaleLinear().domain([0, yMax]).nice(4);
  const yTickValues = y.ticks(4);
  const M = axisMargins(yTickValues.map(yLabel));
  y.range([HEIGHT - M.bottom, M.top]);
  // Each month owns an equal slot of the plot, so the selection (whole slots) stays inside it.
  const plotW = Math.max(1, width - M.left - M.right);
  const step = plotW / Math.max(1, n);
  const x = (i: number) => M.left + step * (i + 0.5);
  const linePath = line<MonthPoint>().x((_, i) => x(i)).y((p) => y(p.revenue)).curve(curveMonotoneX)(points) ?? "";
  const areaPath =
    area<MonthPoint>().x((_, i) => x(i)).y0(y(0)).y1((p) => y(p.revenue)).curve(curveMonotoneX)(points) ?? "";

  const fromIndex = points.findIndex((p) => p.month === filters.from);
  const toIndex = points.findIndex((p) => p.month === filters.to);
  const [a, b] = drag ? [Math.min(drag.start, drag.end), Math.max(drag.start, drag.end)] : [fromIndex, toIndex];
  const bandX = M.left + step * a;
  const bandW = (b - a + 1) * step;
  // Candidate labels every 6 months (12 when narrow) plus the last; fitXTicks drops any that would collide.
  const everyN = width < 520 ? 12 : 6;
  const xTicks = fitXTicks(
    points
      .map((p, i) => ({ key: p.month, x: x(i), label: monthShort(p.month), i }))
      .filter(({ i }) => i % everyN === 0 || i === n - 1),
    M.left,
    width - M.right,
  );

  const indexAt = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(n - 1, Math.floor((e.clientX - box.left - M.left) / step)));
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
          <Axes
            width={width}
            height={HEIGHT}
            margins={M}
            yTicks={yTickValues.map((t) => ({ key: String(t), y: y(t), label: yLabel(t) }))}
            xTicks={xTicks}
          />
          {a >= 0 && b >= 0 ? (
            <rect
              x={bandX}
              y={M.top}
              width={Math.max(0, bandW)}
              height={HEIGHT - M.top - M.bottom}
              className="fill-accent stroke-accent"
              fillOpacity={0.1}
              strokeDasharray="4 4"
              data-range-band
            />
          ) : null}
          <path d={areaPath} className="fill-accent" fillOpacity={0.14} />
          <path d={linePath} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
        {measured ? <MarkLayer marks={marks} label="Monthly revenue values" width={width} /> : null}
      </div>
    </ChartCard>
  );
}
