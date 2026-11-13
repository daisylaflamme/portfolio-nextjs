"use client";

import { useRef, useState, type KeyboardEvent } from "react";

export interface Mark {
  key: string;
  /** Full text for screen readers and the tooltip, e.g. "Apr 21: $67,416". */
  label: string;
  /** Hit area in container pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Where the tooltip points, in container pixels (defaults to the top centre). */
  anchorX?: number;
  anchorY?: number;
}

interface MarkLayerProps {
  marks: Mark[];
  /** Names the group, e.g. "Daily revenue points". */
  label: string;
  /** Container width, to keep the tooltip on screen. */
  width: number;
}

/**
 * Transparent buttons over a chart's marks. The chart's SVG stays a plain role="img"
 * drawing; this layer makes each mark reachable: one Tab stop, arrow keys move between
 * marks (roving tabindex), hover or focus shows the tooltip and Escape hides it.
 */
export default function MarkLayer({ marks, label, width }: MarkLayerProps) {
  const [active, setActive] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const show = (i: number) => {
    setActive(i);
    setHidden(false);
  };

  const move = (i: number) => {
    const next = Math.max(0, Math.min(marks.length - 1, i));
    setFocusIndex(next);
    buttons.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = focusIndex;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        move(i + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        move(i - 1);
        break;
      case "Home":
        move(0);
        break;
      case "End":
        move(marks.length - 1);
        break;
      case "Escape":
        if (active === null || hidden) return;
        setHidden(true);
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const current = active !== null && !hidden ? marks[active] : undefined;
  const tipX = current ? (current.anchorX ?? current.x + current.w / 2) : 0;
  const tipY = current ? (current.anchorY ?? current.y) : 0;
  // Keep the bubble inside the chart: flip its alignment near the edges.
  const align = tipX < 90 ? "left" : tipX > width - 90 ? "right" : "center";

  return (
    <div role="group" aria-label={`${label}. Use arrow keys to move between values.`} onKeyDown={onKeyDown}>
      {marks.map((m, i) => (
        <button
          key={m.key}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          tabIndex={i === focusIndex ? 0 : -1}
          aria-label={m.label}
          data-mark
          onFocus={() => {
            setFocusIndex(i);
            show(i);
          }}
          onBlur={() => setActive((a) => (a === i ? null : a))}
          onMouseEnter={() => show(i)}
          onMouseLeave={() => setActive((a) => (a === i ? null : a))}
          className="absolute cursor-default rounded-sm bg-transparent focus-visible:bg-fg/10 focus-visible:outline-offset-0"
          style={{ left: m.x, top: m.y, width: m.w, height: m.h }}
        />
      ))}
      {current ? (
        <div
          aria-hidden="true"
          data-tooltip
          className="pointer-events-none absolute z-10 max-w-[16rem] whitespace-nowrap rounded-md border border-line bg-bg px-2.5 py-1.5 font-mono text-xs text-fg shadow-lg"
          style={{
            left: tipX,
            top: tipY,
            transform: `translate(${align === "left" ? "-8px" : align === "right" ? "calc(-100% + 8px)" : "-50%"}, calc(-100% - 8px))`,
          }}
        >
          {current.label}
        </div>
      ) : null}
    </div>
  );
}
