import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { featuredProjectIds } from "../src/data/projects";
import { ROUTES, useSavedTheme, type Theme } from "./helpers";

const THEMES: Theme[] = ["light", "dark"];
const BLOCKING = new Set(["serious", "critical"]);

/** Serious and critical WCAG 2.2 AA violations, trimmed to what's useful in a failure message. */
async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations
    .filter((v) => v.impact != null && BLOCKING.has(v.impact))
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.map((n) => n.target.join(" ")) }));
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      // Contrast is checked on settled colors, with no transitions mid-scan.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await useSavedTheme(page, theme);
    });

    for (const route of ROUTES) {
      test(`${route.path} has no serious or critical axe violations`, async ({ page }) => {
        await page.goto(route.path);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        expect(await blockingViolations(page)).toEqual([]);
      });
    }

    test("the open case-study dialog has no serious or critical axe violations", async ({ page }) => {
      await page.goto(`/work/web-engineering?project=${featuredProjectIds[0]}`);
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await blockingViolations(page)).toEqual([]);
    });
  });
}
