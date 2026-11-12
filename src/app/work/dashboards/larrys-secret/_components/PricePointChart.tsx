"use client";

import { useId, useMemo } from "react";
import { scaleBand, scaleLinear } from "d3-scale";
import { useDashboard } from "./DashboardProvider";
import { useElementWidth } from "./useElementWidth";
import ChartCard from "./ChartCard";
import MarkLayer, { type Mark } from "./MarkLayer";
import { selectPricePoints } from "@/lib/dashboards/larrys/selectors";
import { count, money, percent, price } from "@/lib/dashboards/larrys/format";

const HEIGHT = 230;
const M = { top: 22, right: 4, bottom: 40, left: 4 };

export default function PricePointChart({ className }: { className?: string }) {
  const { data, params, filters, update } = useDashboard();
  const selectId = useId();
  const sku = data.skus.find((s) => s.id === params.sku) ?? data.skus[0];
  const buckets = useMemo(() => selectPricePoints(data, filters, sku.id), [data, filters, sku.id]);
  const { ref, width, measured } = useElementWidth<HTMLDivElement>(420);

  const totalUnits = buckets.reduce((s, b) => s + b.units, 0);
  const full = buckets.find((b) => b.isFullPrice);
  const fullShare = full && totalUnits ? full.units / totalUnits : 0;

  const x = scaleBand<number>()
    .domain(buckets.map((b) => b.price))
    .range([M.left, width - M.right])
    .paddingInner(0.25)
    .paddingOuter(0.1);
  const bw = Math.min(x.bandwidth(), 64);
  const y = scaleLinear()
    .domain([0, Math.max(1, ...buckets.map((b) => b.units))])
    .range([HEIGHT - M.bottom, M.top]);

  const summary = `Bar chart of units sold by price for ${sku.name}. ${count(totalUnits)} units in total; ${percent(fullShare)} sold at the full price of ${price(sku.listPrice)}, the rest at ${buckets.length - (full ? 1 : 0)} markdown prices.`;

  const marks: Mark[] = buckets.map((b) => {
    const cx = (x(b.price) ?? 0) + x.bandwidth() / 2;
    return {
      key: String(b.price),
      label: `${price(b.price)}${b.isFullPrice ? " (full price)" : ""}: ${count(b.units)} units, ${money(b.revenue)}`,
      x: x(b.price) ?? 0,
      y: M.top,
      w: x.bandwidth(),
      h: HEIGHT - M.top - M.bottom,
      anchorX: cx,
      anchorY: y(b.units),
    };
  });

  return (
    <ChartCard
      className={className}
      title="Units sold by price point"
      description={<>Full price is highlighted and labelled; the other prices are markdowns.</>}
      controls={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <label htmlFor={selectId} className="text-fg">
            Product
          </label>
          <select
            id={selectId}
            value={sku.id}
            onChange={(e) => update({ sku: e.target.value })}
            className="min-h-11 min-w-0 max-w-full rounded-lg border border-field bg-bg px-3 text-sm text-fg"
          >
            {data.skus.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      }
      table={{
        caption: `Units sold by price, ${sku.name}`,
        columns: ["Price", "Units", "Revenue"],
        rows: buckets.map((b) => [`${price(b.price)}${b.isFullPrice ? " (full price)" : ""}`, count(b.units), money(b.revenue)]),
      }}
    >
      <div ref={ref} className="relative" style={{ height: HEIGHT }} data-chart data-chart-ready={measured ? "true" : undefined}>
        <svg role="img" aria-label={summary} viewBox={`0 0 ${width} ${HEIGHT}`} className="block h-full w-full overflow-visible">
          <line x1={M.left} x2={width - M.right} y1={y(0)} y2={y(0)} className="stroke-line" />
          {buckets.map((b) => {
            const bx = (x(b.price) ?? 0) + (x.bandwidth() - bw) / 2;
            const cx = bx + bw / 2;
            return (
              <g key={b.price}>
                <rect
                  x={bx}
                  y={y(b.units)}
                  width={bw}
                  height={Math.max(1, y(0) - y(b.units))}
                  rx={4}
                  className={b.isFullPrice ? "fill-accent" : "fill-muted"}
                  fillOpacity={b.isFullPrice ? 1 : 0.55}
                />
                <text x={cx} y={y(b.units) - 6} textAnchor="middle" className="fill-muted font-mono text-[11px]">
                  {count(b.units)}
                </text>
                <text x={cx} y={HEIGHT - M.bottom + 16} textAnchor="middle" className="fill-muted font-mono text-[11px]">
                  {/* Narrow bands drop the "$" so neighbouring labels don't touch. */}
                  {x.bandwidth() < 46 ? b.price.toFixed(2) : price(b.price)}
                </text>
                {b.isFullPrice ? (
                  <text x={cx} y={HEIGHT - M.bottom + 32} textAnchor="middle" className="fill-fg text-[11px] font-semibold">
                    full price
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        {measured ? <MarkLayer marks={marks} label={`Units by price for ${sku.name}`} width={width} /> : null}
      </div>
    </ChartCard>
  );
}
