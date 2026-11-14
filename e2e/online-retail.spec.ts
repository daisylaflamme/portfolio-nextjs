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
import { GRAPHQL_ENDPOINT } from "../src/lib/dashboards/online-retail/graphql/endpoint";
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
  const requests = trackRequests(page, PAGES.onlineRetailDashboard.path);
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
  // The drag goes through the same path as the selects: one GraphQL request, no server render.
  await expectOneGraphqlRequest(requests);
});

/**
 * Records, from now on, the GraphQL requests and the non-prefetch RSC requests (a server
 * render) for `path`. Next prefetches tab links with the RSC header too, so those are excluded.
 */
function trackRequests(page: Page, path: string) {
  const graphql: URL[] = [];
  const serverRenders: URL[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    const headers = r.headers();
    if (url.pathname === GRAPHQL_ENDPOINT) graphql.push(url);
    else if (url.pathname === path && headers["rsc"] && !headers["next-router-prefetch"]) serverRenders.push(url);
  });
  return { graphql, serverRenders };
}

async function expectOneGraphqlRequest(requests: ReturnType<typeof trackRequests>) {
  // Give any stray second request time to show up before counting.
  await new Promise((r) => setTimeout(r, 500));
  expect(requests.graphql).toHaveLength(1);
  expect(requests.serverRenders).toHaveLength(0);
}

test("a filter change refreshes every Overview chart with one GraphQL request", async ({ page }) => {
  await open(page, PAGES.onlineRetailDashboard.path);
  const requests = trackRequests(page, PAGES.onlineRetailDashboard.path);
  const response = page.waitForResponse((r) => new URL(r.url()).pathname === GRAPHQL_ENDPOINT);
  await field(page, "Country").selectOption(germany);

  const res = await response;
  expect(res.request().method()).toBe("GET");
  expect(res.status()).toBe(200);
  expect(res.headers()["cache-control"]).toContain("public");
  const variables = JSON.parse(new URL(res.url()).searchParams.get("variables") ?? "{}");
  expect(variables.filters).toEqual({ country: slugify(germany) });

  // Every chart on the tab shows Germany's numbers, from that one response.
  const f: Filters = { ...ALL_TIME, country: germany };
  const [k, months, countries] = await Promise.all([source.kpis(f), source.monthlyRevenue(f), source.countries(f)]);
  await expect(page).toHaveURL(new RegExp(`[?&]country=${slugify(germany)}`));
  await expect(revenueKpi(page)).toContainText(money(k.current.revenue));
  const inRange = months.filter((m) => m.inRange).reduce((s, m) => s + m.revenue, 0);
  await expect(page.getByRole("img", { name: /^Line chart of monthly revenue/ })).toHaveAttribute(
    "aria-label",
    new RegExp(`for ${germany}, all categories.*${money(inRange).replace(/[£,]/g, ".")}`),
  );
  await expect(page.getByText(`${germany} is outlined; the others are shown for comparison.`)).toBeVisible();
  await expect(page.getByRole("group", { name: /^Revenue by country values/ }).getByRole("button", { name: new RegExp(`^${germany}: .*\\(selected\\)$`) })).toHaveCount(1);
  expect(countries.find((c) => c.country === germany)).toBeDefined();
  await expectOneGraphqlRequest(requests);
});

