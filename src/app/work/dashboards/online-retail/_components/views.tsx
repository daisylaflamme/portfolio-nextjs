"use client";

import { useId, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { tabById, tabPath } from "@/lib/dashboards/online-retail/content";
import { countryLabel } from "@/lib/dashboards/online-retail/countries";
import { count, money, rangeLabel } from "@/lib/dashboards/online-retail/format";
import type {
  BasketData,
  CustomersData,
  OverviewData,
  ProductsData,
  ReturnsData,
} from "@/lib/dashboards/online-retail/graphql/operations";
import { serializeFilters } from "@/lib/dashboards/online-retail/params";
import { productShareFor } from "@/lib/dashboards/online-retail/selectors";
import type { DashboardMeta } from "@/lib/dashboards/online-retail/types";
import { useTabData } from "./dashboardStore";
import { ScopeNote, context, scope } from "./labels";
import KpiTiles from "./KpiTiles";
import MonthlyRevenueChart from "./MonthlyRevenueChart";
import CountryRevenue, { type WorldMap } from "./CountryRevenue";
import ParetoChart from "./ParetoChart";
import ProductTable from "./ProductTable";
import ProductSearch from "./ProductSearch";
import ProductMonthlyChart from "./ProductMonthlyChart";
import BasketMatrix from "./BasketMatrix";
import CohortHeatmap from "./CohortHeatmap";
import SegmentBars from "./SegmentBars";
import ReturnBars from "./ReturnBars";

/**
 * One client view per tab. Each starts from the server's data (first render and shared links)
 * and switches to the store's data after a filter change, which brings the whole tab in one
 * GraphQL request (the tab's operation in graphql/operations.ts). aria-busy marks the wait.
 */
function Busy({ pending, children, name }: { pending: boolean; children: ReactNode; name: string }) {
  return (
    <div className="flex flex-col gap-6" aria-busy={pending} data-tab-view={name}>
      {children}
    </div>
  );
}

const topCountryNote = (meta: DashboardMeta, country: string, what: string) =>
  ` ${what} covers all countries together and the top ${meta.topCountries.length} by revenue; ${countryLabel(country)} isn’t one of them, so all countries are shown.`;

export function OverviewView({ meta, initial, partialNote, map }: { meta: DashboardMeta; initial: OverviewData; partialNote: string; map: WorldMap }) {
  const { data, pending } = useTabData(useId(), "overview", initial);
  const { filters, kpis, monthlyRevenue, countries } = data.dashboard;
  return (
    <Busy pending={pending} name="overview">
      <KpiTiles kpis={kpis} categorySelected={filters.category !== "all"} />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <MonthlyRevenueChart
          meta={meta}
          points={monthlyRevenue}
          partialNote={partialNote}
          scopeLabel={`${scope(filters.country)}, ${filters.category === "all" ? "all categories" : filters.category}`}
        />
        <CountryRevenue rows={countries} selected={filters.country} context={context(filters)} map={map} />
      </div>
    </Busy>
  );
}

export function ProductsTabView({ meta, initial }: { meta: DashboardMeta; initial: ProductsData }) {
  const { data, pending } = useTabData(useId(), "products", initial);
  const search = useSearchParams();
  const { filters, topProducts: view, searchProducts: results, productMonthly: monthly } = data.dashboard;
  const live = data.source.status === "live";
  const q = (search.get("q") ?? "").trim().slice(0, 80);
  const product = search.get("product")?.trim().toUpperCase() || null;

  const years = view.fromYear === view.toYear ? String(view.fromYear) : `${view.fromYear}–${view.toYear}`;
  const period = view.rangeKind === "months" ? rangeLabel(filters.from, filters.to) : years;
  const where = scope(view.scope);
  const category = filters.category === "all" ? null : filters.category;
  const path = tabPath(tabById("products"));
  const filterPairs = [...new URLSearchParams(serializeFilters(meta, filters).slice(1))] as [string, string][];
  const productHref = (code: string) => {
    const qs = new URLSearchParams(filterPairs);
    if (q) qs.set("q", q);
    qs.set("product", code);
    return `${path}?${qs.toString()}`;
  };
  const hasSales = monthly?.months.some((m) => m.units > 0) ?? false;

  return (
    <Busy pending={pending} name="products">
      <ScopeNote>
        {view.rangeKind === "months"
          ? `Products are ranked for ${period} exactly${category ? `, within ${category}` : ""}.`
          : `Products are ranked by calendar year: ${years}, the years your From–To range touches.`}
        {view.exact
          ? null
          : ` For ${countryLabel(view.scope)}, totals add up each year’s top 200, so a product outside one year’s top 200 is undercounted, and there’s no 80/20 curve (it covers all countries and the top 5 only).`}
        {category && view.rangeKind === "years" ? ` The table shows ${category} only; the 80/20 view covers every category.` : null}
        {live ? null : " Searching every product needs the live database; this view uses the snapshot’s top products."}
      </ScopeNote>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        {live ? (
          <ProductSearch
            action={path}
            hidden={filterPairs}
            query={q}
            results={q ? (results ?? []) : null}
            selected={product}
            productHref={productHref}
            context={`${context(filters)}, ${where}`}
          />
        ) : null}
        {live && monthly && hasSales ? <ProductMonthlyChart product={monthly} where={where} /> : null}
        {live && monthly && !hasSales ? (
          <p role="status" className="text-sm text-muted">
            {monthly.description} ({monthly.code}) has no sales in {where}.
          </p>
        ) : null}
        {live && product && !monthly ? (
          <p role="status" className="text-sm text-muted">
            No product with code {product}.
          </p>
        ) : null}
        {view.curve && view.productCount ? (
          <ParetoChart curve={view.curve} productCount={view.productCount} share80={productShareFor(view.curve, 0.8)} context={`${where}, ${period}`} />
        ) : null}
        <ProductTable
          rows={view.rows}
          caption={`Top products by revenue, ${where}, ${period}${category ? `, ${category}` : ""}. Total revenue ${money(view.totalRevenue)}${view.productCount ? ` from ${count(view.productCount)} products` : ""}.`}
        />
      </div>
    </Busy>
  );
}

export function BasketTabView({ meta, initial }: { meta: DashboardMeta; initial: BasketData }) {
  const { data, pending } = useTabData(useId(), "basket", initial);
  const { filters, basket: view } = data.dashboard;
  return (
    <Busy pending={pending} name="basket">
      <ScopeNote>
        {view.live
          ? `The ten best-selling products for ${context(filters)}, ${scope(filters.country)}.`
          : "Baskets cover the whole period and every category, so From, To and Category don’t apply here."}
        {view.fallback ? topCountryNote(meta, filters.country, "Basket data") : null}
      </ScopeNote>
      <BasketMatrix view={view} where={scope(view.scope)} />
    </Busy>
  );
}

export function CustomersTabView({ meta, initial }: { meta: DashboardMeta; initial: CustomersData }) {
  const { data, pending } = useTabData(useId(), "customers", initial);
  const { filters, cohorts, segments } = data.dashboard;
  return (
    <Busy pending={pending} name="customers">
      <ScopeNote>
        {cohorts.live
          ? `Cohorts that first ordered in ${rangeLabel(filters.from, filters.to)}${filters.category === "all" ? "" : ` from ${filters.category}`}${filters.country === "all" ? "" : ` in ${countryLabel(filters.country)}`}, followed to the end of the range. Segments are scored over the whole period, all categories, by each customer’s first order country.`
          : `Cohorts that first ordered in ${rangeLabel(filters.from, filters.to)}, followed to the end of the range. Customer views count every category, and segments are scored over the whole period.`}
        {cohorts.fallback ? topCountryNote(meta, filters.country, "Customer data") : null}
      </ScopeNote>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <CohortHeatmap view={cohorts} where={scope(cohorts.scope)} />
        <SegmentBars view={segments} where={scope(segments.scope)} />
      </div>
    </Busy>
  );
}

export function ReturnsTabView({ initial }: { initial: ReturnsData }) {
  const { data, pending } = useTabData(useId(), "returns", initial);
  const { filters, returns } = data.dashboard;
  return (
    <Busy pending={pending} name="returns">
      <ReturnBars view={returns} selected={filters.country} context={context(filters)} />
    </Busy>
  );
}
