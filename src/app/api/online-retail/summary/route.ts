import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { poolRunner, writeTransaction } from "@/lib/dashboards/online-retail/postgresSource";
import { createClaudeStreamer, summaryModel } from "@/lib/dashboards/online-retail/summary/claude";
import { MemoryCache, MemoryDailyCap, RateLimiter } from "@/lib/dashboards/online-retail/summary/guards";
import { handleSummary, type SummaryDeps } from "@/lib/dashboards/online-retail/summary/handler";
import { summariesEnabled } from "@/lib/dashboards/online-retail/summary/enabled";
import { FallbackDailyCap, PostgresCache, PostgresDailyCap } from "@/lib/dashboards/online-retail/summary/store";

/**
 * "Summarize this view" for the Online Retail dashboard. POST { tab, filters } only: the
 * server recomputes that view's numbers and sends just those totals to Claude. Disabled
 * (404) unless ANTHROPIC_API_KEY is set. With the live database, the cache and daily cap are
 * shared through Postgres; otherwise they live in this instance's memory.
 * Logic and guards: src/lib/dashboards/online-retail/summary/.
 */
export const runtime = "nodejs";

let deps: SummaryDeps | null = null;

function getDeps(): SummaryDeps {
  if (deps) return deps;
  const url = process.env.ONLINE_RETAIL_DATABASE_URL?.trim();
  const shared = url ? { read: poolRunner(url), write: writeTransaction(url) } : null;
  deps = {
    source: getOnlineRetailSource(),
    model: summaryModel(),
    streamer: createClaudeStreamer(),
    cache: shared ? new PostgresCache(shared.read, shared.write) : new MemoryCache(),
    limiter: new RateLimiter(),
    cap: shared ? new FallbackDailyCap(new PostgresDailyCap(shared.write), new MemoryDailyCap()) : new MemoryDailyCap(),
  };
  return deps;
}

export async function POST(request: Request) {
  if (!summariesEnabled()) return new Response("Not found", { status: 404 });
  return handleSummary(request, getDeps());
}
