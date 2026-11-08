/**
 * Language breakdown for the home page card.
 *
 * With a GITHUB_TOKEN env var (a fine-grained token with public read access is enough),
 * this queries the GitHub GraphQL API once a day (ISR) and aggregates language bytes
 * across my own non-fork repositories. Without a token, or if the request fails,
 * it returns clearly labelled sample data so the page still renders.
 */

const GITHUB_LOGIN = "daisylaflamme";
const REVALIDATE_SECONDS = 60 * 60 * 24;
const TOP_N = 5;

export const SAMPLE_LANGUAGES = [
  { name: "TypeScript", pct: 42 },
  { name: "JavaScript", pct: 28 },
  { name: "CSS", pct: 14 },
  { name: "HTML", pct: 9 },
  { name: "Python", pct: 7 },
];

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
        nodes {
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name } }
          }
        }
      }
    }
  }
`;

/**
 * @returns {Promise<{ languages: { name: string, pct: number }[], isSample: boolean }>}
 */
export async function getLanguageStats() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { languages: SAMPLE_LANGUAGES, isSample: true };

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_LOGIN } }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);

    const json = await res.json();
    const repos = json?.data?.user?.repositories?.nodes ?? [];
    const totals = new Map();
    for (const repo of repos) {
      for (const edge of repo?.languages?.edges ?? []) {
        const name = edge?.node?.name;
        if (!name) continue;
        totals.set(name, (totals.get(name) ?? 0) + (edge.size ?? 0));
      }
    }

    const sum = [...totals.values()].reduce((a, b) => a + b, 0);
    if (sum === 0) return { languages: SAMPLE_LANGUAGES, isSample: true };

    const languages = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([name, size]) => ({ name, pct: Math.max(1, Math.round((size / sum) * 100)) }));

    return { languages, isSample: false };
  } catch {
    return { languages: SAMPLE_LANGUAGES, isSample: true };
  }
}
