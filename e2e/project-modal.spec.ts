import { expect, test } from "@playwright/test";
import { featuredProjectIds, projects } from "../src/data/projects";
import { PAGES } from "../src/lib/seo";

const WORK = PAGES.work.path;

function byId(id: string) {
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error(`No project with id ${id}`);
  return project;
}

const hero = byId(featuredProjectIds[0]);
const second = byId(featuredProjectIds[1]);
const projectInUrl = (id: string) => new RegExp(`[?&]project=${id}(&|$)`);

test("opens from a card, closes with Escape and returns focus", async ({ page }) => {
  await page.goto(WORK);
  // The featured card's button; its accessible name ends with the project title.
  const trigger = page.getByRole("button", { name: /^read case study/ });
  await expect(trigger).toContainText(hero.title);
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: hero.title });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(projectInUrl(hero.id));
  // Focus moved into the dialog.
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/[?&]project=/);
  await expect(trigger).toBeFocused();
});

test("deep link ?project=<id> opens that case study", async ({ page }) => {
  await page.goto(`${WORK}?project=${second.id}`);

  const dialog = page.getByRole("dialog", { name: second.title });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(second.title);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(new RegExp(`${WORK}$`));
});

test("an unknown ?project= id leaves the dialog closed", async ({ page }) => {
  await page.goto(`${WORK}?project=does-not-exist`);
  await expect(page.locator("h1")).toHaveText("Web engineering");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("next moves to the following case study and updates the URL", async ({ page }) => {
  await page.goto(`${WORK}?project=${hero.id}`);
  await page.getByRole("button", { name: `Next: ${second.title}` }).click();
  await expect(page.getByRole("dialog", { name: second.title })).toBeVisible();
  await expect(page).toHaveURL(projectInUrl(second.id));
});

test("JavaScript in Colors: featured card opens a case study with live links and described screens", async ({ page }) => {
  const app = byId("js-in-colors");
  expect(featuredProjectIds).toContain(app.id);
  await page.goto(WORK);

  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: app.title }) });
  await card.getByRole("button", { name: /view details/i }).click();
  const dialog = page.getByRole("dialog", { name: app.title });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /visit site/ })).toHaveAttribute("href", app.link ?? "");
  await expect(dialog.getByRole("link", { name: /Git Code/ })).toHaveAttribute("href", app.extraLinks?.[0]?.href ?? "");

  const screens = dialog.getByRole("list", { name: "Screenshots" }).getByRole("button");
  await expect(screens).toHaveCount(app.images.length);
  // Every screen has its own alt text, not "screenshot n of m".
  await screens.nth(3).click();
  await expect(dialog.getByRole("button", { name: `View full size: ${app.imageAlts?.[3]}` })).toBeVisible();
});
