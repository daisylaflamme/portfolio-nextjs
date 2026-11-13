import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSchema, parse, validate } from "graphql";
import { onlineRetailSource as source } from "../data.ts";
import { defaultFilters, parseFilters, slugify } from "../params.ts";
import type { Filters } from "../types.ts";
import { operations, type FiltersInput, type OperationData, type OperationName } from "./operations.ts";
import { CACHE_CONTROL, GRAPHQL_ENDPOINT, MAX_COMPLEXITY, MAX_QUERY_LENGTH, createOnlineRetailYoga } from "./schema.ts";
import { typeDefs } from "./typeDefs.ts";

const yoga = createOnlineRetailYoga({ getSource: () => source, production: false });
const prodYoga = createOnlineRetailYoga({ getSource: () => source, production: true });
const meta = source.meta;
const germany = meta.topCountries[3];
const category = meta.categories[7];
const FILTERS: Filters = { from: "2011-01", to: "2011-06", country: germany, category: "all" };
const INPUT: FiltersInput = { from: "2011-01", to: "2011-06", country: slugify(germany) };

/** Results go through JSON so graphql-js's null-prototype objects compare like plain ones. */
const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

async function get(y: typeof yoga, query: string, variables?: Record<string, unknown>) {
  const url = new URL(`http://localhost${GRAPHQL_ENDPOINT}`);
  url.searchParams.set("query", query);
  if (variables) url.searchParams.set("variables", JSON.stringify(variables));
  const res = await y.fetch(url, { method: "GET", headers: { accept: "application/json" } });
  return { res, body: (await res.json()) as { data?: unknown; errors?: { message: string }[] } };
}

async function run<N extends OperationName>(name: N, variables: Record<string, unknown>) {
  const { res, body } = await get(yoga, operations[name], variables);
  assert.equal(res.status, 200, JSON.stringify(body.errors));
  assert.equal(body.errors, undefined);
  return body.data as OperationData[N];
}

describe("client operations", () => {
  const schema = buildSchema(typeDefs);
  for (const [name, doc] of Object.entries(operations)) {
    it(`${name} is valid against the schema`, () => {
      assert.deepEqual(validate(schema, parse(doc)).map((e) => e.message), []);
    });
  }

  it("overview returns exactly what the DataSource returns", async () => {
    const data = await run("overview", { filters: INPUT });
    assert.deepEqual(data.dashboard.filters, FILTERS);
    assert.deepEqual(plain(data.dashboard.kpis), plain(await source.kpis(FILTERS)));
    assert.deepEqual(plain(data.dashboard.monthlyRevenue), plain(await source.monthlyRevenue(FILTERS)));
    assert.deepEqual(plain(data.dashboard.countries), plain(await source.countries(FILTERS)));
  });

  it("products, basket, customers and returns match the DataSource too", async () => {
    const f: Filters = { ...FILTERS, category };
    const input = { ...INPUT, category: slugify(category) };
    const products = await run("products", { filters: input });
    assert.deepEqual(plain(products.dashboard.topProducts), plain(await source.topProducts(f)));
    assert.equal(products.source.status, "snapshot");
    const basket = await run("basket", { filters: input });
    assert.deepEqual(plain(basket.dashboard.basket), plain(await source.basket(f)));
    const customers = await run("customers", { filters: input });
    assert.deepEqual(plain(customers.dashboard.cohorts), plain(await source.cohorts(f)));
    assert.deepEqual(plain(customers.dashboard.segments), plain(await source.segments(f)));
    const returns = await run("returns", { filters: input });
    assert.deepEqual(plain(returns.dashboard.returns), plain(await source.returns(f)));
  });

  it("live-only fields are null on the snapshot", async () => {
    const data = await run("products", { filters: INPUT, query: "lantern", code: "85123A", withSearch: true, withProduct: true });
    assert.equal(data.dashboard.searchProducts, null);
    assert.equal(data.dashboard.productMonthly, null);
    const skipped = await run("products", { filters: INPUT });
    assert.equal("searchProducts" in skipped.dashboard, false);
  });
});

