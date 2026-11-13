import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  basketQuery,
  cohortsQuery,
  countryTotalsQuery,
  escapeLike,
  kpisQuery,
  monthlyQuery,
  paretoQuery,
  productInfoQuery,
  productMonthlyQuery,
  searchProductsQuery,
  segmentsQuery,
  topProductsQuery,
  type Query,
} from "./sql.ts";
import type { Filters } from "./types.ts";

// Every builder must keep values out of the query text: these never appear in it.
const EVIL = "'; drop table online_retail.sales; --";
const ALL: Filters = { from: "2009-12", to: "2011-12", country: "all", category: "all" };
const FULL: Filters = { from: "2010-03", to: "2011-02", country: "Germany", category: "Kitchen & dining" };
const HOSTILE: Filters = { from: "2010-03", to: "2011-02", country: EVIL, category: `${EVIL} 2` };

/** Placeholders are $1…$n with no gaps, n = values.length, and no value is in the text. */
function assertParameterized(q: Query) {
  const used = new Set([...q.text.matchAll(/\$(\d+)/g)].map((m) => Number(m[1])));
  assert.deepEqual([...used].sort((a, b) => a - b), q.values.map((_, i) => i + 1), q.text);
  for (const v of q.values) {
    if (typeof v === "string" && v.length > 3) assert.ok(!q.text.includes(v), `value ${v} leaked into the text`);
  }
  assert.ok(!q.text.includes(EVIL));
  assert.ok(!/drop table/i.test(q.text));
}

const builders: [string, (f: Filters) => Query][] = [
  ["kpis", (f) => kpisQuery(f, { from: "2009-04", to: "2010-02" })],
  ["kpis without a previous period", (f) => kpisQuery(f, null)],
  ["monthly", monthlyQuery],
  ["countryTotals", countryTotalsQuery],
  ["topProducts", (f) => topProductsQuery(f, 200)],
  ["pareto", paretoQuery],
  ["basket", basketQuery],
  ["cohorts", cohortsQuery],
  ["segments", segmentsQuery],
  ["search", (f) => searchProductsQuery(EVIL, f, 25)],
  ["productMonthly", (f) => productMonthlyQuery(EVIL, f)],
];

describe("SQL builders", () => {
  for (const [name, build] of builders) {
    it(`${name}: parameterized for every filter combination, including hostile values`, () => {
      for (const f of [ALL, FULL, HOSTILE]) assertParameterized(build(f));
    });
  }

  it("productInfo is parameterized", () => {
    assertParameterized(productInfoQuery(EVIL));
    assert.deepEqual(productInfoQuery("85123A").values, ["85123A"]);
  });

  it("only reads the online_retail schema", () => {
    for (const [, build] of builders) {
      const tables = [...build(FULL).text.matchAll(/\b(?:from|join)\s+([a-z_.]+)/gi)].map((m) => m[1]);
      // Schema-qualified names must be online_retail's; "a.month" (as in extract(… from a.month)) is a column.
      for (const t of tables) {
        if (t.includes(".") && !/^[a-z]{1,2}\./.test(t)) assert.match(t, /^online_retail\./, t);
      }
    }
  });
});

describe("kpisQuery", () => {
  it("passes months as dates and adds the previous period only when there is one", () => {
    const q = kpisQuery({ ...ALL, from: "2011-01", to: "2011-06" }, { from: "2010-07", to: "2010-12" });
    assert.deepEqual(q.values, ["2011-01-01", "2011-06-01", "2010-07-01", "2010-12-01"]);
    assert.match(q.text, /prev_revenue/);
    assert.match(q.text, /from online_retail\.mv_month_country\b/);
    // No WHERE clause with no country or category (the period sits in each FILTER).
    assert.doesNotMatch(q.text, /\nwhere/);
    const none = kpisQuery(ALL, null);
    assert.deepEqual(none.values, ["2009-12-01", "2011-12-01"]);
    assert.doesNotMatch(none.text, /prev_/);
  });

  it("filters by country and uses the category view for a category", () => {
    const q = kpisQuery(FULL, null);
    assert.deepEqual(q.values, ["2010-03-01", "2011-02-01", "Germany", "Kitchen & dining"]);
    assert.match(q.text, /from online_retail\.mv_month_country_category/);
    assert.match(q.text, /where country = \$3 and category = \$4/);
  });
});

describe("country and category conditions", () => {
  it("appear only when the filter isn't 'all'", () => {
    const all = monthlyQuery(ALL);
    assert.deepEqual(all.values, []);
    assert.doesNotMatch(all.text, /country =|category =/);
    const country = monthlyQuery({ ...ALL, country: "France" });
    assert.deepEqual(country.values, ["France"]);
    assert.match(country.text, /where country = \$1\n/);
    const both = monthlyQuery(FULL);
    assert.deepEqual(both.values, ["Germany", "Kitchen & dining"]);
  });

  it("country totals ignore the country filter (it only highlights) but keep the category", () => {
    const q = countryTotalsQuery(FULL);
    assert.deepEqual(q.values, ["2010-03-01", "2011-02-01", "Kitchen & dining"]);
    assert.doesNotMatch(q.text, /country = /);
  });

  it("top products rank within the category, but scope totals and the curve cover every category", () => {
    const q = topProductsQuery(FULL, 200);
    assert.deepEqual(q.values, ["2010-03-01", "2011-02-01", "Germany", "Kitchen & dining", 200]);
    assert.match(q.text, /limit \$5/);
    const curve = paretoQuery(FULL);
    assert.deepEqual(curve.values, ["2010-03-01", "2011-02-01", "Germany"]);
  });

  it("basket reuses each placeholder instead of repeating values", () => {
    const q = basketQuery(FULL);
    assert.deepEqual(q.values, ["2010-03-01", "2011-02-01", "Germany", "Kitchen & dining"]);
    assert.ok((q.text.match(/\$3/g) ?? []).length >= 2);
  });

  it("cohorts look back to the start of the data and keep cohorts from From", () => {
    const q = cohortsQuery(FULL);
    assert.deepEqual(q.values, ["2011-02-01", "2010-03-01", "Germany", "Kitchen & dining"]);
    assert.match(q.text, /month <= \$1::date and country = \$3 and category = \$4/);
    assert.match(q.text, /fi\.cohort >= \$2::date/);
  });

  it("segments filter by home country only", () => {
    assert.deepEqual(segmentsQuery(ALL).values, []);
    assert.doesNotMatch(segmentsQuery(ALL).text, /where/);
    const q = segmentsQuery(FULL);
    assert.deepEqual(q.values, ["Germany"]);
    assert.match(q.text, /where home_country = \$1/);
  });

  it("product monthly ignores the category", () => {
    const q = productMonthlyQuery("85123A", FULL);
    assert.deepEqual(q.values, ["85123A", "Germany"]);
  });
});

describe("search", () => {
  it("escapes LIKE wildcards and trims the text", () => {
    assert.equal(escapeLike("50%_off\\"), "50\\%\\_off\\\\");
    const q = searchProductsQuery("  50% off  ", ALL, 25);
    assert.deepEqual(q.values, ["%50\\% off%", "2009-12-01", "2011-12-01", 25]);
    assert.match(q.text, /ilike \$1 escape '\\'/);
  });

  it("adds country and category when set", () => {
    const q = searchProductsQuery("lantern", FULL, 10);
    assert.deepEqual(q.values, ["%lantern%", "2010-03-01", "2011-02-01", "Germany", "Kitchen & dining", 10]);
    assert.match(q.text, /m\.country = \$4/);
    assert.match(q.text, /pr\.category = \$5/);
  });
});
