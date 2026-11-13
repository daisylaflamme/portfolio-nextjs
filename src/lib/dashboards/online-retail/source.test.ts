import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getOnlineRetailSource, onlineRetailSource, snapshot } from "./data.ts";
import { withSnapshotFallback } from "./fallback.ts";
import { createPostgresSource, type Runner } from "./postgresSource.ts";
import { defaultFilters } from "./params.ts";
import type { Query } from "./sql.ts";
import type { Filters } from "./types.ts";

const meta = onlineRetailSource.meta;
const ALL_TIME = defaultFilters(meta);
const opts = { referenceDate: snapshot.meta.rfmRules.referenceDate };

/** A Runner that answers from canned rows and records every query. */
function fakeRunner(answer: (q: Query) => unknown[]): Runner & { calls: Query[] } {
  const calls: Query[] = [];
  const run = (async (q: Query) => {
    calls.push(q);
    return answer(q);
  }) as Runner & { calls: Query[] };
  run.calls = calls;
  return run;
}

describe("getOnlineRetailSource", () => {
  it("uses the snapshot when ONLINE_RETAIL_DATABASE_URL is unset or empty", async () => {
    for (const env of [{}, { ONLINE_RETAIL_DATABASE_URL: "" }, { ONLINE_RETAIL_DATABASE_URL: "   " }]) {
      const source = getOnlineRetailSource(env);
      assert.equal(source, onlineRetailSource);
      assert.equal(source.kind, "snapshot");
      assert.equal(await source.status(), "snapshot");
      assert.equal(source.searchProducts, undefined);
    }
  });

  it("picks Postgres when the URL is set, without connecting until a query runs", () => {
    const source = getOnlineRetailSource({ ONLINE_RETAIL_DATABASE_URL: "postgresql://reader:pw@127.0.0.1:1/none" });
    assert.equal(source.kind, "live");
    assert.equal(typeof source.searchProducts, "function");
    assert.deepEqual(source.meta, meta);
  });
});

describe("withSnapshotFallback", () => {
  const failing = createPostgresSource(fakeRunner(() => { throw new Error("connection refused"); }), meta, opts);
  const logs: string[] = [];
  const source = withSnapshotFallback(failing, onlineRetailSource, async () => { throw new Error("down"); }, (m) => logs.push(m));

  it("answers from the snapshot when a live query fails", async () => {
    assert.deepEqual(await source.kpis(ALL_TIME), await onlineRetailSource.kpis(ALL_TIME));
    assert.deepEqual(await source.cohorts(ALL_TIME), await onlineRetailSource.cohorts(ALL_TIME));
    assert.ok(logs.some((l) => l.includes("live kpis failed")));
  });

  it("reports 'snapshot' while the database is down, and live-only features come back empty", async () => {
    assert.equal(source.kind, "live");
    assert.equal(await source.status(), "snapshot");
    assert.deepEqual(await source.searchProducts?.("lantern", ALL_TIME), []);
    assert.equal(await source.productMonthly?.("85123A", ALL_TIME), null);
  });

  it("reports 'live' when the database answers", async () => {
    const ok = withSnapshotFallback(failing, onlineRetailSource, async () => [{ "?column?": 1 }], () => {});
    assert.equal(await ok.status(), "live");
  });
});

describe("createPostgresSource maps rows to the dashboard views", () => {
  const f: Filters = { from: "2011-01", to: "2011-06", country: "Germany", category: "all" };

  it("kpis: current and previous period from one row", async () => {
    const run = fakeRunner(() => [
      { revenue: 100, units: 50, orders: 4, returns_value: 5, prev_revenue: 80, prev_units: 40, prev_orders: 2, prev_returns_value: 0 },
    ]);
    const k = await createPostgresSource(run, meta, opts).kpis(f);
    assert.deepEqual(k.previousRange, { from: "2010-07", to: "2010-12" });
    assert.equal(k.current.averageOrderValue, 25);
    assert.equal(k.current.returnRate, 0.05);
    assert.equal(k.previous?.revenue, 80);
    assert.deepEqual(run.calls[0].values, ["2011-01-01", "2011-06-01", "2010-07-01", "2010-12-01", "Germany"]);
  });

  it("monthly: every month of the data, zero where the database has no row", async () => {
    const run = fakeRunner(() => [{ month: "2011-02", revenue: 10, orders: 1 }]);
    const points = await createPostgresSource(run, meta, opts).monthlyRevenue(f);
    assert.deepEqual(points.map((p) => p.month), meta.months);
    assert.equal(points.find((p) => p.month === "2011-02")?.revenue, 10);
    assert.equal(points.find((p) => p.month === "2010-02")?.revenue, 0);
    assert.equal(points.filter((p) => p.inRange).length, 6);
  });

  it("basket: a symmetric matrix, diagonal from each product's own row", async () => {
    const rows = [
      { a: "A", b: "A", a_rank: 1, b_rank: 1, a_description: "Apple", b_description: "Apple", orders: 40, total_orders: 100 },
      { a: "B", b: "B", a_rank: 2, b_rank: 2, a_description: "Bean", b_description: "Bean", orders: 30, total_orders: 100 },
      { a: "A", b: "B", a_rank: 1, b_rank: 2, a_description: "Apple", b_description: "Bean", orders: 10, total_orders: 100 },
    ];
    const view = await createPostgresSource(fakeRunner(() => rows), meta, opts).basket(f);
    assert.equal(view.live, true);
    assert.equal(view.orders, 100);
    assert.deepEqual(view.products.map((p) => [p.code, p.share]), [["A", 0.4], ["B", 0.3]]);
    assert.deepEqual(view.share, [[null, 0.1], [0.1, null]]);
    assert.deepEqual(view.counts, [[null, 10], [10, null]]);
  });

  it("cohorts: size from month 0, shares up to `to`, zeros inside the range", async () => {
    const rows = [
      { cohort: "2011-01", months_since: 0, active: 10 },
      { cohort: "2011-01", months_since: 2, active: 4 },
      { cohort: "2011-05", months_since: 0, active: 5 },
    ];
    const view = await createPostgresSource(fakeRunner(() => rows), meta, opts).cohorts(f);
    assert.deepEqual(view.rows.map((r) => [r.cohort, r.size]), [["2011-01", 10], ["2011-05", 5]]);
    assert.deepEqual(view.rows[0].cells.slice(0, 6), [0, 0.4, 0, 0, 0, null]);
    assert.deepEqual(view.rows[1].cells.slice(0, 2), [0, null]);
  });

  it("segments: all five in order, shares from the counts", async () => {
    const rows = [
      { segment: "Lost", customers: 30, avg_recency_days: 300, avg_orders: 1, avg_revenue: 100 },
      { segment: "Champions", customers: 70, avg_recency_days: 10, avg_orders: 12, avg_revenue: 5000 },
    ];
    const view = await createPostgresSource(fakeRunner(() => rows), meta, opts).segments(f);
    assert.deepEqual(view.rows.map((r) => [r.segment, r.customers, r.share]), [
      ["Champions", 70, 0.7],
      ["Loyal", 0, 0],
      ["Promising", 0, 0],
      ["At risk", 0, 0],
      ["Lost", 30, 0.3],
    ]);
    assert.equal(view.fallback, false);
  });

  it("search skips the database for blank text; productMonthly returns null for an unknown code", async () => {
    const run = fakeRunner(() => []);
    const source = createPostgresSource(run, meta, opts);
    assert.deepEqual(await source.searchProducts?.("   ", f), []);
    assert.equal(run.calls.length, 0);
    assert.equal(await source.productMonthly?.("NOPE", f), null);
  });
});
