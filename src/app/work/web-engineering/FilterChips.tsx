"use client";

import { useId, useState } from "react";
import { PROJECT_FILTERS, type ProjectFilter } from "./projectFilters";

interface ChipProps {
  filter: ProjectFilter;
  pressed: boolean;
  onToggle: (id: string) => void;
}

function Chip({ filter, pressed, onToggle }: ChipProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={pressed}
        onClick={() => onToggle(filter.id)}
        className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
          pressed ? "border-fg bg-fg text-bg" : "border-field bg-surface text-fg hover:border-fg"
        }`}
      >
        {filter.label}
      </button>
    </li>
  );
}

/**
 * Toggle-button filters (OR logic). Primary filters are always visible;
 * the rest sit behind a disclosure so the row stays short on phones.
 */
export interface FilterChipsProps {
  /** Ids of the active filters. */
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}

export default function FilterChips({ selected, onToggle, onClear }: FilterChipsProps) {
  const moreId = useId();
  const primary = PROJECT_FILTERS.filter((f) => f.placement === "primary");
  const more = PROJECT_FILTERS.filter((f) => f.placement !== "primary");
  const hasMoreSelected = more.some((f) => selected.has(f.id));
  const [showMore, setShowMore] = useState(false);
  const moreVisible = showMore || hasMoreSelected;

  return (
    <div role="group" aria-labelledby={`${moreId}-label`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={`${moreId}-label`} className="font-mono text-sm text-muted">
          Filter by skill
        </p>
        {selected.size > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-fg underline underline-offset-4 hover:text-accent"
          >
            Clear filters ({selected.size})
          </button>
        ) : null}
      </div>
      <ul className="flex flex-wrap gap-2">
        {primary.map((filter) => (
          <Chip key={filter.id} filter={filter} pressed={selected.has(filter.id)} onToggle={onToggle} />
        ))}
        {more.length > 0 ? (
          <li>
            <button
              type="button"
              aria-expanded={moreVisible}
              aria-controls={moreId}
              onClick={() => setShowMore((v) => !v)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-field px-4 text-sm font-medium text-fg hover:border-fg"
            >
              {moreVisible ? "Fewer" : "More"}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={moreVisible ? "rotate-180" : ""}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </li>
        ) : null}
      </ul>
      <ul id={moreId} hidden={!moreVisible} className="flex flex-wrap gap-2">
        {more.map((filter) => (
          <Chip key={filter.id} filter={filter} pressed={selected.has(filter.id)} onToggle={onToggle} />
        ))}
      </ul>
    </div>
  );
}
