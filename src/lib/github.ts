/**
 * Language breakdown for the home page card.
 *
 * With a GITHUB_TOKEN env var (a fine-grained token with public read-only access is
 * enough; see README), this queries the GitHub GraphQL API and aggregates language
 * bytes across my own public, non-fork repositories, for each range in LANGUAGE_RANGES
 * (repos pushed in the last 12 months, and all time), from one request.
 * The home page is regenerated once a day (ISR), so this runs at most once a day.
 *
 * Without a token, or if anything goes wrong, it returns clearly labelled sample data
 * so the page still renders; the reason is logged so it shows up in Vercel's logs.
 *
 * No path aliases or Next imports here: the unit test runs this file directly in Node.
 */

export const GITHUB_LOGIN = "daisylaflamme";
const ENDPOINT = "https://api.github.com/graphql";
const REVALIDATE_SECONDS = 60 * 60 * 24;
const TIMEOUT_MS = 8000;
const TOP_N = 5;
/** Ranges the chart can switch between, in display order; the first one with data is the default. */
export const LANGUAGE_RANGES = [
  { id: "12m", label: "Last 12 months", months: 12 },
  { id: "all", label: "All time", months: null },
] as const satisfies ReadonlyArray<{ id: string; label: string; months: number | null }>;

export type LanguageRangeId = (typeof LANGUAGE_RANGES)[number]["id"];

export interface LanguageShare {
  name: string;
  /** Whole-number percentage of bytes across repositories. */
  pct: number;
}

export interface LanguageRange {
  id: LanguageRangeId;
  label: string;
  languages: LanguageShare[];
}

export interface LanguageStats {
  /** In LANGUAGE_RANGES order; ranges with no data are left out. Sample data has one range. */
  ranges: LanguageRange[];
  isSample: boolean;
}

export const SAMPLE_LANGUAGES: LanguageShare[] = [
  { name: "TypeScript", pct: 42 },
  { name: "JavaScript", pct: 28 },
  { name: "CSS", pct: 14 },
  { name: "HTML", pct: 9 },
  { name: "Python", pct: 7 },
];

// ---------- Query and response types ----------

