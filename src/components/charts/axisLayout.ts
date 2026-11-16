/**
 * Axis layout maths for charts (pure, so unit tests can run it): margins sized to the widest
 * y label, and x labels placed so they never collide. Widths are estimated from the monospace
 * axis font (font-mono, 11px), so the layout matches on the server and in the browser.
 */

export const AXIS_FONT_PX = 11;
/** Advance of one monospace character, in ems (a little generous, so estimates don't fall short). */
const MONO_ADVANCE = 0.62;
/** Space between a y label and the plot area, and between neighbouring x labels. */
export const LABEL_GAP = 8;
const X_LABEL_GAP = 12;

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function textWidth(text: string, fontPx = AXIS_FONT_PX): number {
  return Math.ceil(text.length * fontPx * MONO_ADVANCE);
}

/** Margins for a chart whose y labels are `yLabels`: the left gutter fits the widest one. */
export function axisMargins(yLabels: string[], overrides: Partial<Margins> = {}): Margins {
  const widest = Math.max(0, ...yLabels.map((l) => textWidth(l)));
  return {
    // Half a label above the top tick, so the top label sits fully inside the SVG.
    top: overrides.top ?? Math.ceil(AXIS_FONT_PX / 2) + 4,
    right: overrides.right ?? 12,
    // Gap below the baseline, then one line of x labels.
    bottom: overrides.bottom ?? AXIS_FONT_PX + 18,
    left: overrides.left ?? widest + LABEL_GAP + 2,
  };
}

export interface XTick {
  key: string;
  /** Centre of the tick, in SVG units. */
  x: number;
  label: string;
}

export interface PlacedXTick extends XTick {
  /** Left edge of the label (it's drawn with text-anchor start), kept inside the plot's width. */
  left: number;
  width: number;
}

/**
 * Places x labels centred on their ticks but clamped to the plot's width, and drops any that
 * would come within X_LABEL_GAP of the previous one. The last tick always stays: if it would
 * collide, the label before it goes instead.
 */
export function fitXTicks(ticks: XTick[], plotLeft: number, plotRight: number): PlacedXTick[] {
  const placed = ticks.map((t) => {
    const width = textWidth(t.label);
    const left = Math.max(plotLeft, Math.min(plotRight - width, t.x - width / 2));
    return { ...t, left, width };
  });
  const kept: PlacedXTick[] = [];
  for (const t of placed) {
    const prev = kept[kept.length - 1];
    if (!prev || t.left >= prev.left + prev.width + X_LABEL_GAP) kept.push(t);
  }
  const last = placed[placed.length - 1];
  if (last && kept[kept.length - 1] !== last) {
    while (kept.length && last.left < kept[kept.length - 1].left + kept[kept.length - 1].width + X_LABEL_GAP) kept.pop();
    kept.push(last);
  }
  return kept;
}
