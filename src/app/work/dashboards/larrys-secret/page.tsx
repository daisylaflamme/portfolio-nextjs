import type { Metadata } from "next";
import Link from "next/link";
import { PAGES, pageMetadata } from "@/lib/seo";
import { larrysData, toClientData } from "@/lib/dashboards/larrys/data";
import { RETAIL_DASHBOARD_SOURCE } from "@/lib/dashboards/larrys/content";
import { count, shortDate } from "@/lib/dashboards/larrys/format";
import { DashboardProvider } from "./_components/DashboardProvider";
import StoreFilter from "./_components/StoreFilter";
import KpiTiles from "./_components/KpiTiles";
import DailyRevenueChart from "./_components/DailyRevenueChart";
import StoreBars from "./_components/StoreBars";
import LoyaltyMap from "./_components/LoyaltyMap";
import ThenNow from "./_components/ThenNow";
import { BasketMatrix, DiscountSimulator, PricePointChart, ProductBars } from "./_components/LazyCharts";

export const metadata: Metadata = pageMetadata(PAGES.retailDashboard);

/** The three questions from Larry's brief, listed under the intro. */
const BRIEF_QUESTIONS = [
  "Which stores and products drive revenue and margin?",
  "What do customers buy together?",
  "Which loyalty customers should get a discount, and how big?",
];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RetailDashboardPage({ searchParams }: PageProps) {
  // The filters live in the query string; awaiting it renders each shared link on the
  // server with its own state (the client reads the same values with useSearchParams).
  await searchParams;
  const { meta, stores, skus } = larrysData;

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
              Retail sales
            </span>
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <p className="font-mono text-[13px] text-accent">{"// data case study · retail analytics"}</p>
        <h1 className="font-display text-[clamp(2rem,5vw,2.9rem)] font-bold leading-[1.08] tracking-tight text-fg">
          Larry’s Secret: retail sales dashboard
        </h1>
        <p className="max-w-[70ch] text-[17px] leading-relaxed text-muted">
          Larry’s Secret is a five-store clothing chain around Boston. Larry needed to know where to focus: which stores and
          products were pulling their weight, what his customers bought together, and whether a loyalty discount would help
          or just give away margin. He shared four weeks of register receipts from April 2012 and asked for a dashboard that
          answers three questions:
        </p>
        <ul aria-label="Questions the dashboard answers" className="flex max-w-[70ch] flex-col gap-1.5" data-brief-questions>
          {BRIEF_QUESTIONS.map((q) => (
            <li key={q} className="flex gap-3 text-[17px] leading-relaxed text-body">
              <span aria-hidden="true" className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{q}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          {shortDate(meta.dateRange[0])}–{shortDate(meta.dateRange[1]).replace(/^\w+ /, "")}, 2012 · {stores.length} stores ·{" "}
          {skus.length} products · {count(meta.transactions)} receipts
        </p>
      </header>

      <DashboardProvider data={toClientData(larrysData)}>
        <StoreFilter />
        <KpiTiles />

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <DailyRevenueChart />
          <StoreBars />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-2">
          <ProductBars />
          <BasketMatrix />
        </div>

        <DiscountSimulator />

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-2">
          <PricePointChart />
          <LoyaltyMap />
        </div>
      </DashboardProvider>

      <ThenNow />

      <p className="max-w-[70ch] text-[15px] leading-relaxed text-body" data-closing>
        What this gives Larry: a single view to compare stores, plan bundles around products bought together, and test
        discount rules before rolling them out.
      </p>

      <p className="text-xs leading-relaxed text-muted">{RETAIL_DASHBOARD_SOURCE}</p>
    </main>
  );
}
