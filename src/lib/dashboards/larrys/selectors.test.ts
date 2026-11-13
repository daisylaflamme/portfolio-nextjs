import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { larrysData as data } from "./data.ts";
import {
  isValidThresholds,
  placeLabel,
  selectBasketMatrix,
  selectDailyRevenue,
  selectDiscountTiers,
  selectKpis,
  selectLoyaltyTowns,
  selectPricePoints,
  selectProducts,
  selectRevenueByStore,
} from "./selectors.ts";
import type { Filters } from "./types.ts";

const ALL: Filters = { store: "all" };
const near = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const sumRevenue = (f: (r: (typeof data.storeWeekSku)[number]) => boolean) =>
  data.storeWeekSku.filter(f).reduce((s, r) => s + r.revenue, 0);

describe("selectKpis", () => {
  it("all stores: revenue ≈ $1,176,469 and 7,890 transactions", () => {
    const k = selectKpis(data, ALL);
    near(k.revenue, 1_176_469.19);
    assert.equal(k.transactions, 7890);
    assert.equal(k.transactions, data.meta.transactions);
  });

  it("revenue equals the storeWeekSku sum for every store", () => {
    for (const s of data.stores) {
      near(selectKpis(data, { store: s.id }).revenue, sumRevenue((r) => r.store === s.id));
    }
  });

  it("revenue equals the storeWeekSku sum for a week range", () => {
    const k = selectKpis(data, { store: 424, weeks: [15, 16] });
    near(k.revenue, sumRevenue((r) => r.store === 424 && r.week >= 15 && r.week <= 16));
  });

  it("derives margin, basket and loyalty share from the totals", () => {
    const k = selectKpis(data, ALL);
    near(k.grossMargin, (k.revenue - k.cost) / k.revenue, 1e-9);
    near(k.avgBasket, k.revenue / k.transactions, 1e-9);
    near(k.loyaltyShare, k.loyaltyTransactions / k.transactions, 1e-9);
    assert.ok(k.grossMargin > 0 && k.grossMargin < 1);
  });

  it("store revenues add up to the all-stores total", () => {
    const total = data.stores.reduce((s, st) => s + selectKpis(data, { store: st.id }).revenue, 0);
    near(total, selectKpis(data, ALL).revenue);
  });
});

describe("selectDailyRevenue", () => {
  it("is in date order and sums to the KPI revenue", () => {
    const days = selectDailyRevenue(data, ALL);
    assert.deepEqual(days.map((d) => d.date), [...days.map((d) => d.date)].sort());
    near(days.reduce((s, d) => s + d.revenue, 0), selectKpis(data, ALL).revenue);
    assert.equal(days[0].date, data.meta.dateRange[0]);
    assert.equal(days.at(-1)?.date, data.meta.dateRange[1]);
  });

  it("applies the week range", () => {
    const days = selectDailyRevenue(data, { store: "all", weeks: [14, 14] });
    assert.ok(days.length > 0 && days.length <= 7);
  });
});

describe("selectRevenueByStore", () => {
  it("lists every store, largest first, marking the filter", () => {
    const rows = selectRevenueByStore(data, { store: 439 });
    assert.equal(rows.length, data.stores.length);
    assert.deepEqual(rows.map((r) => r.revenue), [...rows.map((r) => r.revenue)].sort((a, b) => b - a));
    assert.deepEqual(rows.filter((r) => r.active).map((r) => r.id), [439]);
    assert.ok(selectRevenueByStore(data, ALL).every((r) => r.active));
  });
});

describe("selectProducts", () => {
  it("has all 8 products, sorted by revenue, summing to the KPI revenue", () => {
    const rows = selectProducts(data, ALL);
    assert.equal(rows.length, 8);
    assert.deepEqual(rows.map((r) => r.revenue), [...rows.map((r) => r.revenue)].sort((a, b) => b - a));
    near(rows.reduce((s, r) => s + r.revenue, 0), selectKpis(data, ALL).revenue);
    for (const r of rows) assert.ok(r.margin > 0 && r.margin < 1, r.id);
  });
});

