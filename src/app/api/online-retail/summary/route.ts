import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { createClaudeStreamer, summaryModel } from "@/lib/dashboards/online-retail/summary/claude";
import { MemoryCache, MemoryDailyCap, RateLimiter } from "@/lib/dashboards/online-retail/summary/guards";
import { handleSummary, type SummaryDeps } from "@/lib/dashboards/online-retail/summary/handler";

/**
 * "Summarize this view" for the Online Retail dashboard. POST { tab, filters } only: the
 * server recomputes that view's numbers and sends just those totals to Claude. Disabled
 * (404) unless ANTHROPIC_API_KEY is set. Logic and guards: src/lib/dashboards/online-retail/summary/.
 */
export const runtime = "nodejs";

let deps: SummaryDeps | null = null;

function getDeps(): SummaryDeps {
  deps ??= {
    source: getOnlineRetailSource(),
    model: summaryModel(),
    streamer: createClaudeStreamer(),
    cache: new MemoryCache(),
    limiter: new RateLimiter(),
    cap: new MemoryDailyCap(),
  };
  return deps;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return new Response("Not found", { status: 404 });
  return handleSummary(request, getDeps());
}
