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
