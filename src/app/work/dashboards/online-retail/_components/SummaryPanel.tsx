"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ONLINE_RETAIL_TABS, tabPath, type TabId } from "@/lib/dashboards/online-retail/content";
import { filtersToInput } from "@/lib/dashboards/online-retail/graphql/operations";
import type { DashboardMeta } from "@/lib/dashboards/online-retail/types";
import { useFilters } from "./useFilters";

export const SUMMARY_ENDPOINT = "/api/online-retail/summary";

type Status = "idle" | "streaming" | "done" | "stopped" | "error";

interface SummaryState {
  /** Which view (tab + filters) the summary belongs to; a different view shows idle. */
  key: string;
  status: Status;
  text: string;
  cached: boolean;
  error: string;
}

const IDLE: SummaryState = { key: "", status: "idle", text: "", cached: false, error: "" };

type SummaryEvent = { type: "text"; text: string } | { type: "done"; cached: boolean } | { type: "error"; message: string };

/**
 * "Summarize this view". The browser sends only the tab and the filters; the server recomputes
 * the numbers and asks Claude for 3–4 sentences, streamed back as NDJSON. The output region
 * is aria-live and aria-busy while streaming, so screen readers read the finished text once.
 * One action button changes between summarize, stop and retry, so focus stays put.
 */
export default function SummaryPanel({ meta }: { meta: DashboardMeta }) {
  const pathname = usePathname();
  const { filters, query } = useFilters(meta);
  const tab = ONLINE_RETAIL_TABS.find((t) => tabPath(t) === pathname) ?? ONLINE_RETAIL_TABS[0];
  const viewKey = `${tab.id}${query}`;
  const [state, setState] = useState<SummaryState>(IDLE);
  const controller = useRef<AbortController | null>(null);
  // A summary of another view (the filters or tab changed) isn't shown.
  const current = state.key === viewKey ? state : IDLE;
  const streaming = current.status === "streaming";

  async function summarize(id: TabId) {
    controller.current?.abort();
    const ac = new AbortController();
    controller.current = ac;
    const key = viewKey;
    setState({ key, status: "streaming", text: "", cached: false, error: "" });
    const fail = (error: string) => setState((s) => (s.key === key ? { ...s, status: "error", error } : s));
    try {
      const res = await fetch(SUMMARY_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tab: id, filters: filtersToInput(meta, filters) }),
        signal: ac.signal,
      });
      if (!res.body) return fail("The summary couldn’t be loaded. Try again.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as SummaryEvent;
          if (event.type === "text") setState((s) => (s.key === key ? { ...s, text: s.text + event.text } : s));
          else if (event.type === "done") {
            finished = true;
            setState((s) => (s.key === key ? { ...s, status: "done", cached: event.cached } : s));
          } else {
            finished = true;
            fail(event.message);
          }
        }
      }
      if (!finished) fail(res.ok ? "The summary stopped early. Try again." : "The summary couldn’t be loaded. Try again.");
    } catch (error) {
      if (ac.signal.aborted) return;
      console.error("[online-retail] summary request failed", error);
      fail("The summary couldn’t be loaded. Check your connection and try again.");
    }
  }

  function stop() {
    controller.current?.abort();
    controller.current = null;
    setState((s) => (s.key === viewKey && s.status === "streaming" ? { ...s, status: "stopped" } : s));
  }

  const action = streaming ? "stop" : current.status === "error" ? "retry" : "summarize";

  return (
    <section aria-labelledby="ai-summary-title" className="flex flex-wrap items-start gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5" data-summary-panel>
      <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-2">
        <p className="font-mono text-[13px] text-accent">{"// ai summary"}</p>
        <h2 id="ai-summary-title" className="font-display text-lg font-semibold leading-snug text-fg sm:text-xl">
          Summarize this view
        </h2>
        <p className="text-sm text-muted">Claude reads only the totals on screen, never raw rows. Cached per filter.</p>
        <button
          type="button"
          onClick={() => (streaming ? stop() : void summarize(tab.id))}
          className={`mt-1 inline-flex min-h-11 items-center self-start rounded-lg px-4 font-mono text-[15px] ${
            streaming ? "border border-field text-fg hover:border-fg" : "bg-accent text-on-accent hover:opacity-90"
          }`}
          data-summary-action={action}
        >
          {action}
        </button>
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-busy={streaming}
        aria-label={`Summary of the ${tab.label} view`}
        className="min-h-24 min-w-0 flex-[2_1_22rem] rounded-xl border border-dashed border-field bg-surface-2 p-3.5 text-sm leading-relaxed"
        data-summary-output
        data-summary-status={current.status}
      >
        {current.status === "idle" ? (
          <p className="text-muted">A short summary of the current {tab.label.toLowerCase()} view appears here, written from the numbers shown above.</p>
        ) : null}
        {current.text ? <p className="whitespace-pre-line text-fg">{current.text}</p> : null}
        {streaming && !current.text ? <p className="text-muted">Writing…</p> : null}
        {current.status === "stopped" ? <p className="mt-2 font-mono text-xs text-muted">Stopped.</p> : null}
        {current.status === "done" ? (
          <p className="mt-2 font-mono text-xs text-muted">{current.cached ? "From the cache · " : ""}Written by Claude from the totals above.</p>
        ) : null}
        {current.status === "error" ? (
          <p className="mt-2 text-fg" data-summary-error>
            <span className="font-semibold">Couldn’t summarize: </span>
            {current.error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
