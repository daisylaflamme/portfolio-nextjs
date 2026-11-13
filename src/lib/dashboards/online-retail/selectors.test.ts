import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { categories, onlineRetailSource as source, snapshot } from "./data.ts";
import { defaultFilters } from "./params.ts";
import {
  COHORT_MONTHS,
  RETURNS_MIN_ORDERS,
  previousRange,
  productShareFor,
  selectKpis,
  selectTopProducts,
} from "./selectors.ts";
import type { Filters } from "./types.ts";

// Expected values are recomputed here straight from the snapshot rows, never typed in.
const meta = snapshot.meta;
const ALL_TIME = defaultFilters(source.meta);
const [uk, eire, , germany] = meta.topCountries;
const small = meta.countries.find((c) => !meta.topCountries.includes(c) && c !== "Unspecified") ?? "";
const category = meta.categories[0];
const near = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const f = (patch: Partial<Filters>): Filters => ({ ...ALL_TIME, ...patch });

type McRow = (typeof snapshot.monthCountry.rows)[number];
const mc = (pick: (r: McRow) => boolean) => snapshot.monthCountry.rows.filter(pick);
const sumCol = (rows: readonly (readonly unknown[])[], i: number) => rows.reduce((a, r) => a + (r[i] as number), 0);
const mcc = (cat: string, pick: (month: string, country: string) => boolean) =>
  snapshot.monthCountryCategory.rows.filter((r) => r[2] === cat && pick(r[0], r[1]));

describe("kpis", () => {
  it("all time matches meta totals", async () => {
    const k = await source.kpis(ALL_TIME);
    near(k.current.revenue, meta.revenue);
    assert.equal(k.current.orders, meta.orders);
    near(k.current.returnsValue, meta.returnsValue);
    near(k.current.averageOrderValue, meta.revenue / meta.orders);
    near(k.current.returnRate, meta.returnsValue / meta.revenue, 1e-9);
    // The data starts at the first month, so there's nothing to compare with.
    assert.equal(k.previous, null);
    assert.equal(k.previousRange, null);
  });

  it("a country and a range sum the monthCountry rows", async () => {
    const filters = f({ from: "2011-01", to: "2011-06", country: germany });
    const rows = mc((r) => r[1] === germany && r[0] >= "2011-01" && r[0] <= "2011-06");
    const k = await source.kpis(filters);
    near(k.current.revenue, sumCol(rows, 2));
    assert.equal(k.current.orders, sumCol(rows, 4));
    near(k.current.returnsValue, sumCol(rows, 5));
  });

  it("compares with the previous period of equal length", async () => {
    const k = await source.kpis(f({ from: "2011-01", to: "2011-06", country: uk }));
    assert.deepEqual(k.previousRange, { from: "2010-07", to: "2010-12" });
    const prev = mc((r) => r[1] === uk && r[0] >= "2010-07" && r[0] <= "2010-12");
    near(k.previous?.revenue ?? NaN, sumCol(prev, 2));
    assert.equal(k.previous?.orders, sumCol(prev, 4));
  });

  it("a category uses the category rows (orders = invoices containing it)", async () => {
    const rows = mcc(category, (m) => m >= "2010-03" && m <= "2010-09");
    const k = selectKpis(snapshot, f({ from: "2010-03", to: "2010-09", category }));
    near(k.current.revenue, sumCol(rows, 3));
    assert.equal(k.current.orders, sumCol(rows, 5));
    assert.ok(k.current.orders < (await source.kpis(f({ from: "2010-03", to: "2010-09" }))).current.orders);
  });
});

describe("previousRange", () => {
  const months = meta.months;
  it("needs as many earlier months as the range is long", () => {
    assert.deepEqual(previousRange(months, months[1], months[1]), { from: months[0], to: months[0] });
    assert.equal(previousRange(months, months[1], months[2]), null);
    assert.equal(previousRange(months, "1999-01", months[2]), null);
  });
});

