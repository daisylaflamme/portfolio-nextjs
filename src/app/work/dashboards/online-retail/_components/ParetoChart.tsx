"use client";

import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import ChartCard from "@/components/charts/ChartCard";
import { Axes, axisMargins, fitXTicks } from "@/components/charts/axis";
import MarkLayer, { type Mark } from "@/components/charts/MarkLayer";
import { useElementWidth } from "@/components/charts/useElementWidth";
import { count, percent } from "@/lib/dashboards/online-retail/format";

const HEIGHT = 240;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];
const X_TICKS = [0, 20, 40, 60, 80, 100];

interface Props {
  /** curve[i] = share of revenue from the top (i + 1)% of products, ranked by revenue. */
  curve: number[];
  productCount: number;
  /** Smallest share of products that brings in 80% of revenue. */
  share80: number;
  /** e.g. "all countries, 2009–2011" */
  context: string;
}

/**
 * The 80/20 view: products in 100 equal groups ranked by revenue. Bars show each group's
 * share of revenue, the line the running total, and the dashed line marks 80%.
 */
export default function ParetoChart({ curve, productCount, share80, context }: Props) {
  const { ref, width, measured } = useElementWidth<HTMLDivElement>(560);
  // Margin convention: the y labels (0%–100%) set the left gutter.
  const M = axisMargins(Y_TICKS.map((t) => percent(t, 0)));
  const x = scaleLinear().domain([0, 100]).range([M.left, width - M.right]);
  const y = scaleLinear().domain([0, 1]).range([HEIGHT - M.bottom, M.top]);
  const bw = (width - M.left - M.right) / 100;
  const groups = curve.map((v, i) => v - (i ? curve[i - 1] : 0));
  const running = line<number>().x((_, i) => x(i + 1)).y((v) => y(v))([0, ...curve].slice(1)) ?? "";
  const k80 = Math.round(share80 * 100);

  const summary = `Pareto chart of product revenue, ${context}: ${percent(share80, 0)} of the ${count(productCount)} products bring in 80% of revenue; the top 1% bring in ${percent(curve[0], 0)}.`;
  const marks: Mark[] = Array.from({ length: 10 }, (_, d) => {
    const i = (d + 1) * 10 - 1;
    return {
      key: String(d),
      label: `Top ${d + 1}0% of products (${count(Math.ceil((productCount * (d + 1)) / 10))}): ${percent(curve[i])} of revenue`,
      x: x(d * 10),
      y: M.top,
      w: x(10) - x(0),
      h: HEIGHT - M.top - M.bottom,
      anchorX: x(i + 1),
      anchorY: y(curve[i]),
    };
  });

  return (
    <ChartCard
      title="The 80/20 view"
      description={
        <>
          {percent(share80, 0)} of products bring in 80% of revenue. Products are ranked by revenue and grouped into
          hundredths: bars are each group’s share, the line is the running total.
        </>
      }
      table={{
        caption: `Share of revenue by top share of products, ${context}`,
        columns: ["Top share of products", "Products", "Share of revenue"],
        rows: [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => [
          `Top ${p}%`,
          count(Math.ceil((productCount * p) / 100)),
          percent(curve[p - 1]),
        ]),
      }}
      footnote="Dashed line: 80% of revenue. Categories don’t apply here: the curve covers every product."
    >
      <div ref={ref} className="relative" style={{ height: HEIGHT }} data-chart data-chart-ready={measured ? "true" : undefined}>
        <svg role="img" aria-label={summary} viewBox={`0 0 ${width} ${HEIGHT}`} className="block h-full w-full overflow-visible">
          <Axes
            width={width}
            height={HEIGHT}
            margins={M}
            yTicks={Y_TICKS.map((t) => ({ key: String(t), y: y(t), label: percent(t, 0) }))}
            xTicks={fitXTicks(X_TICKS.map((t) => ({ key: String(t), x: x(t), label: `${t}%` })), M.left, width - M.right)}
          />
          <g className="fill-accent" fillOpacity={0.45}>
            {groups.map((g, i) => (
              <rect key={i} x={x(i) + 0.5} y={y(g)} width={Math.max(0.5, bw - 1)} height={y(0) - y(g)} />
            ))}
          </g>
          <line x1={M.left} x2={width - M.right} y1={y(0.8)} y2={y(0.8)} className="stroke-muted" strokeDasharray="4 4" />
          <line x1={x(k80)} x2={x(k80)} y1={y(0.8)} y2={y(0)} className="stroke-muted" strokeDasharray="4 4" />
          <path d={running} fill="none" className="stroke-fg" strokeWidth={2} />
          <circle cx={x(k80)} cy={y(curve[k80 - 1] ?? 0.8)} r={4} className="fill-bg stroke-fg" strokeWidth={2} />
        </svg>
        {measured ? <MarkLayer marks={marks} label="Share of revenue by top share of products" width={width} /> : null}
      </div>
    </ChartCard>
  );
}
