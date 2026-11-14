import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { onlineRetailSource } from "./data.ts";
import { defaultFilters, parseFilters, parseFiltersStrict, serializeFilters, slugify, withRange } from "./params.ts";

const meta = onlineRetailSource.meta;
const parse = (q: string) => parseFilters(meta, new URLSearchParams(q));
const first = meta.months[0];
const last = meta.months[meta.months.length - 1];
const country = meta.countries[3];
const category = meta.categories.find((c) => /[^a-z ]/i.test(c)) ?? meta.categories[0];

describe("parseFilters", () => {
  it("defaults to the whole period, all countries and all categories", () => {
    assert.deepEqual(parse(""), { from: first, to: last, country: "all", category: "all" });
    assert.deepEqual(defaultFilters(meta), parse(""));
  });

  it("reads valid values, with countries and categories as slugs", () => {
    assert.deepEqual(parse(`from=2010-01&to=2011-06&country=${slugify(country)}&category=${slugify(category)}`), {
      from: "2010-01",
      to: "2011-06",
      country,
      category,
    });
  });

  it("accepts a Next searchParams record", () => {
    assert.equal(parseFilters(meta, { from: ["2010-05"], country: undefined }).from, "2010-05");
  });

  it("falls back to defaults for invalid values", () => {
    const d = defaultFilters(meta);
    assert.equal(parse("from=2001-01").from, d.from);
    assert.equal(parse("to=2030-12").to, d.to);
    assert.equal(parse("from=2010-1").from, d.from);
    assert.equal(parse("country=atlantis").country, "all");
    assert.equal(parse(`country=${encodeURIComponent(country)}`).country, slugify(country) === country ? country : "all");
    assert.equal(parse("category=nope").category, "all");
    // A reversed range shows the whole period.
    const reversed = parse("from=2011-05&to=2010-02");
    assert.deepEqual([reversed.from, reversed.to], [d.from, d.to]);
  });
});

describe("serializeFilters", () => {
  it("omits defaults and round-trips", () => {
    assert.equal(serializeFilters(meta, defaultFilters(meta)), "");
    const f = { from: "2010-03", to: "2011-09", country, category };
    const q = serializeFilters(meta, f);
    assert.equal(q, `?from=2010-03&to=2011-09&country=${slugify(country)}&category=${slugify(category)}`);
    assert.deepEqual(parse(q.slice(1)), f);
  });
});

describe("slugify", () => {
  it("gives every country and category a unique, URL-safe slug", () => {
    for (const list of [meta.countries, meta.categories]) {
      const slugs = list.map(slugify);
      assert.equal(new Set(slugs).size, list.length);
      for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
    assert.equal(slugify("Home décor & signs"), "home-decor-signs");
  });
});

describe("withRange", () => {
  const f = { from: "2010-05", to: "2010-08", country: "all", category: "all" };
  it("moves one end and pushes the other when they would cross", () => {
    assert.deepEqual(withRange(f, { from: "2010-07" }), { ...f, from: "2010-07" });
    assert.deepEqual(withRange(f, { from: "2010-10" }), { ...f, from: "2010-10", to: "2010-10" });
    assert.deepEqual(withRange(f, { to: "2010-02" }), { ...f, from: "2010-02", to: "2010-02" });
  });
});

describe("parseFiltersStrict", () => {
  it("accepts canonical input and gives exactly what parseFilters gives", () => {
    const input = { from: "2010-03", to: "2011-09", country: slugify(country), category: slugify(category) };
    assert.deepEqual(parseFiltersStrict(meta, input), { ok: true, value: parseFilters(meta, input) });
    assert.deepEqual(parseFiltersStrict(meta, { country: "all", category: "all" }), { ok: true, value: defaultFilters(meta) });
  });

  it("treats missing filters as the defaults", () => {
    for (const input of [undefined, null, {}]) assert.deepEqual(parseFiltersStrict(meta, input), { ok: true, value: defaultFilters(meta) });
  });

  it("rejects what the URL parser would silently default", () => {
    const cases: [unknown, RegExp][] = [
      [[], /must be an object/],
      ["germany", /must be an object/],
      [{ revenue: 1 }, /Unknown filter: revenue/],
      [{ from: "1999-01" }, /Invalid from/],
      [{ to: "2010-1" }, /Invalid to/],
      [{ from: 201001 }, /Invalid from/],
      [{ country: "" }, /Invalid country/],
      [{ category: "x".repeat(65) }, /Invalid category/],
      [{ from: "2011-05", to: "2010-02" }, /from must not be after to/],
      [{ country: "atlantis" }, /Unknown country/],
      // A display name isn't a slug.
      [{ country: "Germany" }, /Unknown country/],
      [{ category: "nope" }, /Unknown category/],
    ];
    for (const [input, error] of cases) {
      const r = parseFiltersStrict(meta, input);
      assert.equal(r.ok, false, JSON.stringify(input));
      if (!r.ok) assert.match(r.error, error, JSON.stringify(input));
      // The lenient URL parser would have produced a filter set instead.
      if (input && typeof input === "object" && !Array.isArray(input)) assert.ok(parseFilters(meta, input as Record<string, string>));
    }
  });
});