describe("monthlyRevenue", () => {
  it("has every month, sums to the KPI revenue inside the range and flags it", async () => {
    const filters = f({ from: "2010-06", to: "2011-05", country: eire });
    const points = await source.monthlyRevenue(filters);
    assert.deepEqual(points.map((p) => p.month), meta.months);
    const inRange = points.filter((p) => p.inRange);
    assert.deepEqual(inRange.map((p) => p.month), meta.months.filter((m) => m >= "2010-06" && m <= "2011-05"));
    near(sumCol(inRange.map((p) => [p.revenue]), 0), (await source.kpis(filters)).current.revenue);
  });
});

describe("countries", () => {
  it("ranks every country with sales, shares add to 1, ignoring the country filter", async () => {
    const rows = await source.countries(f({ country: germany }));
    assert.deepEqual(rows.map((r) => r.country), meta.countries);
    near(rows.reduce((a, r) => a + r.share, 0), 1, 1e-9);
    near(rows[0].revenue, sumCol(mc((r) => r[1] === rows[0].country), 2));
  });
});

describe("topProducts", () => {
  it("all time, all countries: the exact top 200 with the full Pareto curve", async () => {
    const view = await source.topProducts(ALL_TIME);
    const years = meta.months.map((m) => Number(m.slice(0, 4)));
    const span = snapshot.productSpans.rows.find((r) => r[0] === "all" && r[1] === years[0] && r[2] === years.at(-1));
    assert.ok(span);
    assert.equal(view.exact, true);
    assert.equal(view.productCount, span[3]);
    near(view.totalRevenue, meta.revenue, 1);
    assert.equal(view.rows.length, 200);
    for (let i = 1; i < view.rows.length; i++) assert.ok(view.rows[i].revenue <= view.rows[i - 1].revenue);
    assert.equal(view.curve?.length, 100);
    // The top 1% of products' revenue share, from the curve, equals the top rows' sum.
    const top1 = Math.ceil((view.productCount ?? 0) / 100);
    near(view.curve?.[0] ?? NaN, view.rows.slice(0, top1).reduce((a, r) => a + r.revenue, 0) / view.totalRevenue, 1e-4);
  });

  it("uses the calendar years the range touches", async () => {
    const view = await source.topProducts(f({ from: "2010-11", to: "2011-02", country: uk }));
    assert.equal(view.fromYear, 2010);
    assert.equal(view.toYear, 2011);
    const expected = snapshot.topProductsSpan.rows.filter((r) => r[0] === uk && r[1] === 2010 && r[2] === 2011);
    assert.deepEqual(view.rows.map((r) => r.code), expected.map((r) => r[3]));
  });

  it("filters rows by category and keeps the all-category curve", async () => {
    const all = await source.topProducts(ALL_TIME);
    const view = await source.topProducts(f({ category }));
    assert.deepEqual(view.rows.map((r) => r.code), all.rows.filter((r) => categories.codes[r.code] === category).map((r) => r.code));
    assert.deepEqual(view.curve, all.curve);
  });

  it("other countries sum each year's top 200 and have no curve", () => {
    const view = selectTopProducts(snapshot, categories, f({ country: small }));
    assert.equal(view.exact, false);
    assert.equal(view.curve, null);
    const code = view.rows[0]?.code;
    const expected = snapshot.topProducts.rows.filter((r) => r[0] === small && r[2] === code).reduce((a, r) => a + r[4], 0);
    near(view.rows[0]?.revenue ?? NaN, expected);
    near(view.totalRevenue, sumCol(mc((r) => r[1] === small), 2));
  });

  it("productShareFor reads the curve", () => {
    const curve = Array.from({ length: 100 }, (_, i) => Math.min(1, (i + 1) / 25));
    assert.equal(productShareFor(curve, 0.8), 0.2);
    assert.equal(productShareFor(curve, 1), 0.25);
  });
});

