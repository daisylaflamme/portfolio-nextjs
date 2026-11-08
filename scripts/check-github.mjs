// Checks GITHUB_TOKEN against the same query the home page runs, and says exactly
// what's wrong if it fails. Reads .env.local when present.
//   npm run github:check
import { fetchRepoLanguages, GITHUB_LOGIN, languageRanges } from "../src/lib/github.ts";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN isn't set. Add it to .env.local (see README) and run again.");
  process.exit(1);
}
if (!token.startsWith("github_pat_")) {
  console.warn("Note: this isn't a fine-grained token (they start with github_pat_). It may still work.\n");
}

try {
  const data = await fetchRepoLanguages(token);
  const repos = data.user?.repositories.nodes ?? [];
  const ranges = languageRanges(data);
  console.log(`OK: read ${repos.length} public repositories for ${GITHUB_LOGIN}.`);
  for (const range of ranges) {
    console.log(`
${range.label}:`);
    for (const { name, pct } of range.languages) console.log(`  ${name.padEnd(12)} ${pct}%`);
  }
  if (ranges.length === 0) console.log("No language data; the home page will show sample data.");
} catch (error) {
  console.error(`Failed (${error.kind ?? "error"}): ${error.message}`);
  // exitCode, not exit(): exiting with a fetch still closing crashes Node on Windows.
  process.exitCode = 1;
}
