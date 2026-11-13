/**
 * DataSource backed by the committed snapshot (src/data/online-retail/snapshot.json).
 * Takes the parsed JSON as arguments so unit tests and Playwright specs can build the same
 * source from a file they read themselves; the app uses `onlineRetailSource` from data.ts.
 */
import type { DataSource } from "./source.ts";
import type { OnlineRetailCategories, OnlineRetailSnapshot } from "./types.ts";
import {
  dashboardMeta,
  selectBasket,
  selectCohorts,
  selectCountries,
  selectKpis,
  selectMonthlyRevenue,
  selectReturns,
  selectSegments,
  selectTopProducts,
} from "./selectors.ts";

export function createSnapshotSource(snapshot: OnlineRetailSnapshot, categories: OnlineRetailCategories): DataSource {
  return {
    meta: dashboardMeta(snapshot),
    kpis: async (f) => selectKpis(snapshot, f),
    monthlyRevenue: async (f) => selectMonthlyRevenue(snapshot, f),
    countries: async (f) => selectCountries(snapshot, f),
    topProducts: async (f) => selectTopProducts(snapshot, categories, f),
    basket: async (f) => selectBasket(snapshot, f),
    cohorts: async (f) => selectCohorts(snapshot, f),
    segments: async (f) => selectSegments(snapshot, f),
    returns: async (f) => selectReturns(snapshot, f),
  };
}
