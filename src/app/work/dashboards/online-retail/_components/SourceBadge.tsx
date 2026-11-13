import type { SourceKind } from "@/lib/dashboards/online-retail/source";

/** "live data" (from the database) or "snapshot" (the committed JSON), next to the date range. */
export default function SourceBadge({ kind }: { kind: SourceKind }) {
  const live = kind === "live";
  return (
    <span
      data-source-badge={kind}
      title={live ? "Queried live from the database" : "From the committed, aggregated snapshot"}
      className="inline-flex items-center gap-1.5 rounded-full border border-field px-2.5 py-0.5 font-mono text-xs text-fg"
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${live ? "bg-accent" : "bg-muted"}`} />
      <span className="sr-only">Data source: </span>
      {live ? "live data" : "snapshot"}
    </span>
  );
}
