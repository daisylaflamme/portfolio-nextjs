import { expect, test } from "@playwright/test";
import { LANGUAGE_RANGES } from "../src/lib/github";

// The build only has live GitHub data when GITHUB_TOKEN was set (not in CI), so this
// checks whichever the page was built with.
test("language chart: labelled sample, or a working time-range switch", async ({ page }) => {
  await page.goto("/");
  const chart = page.getByRole("figure").filter({ hasText: "// languages across my GitHub repos" });
  await expect(chart).toBeVisible();
  const ranges = chart.getByRole("group", { name: "Time range" });

  if (await chart.getByText("(sample)").count()) {
    await expect(ranges).toHaveCount(0);
    return;
  }

  // The first range is the default; the other one is a click away.
  const [first, second] = LANGUAGE_RANGES;
  const firstButton = ranges.getByRole("button", { name: first.label });
  const secondButton = ranges.getByRole("button", { name: second.label });
  await expect(firstButton).toHaveAttribute("aria-pressed", "true");
  const summary = chart.locator(".sr-only");
  await expect(summary).toContainText(first.label.toLowerCase());

  await secondButton.click();
  await expect(secondButton).toHaveAttribute("aria-pressed", "true");
  await expect(firstButton).toHaveAttribute("aria-pressed", "false");
  await expect(summary).toContainText(second.label.toLowerCase());
});
