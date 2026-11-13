import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PAGES } from "../src/lib/seo";
import { RETAIL_DASHBOARD_SOURCE } from "../src/lib/dashboards/larrys/content";
import { selectDailyRevenue, selectDiscountTiers, selectKpis } from "../src/lib/dashboards/larrys/selectors";
import type { LarrysData } from "../src/lib/dashboards/larrys/types";
import { blockingViolations, collectErrors, useSavedTheme, type Theme } from "./helpers";

// Expected numbers come from the same data and selectors the page uses.
// Playwright compiles specs to CommonJS, so no import.meta; resolve from the repo root.
const data = JSON.parse(readFileSync(join(process.cwd(), "src/data/larrys-secret.json"), "utf8")) as LarrysData;
const PATH = PAGES.retailDashboard.path;
const usd = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const { workbook1: ruleA, workbook2: ruleB } = data.meta.discountTiers2013;

/**
 * Opens the dashboard and waits until every chart has hydrated. Below-the-fold charts
 * hydrate as they near the viewport, so scroll through the page first; charts set
 * data-chart-ready once they've rendered in the browser.
 */
async function open(page: Page, query = "") {
  await page.goto(`${PATH}${query}`);
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () =>
      !document.querySelector("[data-chart-loading]") &&
      [...document.querySelectorAll("[data-chart]")].every((el) => el.getAttribute("data-chart-ready") === "true"),
  );
}

const storeFilter = (page: Page) => page.getByRole("group", { name: "Filter by store" });
const tierSummary = (page: Page) => page.getByRole("status").filter({ hasText: "loyalty customers qualify" });
const revenueKpi = (page: Page) => page.locator('[data-kpi="revenue"] dd').first();

test("loads with title, breadcrumb, KPIs and the source note", async ({ page }) => {
  const errors = collectErrors(page);
  await open(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(PAGES.retailDashboard.title);
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Work" })).toHaveAttribute("href", PAGES.work.path);
  await expect(crumbs.getByRole("link", { name: "Dashboards" })).toHaveAttribute("href", PAGES.dashboards.path);
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText("Retail sales");
  await expect(page.locator("[data-kpi]")).toHaveCount(5);
  await expect(revenueKpi(page)).toContainText(usd(selectKpis(data, { store: "all" }).revenue));
  await expect(page.getByText(RETAIL_DASHBOARD_SOURCE)).toBeVisible();
  expect(errors).toEqual([]);
});

test("store filter updates the KPIs and the URL without scrolling", async ({ page }) => {
  await open(page);
  const store = data.stores[1];
  const pill = storeFilter(page).getByRole("button", { name: store.name });
  await pill.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => window.scrollY);

  await pill.click();
  await expect(pill).toHaveAttribute("aria-pressed", "true");
  await expect(storeFilter(page).getByRole("button", { name: "All stores" })).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveURL(new RegExp(`[?&]store=${store.id}`));
  await expect(revenueKpi(page)).toContainText(usd(selectKpis(data, { store: store.id }).revenue));
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);

  // Tier counts follow the store too.
  const tiers = selectDiscountTiers(data, { store: store.id }, ruleA);
  await expect(tierSummary(page)).toContainText(`${tiers.qualifying} of ${tiers.total}`);
});

test("presets and sliders change the tier counts", async ({ page }) => {
  await open(page);
  const a = selectDiscountTiers(data, { store: "all" }, ruleA);
  await expect(tierSummary(page)).toContainText(`${a.counts[1]} at 10%, ${a.counts[2]} at 20%, ${a.counts[3]} at 40%`);

  const presetB = page.getByRole("button", { name: /^2013 rule B/ });
  await presetB.click();
  await expect(presetB).toHaveAttribute("aria-pressed", "true");
  const b = selectDiscountTiers(data, { store: "all" }, ruleB);
  expect(b.counts).toEqual([167, 96, 7, 4]);
  await expect(tierSummary(page)).toContainText(`${b.counts[1]} at 10%, ${b.counts[2]} at 20%, ${b.counts[3]} at 40%`);
  await expect(page).toHaveURL(new RegExp(`[?&]t=${ruleB.join(",")}`));

  // Keyboard on the native range input: one step up from 1.0 to 1.1.
  const slider = page.getByRole("slider", { name: "10% tier starts above" });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("1.1");
  await expect(slider).toHaveAttribute("aria-valuetext", "1.1 times the average line");
  const moved = selectDiscountTiers(data, { store: "all" }, [1.1, ruleB[1], ruleB[2]]);
  await expect(tierSummary(page)).toContainText(`${moved.qualifying} of ${moved.total}`);
  await expect(presetB).toHaveAttribute("aria-pressed", "false");
});

