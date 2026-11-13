"use client";

import { useElementWidth } from "@/components/charts/useElementWidth";
import MarkLayer, { type Mark } from "@/components/charts/MarkLayer";

interface MapMarksProps {
  /** Marks in the map's viewBox units. */
  marks: Mark[];
  viewWidth: number;
  label: string;
}

/** Focusable town dots over the server-rendered map, scaled to its rendered size. */
export default function MapMarks({ marks, viewWidth, label }: MapMarksProps) {
  const { ref, width, measured } = useElementWidth<HTMLDivElement>(viewWidth);
  const k = width / viewWidth;
  const scaled = marks.map((m) => ({
    ...m,
    x: m.x * k,
    y: m.y * k,
    w: m.w * k,
    h: m.h * k,
    anchorX: m.anchorX === undefined ? undefined : m.anchorX * k,
    anchorY: m.anchorY === undefined ? undefined : m.anchorY * k,
  }));
  return (
    <div ref={ref} className="absolute inset-0" data-chart data-chart-ready={measured ? "true" : undefined}>
      {measured ? <MarkLayer marks={scaled} label={label} width={width} /> : null}
    </div>
  );
}
