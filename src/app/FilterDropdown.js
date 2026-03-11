"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Reusable multi-select filter dropdown. Pass categories (with options), selected
 * option ids, and onChange. Label appears inside the dropdown; trigger shows icon + "Filter projects".
 *
 * @param {Object} props
 * @param {string} props.label - Label shown inside dropdown (e.g. "Filter projects by")
 * @param {Array<{ id: string, label: string, options: Array<{ id: string, label: string }> }>} props.categories
 * @param {Set<string>} props.selected - Set of selected option ids
 * @param {(selected: Set<string>) => void} props.onChange
 */
export default function FilterDropdown({ label = "Filter projects by", categories, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleOption = (optionId) => {
    const next = new Set(selected);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    onChange(next);
  };

  const removeOption = (optionId, e) => {
    e.stopPropagation();
    const next = new Set(selected);
    next.delete(optionId);
    onChange(next);
  };

  const unselectAll = () => {
    onChange(new Set());
  };

  const getOptionLabel = (optionId) => {
    for (const cat of categories) {
      const opt = cat.options.find((o) => o.id === optionId);
      if (opt) return opt.label;
    }
    return optionId;
  };

  const selectedList = Array.from(selected);

  /* Filter icon: funnel shape, theme colors (font primary + accent) */
  const FilterIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0 text-[var(--color-font-primary)]"
      aria-hidden
    >
      <path d="M4 4h16v2.5l-6 6v6l-4-2v-4l-6-6V4z" />
    </svg>
  );

  return (
    <div ref={ref} className="w-full max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2 items-start">
        <div className="relative shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] text-[var(--color-font-primary)] font-medium text-sm hover:bg-[var(--color-center-circle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-2 transition-colors"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={open ? "Close filter menu" : "Open filter menu"}
          >
            <FilterIcon />
            <span>Filter projects</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {open && (
            <div
              className="absolute left-0 top-full mt-2 z-30 min-w-[240px] max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] shadow-lg py-2"
              role="listbox"
              aria-multiselectable="true"
            >
              <p className="px-4 py-2 text-sm font-medium text-[var(--color-font-secondary)] border-b border-[var(--color-petal-border)]">
                {label}
              </p>
              {categories.map((category) => (
                <div key={category.id} className="py-1">
                  <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-font-secondary)]">
                    {category.label}
                  </p>
                  {category.options.map((option) => {
                    const isChecked = selected.has(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={isChecked}
                        onClick={() => toggleOption(option.id)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-[var(--color-font-primary)] hover:bg-[var(--color-petal-bg)] focus:outline-none focus:bg-[var(--color-petal-bg)]"
                      >
                        <span
                          className={`flex shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked
                              ? "bg-[var(--color-shadow-accent)] border-[var(--color-shadow-accent)]"
                              : "border-[var(--color-petal-border)]"
                          }`}
                          aria-hidden
                        >
                          {isChecked && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                              <path d="M20 6L9 15l-5-5" />
                            </svg>
                          )}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ))}
              {selectedList.length > 0 && (
                <div className="px-4 py-2 mt-1 border-t border-[var(--color-petal-border)]">
                  <button
                    type="button"
                    onClick={unselectAll}
                    className="text-sm text-[var(--color-font-secondary)] hover:text-[var(--color-shadow-accent)] underline focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-1 rounded"
                  >
                    Unselect all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {selectedList.map((optionId) => (
            <span
              key={optionId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-petal-bg)] border border-[var(--color-petal-border)] text-[var(--color-font-primary)] text-sm"
            >
              {getOptionLabel(optionId)}
              <button
                type="button"
                onClick={(e) => removeOption(optionId, e)}
                className="p-0.5 rounded hover:bg-[var(--color-center-circle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)]"
                aria-label={`Remove ${getOptionLabel(optionId)}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
