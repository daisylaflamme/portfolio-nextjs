import raw from "../../../data/larrys-secret.json" with { type: "json" };
import type { ClientLarrysData, LarrysData } from "./types.ts";

/** The dashboard dataset, typed once here. */
export const larrysData = raw as LarrysData;

/** The slice the interactive charts need, passed from the server page to the client. */
export function toClientData(d: LarrysData): ClientLarrysData {
  return {
    meta: d.meta,
    stores: d.stores,
    skus: d.skus,
    storeWeekSku: d.storeWeekSku,
    daily: d.daily,
    pricePoints: d.pricePoints,
    basketPairs: d.basketPairs,
    loyaltyCustomers: d.loyaltyCustomers.map(({ homeStore, ratio }) => ({ homeStore, ratio })),
  };
}
