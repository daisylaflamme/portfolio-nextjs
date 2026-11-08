import type { Page } from "@playwright/test";
import { PAGES } from "../src/lib/seo";

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