describe("selectBasketMatrix", () => {
  it("is 8×8, symmetric, with an empty diagonal", () => {
    const m = selectBasketMatrix(data, ALL);
    assert.equal(m.products.length, 8);
    for (let i = 0; i < 8; i++) {
      assert.equal(m.counts[i][i], null);
      for (let j = 0; j < 8; j++) assert.equal(m.counts[i][j], m.counts[j][i]);
    }
  });

  it("totals match the basket pairs and the top pair is the maximum", () => {
    const m = selectBasketMatrix(data, { store: 424 });
    const upper = m.counts.flatMap((row, i) => row.slice(i + 1)).reduce<number>((s, n) => s + (n ?? 0), 0);
    const expected = data.basketPairs.filter((p) => p.store === 424).reduce((s, p) => s + p.transactions, 0);
    assert.equal(upper, expected);
    assert.ok(m.top);
    assert.equal(m.top.transactions, m.max);
  });
});

describe("selectPricePoints", () => {
  it("flags only the list price as full price, prices ascending", () => {
    for (const sku of data.skus) {
      const rows = selectPricePoints(data, ALL, sku.id);
      assert.ok(rows.length > 0, sku.id);
      assert.deepEqual(rows.map((r) => r.price), [...rows.map((r) => r.price)].sort((a, b) => a - b));
      assert.deepEqual(rows.filter((r) => r.isFullPrice).map((r) => r.price), [sku.listPrice]);
    }
  });

  it("returns nothing for an unknown product", () => {
    assert.deepEqual(selectPricePoints(data, ALL, "NOPE"), []);
  });
});

describe("selectDiscountTiers", () => {
  const { workbook1, workbook2 } = data.meta.discountTiers2013;

  it("rule A on all stores = 167 / 101 / 6 / 0", () => {
    assert.deepEqual(selectDiscountTiers(data, ALL, workbook1).counts, [167, 101, 6, 0]);
  });

  it("rule B on all stores = 167 / 96 / 7 / 4", () => {
    assert.deepEqual(selectDiscountTiers(data, ALL, workbook2).counts, [167, 96, 7, 4]);
  });

  it("store filters by home store and adds up to the total", () => {
    const sum = data.stores.reduce((s, st) => s + selectDiscountTiers(data, { store: st.id }, workbook1).total, 0);
    assert.equal(sum, data.meta.loyaltyCustomers);
    const t = selectDiscountTiers(data, { store: 424 }, workbook1);
    assert.equal(t.qualifying, t.total - t.counts[0]);
  });

  it("rejects thresholds that are not strictly increasing", () => {
    assert.throws(() => selectDiscountTiers(data, ALL, [2, 1, 3]), RangeError);
    assert.throws(() => selectDiscountTiers(data, ALL, [1, 1, 3]), RangeError);
    assert.equal(isValidThresholds([1, 1.6, 2.2]), true);
    assert.equal(isValidThresholds([0, 1, 2]), false);
  });
});

describe("selectLoyaltyTowns", () => {
  it("lists every zip, most customers first", () => {
    const towns = selectLoyaltyTowns(data, ALL);
    assert.equal(towns.length, data.loyaltyZips.length);
    assert.equal(towns[0].place, "Cambridge");
    assert.equal(
      towns.reduce((s, z) => s + z.customers, 0) + data.meta.loyaltyCustomersInSmallZips,
      data.meta.loyaltyCustomers,
    );
  });

  it("restores spaces in place names", () => {
    assert.equal(placeLabel("JamaicaPlain"), "Jamaica Plain");
    assert.equal(placeLabel("NewtonLowerFalls"), "Newton Lower Falls");
    assert.equal(placeLabel("Boston"), "Boston");
  });
});