export const LANGUAGES_QUERY = /* GraphQL */ `
  query RepoLanguages($login: String!) {
    user(login: $login) {
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        privacy: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          pushedAt
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export interface LanguagesQueryVariables {
  login: string;
}

/** Mirrors the query above, with GitHub's schema nullability (`| null` where the schema allows it). */
export interface LanguagesQueryData {
  user: {
    repositories: {
      nodes: Array<{
        name: string;
        /** ISO 8601; null for a repo that has never been pushed to. */
        pushedAt: string | null;
        languages: {
          edges: Array<{ size: number; node: { name: string } } | null> | null;
        } | null;
      } | null> | null;
    };
  } | null;
}

export interface GraphQLError {
  message: string;
  type?: string;
  path?: Array<string | number>;
}

export interface GraphQLResponse<TData> {
  data?: TData | null;
  errors?: GraphQLError[];
}

// ---------- Errors ----------

export type GitHubErrorKind = "http" | "rate-limit" | "graphql" | "not-found" | "network";

export class GitHubApiError extends Error {
  readonly kind: GitHubErrorKind;
  readonly status?: number;

  constructor(kind: GitHubErrorKind, message: string, status?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.kind = kind;
    this.status = status;
  }
}

// ---------- Fetching ----------

/**
 * Runs the query and returns its data, or throws a GitHubApiError that says what went
 * wrong (bad token, rate limit, GraphQL error, unknown user, network or timeout).
 */
export async function fetchRepoLanguages(token: string, login = GITHUB_LOGIN): Promise<LanguagesQueryData> {
  const variables: LanguagesQueryVariables = { login };
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio-nextjs",
      },
      body: JSON.stringify({ query: LANGUAGES_QUERY, variables }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError" ? `timed out after ${TIMEOUT_MS}ms` : String(error);
    throw new GitHubApiError("network", `GitHub GraphQL request failed: ${reason}`);
  }

  if (!res.ok) {
    const rateLimited = res.status === 429 || (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0");
    if (rateLimited) {
      throw new GitHubApiError("rate-limit", `GitHub GraphQL rate limit reached (HTTP ${res.status})`, res.status);
    }
    const hint = res.status === 401 ? " (token missing, expired or revoked)" : "";
    throw new GitHubApiError("http", `GitHub GraphQL HTTP ${res.status}${hint}`, res.status);
  }

  let json: GraphQLResponse<LanguagesQueryData>;
  try {
    json = (await res.json()) as GraphQLResponse<LanguagesQueryData>;
  } catch {
    throw new GitHubApiError("graphql", "GitHub GraphQL returned a body that isn't JSON");
  }

  // GraphQL reports most problems with HTTP 200 and an `errors` array.
  if (json.errors?.length) {
    const messages = json.errors.map((e) => (e.type ? `${e.type}: ${e.message}` : e.message)).join("; ");
    if (json.errors.some((e) => e.type === "RATE_LIMITED")) throw new GitHubApiError("rate-limit", messages);
    if (json.errors.some((e) => e.type === "NOT_FOUND")) throw new GitHubApiError("not-found", messages);
    throw new GitHubApiError("graphql", messages);
  }
  if (!json.data?.user) throw new GitHubApiError("not-found", `No GitHub user "${login}"`);
  return json.data;
}

// ---------- Aggregation ----------

/**
 * Top languages by bytes, as whole percentages. With `since`, only repos pushed on or
 * after that date count; null counts every repo. Returns an empty list when there's nothing to count.
 */
export function aggregateLanguages(data: LanguagesQueryData, since: Date | null, topN = TOP_N): LanguageShare[] {
  const totals = new Map<string, number>();
  for (const repo of data.user?.repositories.nodes ?? []) {
    if (!repo) continue;
    if (since && (!repo.pushedAt || new Date(repo.pushedAt) < since)) continue;
    for (const edge of repo.languages?.edges ?? []) {
      if (!edge) continue;
      totals.set(edge.node.name, (totals.get(edge.node.name) ?? 0) + edge.size);
    }
  }

  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (sum === 0) return [];

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, size]) => ({ name, pct: Math.max(1, Math.round((size / sum) * 100)) }));
}

/** The date `months` before `now`, or null (no cutoff) when months is null. */
export function rangeCutoff(months: number | null, now: Date = new Date()): Date | null {
  if (months === null) return null;
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months);
  return cutoff;
}

/** Every range that has data, in LANGUAGE_RANGES order. */
export function languageRanges(data: LanguagesQueryData, now: Date = new Date()): LanguageRange[] {
  return LANGUAGE_RANGES.flatMap(({ id, label, months }) => {
    const languages = aggregateLanguages(data, rangeCutoff(months, now));
    return languages.length > 0 ? [{ id, label, languages }] : [];
  });
}

const SAMPLE_STATS: LanguageStats = {
  // Sample data isn't tied to a time range, so it's labelled as all time.
  ranges: [{ id: "all", label: "All time", languages: SAMPLE_LANGUAGES }],
  isSample: true,
};

/** Never throws: falls back to labelled sample data and logs why. */
export async function getLanguageStats(now: Date = new Date()): Promise<LanguageStats> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return SAMPLE_STATS;

  try {
    const ranges = languageRanges(await fetchRepoLanguages(token), now);
    if (ranges.length === 0) {
      console.warn("[github] No language data in any repository; showing sample data.");
      return SAMPLE_STATS;
    }
    return { ranges, isSample: false };
  } catch (error) {
    console.error(`[github] ${error instanceof Error ? error.message : String(error)}; showing sample data.`);
    return SAMPLE_STATS;
  }
}
