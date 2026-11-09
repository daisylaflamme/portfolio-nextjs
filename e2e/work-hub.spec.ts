import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { dashboards } from "../src/data/dashboards";
import { graphics } from "../src/data/graphics";
import { landingPages } from "../src/data/landingPages";
import { presentations, SLIDESHARE_PROFILE } from "../src/data/presentations";
import { featuredProjectIds, projects } from "../src/data/projects";
import { withAvailableFiles } from "../src/lib/archive";
import { WORK_CATEGORIES } from "../src/lib/work";
import { useSavedTheme, type Theme } from "./helpers";

// What the pages can show depends on which archive images are in public/ (they're
// added separately), so expectations are computed the same way the pages do it.
const shownGraphics = withAvailableFiles([...landingPages, ...graphics]);
const shownDashboards = withAvailableFiles(dashboards);
const shownPresentations = withAvailableFiles(presentations);
const EMPTY_MESSAGE = /being moved over from my old portfolio/;

const label = (id: string) => WORK_CATEGORIES.find((c) => c.id === id)?.label ?? id;
const path = (id: string) => WORK_CATEGORIES.find((c) => c.id === id)?.path ?? id;

/** Nothing on the page talks to the old SlideShare / Tableau embeds. */
function trackThirdPartyEmbeds(page: Page): string[] {
  const hits: string[] = [];
  page.on("request", (request) => {
    if (/slideshare\.net|tableausoftware\.com|public\.tableau\.com/.test(request.url())) hits.push(request.url());
  });
  return hits;
}

test.describe("navigation", () => {
  test("old /web-projects links redirect permanently and keep ?project=", async ({ page, request }) => {
    const response = await request.get("/web-projects", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/work/web-engineering");

    const project = projects.find((p) => p.id === featuredProjectIds[1]);
    await page.goto(`/web-projects?project=${project?.id}`);
    await expect(page).toHaveURL(new RegExp(`/work/web-engineering\\?project=${project?.id}$`));
    await expect(page.getByRole("dialog", { name: project?.title })).toBeVisible();
  });

  test("category tabs are links that mark the current page", async ({ page }) => {
    for (const category of WORK_CATEGORIES) {
      await page.goto(category.path);
      await expect(page.locator("h1")).toHaveText(category.label);
      const tabs = page.getByRole("navigation", { name: "Work categories" });
      await expect(tabs.getByRole("link")).toHaveCount(WORK_CATEGORIES.length);
      await expect(tabs.locator('[aria-current="page"]')).toHaveText(category.label);
      // The header's Work link stays current on every category.
      await expect(page.locator('header a[aria-current="page"]').first()).toHaveText("Work");
    }

    await page.goto(path("web-engineering"));
    await page.getByRole("navigation", { name: "Work categories" }).getByRole("link", { name: label("dashboards") }).click();
    await expect(page).toHaveURL(path("dashboards"));
  });

  test("home work hub links to every category, none marked coming soon", async ({ page }) => {
    await page.goto("/");
    const hub = page.getByRole("region", { name: "// choose a body of work" });
    for (const category of WORK_CATEGORIES) {
      await expect(hub.getByRole("link", { name: new RegExp(category.label) })).toHaveAttribute("href", category.path);
    }
    await expect(page.getByText(/coming soon/i)).toHaveCount(0);
  });
});

test.describe("marketing and design", () => {
  test("gallery shows every piece whose images are present", async ({ page }) => {
    const embeds = trackThirdPartyEmbeds(page);
    await page.goto(path("marketing-design"));

    if (shownGraphics.length === 0) {
      await expect(page.getByText(EMPTY_MESSAGE)).toBeVisible();
      return;
    }
    const tiles = page.getByRole("button", { name: /full size/ });
    await expect(tiles).toHaveCount(shownGraphics.length);
    for (const item of shownGraphics) {
      await expect(page.getByRole("button", { name: new RegExp(`^View ${escapeRegExp(item.title)} full size`) })).toBeVisible();
    }
    expect(embeds).toEqual([]);
  });

  test("landing pages link to their case studies, which stay in web engineering", async ({ page }) => {
    expect(landingPages.map((item) => item.id).every((id) => projects.some((p) => p.id === id))).toBe(true);
    await page.goto(path("marketing-design"));
    const section = page.getByRole("region", { name: "Landing pages" });
    for (const item of withAvailableFiles(landingPages)) {
      await expect(section.getByRole("link", { name: `Read the case study: ${item.title}` })).toHaveAttribute(
        "href",
        `/work/web-engineering?project=${item.id}`
      );
    }

    const first = landingPages[0];
    await section.getByRole("link", { name: `Read the case study: ${first.title}` }).click();
    await expect(page.getByRole("dialog", { name: first.title })).toBeVisible();
  });

  test("lightbox opens from a tile, pages with arrow keys, closes with Escape and returns focus", async ({ page }) => {
    const item = shownGraphics.find((g) => g.images.length > 1);
    test.skip(!item, "No multi-image piece has its images in public/ yet");
    if (!item) return;

    await page.goto(path("marketing-design"));
    const tile = page.getByRole("button", { name: `View ${item.title} full size, ${item.images.length} images` });
    await tile.click();

    const viewer = page.getByRole("dialog", { name: `${item.title} images` });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole("button", { name: "Close viewer" })).toBeFocused();
    await expect(viewer.getByText(`1 / ${item.images.length}`)).toBeVisible();
    await expect(viewer.getByRole("img")).toHaveAttribute("alt", `${item.imageAlt} (1 of ${item.images.length})`);

    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText(`2 / ${item.images.length}`)).toBeVisible();
    await viewer.getByRole("button", { name: "Previous screenshot" }).click();
    await expect(viewer.getByText(`1 / ${item.images.length}`)).toBeVisible();

    // The page behind doesn't scroll while the viewer is open.
    await expect(page.locator("html")).toHaveClass(/has-open-dialog/);

    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    await expect(page.locator("html")).not.toHaveClass(/has-open-dialog/);
    await expect(tile).toBeFocused();
  });
});

