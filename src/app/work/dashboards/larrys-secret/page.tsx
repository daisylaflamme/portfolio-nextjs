import type { Metadata } from "next";
import Link from "next/link";
import { PAGES, pageMetadata } from "@/lib/seo";
import { larrysData } from "@/lib/dashboards/larrys/data";
import { RETAIL_DASHBOARD_SOURCE } from "@/lib/dashboards/larrys/content";
import { count, shortDate } from "@/lib/dashboards/larrys/format";
import { DashboardProvider } from "./_components/DashboardProvider";
import StoreFilter from "./_components/StoreFilter";
import KpiTiles from "./_components/KpiTiles";
import DailyRevenueChart from "./_components/DailyRevenueChart";
import StoreBars from "./_components/StoreBars";
import ProductBars from "./_components/ProductBars";
import LoyaltyMap from "./_components/LoyaltyMap";
import ThenNow from "./_components/ThenNow";
import { BasketMatrix, DiscountSimulator, PricePointChart } from "./_components/LazyCharts";

export const metadata: Metadata = pageMetadata(PAGES.retailDashboard);

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
        <p className="font-mono text-[13px] text-accent">{"// data case study · 2013 Tableau → 2026 React + D3"}</p>
        <h1 className="font-display text-[clamp(2rem,5vw,2.9rem)] font-bold leading-[1.08] tracking-tight text-fg">
          Retail sales dashboard
        </h1>
        <p className="max-w-[70ch] text-[17px] leading-relaxed text-muted">
          A clothing chain’s April 2012 sales, rebuilt from my 2013 Tableau work for UMass Boston’s Business Intelligence
          course (IT 478) as an accessible, interactive dashboard. Filter by store, explore what shoppers buy together, and
          test the discount rules.
        </p>
        <p className="text-sm text-muted">
          {shortDate(meta.dateRange[0])}–{shortDate(meta.dateRange[1]).replace(/^\w+ /, "")}, 2012 · {stores.length} stores ·{" "}
          {skus.length} products · {count(meta.transactions)} transactions · anonymized course data
        </p>
      </header>

      <DashboardProvider>
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

      <p className="text-xs leading-relaxed text-muted">Source: {RETAIL_DASHBOARD_SOURCE}</p>
    </main>
  );
}
