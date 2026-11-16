/**
 * Shared axes for line and bar charts, using the margin convention: the plot area is the SVG
 * minus a left gutter sized to the widest y label, a bottom gutter for the x labels and a
 * little room at the top so the highest y label isn't clipped. No label is drawn inside the
 * plot area, and x labels that would collide are dropped (the first and last always stay).
 *
 * Label widths are estimated from the monospace axis font (font-mono, 11px), so the layout
 * is the same on the server and in the browser.
 */

import { AXIS_FONT_PX, LABEL_GAP, type Margins, type PlacedXTick } from "./axisLayout";

export { axisMargins, fitXTicks, textWidth, type Margins, type PlacedXTick, type XTick } from "./axisLayout";

interface AxesProps {
  width: number;
  height: number;
  margins: Margins;
  /** y ticks: position (SVG units) and label. */
  yTicks: { key: string; y: number; label: string }[];
  xTicks: PlacedXTick[];
}

/**
 * Gridlines, y labels (right-aligned in the left gutter) and x labels (below the baseline).
 * The invisible plot-area rectangle marks the bounds for tests.
 */
export function Axes({ width, height, margins: m, yTicks, xTicks }: AxesProps) {
  const baseline = height - m.bottom;
  return (
    <g>
      <rect
        x={m.left}
        y={m.top}
        width={Math.max(0, width - m.left - m.right)}
        height={Math.max(0, baseline - m.top)}
        fill="none"
        data-plot-area
      />
      {yTicks.map((t) => (
        <line key={`g-${t.key}`} x1={m.left} x2={width - m.right} y1={t.y} y2={t.y} className="stroke-line" />
      ))}
      <g data-axis="y">
        {yTicks.map((t) => (
          <text key={t.key} x={m.left - LABEL_GAP} y={t.y} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">
            {t.label}
          </text>
        ))}
      </g>
      <g data-axis="x">
        {xTicks.map((t) => (
          <text key={t.key} x={t.left} y={baseline + LABEL_GAP + AXIS_FONT_PX} textAnchor="start" className="fill-muted font-mono text-[11px]">
            {t.label}
          </text>
        ))}
      </g>
    </g>
  );
}
