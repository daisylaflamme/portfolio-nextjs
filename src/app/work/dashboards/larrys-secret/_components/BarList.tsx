"use client";

import { scaleLinear } from "d3-scale";
import { useElementWidth } from "./useElementWidth";
import MarkLayer, { type Mark } from "./MarkLayer";

export interface BarRow {
  key: string;
  label: string;
  value: number;
  /** Printed at the end of the row, e.g. "$236k · 48%". */
  valueText: string;
  /** Full sentence for the tooltip and screen readers. */
  description: string;
  /** Shown dimmed, with `note` text so the state isn't carried by opacity alone. */
  dim?: boolean;
  note?: string;
  /** 0–1 fill opacity steps for ordered categories (e.g. discount tiers). */
  opacity?: number;
}

interface BarListProps {
  rows: BarRow[];
  /** aria-label for the drawing: the key fact in one or two sentences. */
  summary: string;
  /** Names the focusable values group. */
  marksLabel: string;
  /** Fixed max for the scale (defaults to the largest value). */
  maxValue?: number;
}

const ROW = 48;

/**
 * Horizontal bars, one row per category: label and value text in HTML (so long names
 * wrap or truncate cleanly) and the bar itself in SVG.
 */
export default function BarList({ rows, summary, marksLabel, maxValue }: BarListProps) {
  const { ref, width, measured } = useElementWidth<HTMLDivElement>(360);
  const x = scaleLinear()
    .domain([0, maxValue ?? Math.max(1, ...rows.map((r) => r.value))])
    .range([0, 100]);

  const marks: Mark[] = rows.map((r, i) => ({
    key: r.key,
    label: r.description,
    x: 0,
    y: i * ROW,
    w: width,
    h: ROW,
    anchorX: Math.max(24, (x(r.value) / 100) * width),
    anchorY: i * ROW + 30,
  }));

  return (
    <div ref={ref} className="relative" data-chart-ready={measured ? "true" : undefined}>
      <div role="img" aria-label={summary}>
        {rows.map((r) => (
          <div key={r.key} className="flex flex-col justify-center gap-1.5" style={{ height: ROW }}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={`min-w-0 truncate ${r.dim ? "text-muted" : "text-fg"}`}>
                {r.label}
                {r.note ? <span className="ml-1.5 font-mono text-[11px] text-muted">{r.note}</span> : null}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted">{r.valueText}</span>
            </div>
            <svg width="100%" height="10" className="block">
              <rect width="100%" height="10" rx="5" className="fill-surface-2" />
              <rect
                width={`${x(r.value)}%`}
                height="10"
                rx="5"
                className={r.dim ? "fill-muted" : "fill-accent"}
                fillOpacity={r.dim ? 0.45 : (r.opacity ?? 1)}
              />
            </svg>
          </div>
        ))}
      </div>
      {measured ? <MarkLayer marks={marks} label={marksLabel} width={width} /> : null}
    </div>
  );
}
