import { expect, test } from "@playwright/test";
import { PAGES } from "../src/lib/seo";
import { certifications, courseHistoryCount, diplomas, recentLearning } from "../src/data/certificates";

const EDUCATION = `${PAGES.about.path}#education`;

test("/certificates permanently redirects to the Education section on About", async ({ page, request }) => {
  const response = await request.get("/certificates", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(EDUCATION);

  await page.goto("/certificates");
  await expect(page).toHaveURL(EDUCATION);
  await expect(page.locator("#education")).toBeInViewport();
});

test("the footer links to Education", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("contentinfo").getByRole("link", { name: "education", exact: true });
  await expect(link).toHaveAttribute("href", EDUCATION);
});

test("Education shows degrees, certifications, recent learning and the course history", async ({ page }) => {
  await page.goto(EDUCATION);
  await expect(page.locator("h1")).toHaveCount(1);

  const section = page.locator("#education");
  await expect(section.getByRole("heading", { level: 2, name: "Education" })).toBeVisible();
  for (const name of ["Degrees", "Certifications", "Recent learning"]) {
    await expect(section.getByRole("heading", { level: 3, name })).toBeVisible();
  }

  // Title and year read as separate words ("…201, 2016"), not "…2012016".
  for (const cert of [...diplomas, ...certifications]) {
    await expect(section.getByText(`${cert.title}, ${cert.year}`, { exact: false })).toHaveCount(1);
  }
  for (const degree of diplomas) {
    await expect(section.getByRole("button", { name: `View ${degree.title} diploma`, exact: true })).toBeVisible();
  }

  const recent = section.getByRole("region", { name: "Recent learning" }).getByRole("listitem");
  await expect(recent).toHaveCount(recentLearning.length);
  // Course entries are text only.
  await expect(section.getByRole("region", { name: "Recent learning" }).locator("img")).toHaveCount(0);

  const details = section.locator("details");
  await expect(details).not.toHaveAttribute("open", "");
  await expect(details.locator("summary")).toContainText(`(${courseHistoryCount} courses)`);
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await expect(details.getByRole("listitem")).toHaveCount(courseHistoryCount);
  await expect(details.locator("img")).toHaveCount(0);
});

test("a diploma opens in the lightbox and focus returns to its button", async ({ page }) => {
  await page.goto(EDUCATION);
  const trigger = page.getByRole("button", { name: `View ${diplomas[0].title} diploma`, exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: `${diplomas[0].title} diploma` });
  await expect(dialog).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/has-open-dialog/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("html")).not.toHaveClass(/has-open-dialog/);
});
