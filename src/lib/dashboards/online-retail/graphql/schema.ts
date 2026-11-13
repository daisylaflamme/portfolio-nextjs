/**
 * The Online Retail GraphQL endpoint: schema, resolvers and guard rails, as a Yoga instance.
 * The route handler (src/app/api/online-retail/graphql/route.ts) serves it; unit tests call
 * `yoga.fetch` directly. Resolvers call the active DataSource (snapshot or Postgres), so the
 * API always matches what the pages show.
 *
 * Guard rails:
 * - depth and complexity limits (rules.ts) and a cap on query size
 * - no introspection in production
 * - masked errors (Yoga's default: no stack traces or SQL in responses)
 * - no batching, and GraphiQL only in development
 * - Cache-Control: public and cacheable for successful GET queries (the data never changes),
 *   no-store for everything else
 */
import { NoSchemaIntrospectionCustomRule } from "graphql";
import { createGraphQLError, createSchema, createYoga, type Plugin } from "graphql-yoga";
import type { DataSource } from "../source.ts";
import { parseFilters } from "../params.ts";
import type { Filters } from "../types.ts";
import { typeDefs } from "./typeDefs.ts";
import { complexityLimit, depthLimit } from "./rules.ts";

export const GRAPHQL_ENDPOINT = "/api/online-retail/graphql";
export const MAX_DEPTH = 8;
export const MAX_COMPLEXITY = 300;
export const MAX_QUERY_LENGTH = 8_000;
export const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

interface Context {
  source: DataSource;
  /** One DataSource call per method and filters per request (e.g. countries and returns share one on Postgres). */
  memo: Map<string, Promise<unknown>>;
}

interface DashboardParent {
  filters: Filters;
}

type FilterInput = { from?: string | null; to?: string | null; country?: string | null; category?: string | null };

function memo<T>(ctx: Context, key: string, run: () => Promise<T>): Promise<T> {
  let hit = ctx.memo.get(key) as Promise<T> | undefined;
  if (!hit) {
    hit = run();
    ctx.memo.set(key, hit);
  }
  return hit;
}

/** A Dashboard field resolver that calls one DataSource method with the parent's filters. */
function view<K extends "kpis" | "monthlyRevenue" | "countries" | "topProducts" | "basket" | "cohorts" | "segments" | "returns">(
  method: K,
) {
  return (parent: DashboardParent, _args: unknown, ctx: Context) =>
    memo<unknown>(ctx, `${method}:${JSON.stringify(parent.filters)}`, () =>
      (ctx.source[method] as (f: Filters) => Promise<unknown>).call(ctx.source, parent.filters),
    );
}

export function createResolvers() {
  return {
    Query: {
      meta: (_: unknown, __: unknown, ctx: Context) => ctx.source.meta,
      source: async (_: unknown, __: unknown, ctx: Context) => ({ kind: ctx.source.kind, status: await ctx.source.status() }),
      dashboard: (_: unknown, args: { filters?: FilterInput | null }, ctx: Context): DashboardParent => {
        // The URL's own parser: same validation, same defaults for anything missing or invalid.
        const raw = args.filters ?? {};
        const record: Record<string, string | undefined> = {};
        for (const key of ["from", "to", "country", "category"] as const) record[key] = raw[key] ?? undefined;
        return { filters: parseFilters(ctx.source.meta, record) };
      },
    },
    Dashboard: {
      filters: (parent: DashboardParent) => parent.filters,
      kpis: view("kpis"),
      monthlyRevenue: view("monthlyRevenue"),
      countries: view("countries"),
      topProducts: view("topProducts"),
      basket: view("basket"),
      cohorts: view("cohorts"),
      segments: view("segments"),
      returns: view("returns"),
      searchProducts: async (parent: DashboardParent, args: { query: string }, ctx: Context) => {
        if (!ctx.source.searchProducts || (await ctx.source.status()) !== "live") return null;
        return ctx.source.searchProducts(args.query.slice(0, 80), parent.filters);
      },
      productMonthly: async (parent: DashboardParent, args: { code: string }, ctx: Context) => {
        if (!ctx.source.productMonthly || (await ctx.source.status()) !== "live") return null;
        const code = args.code.trim().toUpperCase();
        if (!/^[A-Z0-9]{1,12}$/.test(code)) return null;
        return ctx.source.productMonthly(code, parent.filters);
      },
    },
  };
}

/** Adds the validation rules and query-size cap, and sets Cache-Control on every response. */
function guardRails(production: boolean, limits: { depth: number; complexity: number }): Plugin {
  const cacheable = new WeakSet<Request>();
  return {
    onParams({ params }) {
      if ((params.query?.length ?? 0) > MAX_QUERY_LENGTH) {
        throw createGraphQLError(`Query is too long (max ${MAX_QUERY_LENGTH} characters).`, { extensions: { http: { status: 400 } } });
      }
    },
    onValidate({ addValidationRule }) {
      addValidationRule(depthLimit(limits.depth));
      addValidationRule(complexityLimit(limits.complexity));
      if (production) addValidationRule(NoSchemaIntrospectionCustomRule);
    },
    onExecute({ args }) {
      const request = (args.contextValue as { request?: Request }).request;
      return {
        onExecuteDone({ result }) {
          if (request && request.method === "GET" && !("errors" in result && result.errors?.length)) cacheable.add(request);
        },
      };
    },
    onResponse({ request, response }) {
      const ok = cacheable.has(request) && response.status === 200;
      response.headers.set("Cache-Control", ok ? CACHE_CONTROL : "no-store");
    },
  };
}

export interface YogaOptions {
  /** The active DataSource for each request (data.ts's getOnlineRetailSource). */
  getSource: () => DataSource;
  production?: boolean;
  maxDepth?: number;
  maxComplexity?: number;
}

export function createOnlineRetailYoga({ getSource, production = process.env.NODE_ENV === "production", maxDepth = MAX_DEPTH, maxComplexity = MAX_COMPLEXITY }: YogaOptions) {
  return createYoga<object, Context>({
    schema: createSchema<Context>({ typeDefs, resolvers: createResolvers() }),
    graphqlEndpoint: GRAPHQL_ENDPOINT,
    context: () => ({ source: getSource(), memo: new Map() }),
    fetchAPI: { Response },
    graphiql: !production,
    landingPage: false,
    batching: false,
    maskedErrors: true,
    plugins: [guardRails(production, { depth: maxDepth, complexity: maxComplexity })],
  });
}
