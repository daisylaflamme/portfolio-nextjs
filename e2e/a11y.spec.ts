import { expect, test } from "@playwright/test";
import { featuredProjectIds } from "../src/data/projects";
import { blockingViolations, ROUTES, useSavedTheme, type Theme } from "./helpers";

const THEMES: Theme[] = ["light", "dark"];

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

    test("the JavaScript in Colors case study has no serious or critical axe violations", async ({ page }) => {
      await page.goto("/work/web-engineering?project=js-in-colors");
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await blockingViolations(page)).toEqual([]);
    });
  });
}
