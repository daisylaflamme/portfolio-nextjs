import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Query } from "../sql.ts";
import { MemoryDailyCap } from "./guards.ts";
import { FallbackDailyCap, PostgresCache, PostgresDailyCap, cacheGetQuery, cacheSetQuery, usageTakeQuery, type ReadRunner, type WriteTransaction } from "./store.ts";

describe("summary store queries", () => {
  it("are parameterized and only touch the two summary tables", () => {
    const evil = "'; drop table online_retail.sales; --";
    for (const q of [cacheGetQuery(evil), cacheSetQuery(evil, evil, evil), usageTakeQuery()]) {
      assert.ok(!q.text.includes(evil));
      assert.doesNotMatch(q.text, /\bsales\b|\bproducts\b|\bdelete\b|\btruncate\b/i);
      const tables = [...q.text.matchAll(/online_retail\.(\w+)/g)].map((m) => m[1]);
      for (const t of tables) assert.ok(["ai_summaries", "ai_summary_usage"].includes(t), t);
    }
    assert.deepEqual(cacheSetQuery("k", "s", "m").values, ["k", "s", "m"]);
  });
});

describe("PostgresCache", () => {
  it("reads through memory, then Postgres, and writes both", async () => {
    const reads: Query[] = [];
    const writes: Query[][] = [];
    const db = new Map<string, string>([["k1", "from db"]]);
    const read = (async (q: Query) => {
      reads.push(q);
      const v = db.get(String(q.values[0]));
      return v ? [{ summary: v }] : [];
    }) as ReadRunner;
    const write = (async (qs: Query[]) => {
      writes.push(qs);
      return qs.map(() => []);
    }) as WriteTransaction;
    const cache = new PostgresCache(read, write);
    assert.equal(await cache.get("k1"), "from db");
    assert.equal(await cache.get("k1"), "from db");
    assert.equal(reads.length, 1, "the second read is served from memory");
    assert.equal(await cache.get("missing"), undefined);
    await cache.set("k2", "new", "claude-opus-5-5");
    assert.deepEqual(writes, [[cacheSetQuery("k2", "new", "claude-opus-5-5")]]);
    assert.equal(await cache.get("k2"), "new");
  });
});

describe("daily cap", () => {
  it("allows calls up to the cap from the shared counter", async () => {
    let calls = 0;
    const write = (async () => [[{ calls: ++calls }]]) as unknown as WriteTransaction;
    const cap = new PostgresDailyCap(write, 2);
    assert.deepEqual([await cap.take(), await cap.take(), await cap.take()], [true, true, false]);
  });

  it("falls back to the instance's own count when Postgres fails", async () => {
    const broken = new PostgresDailyCap((async () => {
      throw new Error("db down");
    }) as WriteTransaction);
    const logs: string[] = [];
    const cap = new FallbackDailyCap(broken, new MemoryDailyCap(1), (m) => logs.push(m));
    assert.equal(await cap.take(), true);
    assert.equal(await cap.take(), false);
    assert.equal(logs.length, 2);
  });
});
