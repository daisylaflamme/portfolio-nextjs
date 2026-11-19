import { expect, test } from "@playwright/test";
import { PAGES } from "../src/lib/seo";

// Load, title, axe and horizontal-scroll checks for /privacy come from ROUTES (helpers.ts) in the smoke and a11y specs.

test("the footer links to Privacy, and the header doesn't", async ({ page }) => {
  await page.goto("/");
  const footerLink = page.getByRole("contentinfo").getByRole("link", { name: "privacy", exact: true });
  await expect(footerLink).toHaveAttribute("href", PAGES.privacy.path);
  await expect(page.getByRole("banner").getByRole("link", { name: /privacy/i })).toHaveCount(0);

  await footerLink.click();
  await expect(page).toHaveURL(PAGES.privacy.path);
  await expect(page.getByRole("heading", { level: 1, name: PAGES.privacy.title })).toBeVisible();
});

test("Privacy explains analytics, the contact form, résumé links and browser storage", async ({ page }) => {
  await page.goto(PAGES.privacy.path);
  for (const name of ["Analytics", "Contact form", "Résumé links", "Stored in your browser", "Questions"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "contact page" })).toHaveAttribute("href", PAGES.contact.path);
});
