import { expect, test } from "@playwright/test";
import { featuredProjectIds, projects } from "../src/data/projects";
import { groupProjects } from "../src/lib/projectSections";
import { PROJECT_FILTERS } from "../src/app/work/web-engineering/projectFilters";

/** The count the page should report for a set of filter ids, computed from the data. */
function expectedCount(ids: string[]): number {
  const active = PROJECT_FILTERS.filter((f) => ids.includes(f.id));
  const { featured, earlier } = groupProjects(projects, featuredProjectIds, active);
  return featured.length + earlier.length;
}

function filterLabel(id: string): string {
  const filter = PROJECT_FILTERS.find((f) => f.id === id);
  if (!filter) throw new Error(`No filter ${id}`);
  return filter.label;
}

const matching = (n: number) => `${n} matching ${n === 1 ? "project" : "projects"}`;

test("filters update the result count", async ({ page }) => {
  await page.goto("/work/web-engineering");
  const status = page.getByRole("status");
  await expect(status).toHaveText(`${projects.length} projects`);

  const payments = page.getByRole("button", { name: filterLabel("payments"), exact: true });
  await payments.click();
  await expect(payments).toHaveAttribute("aria-pressed", "true");
  const paymentsCount = expectedCount(["payments"]);
  expect(paymentsCount).toBeGreaterThan(0);
  expect(paymentsCount).toBeLessThan(projects.length);
  await expect(status).toHaveText(matching(paymentsCount));

  // Filters combine with OR, so adding one never lowers the count.
  await page.getByRole("button", { name: filterLabel("maps"), exact: true }).click();
  const bothCount = expectedCount(["payments", "maps"]);
  expect(bothCount).toBeGreaterThanOrEqual(paymentsCount);
  await expect(status).toHaveText(matching(bothCount));

  await page.getByRole("button", { name: /^Clear filters/ }).click();
  await expect(status).toHaveText(`${projects.length} projects`);
  await expect(payments).toHaveAttribute("aria-pressed", "false");
});

test("earlier work opens while filters are active and closes when they are cleared", async ({ page }) => {
  // The first filter whose matches include earlier (non-featured) projects, from the data.
  const filter = PROJECT_FILTERS.find((f) => groupProjects(projects, featuredProjectIds, [f]).earlier.length > 0);
  if (!filter) throw new Error("No filter matches an earlier project");
  const [firstEarlier] = groupProjects(projects, featuredProjectIds, [filter]).earlier;

  await page.goto("/work/web-engineering");
  const earlier = page.locator("section[aria-labelledby='earlier-heading'] details");
  await expect(earlier).not.toHaveAttribute("open");

  const chip = page.getByRole("button", { name: filter.label, exact: true });
  if (!(await chip.isVisible())) await page.getByRole("button", { name: "More", exact: true }).click();
  await chip.click();
  await expect(earlier).toHaveAttribute("open");
  await expect(earlier.getByRole("button", { name: firstEarlier.title })).toBeVisible();

  await page.getByRole("button", { name: /^Clear filters/ }).click();
  await expect(earlier).not.toHaveAttribute("open");
});
