import { expect, test, type Page } from "@playwright/test";
import { PAGES } from "../src/lib/seo";
import { ONLINE_RETAIL_TABS, tabPath } from "../src/lib/dashboards/online-retail/content";

/**
 * Axis labels must never overlap each other or the plot area. Charts that use the shared
 * Axes component mark their plot area (data-plot-area) and label groups (data-axis), so this
 * measures the rendered boxes at each project width (390px and 1280px).
 */

const PAGES_WITH_AXES = [
  { name: "Larry's Stores daily revenue", path: PAGES.retailDashboard.path },
  { name: "Online Retail monthly revenue", path: PAGES.onlineRetailDashboard.path },
  { name: "Online Retail 80/20 view", path: tabPath(ONLINE_RETAIL_TABS[1]) },
];

async function settle(page: Page, path: string) {
  await page.goto(path);
  // Only the charts with axes need to be measured (other charts may hydrate lazily, off screen).
  await page.waitForFunction(() => {
    const withAxes = [...document.querySelectorAll("[data-chart]")].filter((el) => el.querySelector("[data-plot-area]"));
    return withAxes.length > 0 && withAxes.every((el) => el.getAttribute("data-chart-ready") === "true");
  });
}

/** Overlaps between axis labels, and between labels and the plot area, in every chart on the page. */
async function axisCollisions(page: Page) {
  return page.evaluate(() => {
    type Box = { left: number; top: number; right: number; bottom: number };
    const box = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    };
    // Half a pixel of slack for anti-aliasing.
    const overlap = (a: Box, b: Box) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const problems: string[] = [];
    const charts = [...document.querySelectorAll("svg")].filter((svg) => svg.querySelector("[data-plot-area]"));
    for (const [c, svg] of charts.entries()) {
      const plot = box(svg.querySelector("[data-plot-area]") as Element);
      const svgBox = box(svg);
      const labels = [...svg.querySelectorAll("[data-axis] text")].map((el) => ({ text: el.textContent ?? "", axis: el.closest("[data-axis]")?.getAttribute("data-axis"), b: box(el) }));
      for (const l of labels) {
        if (overlap(l.b, plot)) problems.push(`chart ${c}: ${l.axis} label "${l.text}" overlaps the plot area`);
        if (l.b.top < svgBox.top - 0.5 || l.b.left < svgBox.left - 0.5 || l.b.right > svgBox.right + 0.5 || l.b.bottom > svgBox.bottom + 0.5) {
          problems.push(`chart ${c}: ${l.axis} label "${l.text}" is clipped by the chart edge`);
        }
      }
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          if (overlap(labels[i].b, labels[j].b)) problems.push(`chart ${c}: "${labels[i].text}" overlaps "${labels[j].text}"`);
        }
      }
      if (labels.filter((l) => l.axis === "x").length < 2) problems.push(`chart ${c}: fewer than two x labels`);
    }
    return { charts: charts.length, problems };
  });
}

for (const { name, path } of PAGES_WITH_AXES) {
  test(`${name}: axis labels don't overlap each other or the plot`, async ({ page }) => {
    await settle(page, path);
    const result = await axisCollisions(page);
    expect(result.charts).toBeGreaterThan(0);
    expect(result.problems).toEqual([]);
  });
}

test("the monthly revenue selection stays inside the plot area", async ({ page }) => {
  await settle(page, `${PAGES.onlineRetailDashboard.path}?from=2009-12&to=2010-03`);
  const { band, plot } = await page.evaluate(() => {
    const svg = document.querySelector("[data-range-band]")?.closest("svg");
    const r = (sel: string) => {
      const b = (svg?.querySelector(sel) as Element).getBoundingClientRect();
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
    };
    return { band: r("[data-range-band]"), plot: r("[data-plot-area]") };
  });
  expect(band.left).toBeGreaterThanOrEqual(plot.left - 0.5);
  expect(band.right).toBeLessThanOrEqual(plot.right + 0.5);
  expect(band.top).toBeGreaterThanOrEqual(plot.top - 0.5);
  expect(band.bottom).toBeLessThanOrEqual(plot.bottom + 0.5);
});
