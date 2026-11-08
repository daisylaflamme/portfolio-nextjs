import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import {
  aggregateLanguages,
  fetchRepoLanguages,
  getLanguageStats,
  GitHubApiError,
  GITHUB_LOGIN,
  LANGUAGES_QUERY,
  recentCutoff,
  SAMPLE_LANGUAGES,
  type GraphQLResponse,
  type LanguagesQueryData,
} from "./github.ts";

const NOW = new Date("2026-11-08T00:00:00Z");

/** Shaped like a real response: two recent repos, one 2013 repo that must not count, and the nulls the schema allows. */
const RESPONSE: GraphQLResponse<LanguagesQueryData> = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "js-in-colors",
            pushedAt: "2026-11-07T10:00:00Z",
            languages: {
              edges: [
                { size: 600, node: { name: "TypeScript" } },
                { size: 80, node: { name: "SCSS" } },
                { size: 20, node: { name: "HTML" } },
              ],
            },
          },
          {
            name: "wishwave-gif",
            pushedAt: "2026-10-25T10:00:00Z",
            languages: {
              edges: [
                { size: 200, node: { name: "TypeScript" } },
                { size: 60, node: { name: "JavaScript" } },
                { size: 40, node: { name: "CSS" } },
                null,
              ],
            },
          },
          { name: "empty", pushedAt: "2026-01-01T00:00:00Z", languages: { edges: [] } },
          { name: "never-pushed", pushedAt: null, languages: null },
          null,
          {
            name: "dwa",
            pushedAt: "2013-10-21T00:00:00Z",
            languages: { edges: [{ size: 6_000_000, node: { name: "PHP" } }] },
          },
        ],
      },
    },
  },
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" }, ...init });
}

function mockFetch(impl: () => Promise<Response>) {
  return mock.method(globalThis, "fetch", impl);
}

describe("aggregateLanguages", () => {
  it("sums bytes across recent repos and returns whole percentages, largest first", () => {
    assert.deepEqual(aggregateLanguages(RESPONSE.data!, recentCutoff(NOW)), [
      { name: "TypeScript", pct: 80 },
      { name: "SCSS", pct: 8 },
      { name: "JavaScript", pct: 6 },
      { name: "CSS", pct: 4 },
      { name: "HTML", pct: 2 },
    ]);
  });

  it("ignores repos last pushed before the cutoff", () => {
    const all = aggregateLanguages(RESPONSE.data!, new Date(0));
    assert.equal(all[0].name, "PHP");
    assert.ok(!aggregateLanguages(RESPONSE.data!, recentCutoff(NOW)).some((l) => l.name === "PHP"));
  });

  it("returns an empty list when there is nothing to count", () => {
    assert.deepEqual(aggregateLanguages({ user: { repositories: { nodes: [] } } }, recentCutoff(NOW)), []);
    assert.deepEqual(aggregateLanguages({ user: null }, recentCutoff(NOW)), []);
  });
});

describe("fetchRepoLanguages", () => {
  afterEach(() => mock.restoreAll());

  it("posts the typed query with the login and a bearer token", async () => {
    const fetchMock = mockFetch(async () => jsonResponse(RESPONSE));
    const data = await fetchRepoLanguages("test-token");

    assert.equal(data.user?.repositories.nodes?.length, 6);
    const [url, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit];
    assert.equal(url, "https://api.github.com/graphql");
    assert.equal(init.method, "POST");
    assert.equal((init.headers as Record<string, string>).Authorization, "Bearer test-token");
    assert.deepEqual(JSON.parse(init.body as string), { query: LANGUAGES_QUERY, variables: { login: GITHUB_LOGIN } });
  });

  const failures: Array<[string, () => Promise<Response>, GitHubApiError["kind"], RegExp]> = [
    ["a rejected token", async () => jsonResponse({ message: "Bad credentials" }, { status: 401 }), "http", /401.*expired or revoked/],
    [
      "the REST-style rate limit",
      async () => jsonResponse({}, { status: 403, headers: { "x-ratelimit-remaining": "0" } }),
      "rate-limit",
      /rate limit/,
    ],
    [
      "a GraphQL rate limit",
      async () => jsonResponse({ errors: [{ type: "RATE_LIMITED", message: "API rate limit exceeded" }] }),
      "rate-limit",
      /RATE_LIMITED/,
    ],
    [
      "an unknown user",
      async () => jsonResponse({ data: { user: null }, errors: [{ type: "NOT_FOUND", message: "Could not resolve to a User" }] }),
      "not-found",
      /NOT_FOUND/,
    ],
    [
      "a token without access",
      async () => jsonResponse({ errors: [{ type: "FORBIDDEN", message: "Resource not accessible by personal access token" }] }),
      "graphql",
      /not accessible/,
    ],
    ["a body that isn't JSON", async () => new Response("<html>", { status: 200 }), "graphql", /isn't JSON/],
    ["a network failure", async () => Promise.reject(new TypeError("fetch failed")), "network", /fetch failed/],
    [
      "a timeout",
      async () => Promise.reject(Object.assign(new Error("aborted"), { name: "TimeoutError" })),
      "network",
      /timed out/,
    ],
  ];

  for (const [label, impl, kind, message] of failures) {
    it(`throws a "${kind}" GitHubApiError for ${label}`, async () => {
      mockFetch(impl);
      await assert.rejects(fetchRepoLanguages("test-token"), (error: unknown) => {
        assert.ok(error instanceof GitHubApiError);
        assert.equal(error.kind, kind);
        assert.match(error.message, message);
        return true;
      });
    });
  }
});

describe("getLanguageStats", () => {
  const savedToken = process.env.GITHUB_TOKEN;
  beforeEach(() => {
    process.env.GITHUB_TOKEN = "test-token";
    mock.method(console, "error", () => {});
    mock.method(console, "warn", () => {});
  });
  afterEach(() => {
    mock.restoreAll();
    if (savedToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = savedToken;
  });

  it("returns live data from a mocked response", async () => {
    mockFetch(async () => jsonResponse(RESPONSE));
    const stats = await getLanguageStats(NOW);
    assert.equal(stats.isSample, false);
    assert.deepEqual(stats.languages[0], { name: "TypeScript", pct: 80 });
  });

  it("uses sample data without a token and doesn't call GitHub", async () => {
    delete process.env.GITHUB_TOKEN;
    const fetchMock = mockFetch(async () => jsonResponse(RESPONSE));
    assert.deepEqual(await getLanguageStats(NOW), { languages: SAMPLE_LANGUAGES, isSample: true });
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("falls back to sample data and logs the reason when GitHub fails", async () => {
    mockFetch(async () => jsonResponse({ message: "Bad credentials" }, { status: 401 }));
    assert.deepEqual(await getLanguageStats(NOW), { languages: SAMPLE_LANGUAGES, isSample: true });
    const logged = (console.error as unknown as ReturnType<typeof mock.fn>).mock.calls[0].arguments[0];
    assert.match(String(logged), /\[github\] GitHub GraphQL HTTP 401/);
  });

  it("falls back to sample data when no recent repo has language data", async () => {
    mockFetch(async () => jsonResponse({ data: { user: { repositories: { nodes: [] } } } }));
    assert.deepEqual(await getLanguageStats(NOW), { languages: SAMPLE_LANGUAGES, isSample: true });
  });
});
