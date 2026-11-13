"use client";

import { useEffect, useSyncExternalStore } from "react";
import { operations, type OperationData, type OperationName } from "@/lib/dashboards/online-retail/graphql/operations";
import { gqlFetch } from "./gql";

/**
 * The dashboard's client data, outside React so any component can trigger a refetch and the
 * current tab can read the result (useSyncExternalStore; no setState in effects).
 *
 * - The tab's view registers its operation (one query composed of its charts' fragments).
 * - A filter change writes the URL with history.replaceState(null, …), which Next syncs into
 *   useSearchParams without a server round trip, then sends ONE GraphQL request and
 *   publishes the result. A newer change aborts the request in flight.
 * - If the request fails, the page falls back to a normal navigation to the new URL, so the
 *   server renders it as before.
 */

interface Snapshot {
  /** The view instance the data belongs to (a navigation mounts a new one). */
  owner: string | null;
  data: unknown;
  pending: boolean;
}

const SERVER: Snapshot = { owner: null, data: null, pending: false };
let snapshot: Snapshot = SERVER;
const listeners = new Set<() => void>();
let current: { owner: string; op: OperationName } | null = null;
let inflight: AbortController | null = null;

function publish(patch: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function register(owner: string, op: OperationName) {
  current = { owner, op };
  if (snapshot.owner !== owner) publish({ owner, data: null, pending: false });
  return () => {
    if (current?.owner === owner) current = null;
  };
}

/** Writes the URL, then refetches the current tab's data in one request. */
export async function changeFilters(url: string, variables: Record<string, unknown>): Promise<void> {
  window.history.replaceState(null, "", url);
  const target = current;
  if (!target) {
    window.location.assign(url);
    return;
  }
  inflight?.abort();
  const controller = new AbortController();
  inflight = controller;
  publish({ pending: true });
  try {
    const data = await gqlFetch<OperationData[typeof target.op]>(operations[target.op], variables, controller.signal);
    if (controller.signal.aborted || current?.owner !== target.owner) return;
    publish({ owner: target.owner, data, pending: false });
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error("[online-retail] GraphQL refetch failed; reloading the page instead", error);
    publish({ pending: false });
    window.location.assign(url);
  } finally {
    if (inflight === controller) inflight = null;
  }
}

/**
 * A tab view's data: the server's initial data until a filter change brings newer data
 * for this same view instance.
 */
export function useTabData<N extends OperationName>(owner: string, op: N, initial: OperationData[N]) {
  const snap = useSyncExternalStore(subscribe, () => snapshot, () => SERVER);
  useEffect(() => register(owner, op), [owner, op]);
  const data = snap.owner === owner && snap.data ? (snap.data as OperationData[N]) : initial;
  return { data, pending: snap.pending };
}

/** True while a refetch is in flight (for the filters' "Updating…" status). */
export function usePending(): boolean {
  return useSyncExternalStore(subscribe, () => snapshot.pending, () => false);
}
