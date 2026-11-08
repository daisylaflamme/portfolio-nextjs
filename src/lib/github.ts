/**
 * Language breakdown for the home page card.
 *
 * With a GITHUB_TOKEN env var (a fine-grained token with public read-only access is
 * enough; see README), this queries the GitHub GraphQL API and aggregates language
 * bytes across my own public, non-fork repositories pushed in the last few years.
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
/** Older repos (2012–2014 coursework) aren't representative of what I write now. */
export const RECENT_YEARS = 3;

export interface LanguageShare {
  name: string;
  /** Whole-number percentage of bytes across repositories. */
  pct: number;
}

export interface LanguageStats {
  languages: LanguageShare[];
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
 * Top languages by bytes across repos pushed since `since`, as whole percentages.
 * Returns an empty list when there's nothing to count.
 */
export function aggregateLanguages(data: LanguagesQueryData, since: Date, topN = TOP_N): LanguageShare[] {
  const totals = new Map<string, number>();
  for (const repo of data.user?.repositories.nodes ?? []) {
    if (!repo?.pushedAt || new Date(repo.pushedAt) < since) continue;
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

/** The date RECENT_YEARS before `now`. */
export function recentCutoff(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - RECENT_YEARS);
  return cutoff;
}

/** Never throws: falls back to labelled sample data and logs why. */
export async function getLanguageStats(now: Date = new Date()): Promise<LanguageStats> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { languages: SAMPLE_LANGUAGES, isSample: true };

  try {
    const languages = aggregateLanguages(await fetchRepoLanguages(token), recentCutoff(now));
    if (languages.length === 0) {
      console.warn("[github] No language data in recent repositories; showing sample data.");
      return { languages: SAMPLE_LANGUAGES, isSample: true };
    }
    return { languages, isSample: false };
  } catch (error) {
    console.error(`[github] ${error instanceof Error ? error.message : String(error)}; showing sample data.`);
    return { languages: SAMPLE_LANGUAGES, isSample: true };
  }
}
