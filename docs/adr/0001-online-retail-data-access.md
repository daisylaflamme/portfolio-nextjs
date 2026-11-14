# ADR 0001: How the Online Retail dashboard gets its data

- Status: accepted
- Date: 2026-11-13
- Scope: `/work/dashboards/online-retail` (the Larry's Secret dashboard keeps its own approach; see below)

## Context

The Online Retail II data is about 1.07 million invoice lines (UCI, CC BY 4.0). The dashboard filters by month range,
country and category, across five tabs. There are three places the numbers could come from:

1. **In the browser.** Ship the data and aggregate on the client, as the Larry's Secret dashboard does: its whole
   dataset is a ~1 MB JSON slice, which makes every filter instant with no server. At a million lines that stops
   working: the raw lines are out of the question, and even the aggregates the dashboard needs come to 1.3 MB of
   JSON (the snapshot), all downloaded and parsed before the first chart, on every phone.
2. **A committed snapshot.** A Python build (`scripts/build_online_retail_data.py`) cleans the data and writes a
   1.3 MB aggregated JSON that only the server reads. It needs no secrets, so build, CI and e2e run anywhere. But it
   can only answer what was pre-aggregated: no arbitrary product, exact rankings only for the top countries, cohorts
   without a category.
3. **Postgres** (Supabase). The same cleaned lines plus materialized views answer any drill-down, but they need a
   database, a secret and a network hop, and they can fail.

## Decision

**Aggregate on the server behind one interface.** Pages talk to a `DataSource` (`src/lib/dashboards/online-retail/source.ts`).
`data.ts` picks the implementation in one place:

- The **snapshot** by default, so the site, CI and e2e never need a secret.
- **Postgres** when `ONLINE_RETAIL_DATABASE_URL` is set. It connects as a read-only role and uses parameterized
  queries only. Any failed call falls back to the snapshot, and the badge says which one is showing.

**Server components render the first view.** Each tab page reads the filters from the URL and calls the `DataSource`
directly, with no HTTP request to itself. Shared links and tab navigation always arrive fully rendered.

**GraphQL for client refetches.** A filter change rewrites the URL with `history.replaceState` (no server render), then
the tab sends **one** GraphQL request.
- Each chart declares the fields it shows as a fragment (`graphql/operations.ts`), and the tab composes them into
  one operation against a typed schema that mirrors the `DataSource`.
- The endpoint is GraphQL Yoga at `/api/online-retail/graphql`. Responses to GET are cacheable by the CDN, because the
  data never changes.

Why GraphQL here and not one REST endpoint per chart:
- **Several charts change together.** One filter change refreshes three charts on Overview. That's one request
  rather than three, and nothing is over-fetched: the Returns tab never downloads KPIs.
- **The schema is the contract.** The fields each chart needs sit next to each other in one document. A unit test
  validates every operation against the schema and checks the results equal what the `DataSource` returns.
- **It's also a usable public API** over the same data, snapshot or live.

**What's deliberately left out:**
- **Apollo and urql.** Each tab sends one query and needs no normalized cache. A ~20-line typed fetch helper plus a
  tiny external store (`useSyncExternalStore`) is enough.
- **Codegen.** The fragments select whole view types, so the existing TypeScript types are the result types, and the
  unit test above guarantees they match the schema. Revisit codegen if fragments start selecting partial types.

## Guard rails

- Query depth (8) and complexity (300) limits are custom graphql-js validation rules; aliasing `dashboard` 20 times
  is refused.
- Queries are capped at 8 KB, and batching is off.
- Introspection is off in production, and so are "Did you mean …" field suggestions. GraphiQL runs in development
  only.
- Errors are masked: no stack traces or SQL text in responses.
- Filter input is validated with the URL's rules, but strictly (`parseFiltersStrict`): an invalid month, country,
  category or a reversed range is a `BAD_USER_INPUT` error, not quietly different data. The URL keeps falling back to
  defaults so shared links always render. The summary route uses the same strict check.
- `Cache-Control: public, s-maxage=86400, stale-while-revalidate` applies to successful GET queries only;
  everything else gets `no-store`.

## Consequences

- One more endpoint to secure and keep in step with the `DataSource`. The schema test keeps them aligned.
- The charts became client components fed by props. The world map stays server-drawn: the client colours its paths
  through a scoped stylesheet, so no path data travels as JSON.
- If the GraphQL request fails, the page does a normal navigation and the server renders the new filters, so the
  dashboard keeps working without the API.
- Larry's Secret stays in-browser: its data is small, and instant filtering without a server is the point of that
  rebuild.

**Revisit if** filters change often enough that per-filter CDN caching stops hitting, the snapshot outgrows ~2 MB, or
other pages need the same data (then the GraphQL layer would move to a shared API).