describe("filters input", () => {
  it("is validated by params.ts: invalid values fall back to the defaults", async () => {
    const input = { from: "1999-01", to: "2011-02", country: "atlantis", category: "Kitchen & dining" };
    const data = await run("overview", { filters: input });
    assert.deepEqual(data.dashboard.filters, parseFilters(meta, input));
    assert.deepEqual(data.dashboard.filters, { ...defaultFilters(meta), to: "2011-02" });
  });

  it("no filters means the whole period", async () => {
    const data = await run("overview", {});
    assert.deepEqual(data.dashboard.filters, defaultFilters(meta));
  });
});

describe("guard rails", () => {
  it("refuses queries over the complexity limit (aliased dashboards)", async () => {
    const aliases = Array.from({ length: 20 }, (_, i) => `d${i}: dashboard { kpis { current { revenue } } }`).join("\n");
    const { body } = await get(yoga, `{ ${aliases} }`);
    assert.match(body.errors?.[0]?.message ?? "", new RegExp(`too complex.*max ${MAX_COMPLEXITY}`));
    assert.equal(body.data, undefined);
  });

  it("refuses queries over the depth limit", async () => {
    const shallow = createOnlineRetailYoga({ getSource: () => source, production: false, maxDepth: 3 });
    const { body } = await get(shallow, "{ dashboard { kpis { current { revenue } } } }");
    assert.match(body.errors?.[0]?.message ?? "", /too deep: 4 levels \(max 3\)/);
    // Fragments count: the depth is measured through them.
    const viaFragment = await get(shallow, "query { dashboard { ...K } } fragment K on Dashboard { kpis { current { revenue } } }");
    assert.match(viaFragment.body.errors?.[0]?.message ?? "", /too deep/);
  });

  it("refuses oversized query text", async () => {
    const { res, body } = await get(yoga, `{ meta { months } } ${"#".repeat(MAX_QUERY_LENGTH)}`);
    assert.notEqual(res.status, 200);
    assert.match(body.errors?.[0]?.message ?? "", /too long/);
  });

  it("allows introspection in development, refuses it in production", async () => {
    const q = "{ __schema { queryType { name } } }";
    const dev = await get(yoga, q);
    assert.equal(dev.body.errors, undefined);
    const prod = await get(prodYoga, q);
    assert.match(prod.body.errors?.[0]?.message ?? "", /introspection/i);
    assert.equal(prod.body.data, undefined);
  });

  it("doesn't suggest field names in production", async () => {
    const dev = await get(yoga, "{ dashboard { kpi { current { revenue } } } }");
    assert.match(dev.body.errors?.[0]?.message ?? "", /Did you mean "kpis"/);
    const prod = await get(prodYoga, "{ dashboard { kpi { current { revenue } } } }");
    assert.equal(prod.body.errors?.[0]?.message, 'Cannot query field "kpi" on type "Dashboard".');
  });

  it("masks unexpected errors", async () => {
    const broken = createOnlineRetailYoga({
      getSource: () => ({ ...source, kpis: async () => { throw new Error("connection to db.secret.host refused"); } }),
      production: true,
    });
    const { body } = await get(broken, "{ dashboard { kpis { current { revenue } } } }");
    const message = body.errors?.[0]?.message ?? "";
    assert.equal(message, "Unexpected error.");
    assert.doesNotMatch(JSON.stringify(body), /secret/);
  });
});

describe("caching", () => {
  it("successful GET queries are publicly cacheable", async () => {
    const { res } = await get(yoga, operations.overview, { filters: INPUT });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_CONTROL);
  });

  it("errors and POST requests are not cached", async () => {
    const bad = await get(yoga, "{ nope }");
    assert.equal(bad.res.headers.get("cache-control"), "no-store");
    const post = await yoga.fetch(`http://localhost${GRAPHQL_ENDPOINT}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ query: "{ meta { months } }" }),
    });
    assert.equal(post.status, 200);
    assert.equal(post.headers.get("cache-control"), "no-store");
  });
});