test("thresholds stay in order: t1 can't pass t2", async ({ page }) => {
  await open(page, "?t=1.5,1.6,2.2");
  const slider = page.getByRole("slider", { name: "10% tier starts above" });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("1.5");
});

test("shared links restore the view; invalid values fall back to defaults", async ({ page }) => {
  await open(page, `?store=${data.stores[4].id}&t=${ruleB.join(",")}&sku=G4451`);
  await expect(storeFilter(page).getByRole("button", { name: data.stores[4].name })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^2013 rule B/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("combobox", { name: "Product" })).toHaveValue("G4451");

  await open(page, "?store=999&t=9,9,9&sku=nope");
  await expect(storeFilter(page).getByRole("button", { name: "All stores" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^2013 rule A/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("combobox", { name: "Product" })).toHaveValue("S7310");
});

test("product select updates the price chart and the URL", async ({ page }) => {
  await open(page);
  await page.getByRole("combobox", { name: "Product" }).selectOption("S4803");
  await expect(page).toHaveURL(/[?&]sku=S4803/);
  const sku = data.skus.find((s) => s.id === "S4803");
  await expect(page.getByRole("img", { name: new RegExp(`units sold by price for ${sku?.name}`, "i") })).toBeVisible();
});

test("every chart has a data table toggle that reveals a real table", async ({ page }) => {
  await open(page);
  const toggles = page.getByRole("button", { name: "Show data table" });
  const n = await toggles.count();
  // Daily, stores, products, matrix, tiers, price points, map.
  expect(n).toBe(7);
  for (let i = 0; i < n; i++) {
    // The list shrinks as each button turns into "Hide data table".
    const button = toggles.first();
    const id = await button.getAttribute("aria-controls");
    await button.click();
    await expect(page.locator(`[id="${id}"] table`)).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Hide data table" })).toHaveCount(n);

  // The daily table has one row per trading day.
  const days = selectDailyRevenue(data, { store: "all" });
  await expect(page.getByRole("table", { name: "Daily revenue and transactions" }).locator("tbody tr")).toHaveCount(days.length);
});

test("the bought-together matrix is a table with row and column headers", async ({ page }) => {
  await open(page);
  const matrix = page.getByRole("region", { name: /Bought-together matrix/ }).getByRole("table");
  await expect(matrix.getByRole("columnheader")).toHaveCount(data.skus.length);
  await expect(matrix.getByRole("rowheader")).toHaveCount(data.skus.length);
});

test("tooltips are reachable by keyboard and close with Escape", async ({ page }) => {
  await open(page);
  const group = page.getByRole("group", { name: /^Daily revenue values/ });
  const marks = group.locator("[data-mark]");
  await marks.first().focus();
  const tooltip = group.locator("[data-tooltip]");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText((await marks.first().getAttribute("aria-label")) ?? "");

  await page.keyboard.press("ArrowRight");
  await expect(marks.nth(1)).toBeFocused();
  await expect(tooltip).toHaveText((await marks.nth(1).getAttribute("aria-label")) ?? "");

  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(marks.nth(1)).toBeFocused();
});

test("no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await open(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const theme of ["light", "dark"] as Theme[]) {
  test(`no serious or critical axe violations with tables open (${theme})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await useSavedTheme(page, theme);
    await open(page, `?store=${data.stores[0].id}`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const toggles = page.getByRole("button", { name: "Show data table" });
    while ((await toggles.count()) > 0) await toggles.first().click();
    // A tooltip open too, so its colours are checked.
    await page.locator("[data-mark]").first().focus();
    expect(await blockingViolations(page)).toEqual([]);
  });
}
