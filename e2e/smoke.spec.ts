import { expect, test } from "@playwright/test";
import { collectErrors, ROUTES } from "./helpers";

for (const route of ROUTES) {
  test(`${route.path} renders without errors`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(route.path === "/" ? route.title : `${route.title} | Daisy Laflamme`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: "Daisy Laflamme, home" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    // Nothing pushes the page wider than the viewport.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    expect(errors).toEqual([]);
  });
}

const NAV = [
  { name: "Work", path: "/work/web-engineering" },
  { name: "About", path: "/about" },
  { name: "Résumé", path: "/resume" },
  { name: "Contact", path: "/contact" },
];

test("main navigation reaches every section", async ({ page, viewport }) => {
  await page.goto("/");
  // Below 768px the links sit behind the Menu button.
  const phone = (viewport?.width ?? 1280) < 768;
  const menu = page.getByRole("button", { name: "Menu" });

  for (const item of NAV) {
    if (phone) await menu.click();
    const link = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: item.name, exact: true })
      .filter({ visible: true });
    await link.click();
    await expect(page).toHaveURL(item.path);
    await expect(page.locator("h1")).toBeVisible();
    // Both copies of the link (desktop row and mobile menu) mark the current page.
    await expect(page.locator(`header a[href="${item.path}"][aria-current="page"]`)).toHaveCount(2);
    // The mobile menu closes after navigating.
    if (phone) await expect(menu).toHaveAttribute("aria-expanded", "false");
  }
});
