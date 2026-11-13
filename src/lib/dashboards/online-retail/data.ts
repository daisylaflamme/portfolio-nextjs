/**
 * The snapshot, and the one place the dashboard's DataSource is chosen. Server-only: import
 * this from server components, route handlers and the OG image, never from a "use client"
 * file (the snapshot is 1.3 MB, and the database URL is a secret).
 *
 * getOnlineRetailSource(): Postgres when ONLINE_RETAIL_DATABASE_URL is set (with the snapshot
 * as a fallback if a query fails), otherwise the snapshot. The build, CI and e2e set nothing,
 * so they always run on the snapshot.
 */
import rawSnapshot from "../../../data/online-retail/snapshot.json" with { type: "json" };
import rawCategories from "../../../data/online-retail/categories.json" with { type: "json" };
import { withSnapshotFallback } from "./fallback.ts";
import { createPostgresSource, poolRunner } from "./postgresSource.ts";
import type { DataSource } from "./source.ts";
import { createSnapshotSource } from "./snapshotSource.ts";
import type { OnlineRetailCategories, OnlineRetailSnapshot } from "./types.ts";

export const snapshot = rawSnapshot as unknown as OnlineRetailSnapshot;
export const categories = rawCategories as OnlineRetailCategories;

/** Always the committed snapshot: unit tests, the OG image and the dashboards card use it directly. */
export const onlineRetailSource = createSnapshotSource(snapshot, categories);

let live: { url: string; source: DataSource } | null = null;

export function getOnlineRetailSource(env: Record<string, string | undefined> = process.env): DataSource {
  const url = env.ONLINE_RETAIL_DATABASE_URL?.trim();
  if (!url) return onlineRetailSource;
  if (live?.url !== url) {
    const run = poolRunner(url);
    const postgres = createPostgresSource(run, onlineRetailSource.meta, {
      referenceDate: snapshot.meta.rfmRules.referenceDate,
    });
    live = { url, source: withSnapshotFallback(postgres, onlineRetailSource, () => run({ text: "select 1", values: [] })) };
  }
  return live.source;
}
