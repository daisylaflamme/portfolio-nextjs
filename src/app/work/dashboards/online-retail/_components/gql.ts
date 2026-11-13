import { GRAPHQL_ENDPOINT } from "@/lib/dashboards/online-retail/graphql/endpoint";

/**
 * A small typed GraphQL fetch: GET (so the CDN can cache each filter combination), JSON
 * variables in the URL, and an error when the response has any `errors`, so a caller never
 * renders partial data. The type parameter is the operation's result type from
 * graphql/operations.ts (tests check those types match the schema's results).
 */
export async function gqlFetch<T>(query: string, variables: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const url = new URL(GRAPHQL_ENDPOINT, window.location.origin);
  url.searchParams.set("query", query);
  url.searchParams.set("variables", JSON.stringify(variables));
  const res = await fetch(url, { headers: { accept: "application/graphql-response+json, application/json" }, signal });
  const body = (await res.json().catch(() => null)) as { data?: T; errors?: { message: string }[] } | null;
  if (!res.ok || !body || body.errors?.length || !body.data) {
    throw new Error(body?.errors?.[0]?.message ?? `GraphQL request failed (${res.status})`);
  }
  return body.data;
}