describe("basket", () => {
  it("a symmetric 10×10 from the snapshot pairs, with the scope's orders", async () => {
    const view = await source.basket(f({ country: germany }));
    assert.equal(view.scope, germany);
    assert.equal(view.fallback, false);
    assert.equal(view.products.length, 10);
    assert.equal(view.orders, sumCol(mc((r) => r[1] === germany), 4));
    for (let i = 0; i < 10; i++) {
      assert.equal(view.share[i][i], null);
      for (let j = 0; j < 10; j++) assert.equal(view.share[i][j], view.share[j][i]);
    }
    const [, a, b, orders, share] = snapshot.basketTopPairs.rows.find((r) => r[0] === germany) ?? [];
    const i = view.products.findIndex((p) => p.code === a);
    const j = view.products.findIndex((p) => p.code === b);
    assert.equal(view.counts[i][j], orders);
    assert.equal(view.share[i][j], share);
  });

  it("falls back to all countries where there's no basket data", async () => {
    const view = await source.basket(f({ country: small }));
    assert.equal(view.scope, "all");
    assert.equal(view.fallback, true);
    assert.equal(view.orders, meta.orders);
  });
});

describe("cohorts", () => {
  it("all time: every cohort, sizes add up to the customers", async () => {
    const view = await source.cohorts(ALL_TIME);
    assert.equal(view.maxMonths, COHORT_MONTHS);
    assert.equal(view.rows.length, meta.months.length);
    assert.equal(view.rows.reduce((a, r) => a + r.size, 0), meta.customers);
    const first = view.rows[0];
    const month1 = snapshot.cohorts.rows.find((r) => r[0] === "all" && r[1] === first.cohort && r[3] === 1);
    assert.equal(first.cells[0], month1?.[5]);
    // The last cohort has no later months in the data.
    assert.ok(view.rows.at(-1)?.cells.every((c) => c === null));
  });

  it("a range keeps cohorts that started in it and stops at `to`", async () => {
    const view = await source.cohorts(f({ from: "2010-01", to: "2010-06", country: uk }));
    assert.deepEqual(view.rows.map((r) => r.cohort), ["2010-01", "2010-02", "2010-03", "2010-04", "2010-05", "2010-06"]);
    const jan = view.rows[0];
    assert.equal(jan.cells.filter((c) => c !== null).length, 5);
    assert.ok(view.rows.at(-1)?.cells.every((c) => c === null));
  });
});

describe("segments", () => {
  it("five segments adding up to the scope's customers", async () => {
    const view = await source.segments(ALL_TIME);
    assert.deepEqual(view.rows.map((r) => r.segment), ["Champions", "Loyal", "Promising", "At risk", "Lost"]);
    assert.equal(view.customers, meta.customers);
    near(view.rows.reduce((a, r) => a + r.share, 0), 1, 0.001);
    assert.equal(view.referenceDate, meta.rfmRules.referenceDate);
  });

  it("a top country has its own counts; others fall back", async () => {
    const de = await source.segments(f({ country: germany }));
    assert.equal(de.fallback, false);
    assert.ok(de.customers < meta.customers);
    assert.equal((await source.segments(f({ country: small }))).fallback, true);
  });
});

describe("returns", () => {
  it("rates per country, countries under the minimum orders left out", async () => {
    const view = await source.returns(ALL_TIME);
    assert.equal(view.minOrders, RETURNS_MIN_ORDERS);
    near(view.overall.rate, meta.returnsValue / meta.revenue, 1e-9);
    for (const r of view.rows) {
      const rows = mc((x) => x[1] === r.country);
      assert.ok(r.orders >= RETURNS_MIN_ORDERS);
      assert.equal(r.orders, sumCol(rows, 4));
      near(r.rate, sumCol(rows, 5) / sumCol(rows, 2), 1e-9);
    }
    for (let i = 1; i < view.rows.length; i++) assert.ok(view.rows[i].rate <= view.rows[i - 1].rate);
    const below = meta.countries.filter((c) => sumCol(mc((x) => x[1] === c), 4) < RETURNS_MIN_ORDERS).length;
    assert.equal(view.excluded, below);
    assert.equal(view.rows.length + view.excluded, meta.countries.length);
  });
});
