import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { describe, it } from "node:test";
import type { OnlineRetailCategories, OnlineRetailSnapshot } from "./types.ts";

const dataDir = new URL("../../../data/online-retail/", import.meta.url);
const snapshotFile = new URL("snapshot.json", dataDir);
const snapshot = JSON.parse(readFileSync(snapshotFile, "utf8")) as OnlineRetailSnapshot;
const categories = JSON.parse(readFileSync(new URL("categories.json", dataDir), "utf8")) as OnlineRetailCategories;
const { meta } = snapshot;

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const cents = (n: number) => Math.round(n * 100);

describe("Online Retail snapshot", () => {
  it("stays under the 1.5 MB budget", () => {
    assert.ok(statSync(snapshotFile).size <= 1.5 * 1024 * 1024);
  });

  it("monthCountry totals match meta", () => {
    const rows = snapshot.monthCountry.rows;
    assert.equal(cents(sum(rows.map((r) => r[2]))), cents(meta.revenue), "revenue");
    assert.equal(sum(rows.map((r) => r[3])), meta.units, "units");
    // Orders add up across months and countries: an invoice has one date and one country.
    assert.equal(sum(rows.map((r) => r[4])), meta.orders, "orders");
    assert.equal(cents(sum(rows.map((r) => r[5]))), cents(meta.returnsValue), "returnsValue");
    assert.equal(sum(rows.map((r) => r[6])), meta.returnLines, "returnLines");
  });

  it("monthCountry has one row per month and country", () => {
    const keys = snapshot.monthCountry.rows.map(([month, country]) => `${month}|${country}`);
    assert.equal(new Set(keys).size, keys.length);
    for (const [month, country] of snapshot.monthCountry.rows) {
      assert.ok(meta.months.includes(month), month);
      assert.ok(meta.countries.includes(country), country);
    }
  });

  it("category revenue, units and returns add up to monthCountry per month and country", () => {
    const byCell = new Map<string, { revenue: number; units: number; returnsValue: number; orders: number }>();
    for (const [month, country, , revenue, units, orders, returnsValue] of snapshot.monthCountryCategory.rows) {
      const key = `${month}|${country}`;
      const cell = byCell.get(key) ?? { revenue: 0, units: 0, returnsValue: 0, orders: 0 };
      cell.revenue += revenue;
      cell.units += units;
      cell.returnsValue += returnsValue;
      cell.orders = Math.max(cell.orders, orders);
      byCell.set(key, cell);
    }
    assert.equal(byCell.size, snapshot.monthCountry.rows.length);
    for (const [month, country, revenue, units, orders, returnsValue] of snapshot.monthCountry.rows) {
      const cell = byCell.get(`${month}|${country}`);
      assert.ok(cell, `${month} ${country} has category rows`);
      assert.equal(cents(cell.revenue), cents(revenue), `${month} ${country} revenue`);
      assert.equal(cell.units, units, `${month} ${country} units`);
      assert.equal(cents(cell.returnsValue), cents(returnsValue), `${month} ${country} returns`);
      // Orders are distinct counts: a category never has more orders than its month and country.
      assert.ok(cell.orders <= orders, `${month} ${country} orders`);
    }
  });

  it("uses only categories listed in categories.json", () => {
    assert.deepEqual(meta.categories, categories.categories);
    assert.equal(meta.categoryMethod, categories.method);
    const listed = new Set(categories.categories);
    for (const row of snapshot.monthCountryCategory.rows) assert.ok(listed.has(row[2]), row[2]);
    for (const category of Object.values(categories.codes)) assert.ok(listed.has(category), category);
  });

  it("segments add up to the customer count in every scope", () => {
    const byScope = new Map<string, number>();
    for (const [scope, , customers] of snapshot.segments.rows) byScope.set(scope, (byScope.get(scope) ?? 0) + customers);
    assert.equal(byScope.get("all"), meta.customers);
    const countries = sum([...byScope].filter(([scope]) => scope !== "all").map(([, n]) => n));
    assert.ok(countries <= meta.customers);
    assert.deepEqual([...byScope.keys()], ["all", ...meta.topCountries]);
  });

  it("cohort sizes add up to the customer count", () => {
    const sizes = new Map<string, number>();
    for (const [scope, cohort, size, monthsSince, active, share] of snapshot.cohorts.rows) {
      if (scope === "all") sizes.set(cohort, size);
      if (monthsSince === 0) assert.equal(active, size, `${scope} ${cohort} month 0`);
      assert.ok(share > 0 && share <= 1, `${scope} ${cohort} +${monthsSince}`);
    }
    assert.equal(sum([...sizes.values()]), meta.customers);
  });

  it("describes every product it references", () => {
    for (const row of snapshot.topProducts.rows) assert.ok(row[2] in snapshot.products, row[2]);
    for (const row of snapshot.basketTopPairs.rows) {
      assert.ok(row[1] in snapshot.products && row[2] in snapshot.products, `${row[1]} ${row[2]}`);
    }
  });

  it("contains no customer names or IDs", () => {
    const forbidden = /customer.?id|customer.?name|^name$|e-?mail/i;
    const walk = (value: unknown, path: string): void => {
      if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
      if (value && typeof value === "object") {
        for (const [key, v] of Object.entries(value)) {
          assert.doesNotMatch(key, forbidden, `${path}.${key}`);
          walk(v, `${path}.${key}`);
        }
      }
    };
    walk(snapshot, "snapshot");
    for (const table of Object.values(snapshot)) {
      if (table && typeof table === "object" && "columns" in table) {
        for (const column of table.columns as string[]) assert.doesNotMatch(column, forbidden, column);
      }
    }
    // Customer data appears only as counts and shares: no per-customer rows anywhere.
    assert.deepEqual(snapshot.segments.columns.slice(2), ["customers", "share", "avgRecencyDays", "avgOrders", "avgRevenue"]);
    assert.ok(snapshot.segments.rows.length <= (1 + meta.topCountries.length) * 5);
    assert.deepEqual(snapshot.cohorts.columns.slice(2), ["size", "monthsSince", "active", "share"]);
  });
});
