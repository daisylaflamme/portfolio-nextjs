"use client";

import { useId, useMemo } from "react";
import { useDashboard } from "./DashboardProvider";
import BarList from "@/components/charts/BarList";
import ChartCard from "@/components/charts/ChartCard";
import { selectDiscountTiers, TIER_LABELS } from "@/lib/dashboards/larrys/selectors";
import { THRESHOLD_RANGES, THRESHOLD_STEP, withThreshold } from "@/lib/dashboards/larrys/params";
import { count, percent, times } from "@/lib/dashboards/larrys/format";
import type { Thresholds } from "@/lib/dashboards/larrys/types";

const SLIDERS = [
  { label: "10% tier starts above", tier: "10%" },
  { label: "20% tier starts above", tier: "20%" },
  { label: "40% tier starts above", tier: "40%" },
] as const;

const TIER_OPACITY = [0.35, 0.6, 0.8, 1];

const same = (a: Thresholds, b: readonly number[]) => a.every((v, i) => v === b[i]);

export default function DiscountSimulator() {
  const { data, params, filters, update } = useDashboard();
  const id = useId();
  const t = params.thresholds;
  const tiers = useMemo(() => selectDiscountTiers(data, filters, t), [data, filters, t]);
  const { workbook1, workbook2 } = data.meta.discountTiers2013;
  const storeName = filters.store === "all" ? null : data.stores.find((s) => s.id === filters.store)?.name;

  const summary =
    `${count(tiers.qualifying)} of ${count(tiers.total)} loyalty customers qualify for a discount` +
    (storeName ? ` at ${storeName}` : "") +
    `: ${tiers.counts[1]} at 10%, ${tiers.counts[2]} at 20%, ${tiers.counts[3]} at 40%.`;

  // "1×", "1.6×": the preset labels drop a trailing ".0" (the sliders keep one decimal).
  const multipliers = (values: readonly number[]) => values.map((v) => `${Number(v.toFixed(1))}×`).join(" / ");
  const presets = [
    { label: "Rule A", detail: multipliers(workbook1), value: workbook1 },
    { label: "Rule B", detail: multipliers(workbook2), value: workbook2 },
  ];

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:flex-row lg:gap-10"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="font-mono text-[13px] text-accent">{"// what-if"}</p>
        <h2 id={`${id}-title`} className="font-display text-xl font-semibold text-fg sm:text-2xl">
          Loyalty discount simulator
        </h2>
        <p className="text-[15px] leading-relaxed text-muted">
          Larry wanted to reward his best customers without eroding margin. Each loyalty customer’s average spend per receipt
          line is compared with the average line across all five stores, then assigned a 10%, 20% or 40% tier. Move the
          thresholds to see who qualifies.
        </p>
        <div role="group" aria-label="Presets" className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              aria-pressed={same(t, p.value)}
              onClick={() => update({ thresholds: [...p.value] })}
              className="inline-flex min-h-11 items-center rounded-lg border border-field px-3 text-sm text-fg hover:border-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
            >
              {p.label} ({p.detail})
            </button>
          ))}
        </div>
        {SLIDERS.map((s, i) => {
          const range = THRESHOLD_RANGES[i];
          const inputId = `${id}-t${i + 1}`;
          return (
            <div key={s.tier} className="flex flex-col gap-1.5">
              <label htmlFor={inputId} className="flex justify-between gap-3 text-sm text-fg">
                <span>{s.label}</span>
                <output htmlFor={inputId} className="font-mono">
                  {times(t[i])} avg
                </output>
              </label>
              <input
                id={inputId}
                type="range"
                min={range.min}
                max={range.max}
                step={THRESHOLD_STEP}
                value={t[i]}
                aria-valuetext={`${t[i].toFixed(1)} times the average line`}
                onChange={(e) => update({ thresholds: withThreshold(t, i as 0 | 1 | 2, Number(e.target.value)) })}
                className="h-11 w-full cursor-pointer accent-[var(--accent)]"
              />
            </div>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        <p role="status" aria-live="polite" className="text-sm leading-relaxed text-fg" data-tier-summary>
          {summary}
        </p>
        <ChartCard
          title="Customers by discount tier"
          headingLevel={3}
          className="rounded-none! border-0! bg-transparent! p-0!"
          table={{
            caption: "Loyalty customers per discount tier",
            columns: ["Tier", "Customers", "Share"],
            rows: TIER_LABELS.map((label, i) => [
              label,
              count(tiers.counts[i]),
              percent(tiers.total ? tiers.counts[i] / tiers.total : 0),
            ]),
          }}
        >
          <BarList
            summary={`Bar chart of loyalty customers by discount tier. ${summary}`}
            marksLabel="Customers per tier"
            maxValue={tiers.total || 1}
            rows={TIER_LABELS.map((label, i) => ({
              key: label,
              label,
              value: tiers.counts[i],
              valueText: count(tiers.counts[i]),
              description: `${label}: ${count(tiers.counts[i])} customers, ${percent(tiers.total ? tiers.counts[i] / tiers.total : 0)}`,
              opacity: TIER_OPACITY[i],
            }))}
          />
        </ChartCard>
        <details className="text-sm text-muted">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-fg">How the tiers are computed</summary>
          <p className="leading-relaxed">
            Each customer’s ratio is their average line amount divided by the overall average line. Above the first threshold
            is 10%, above the second 20%, above the third 40%. Customers are grouped by the store they shop at most.
          </p>
        </details>
      </div>
    </section>
  );
}
