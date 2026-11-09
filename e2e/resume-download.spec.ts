import { expect, test } from "@playwright/test";
import { RESUME_PDF } from "../src/lib/resume";

test("the résumé PDF is served", async ({ request }) => {
  const response = await request.get(RESUME_PDF.href);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

for (const [page, name] of [
  ["/", /^résumé pdf/],
  ["/resume", /download résumé/],
] as const) {
  test(`${page} has a résumé download link`, async ({ page: browserPage }) => {
    await browserPage.goto(page);
    const link = browserPage.getByRole("link", { name });
    await expect(link).toHaveAttribute("href", RESUME_PDF.href);
    await expect(link).toHaveAttribute("download", "");
    const download = await Promise.all([browserPage.waitForEvent("download"), link.click()]).then(([d]) => d);
    expect(download.suggestedFilename()).toMatch(/Resume\.pdf$/);
  });
}
