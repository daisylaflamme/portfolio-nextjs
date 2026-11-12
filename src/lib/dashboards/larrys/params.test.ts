import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { larrysData as data } from "./data.ts";
import {
  DEFAULT_SKU,
  defaultParams,
  parseDashboardParams,
  serializeDashboardParams,
  withThreshold,
} from "./params.ts";

const parse = (q: string) => parseDashboardParams(data, new URLSearchParams(q));

describe("parseDashboardParams", () => {
  it("defaults to all stores, rule A and the BDG buttondown", () => {
    assert.deepEqual(parse(""), { store: "all", thresholds: [1, 2, 3], sku: DEFAULT_SKU });
  });

  it("reads valid values", () => {
    assert.deepEqual(parse("store=433&t=1,1.6,2.2&sku=S4803"), {
      store: 433,
      thresholds: [1, 1.6, 2.2],
      sku: "S4803",
    });
  });

  it("accepts a Next searchParams record", () => {
    assert.equal(parseDashboardParams(data, { store: ["444"], sku: undefined }).store, 444);
  });

  it("falls back to defaults for invalid values", () => {
    const d = defaultParams(data);
    for (const q of [
      "store=999",
      "store=abc",
      "store=424.5",
      "sku=XXX",
      "t=2,1,3",
      "t=1,1,3",
      "t=1,2",
      "t=a,b,c",
      "t=0.1,2,3",
      "t=1,2,9",
      "t=-1,2,3",
    ]) {
      const p = parse(q);
      const key = q.split("=")[0];
      if (key === "store") assert.equal(p.store, d.store, q);
      if (key === "sku") assert.equal(p.sku, d.sku, q);
      if (key === "t") assert.deepEqual(p.thresholds, d.thresholds, q);
    }
  });
});

describe("serializeDashboardParams", () => {
  it("omits defaults and round-trips", () => {
    assert.equal(serializeDashboardParams(data, defaultParams(data)), "");
    const p = { store: 481 as const, thresholds: [1.2, 1.8, 2.5] as [number, number, number], sku: "G4451" };
    const q = serializeDashboardParams(data, p);
    assert.equal(q, "?store=481&t=1.2,1.8,2.5&sku=G4451");
    assert.deepEqual(parse(q.slice(1)), p);
  });
});

describe("withThreshold", () => {
  it("keeps t1 < t2 < t3 and the slider ranges", () => {
    assert.deepEqual(withThreshold([1, 2, 3], 0, 2.5), [1.6, 2, 3]);
    assert.deepEqual(withThreshold([1.5, 1.6, 3], 0, 1.6), [1.5, 1.6, 3]);
    assert.deepEqual(withThreshold([1, 2, 3], 1, 0.5), [1, 1.2, 3]);
    assert.deepEqual(withThreshold([1, 2, 2.2], 1, 2.9), [1, 2.1, 2.2]);
    assert.deepEqual(withThreshold([1, 2, 3], 2, 9), [1, 2, 3.5]);
    assert.deepEqual(withThreshold([1, 1.6, 2.2], 2, 1.0), [1, 1.6, 1.7]);
  });
});
