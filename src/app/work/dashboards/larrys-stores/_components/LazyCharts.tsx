"use client";

import { hydrateWhenVisible } from "@/components/charts/hydrateWhenVisible";

/**
 * Below-the-fold charts. Their HTML is server-rendered like the rest of the page;
 * their JavaScript loads and hydrates as they approach the viewport (see
 * hydrateWhenVisible), which keeps the work at page load small. The placeholder only
 * shows if a chart has to render on the client before its code has arrived, and it
 * keeps the panel's height so nothing shifts.
 */
function Placeholder({ height, label }: { height: number; label: string }) {
  return (
    <div
      data-chart-loading
      className="flex items-center justify-center rounded-2xl border border-line bg-surface text-sm text-muted"
      style={{ minHeight: height }}
    >
      Loading {label}…
    </div>
  );
}

export const ProductBars = hydrateWhenVisible(() => import("./ProductBars"), {
  fallback: <Placeholder height={520} label="chart" />,
});

export const BasketMatrix = hydrateWhenVisible(() => import("./BasketMatrix"), {
  fallback: <Placeholder height={460} label="matrix" />,
});

export const DiscountSimulator = hydrateWhenVisible(() => import("./DiscountSimulator"), {
  fallback: <Placeholder height={560} label="simulator" />,
});

export const PricePointChart = hydrateWhenVisible(() => import("./PricePointChart"), {
  fallback: <Placeholder height={420} label="chart" />,
});

/** The focusable dots over the server-rendered map. */
export const MapMarks = hydrateWhenVisible(() => import("./MapMarks"), {
  wrapperClassName: "absolute inset-0",
});
