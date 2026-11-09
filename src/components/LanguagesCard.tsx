"use client";

import { useState } from "react";
import type { LanguageStats } from "@/lib/github";

/**
 * Home page language chart. Every range is computed on the server from one GitHub
 * request; the switch only changes which one is shown, so it needs no extra fetches.
 */
export default function LanguagesCard({ ranges, isSample }: LanguageStats) {
  const [rangeId, setRangeId] = useState(ranges[0]?.id);
  const range = ranges.find((r) => r.id === rangeId) ?? ranges[0];
  if (!range) return null;

  const max = Math.max(...range.languages.map((l) => l.pct), 1);
  const summary = range.languages.map((l) => `${l.name} ${l.pct}%`).join(", ");

  return (
    <figure className="m-0 flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className="font-mono text-sm text-muted">
          {"// languages across my GitHub repos"}
          {isSample ? " (sample)" : ""}
        </figcaption>
        {ranges.length > 1 ? (
          <div role="group" aria-label="Time range" className="inline-flex rounded-lg border border-line bg-surface-2 p-1">
            {ranges.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={r.id === range.id}
                onClick={() => setRangeId(r.id)}
                className={`min-h-11 rounded-md px-3 font-mono text-[13px] transition-colors ${
                  r.id === range.id ? "bg-accent text-on-accent" : "text-muted hover:text-fg"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        Languages by share of code, {range.label.toLowerCase()}: {summary}.
      </p>
      <ul className="flex flex-col gap-3" aria-hidden="true">
        {range.languages.map((lang) => (
          <li key={lang.name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-right font-mono text-sm font-medium text-fg">{lang.name}</span>
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                className="block h-7 rounded bg-accent transition-[width] duration-500 ease-out"
                style={{ width: `${Math.round((lang.pct / max) * 82)}%` }}
              />
              <span className="font-mono text-[13px] text-muted">{lang.pct}%</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
