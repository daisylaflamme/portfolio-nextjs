"use client";

import { useId, useState, type ReactNode } from "react";

export interface DataTable {
  caption: string;
  columns: string[];
  /** The first cell of each row is its header. Numbers are right-aligned. */
  rows: (string | number)[][];
}

interface ChartCardProps {
  title: string;
  /** Short line under the title. */
  description?: ReactNode;
  /** Controls above the chart, e.g. a product select. */
  controls?: ReactNode;
  children: ReactNode;
  table: DataTable;
  footnote?: ReactNode;
  className?: string;
  /** 3 when the card sits inside another titled section. */
  headingLevel?: 2 | 3;
}

/**
 * A chart panel: visible title, the chart, and a "Show data table" toggle that
 * reveals the same numbers as a real table.
 */
export default function ChartCard({
  title,
  description,
  controls,
  children,
  table,
  footnote,
  className = "",
  headingLevel = 2,
}: ChartCardProps) {
  const [open, setOpen] = useState(false);
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const id = useId();
  const headingId = `${id}-title`;
  const tableId = `${id}-table`;

  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <Heading id={headingId} className="font-display text-lg font-semibold leading-snug text-fg sm:text-xl">
          {title}
        </Heading>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={tableId}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex min-h-11 items-center rounded-lg border border-field px-3 text-sm text-fg hover:border-fg"
        >
          {open ? "Hide data table" : "Show data table"}
        </button>
      </div>
      {description ? <p className="text-sm leading-relaxed text-muted">{description}</p> : null}
      {controls}
      {children}
      <div id={tableId} hidden={!open} className="max-w-full overflow-x-auto">
        {open ? (
          <table className="w-full border-collapse text-left text-sm">
            <caption className="pb-2 text-left text-sm text-muted">{table.caption}</caption>
            <thead>
              <tr className="border-b border-line">
                {table.columns.map((c, i) => (
                  <th key={c} scope="col" className={`py-2 pr-3 font-semibold text-fg ${i > 0 ? "text-right" : ""}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, r) => (
                <tr key={r} className="border-b border-line last:border-0">
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="py-2 pr-3 font-normal text-fg">
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className="py-2 pr-3 text-right font-mono text-[13px] text-body">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
      {footnote ? <p className="text-xs leading-relaxed text-muted">{footnote}</p> : null}
    </section>
  );
}