test.describe("dashboards", () => {
  test("screenshots and write-ups, no Tableau embeds", async ({ page }) => {
    const embeds = trackThirdPartyEmbeds(page);
    await page.goto(path("dashboards"));
    await expect(page.locator("iframe")).toHaveCount(0);

    if (shownDashboards.length === 0) {
      await expect(page.getByText(EMPTY_MESSAGE)).toBeVisible();
      return;
    }
    await expect(page.getByRole("article")).toHaveCount(shownDashboards.length);
    for (const item of shownDashboards) {
      const article = page.getByRole("article", { name: item.title });
      await expect(article.getByRole("heading", { level: 2 })).toHaveText(item.title);
      for (const point of item.highlights ?? []) await expect(article.getByText(point)).toBeVisible();
    }

    // Screenshots open full size.
    const first = shownDashboards[0];
    await page.getByRole("button", { name: new RegExp(`^View ${escapeRegExp(first.title)} full size`) }).click();
    await expect(page.getByRole("dialog", { name: `${first.title} images` })).toBeVisible();
    await page.keyboard.press("Escape");
    expect(embeds).toEqual([]);
  });
});

test.describe("presentations", () => {
  test("only the chosen decks, each with a cover and a link or PDF, no SlideShare iframes", async ({ page }) => {
    const embeds = trackThirdPartyEmbeds(page);
    await page.goto(path("presentations"));
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(presentations.map((p) => p.title)).toEqual([
      "JavaScript Learning Platform",
      "Human Computer Interaction Project",
      "Retail KPI Dashboard",
      "Smart TV and API Integration",
      "JQSA Website Plan",
    ]);

    if (shownPresentations.length === 0) {
      await expect(page.getByText(EMPTY_MESSAGE)).toBeVisible();
      return;
    }
    await expect(page.getByRole("article")).toHaveCount(shownPresentations.length);
    for (const item of shownPresentations) {
      const article = page.getByRole("article", { name: item.title });
      await expect(article.getByRole("img", { name: item.imageAlt })).toBeVisible();
      if (item.link) {
        const link = article.getByRole("link", { name: new RegExp(item.link.label, "i") });
        await expect(link).toHaveAttribute("href", item.link.href);
        await expect(link).toHaveAttribute("target", "_blank");
      }
      // The PDF button only appears once the file has been added.
      await expect(article.getByRole("link", { name: /download pdf/ })).toHaveCount(item.pdf ? 1 : 0);
      expect(item.link || item.pdf).toBeTruthy();
    }
    const all = page.getByRole("link", { name: /see all presentations on SlideShare/ });
    await expect(all).toHaveAttribute("href", SLIDESHARE_PROFILE);
    await expect(all).toHaveAttribute("target", "_blank");
    expect(embeds).toEqual([]);
  });
});

for (const theme of ["light", "dark"] as Theme[]) {
  test(`open gallery lightbox has no serious or critical axe violations (${theme})`, async ({ page }) => {
    const item = shownGraphics[0];
    test.skip(!item, "No marketing and design images in public/ yet");
    if (!item) return;

    await page.emulateMedia({ reducedMotion: "reduce" });
    await useSavedTheme(page, theme);
    await page.goto(path("marketing-design"));
    await page.getByRole("button", { name: new RegExp(`^View ${escapeRegExp(item.title)} full size`) }).click();
    await expect(page.getByRole("dialog", { name: `${item.title} images` })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const blocking = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target.join(" ")) }));
    expect(blocking).toEqual([]);
  });
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
