import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { PAGES } from "@/lib/seo";
import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import {
  ONLINE_RETAIL_DATA_NOTE,
  ONLINE_RETAIL_INTRO,
  ONLINE_RETAIL_TITLE,
} from "@/lib/dashboards/online-retail/content";
import { monthLabel } from "@/lib/dashboards/online-retail/format";
import DashboardControls from "./_components/DashboardControls";
import SourceBadge from "./_components/SourceBadge";

/** Breadcrumb, intro, section tabs, filters and the data note, around every tab. */
export default async function OnlineRetailLayout({ children }: { children: ReactNode }) {
  const source = getOnlineRetailSource();
  const { meta } = source;
  const kind = await source.status();
  const first = meta.months[0];
  const last = meta.months[meta.months.length - 1];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link href={PAGES.work.path} className="inline-flex min-h-11 items-center underline hover:text-fg">
              Work
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={PAGES.dashboards.path} className="inline-flex min-h-11 items-center underline hover:text-fg">
              Dashboards
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="text-fg">
              Online retail
            </span>
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <p className="font-mono text-[13px] text-accent">{"// data dashboard · 1M+ invoice lines"}</p>
        <h1 className="font-display text-[clamp(2rem,5vw,2.9rem)] font-bold leading-[1.08] tracking-tight text-fg">
          {ONLINE_RETAIL_TITLE}
        </h1>
        <p className="max-w-[72ch] text-[17px] leading-relaxed text-muted">{ONLINE_RETAIL_INTRO}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>
            {monthLabel(first)} – {monthLabel(last)} · GBP
          </span>
          <SourceBadge kind={kind} />
        </p>
      </header>

      {/* useSearchParams needs a Suspense boundary; the fallback keeps the controls' height. */}
      <Suspense fallback={<div className="min-h-[13rem] sm:min-h-[7.5rem]" />}>
        <DashboardControls meta={meta} />
      </Suspense>

      {children}

      <p className="text-xs leading-relaxed text-muted" data-source-note>
        {ONLINE_RETAIL_DATA_NOTE}
      </p>
    </main>
  );
}
