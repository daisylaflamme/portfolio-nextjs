import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { featuredProjectIds, projects } from "../src/data/projects";
import { ROUTES, useSavedTheme, type Theme } from "./helpers";

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

    for (const id of ["asi-header-redesign", "mvc-to-angular-migration"]) {
      test(`the ${id} case study has no serious or critical axe violations`, async ({ page }) => {
        const project = projects.find((p) => p.id === id);
        expect(project, `${id} is in src/data/projects.ts`).toBeDefined();
        await page.goto(`/work/web-engineering?project=${id}`);
        await expect(page.getByRole("dialog").getByRole("heading", { level: 2 })).toHaveText(project?.title ?? "");
        expect(await blockingViolations(page)).toEqual([]);
      });
    }

    test("the open course history on About has no serious or critical axe violations", async ({ page }) => {
      await page.goto("/about#education");
      await page.locator("#education details summary").click();
      await expect(page.locator("#education details")).toHaveAttribute("open", "");
      expect(await blockingViolations(page)).toEqual([]);
    });

    test("the open certificate viewer has no serious or critical axe violations", async ({ page }) => {
      await page.goto("/about#education");
      await page.locator("#education").getByRole("button", { name: /^View certificate/ }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await blockingViolations(page)).toEqual([]);
    });
  });
}
