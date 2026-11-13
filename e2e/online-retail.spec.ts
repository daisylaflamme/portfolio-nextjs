import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PAGES } from "../src/lib/seo";
import { onlineRetailDashboard } from "../src/data/dashboards";
import {
  ONLINE_RETAIL_DATA_NOTE,
  ONLINE_RETAIL_TABS,
  ONLINE_RETAIL_TITLE,
  tabPath,
} from "../src/lib/dashboards/online-retail/content";
import { createSnapshotSource } from "../src/lib/dashboards/online-retail/snapshotSource";
import { defaultFilters, serializeFilters, slugify } from "../src/lib/dashboards/online-retail/params";
import { money, monthLabel, rangeLabel } from "../src/lib/dashboards/online-retail/format";
import type { Filters, OnlineRetailCategories, OnlineRetailSnapshot } from "../src/lib/dashboards/online-retail/types";
import { blockingViolations, collectErrors, useSavedTheme, type Theme } from "./helpers";

// Expected values come from the same snapshot and selectors the pages use.
// Playwright compiles specs to CommonJS, so no import.meta; resolve from the repo root.
const read = <T,>(file: string) => JSON.parse(readFileSync(join(process.cwd(), file), "utf8")) as T;
const source = createSnapshotSource(
  read<OnlineRetailSnapshot>("src/data/online-retail/snapshot.json"),
  read<OnlineRetailCategories>("src/data/online-retail/categories.json"),
);
const meta = source.meta;
const ALL_TIME = defaultFilters(meta);
const [, , , germany, france] = meta.topCountries;
const category = meta.categories[7];

/** Opens a tab and waits for the page to settle (hydrated, charts measured). */
async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(
    () =>
      document.querySelector('form[data-ready="true"]') !== null &&
      [...document.querySelectorAll("[data-chart]")].every((el) => el.getAttribute("data-chart-ready") === "true"),
  );
}

const field = (page: Page, name: string) => page.getByRole("form", { name: "Filters" }).getByRole("combobox", { name });
const revenueKpi = (page: Page) => page.locator('[data-kpi="revenue"] [data-kpi-value]');
const ordersKpi = (page: Page) => page.locator('[data-kpi="orders"] [data-kpi-value]');
const urlFor = (f: Filters, path = PAGES.onlineRetailDashboard.path) => `${path}${serializeFilters(meta, f)}`;

