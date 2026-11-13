/**
 * The snapshot and its DataSource, typed once here. Server-only: import this from server
 * components, route handlers and the OG image, never from a "use client" file (the
 * snapshot is 1.3 MB).
 */
import rawSnapshot from "../../../data/online-retail/snapshot.json" with { type: "json" };
import rawCategories from "../../../data/online-retail/categories.json" with { type: "json" };
import { createSnapshotSource } from "./snapshotSource.ts";
import type { OnlineRetailCategories, OnlineRetailSnapshot } from "./types.ts";

export const snapshot = rawSnapshot as unknown as OnlineRetailSnapshot;
export const categories = rawCategories as OnlineRetailCategories;
export const onlineRetailSource = createSnapshotSource(snapshot, categories);
