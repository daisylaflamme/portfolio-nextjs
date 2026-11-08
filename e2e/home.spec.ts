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

  const [all, recent] = LANGUAGE_RANGES;
  const allButton = ranges.getByRole("button", { name: all.label });
  const recentButton = ranges.getByRole("button", { name: recent.label });
  await expect(allButton).toHaveAttribute("aria-pressed", "true");
  const summary = chart.locator(".sr-only");
  await expect(summary).toContainText(all.label.toLowerCase());

  await recentButton.click();
  await expect(recentButton).toHaveAttribute("aria-pressed", "true");
  await expect(allButton).toHaveAttribute("aria-pressed", "false");
  await expect(summary).toContainText(recent.label.toLowerCase());
});