test("on another tab, a filter change is one GraphQL request for that tab's charts", async ({ page }) => {
  const path = tabPath(ONLINE_RETAIL_TABS[4]);
  await open(page, path);
  const requests = trackRequests(page, path);
  const response = page.waitForResponse((r) => new URL(r.url()).pathname === GRAPHQL_ENDPOINT);
  await field(page, "Category").selectOption(category);
  const query = new URL((await response).url()).searchParams.get("query") ?? "";
  expect(query).toMatch(/^query Returns\(/);
  expect(query).not.toMatch(/kpis|monthlyRevenue/);

  const returns = await source.returns({ ...ALL_TIME, category });
  await expect(page.getByRole("group", { name: /^Return rate values/ }).locator("[data-mark]")).toHaveCount(returns.rows.length);
  await expect(page.getByText(`Overall: ${(returns.overall.rate * 100).toFixed(1)}%`, { exact: false })).toBeVisible();
  await expectOneGraphqlRequest(requests);
});

test("the GraphQL endpoint refuses introspection in production", async ({ request }) => {
  const res = await request.get(`${GRAPHQL_ENDPOINT}?query=${encodeURIComponent("{ __schema { types { name } } }")}`, {
    headers: { accept: "application/json" },
  });
  const body = await res.json();
  expect(body.data).toBeUndefined();
  expect(body.errors[0].message).toMatch(/introspection has been disabled/);
  expect(res.headers()["cache-control"]).toBe("no-store");
});

test("the GraphQL endpoint rejects invalid filters instead of defaulting them", async ({ request }) => {
  const query = "query($f: FiltersInput) { dashboard(filters: $f) { kpis { current { revenue } } } }";
  const url = (filters: object) =>
    `${GRAPHQL_ENDPOINT}?query=${encodeURIComponent(query)}&variables=${encodeURIComponent(JSON.stringify({ f: filters }))}`;
  const bad = await request.get(url({ country: "atlantis" }), { headers: { accept: "application/json" } });
  const body = await bad.json();
  expect(body.errors[0].message).toBe("Unknown country.");
  expect(body.errors[0].extensions.code).toBe("BAD_USER_INPUT");
  expect(body.data?.dashboard ?? null).toBeNull();
  expect(bad.headers()["cache-control"]).toBe("no-store");

  // A valid slug still answers, cacheably, with the source's numbers.
  const good = await request.get(url({ country: slugify(germany) }), { headers: { accept: "application/json" } });
  const ok = await good.json();
  expect(ok.data.dashboard.kpis.current.revenue).toBeCloseTo((await source.kpis({ ...ALL_TIME, country: germany })).current.revenue, 2);
  expect(good.headers()["cache-control"]).toContain("public");
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

// ---- "Summarize this view" ----------------------------------------------------------------
// The panel renders because playwright.config.ts gives the server a placeholder key; every test
// here answers the summary route with page.route, so no request ever reaches Anthropic.

const SUMMARY = "/api/online-retail/summary";
const ndjson = (...events: object[]) => events.map((e) => JSON.stringify(e)).join("\n") + "\n";
const summaryPanel = (page: Page) => page.locator("[data-summary-panel]");
const summaryOutput = (page: Page) => page.locator("[data-summary-output]");
const summaryAction = (page: Page) => summaryPanel(page).locator("[data-summary-action]");

test("summarize sends only the tab and filters, and streams into a live region", async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route(`**${SUMMARY}`, async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: ndjson({ type: "text", text: "From Dec 2009 to Dec 2011, " }, { type: "text", text: "revenue was £19,354,775." }, { type: "done", cached: false }),
    });
  });
  await open(page, urlFor({ ...ALL_TIME, country: germany }));
  await expect(summaryPanel(page).getByRole("heading", { name: "Summarize this view" })).toBeVisible();
  await expect(summaryOutput(page)).toHaveAttribute("aria-live", "polite");
  await expect(summaryOutput(page)).toHaveAttribute("role", "status");

  await summaryAction(page).click();
  await expect(summaryOutput(page)).toContainText("From Dec 2009 to Dec 2011, revenue was £19,354,775.");
  await expect(summaryOutput(page)).toHaveAttribute("data-summary-status", "done");
  await expect(summaryOutput(page)).toHaveAttribute("aria-busy", "false");
  // Never numbers from the browser: the server recomputes them.
  expect(bodies).toEqual([{ tab: "overview", filters: { country: slugify(germany) } }]);

  // Another view hides the old summary.
  await field(page, "Category").selectOption(category);
  await expect(summaryOutput(page)).toHaveAttribute("data-summary-status", "idle");
  await expect(summaryOutput(page)).not.toContainText("£19,354,775");
});

test("summarize on another tab sends that tab", async ({ page }) => {
  let body: unknown = null;
  await page.route(`**${SUMMARY}`, async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/x-ndjson", body: ndjson({ type: "text", text: "Returns summary." }, { type: "done", cached: true }) });
  });
  await open(page, tabPath(ONLINE_RETAIL_TABS[4]));
  await summaryAction(page).click();
  await expect(summaryOutput(page)).toContainText("Returns summary.");
  await expect(summaryOutput(page)).toContainText("From the cache");
  expect(body).toEqual({ tab: "returns", filters: {} });
});

test("stop ends a summary in progress", async ({ page }) => {
  await page.route(`**${SUMMARY}`, async (route) => {
    await new Promise((r) => setTimeout(r, 4000));
    await route.fulfill({ status: 200, contentType: "application/x-ndjson", body: ndjson({ type: "text", text: "Too late." }, { type: "done", cached: false }) }).catch(() => {});
  });
  await open(page, PAGES.onlineRetailDashboard.path);
  await summaryAction(page).click();
  await expect(summaryAction(page)).toHaveText("stop");
  await expect(summaryOutput(page)).toHaveAttribute("aria-busy", "true");
  await summaryAction(page).click();
  await expect(summaryOutput(page)).toHaveAttribute("data-summary-status", "stopped");
  await expect(summaryAction(page)).toHaveText("summarize");
  await expect(summaryAction(page)).toBeFocused();
  await page.waitForTimeout(4500);
  await expect(summaryOutput(page)).not.toContainText("Too late.");
});

test("an error shows a message and retry recovers", async ({ page }) => {
  let calls = 0;
  await page.route(`**${SUMMARY}`, async (route) => {
    calls += 1;
    if (calls === 1) {
      await route.fulfill({ status: 429, contentType: "application/x-ndjson", body: ndjson({ type: "error", message: "Too many summaries from this address." }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/x-ndjson", body: ndjson({ type: "text", text: "Second try worked." }, { type: "done", cached: false }) });
    }
  });
  await open(page, PAGES.onlineRetailDashboard.path);
  await summaryAction(page).click();
  await expect(summaryPanel(page).locator("[data-summary-error]")).toContainText("Too many summaries from this address.");
  await expect(summaryAction(page)).toHaveText("retry");
  await summaryAction(page).click();
  await expect(summaryOutput(page)).toContainText("Second try worked.");
  expect(calls).toBe(2);
});

for (const theme of ["light", "dark"] as Theme[]) {
  test(`the summary panel has no serious or critical axe violations (${theme})`, async ({ page }) => {
    await page.route(`**${SUMMARY}`, (route) =>
      route.fulfill({ status: 200, contentType: "application/x-ndjson", body: ndjson({ type: "text", text: "A short summary." }, { type: "done", cached: true }) }),
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await useSavedTheme(page, theme);
    await open(page, PAGES.onlineRetailDashboard.path);
    await summaryAction(page).click();
    await expect(summaryOutput(page)).toHaveAttribute("data-summary-status", "done");
    expect(await blockingViolations(page)).toEqual([]);
  });
}
