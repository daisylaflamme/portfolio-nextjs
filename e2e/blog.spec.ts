import { expect, test } from "@playwright/test";
import { blogPath, blogPosts } from "../src/data/blog";
import { PAGES } from "../src/lib/seo";

test("notes index lists every post", async ({ page }) => {
  await page.goto(PAGES.blog.path);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(PAGES.blog.title);
  for (const post of blogPosts) {
    await expect(page.getByRole("heading", { level: 2, name: post.title })).toBeVisible();
  }
});

test("a note has the title, breadcrumb and a code sample", async ({ page }) => {
  const post = blogPosts[0];
  await page.goto(blogPath(post.slug));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(post.title);
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Notes" })).toHaveAttribute("href", PAGES.blog.path);
  await expect(page.locator("pre code").first()).toBeVisible();
});

test("code samples are named regions labelled by their caption", async ({ page }) => {
  const post = blogPosts[0];
  const first = post.body.find((block) => block.type === "code");
  await page.goto(blogPath(post.slug));
  await expect(page.getByRole("region", { name: first?.type === "code" ? first.caption : "" })).toBeVisible();
});

test("a note is an article in Open Graph", async ({ page }) => {
  const post = blogPosts[0];
  await page.goto(blogPath(post.slug));
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute("content", new RegExp(`^${post.date}`));
});

test("the dashboards note links to Larry's Stores", async ({ page }) => {
  const post = blogPosts.find((p) => p.body.some((block) => block.type === "p" && block.link));
  const block = post?.body.find((b) => b.type === "p" && b.link);
  if (!post || block?.type !== "p" || !block.link) throw new Error("no post with a link");
  await page.goto(blogPath(post.slug));
  await expect(page.getByRole("link", { name: block.link.label })).toHaveAttribute("href", block.link.href);
});