for (const tab of ONLINE_RETAIL_TABS) {
  test(`${tab.label} tab loads with tabs, filters and the data note, without horizontal scroll`, async ({ page }) => {
    const errors = collectErrors(page);
    await open(page, tabPath(tab));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(ONLINE_RETAIL_TITLE);
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("link", { name: "Dashboards" })).toHaveAttribute("href", PAGES.dashboards.path);
    const tabs = page.getByRole("navigation", { name: "Dashboard sections" });
    await expect(tabs.getByRole("link")).toHaveCount(ONLINE_RETAIL_TABS.length);
    await expect(tabs.getByRole("link", { name: tab.label })).toHaveAttribute("aria-current", "page");
    await expect(tabs.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(page.getByText(ONLINE_RETAIL_DATA_NOTE)).toBeVisible();
    // Tests run with no database URL, so every tab says it shows the snapshot.
    await expect(page.locator("[data-source-badge]")).toHaveAttribute("data-source-badge", "snapshot");
    await expect(page.locator("[data-source-badge]")).toHaveText(/snapshot$/);
    await expect(page).toHaveTitle(new RegExp(`^${tab.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("the overview KPIs match the data layer", async ({ page }) => {
  await open(page, PAGES.onlineRetailDashboard.path);
  const k = await source.kpis(ALL_TIME);
  await expect(page.locator("[data-kpi]")).toHaveCount(4);
  await expect(revenueKpi(page)).toContainText(money(k.current.revenue));
  await expect(ordersKpi(page)).toContainText(k.current.orders.toLocaleString("en-US"));
  // The data starts with the default range, so there is nothing to compare with.
  await expect(page.locator('[data-kpi="revenue"] [data-kpi-change]')).toHaveText("no earlier period to compare");
});

test("filters update the KPIs and the URL, and compare with the previous period", async ({ page }) => {
  await open(page, PAGES.onlineRetailDashboard.path);
  await field(page, "Country").selectOption(germany);
  await expect(page).toHaveURL(new RegExp(`[?&]country=${slugify(germany)}`));
  const de = await source.kpis({ ...ALL_TIME, country: germany });
  await expect(revenueKpi(page)).toContainText(money(de.current.revenue));

  await field(page, "From").selectOption("2011-01");
  await expect(page).toHaveURL(/[?&]from=2011-01/);
  await field(page, "To").selectOption("2011-06");
  await expect(page).toHaveURL(/[?&]to=2011-06/);
  const f: Filters = { from: "2011-01", to: "2011-06", country: germany, category: "all" };
  const k = await source.kpis(f);
  await expect(revenueKpi(page)).toContainText(money(k.current.revenue));
  const prev = k.previousRange;
  expect(prev).toEqual({ from: "2010-07", to: "2010-12" });
  await expect(page.locator('[data-kpi="revenue"] [data-kpi-change]')).toContainText(`vs ${rangeLabel(prev?.from ?? "", prev?.to ?? "")}`);

  await field(page, "Category").selectOption(category);
  await expect(page).toHaveURL(new RegExp(`[?&]category=${slugify(category)}`));
  const withCategory = await source.kpis({ ...f, category });
  await expect(revenueKpi(page)).toContainText(money(withCategory.current.revenue));

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page).toHaveURL(new RegExp(`${PAGES.onlineRetailDashboard.path}$`));
  await expect(revenueKpi(page)).toContainText(money((await source.kpis(ALL_TIME)).current.revenue));
});

test("filters persist across tabs through the query string", async ({ page }) => {
  const f: Filters = { from: "2010-03", to: "2011-02", country: france, category: "all" };
  await open(page, urlFor(f));
  const tabs = page.getByRole("navigation", { name: "Dashboard sections" });
  for (const tab of ONLINE_RETAIL_TABS.slice(1)) {
    await expect(tabs.getByRole("link", { name: tab.label })).toHaveAttribute("href", urlFor(f, tabPath(tab)));
  }
  await tabs.getByRole("link", { name: "Returns" }).click();
  await expect(page).toHaveURL(urlFor(f, tabPath(ONLINE_RETAIL_TABS[4])));
  await expect(field(page, "Country")).toHaveValue(france);
  await expect(field(page, "From")).toHaveValue("2010-03");
});

test("a shared link restores the view; invalid values fall back to defaults", async ({ page }) => {
  const f: Filters = { from: "2010-05", to: "2010-10", country: germany, category };
  await open(page, urlFor(f));
  await expect(field(page, "From")).toHaveValue(f.from);
  await expect(field(page, "To")).toHaveValue(f.to);
  await expect(field(page, "Country")).toHaveValue(germany);
  await expect(field(page, "Category")).toHaveValue(category);
  await expect(revenueKpi(page)).toContainText(money((await source.kpis(f)).current.revenue));

  await open(page, `${PAGES.onlineRetailDashboard.path}?from=1999-01&to=2011-02&country=atlantis&category=nope`);
  await expect(field(page, "From")).toHaveValue(ALL_TIME.from);
  await expect(field(page, "To")).toHaveValue("2011-02");
  await expect(field(page, "Country")).toHaveValue("all");
  await expect(field(page, "Category")).toHaveValue("all");
});

test("dragging across the monthly chart sets the date range", async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile || testInfo.project.name.includes("390"), "Pointer drag is checked at desktop width");
  await open(page, PAGES.onlineRetailDashboard.path);
  const chart = page.getByRole("img", { name: /^Line chart of monthly revenue/ });
  // Mouse coordinates are viewport-relative, so the chart must be on screen.
  await chart.scrollIntoViewIfNeeded();
  const box = await chart.boundingBox();
  if (!box) throw new Error("chart not visible");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * 0.4, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, y, { steps: 8 });
  await page.mouse.up();
  await expect(page).toHaveURL(/[?&]from=\d{4}-\d{2}&to=\d{4}-\d{2}/);
  const url = new URL(page.url());
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";
  expect(from < to).toBe(true);
  await expect(field(page, "From")).toHaveValue(from);
  await expect(revenueKpi(page)).toContainText(money((await source.kpis({ ...ALL_TIME, from, to })).current.revenue));
});

test("chart values are reachable by keyboard", async ({ page }) => {
  await open(page, PAGES.onlineRetailDashboard.path);
  const group = page.getByRole("group", { name: /^Monthly revenue values/ });
  const marks = group.locator("[data-mark]");
  await expect(marks).toHaveCount(meta.months.length);
  await marks.first().focus();
  await expect(group.locator("[data-tooltip]")).toContainText(monthLabel(meta.months[0]));
  await page.keyboard.press("ArrowRight");
  await expect(marks.nth(1)).toBeFocused();
});

test("every chart's data table toggles on every tab", async ({ page }) => {
  for (const tab of ONLINE_RETAIL_TABS) {
    await open(page, tabPath(tab));
    const toggles = page.getByRole("button", { name: "Show data table" });
    const n = await toggles.count();
    expect(n, tab.label).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const button = toggles.first();
      const id = await button.getAttribute("aria-controls");
      await button.click();
      await expect(page.locator(`[id="${id}"] table`)).toBeVisible();
    }
    const hide = page.getByRole("button", { name: "Hide data table" });
    await expect(hide).toHaveCount(n);
    await hide.first().click();
    await expect(page.getByRole("button", { name: "Show data table" })).toHaveCount(1);
  }
});

test("the overview country table and monthly table match the data", async ({ page }) => {
  await open(page, PAGES.onlineRetailDashboard.path);
  const toggles = page.getByRole("button", { name: "Show data table" });
  while ((await toggles.count()) > 0) await toggles.first().click();
  const countries = await source.countries(ALL_TIME);
  await expect(page.getByRole("table", { name: /^Revenue by country/ }).locator("tbody tr")).toHaveCount(countries.length);
  await expect(page.getByRole("table", { name: /^Monthly revenue and orders/ }).locator("tbody tr")).toHaveCount(meta.months.length);
});

test("products: Pareto summary and search", async ({ page }) => {
  await open(page, tabPath(ONLINE_RETAIL_TABS[1]));
  const view = await source.topProducts(ALL_TIME);
  await expect(page.getByRole("img", { name: /^Pareto chart of product revenue/ })).toBeVisible();
  const table = page.getByRole("table", { name: /^Top products by revenue/ });
  await expect(table.locator("tbody tr")).toHaveCount(view.rows.length);
  const word = "LANTERN";
  const matches = view.rows.filter((r) => r.description.toUpperCase().includes(word)).length;
  await page.getByRole("searchbox", { name: "Search products" }).fill("lantern");
  await expect(table.locator("tbody tr")).toHaveCount(matches);
  await expect(page.locator("[data-product-count]")).toContainText(`${matches} of ${view.rows.length}`);
});

test("products: live-only search and product sales stay hidden on the snapshot", async ({ page }) => {
  // Even with the live parameters in the URL, the snapshot page renders without them.
  await open(page, `${tabPath(ONLINE_RETAIL_TABS[1])}?q=lantern&product=85123A`);
  await expect(page.locator("[data-product-search]")).toHaveCount(0);
  await expect(page.getByRole("search", { name: "Find any product" })).toHaveCount(0);
  await expect(page.getByRole("img", { name: /^Line chart of monthly revenue for/ })).toHaveCount(0);
  await expect(page.locator("[data-scope-note]")).toContainText("needs the live database");
  // A filter change keeps the tab's own parameters.
  await field(page, "Country").selectOption(germany);
  await expect(page).toHaveURL(/country=germany.*q=lantern&product=85123A|q=lantern&product=85123A.*country=germany/);
});

test("basket: the matrix is a table with row and column headers", async ({ page }) => {
  await open(page, tabPath(ONLINE_RETAIL_TABS[2]));
  const view = await source.basket(ALL_TIME);
  const matrix = page.getByRole("region", { name: /Bought-together matrix/ }).getByRole("table");
  await expect(matrix.getByRole("columnheader")).toHaveCount(view.products.length);
  await expect(matrix.getByRole("rowheader")).toHaveCount(view.products.length);
});

test("customers and returns follow the filters, with notes where a filter doesn't apply", async ({ page }) => {
  const f: Filters = { from: "2010-01", to: "2010-06", country: germany, category: "all" };
  await open(page, urlFor(f, tabPath(ONLINE_RETAIL_TABS[3])));
  const cohorts = await source.cohorts(f);
  await expect(page.getByRole("region", { name: /Cohort retention table/ }).locator("tbody tr")).toHaveCount(cohorts.rows.length);
  await expect(page.locator("[data-scope-note]")).toContainText("segments are scored over the whole period");

  // A country without basket data falls back to all countries, and says so.
  const small = meta.countries.find((c) => !meta.topCountries.includes(c)) ?? "";
  await open(page, urlFor({ ...ALL_TIME, country: small }, tabPath(ONLINE_RETAIL_TABS[2])));
  await expect(page.locator("[data-scope-note]")).toContainText("so all countries are shown");

  await open(page, urlFor(ALL_TIME, tabPath(ONLINE_RETAIL_TABS[4])));
  const returns = await source.returns(ALL_TIME);
  await expect(page.getByText(`at least ${returns.minOrders} orders in the range`)).toBeVisible();
  await expect(page.getByRole("group", { name: /^Return rate values/ }).locator("[data-mark]")).toHaveCount(returns.rows.length);
});

test("the dashboards page shows the online retail card below Larry's", async ({ page }) => {
  await page.goto(PAGES.dashboards.path);
  const cards = page.locator("article").filter({ has: page.getByRole("link", { name: /^open dashboard/ }) });
  await expect(cards).toHaveCount(2);
  const card = cards.nth(1);
  await expect(card.getByRole("heading", { level: 2 })).toHaveText(onlineRetailDashboard.title);
  await expect(card.getByText(onlineRetailDashboard.summary)).toBeVisible();
  await expect(card.getByRole("link", { name: /^open dashboard/ })).toHaveAttribute("href", onlineRetailDashboard.href);
});

for (const theme of ["light", "dark"] as Theme[]) {
  for (const tab of ONLINE_RETAIL_TABS) {
    test(`${tab.label}: no serious or critical axe violations with tables open (${theme})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await useSavedTheme(page, theme);
      await open(page, urlFor({ ...ALL_TIME, country: germany }, tabPath(tab)));
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const toggles = page.getByRole("button", { name: "Show data table" });
      while ((await toggles.count()) > 0) await toggles.first().click();
      const mark = page.locator("[data-mark]").first();
      if (await mark.count()) await mark.focus();
      // Focusing scrolls the page; scroll back so the sticky header doesn't cover the filters for the target-size check.
      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await blockingViolations(page)).toEqual([]);
    });
  }
}
