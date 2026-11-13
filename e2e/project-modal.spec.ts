import { expect, test, type Page } from "@playwright/test";
import { featuredProjectIds, projects } from "../src/data/projects";
import { PAGES } from "../src/lib/seo";
import { escapeRegExp } from "./helpers";

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

test.describe("Larry's Secret dashboard card", () => {
  const dash = byId("larrys-secret-dashboard");
  const cardFor = (page: Page) =>
    page.getByRole("article").filter({ has: page.getByRole("heading", { name: dash.title }) });

  test("is the 2nd featured case study, with JavaScript in Colors 3rd", () => {
    expect(featuredProjectIds.slice(0, 3)).toEqual([featuredProjectIds[0], "larrys-secret-dashboard", "js-in-colors"]);
  });

  test("its main button opens the dashboard in the same tab", async ({ page }) => {
    await page.goto(WORK);
    const open = cardFor(page).getByRole("link", { name: new RegExp(`^open dashboard ?: ${escapeRegExp(dash.title)}`) });
    await expect(open).toHaveAttribute("href", dash.link ?? "");
    await expect(open).not.toHaveAttribute("target", /.+/);
    await open.click();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(dash.link ?? "")}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(dash.title);
  });

  test("View details opens the case study, whose primary link opens the dashboard", async ({ page }) => {
    await page.goto(WORK);
    await cardFor(page).getByRole("button", { name: /^View details/ }).click();
    const dialog = page.getByRole("dialog", { name: dash.title });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: /visit site/ })).toHaveCount(0);
    const primary = dialog.getByRole("link", { name: /^open dashboard/ });
    await expect(primary).toHaveAttribute("href", dash.link ?? "");
    await expect(primary).not.toHaveAttribute("target", /.+/);
    await expect(primary).not.toContainText("opens in a new tab");

    await primary.click();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(dash.link ?? "")}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(dash.title);
    // Leaving with the dialog open must not keep the page scroll-locked.
    await expect(page.locator("html")).not.toHaveClass(/has-open-dialog/);
  });
});

test.describe("Online retail dashboard card", () => {
  const dash = byId("online-retail-dashboard");
  const cardFor = (page: Page) =>
    page.getByRole("article").filter({ has: page.getByRole("heading", { name: dash.title }) });

  test("is the 4th featured case study, after the top three", () => {
    expect(featuredProjectIds.slice(0, 4)).toEqual([featuredProjectIds[0], "larrys-secret-dashboard", "js-in-colors", "online-retail-dashboard"]);
  });

  test("its main button opens the dashboard in the same tab, and the case study links there too", async ({ page }) => {
    await page.goto(WORK);
    const open = cardFor(page).getByRole("link", { name: new RegExp(`^open dashboard ?: ${escapeRegExp(dash.title)}`) });
    await expect(open).toHaveAttribute("href", dash.link ?? "");
    await expect(open).not.toHaveAttribute("target", /.+/);

    await cardFor(page).getByRole("button", { name: /^View details/ }).click();
    const dialog = page.getByRole("dialog", { name: dash.title });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Solo, built with Claude Code")).toBeVisible();
    const primary = dialog.getByRole("link", { name: /^open dashboard/ });
    await expect(primary).toHaveAttribute("href", dash.link ?? "");
    await primary.click();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(dash.link ?? "")}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(dash.title);
    await expect(page.locator("html")).not.toHaveClass(/has-open-dialog/);
  });
});

test("a case study without a link shows no visit-site button", async ({ page }) => {
  const project = projects.find((p) => p.link === null && !p.extraLinks?.length);
  expect(project).toBeDefined();
  await page.goto(`${WORK}?project=${project?.id}`);
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(project?.title ?? "");
  await expect(dialog.getByRole("link", { name: /visit site/ })).toHaveCount(0);
});

test("no case study links to cardis.com", () => {
  const hrefs = projects.flatMap((p) => [p.link ?? "", ...(p.extraLinks ?? []).map((l) => l.href)]);
  expect(hrefs.filter((href) => href.includes("cardis.com"))).toEqual([]);
});
