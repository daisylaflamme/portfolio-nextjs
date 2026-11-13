import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { PAGES } from "../src/lib/seo";

const BLOCKING = new Set(["serious", "critical"]);

/** Serious and critical WCAG 2.2 AA violations, trimmed to what's useful in a failure message. */
export async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations
    .filter((v) => v.impact != null && BLOCKING.has(v.impact))
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.map((n) => n.target.join(" ")) }));
}

export type Theme = "light" | "dark";

/** Every public route, from the same list that builds the sitemap. */
export const ROUTES = Object.values(PAGES).map(({ path, title }) => ({ path, title }));

/** Save a theme before any page script runs, like a returning visitor's earlier choice. */
export async function useSavedTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {
      // Storage can be blocked; the theme assertion in the test will then fail.
    }
  }, theme);
}

/**
 * Collect uncaught errors and console errors. The Vercel Analytics and Speed Insights
 * scripts only exist on Vercel, so their 404s on localhost are ignored.
 */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (message.location().url.includes("/_vercel/")) return;
    errors.push(message.text());
  });
  return errors;
}
