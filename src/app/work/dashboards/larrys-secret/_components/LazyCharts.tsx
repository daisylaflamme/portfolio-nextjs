"use client";

import dynamic from "next/dynamic";

/**
 * Below-the-fold charts load as separate chunks, so the code for the headline numbers
 * and the first charts isn't held up by them. Each placeholder keeps the panel's height,
 * so nothing shifts when the chunk arrives.
 */
function Placeholder({ height, label }: { height: number; label: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-line bg-surface text-sm text-muted"
      style={{ minHeight: height }}
    >
      Loading {label}…
    </div>
  );
}

export const BasketMatrix = dynamic(() => import("./BasketMatrix"), {
  loading: () => <Placeholder height={460} label="matrix" />,
});

export const DiscountSimulator = dynamic(() => import("./DiscountSimulator"), {
  loading: () => <Placeholder height={560} label="simulator" />,
});

export const PricePointChart = dynamic(() => import("./PricePointChart"), {
  loading: () => <Placeholder height={420} label="chart" />,
});
