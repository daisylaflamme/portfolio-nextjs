import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { BLOG_POST_PRIORITY, PAGES, jsonLdHtml } from "../lib/seo.ts";
import { blogPath, blogPosts, formatPostDate, getPost, headingIds, isExternal } from "./blog.ts";
import type { BlogBlock } from "./types.ts";

describe("blog posts", () => {
  it("has unique slugs and four notes", () => {
    const slugs = blogPosts.map((post) => post.slug);
    assert.equal(slugs.length, 4);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("every post has a title, date, description and body", () => {
    for (const post of blogPosts) {
      assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(post.title.length > 10);
      assert.ok(post.description.length > 40);
      assert.ok(post.body.some((block) => block.type === "h2"));
      assert.equal(getPost(post.slug)?.slug, post.slug);
      assert.equal(blogPath(post.slug), `/blog/${post.slug}`);
    }
  });

  it("is sorted newest first, one note per date, and the Webflow note is Nov 15, 2026", () => {
    const dates = blogPosts.map((post) => post.date);
    assert.deepEqual(dates, [...dates].sort().reverse());
    assert.equal(new Set(dates).size, dates.length);
    assert.equal(getPost("webflow-through-a-react-angular-developers-eyes")?.date, "2026-11-15");
  });

  it("unknown slugs are missing", () => {
    assert.equal(getPost("not-a-post"), undefined);
  });

  it("never uses the dashboard's old name", () => {
    const text = JSON.stringify(blogPosts);
    assert.doesNotMatch(text, /Larry[’']s Secret/);
  });

  it("links point at real pages or https sites", () => {
    const paths = new Set(Object.values(PAGES).map((page) => page.path));
    for (const post of blogPosts) {
      for (const block of post.body) {
        if (block.type !== "p" || !block.link) continue;
        const { href } = block.link;
        if (isExternal(href)) assert.doesNotThrow(() => new URL(href), href);
        else assert.ok(paths.has(href), href);
      }
    }
  });

  it("figures are WebP files under public/ with alt text and a size", () => {
    for (const post of blogPosts) {
      for (const block of post.body) {
        if (block.type !== "figure") continue;
        assert.match(block.src, /^\/images\/blog\/[a-z0-9-]+\.webp$/);
        assert.ok(existsSync(join("public", block.src)), block.src);
        assert.ok(block.alt.length > 20 && block.caption.length > 0, block.src);
        assert.ok(block.width > 0 && block.height > 0, block.src);
      }
    }
  });

  it("heading ids are unique within each post", () => {
    for (const post of blogPosts) {
      const ids = [...headingIds(post.body).values()];
      assert.equal(new Set(ids).size, ids.length, post.slug);
    }
  });
});

describe("headingIds", () => {
  it("slugs the text, numbers repeats and never returns an empty id", () => {
    const blocks: BlogBlock[] = [
      { type: "h2", text: "Summary" },
      { type: "p", text: "…" },
      { type: "h2", text: "Summary" },
      { type: "h2", text: "—" },
      { type: "h2", text: "Forms, routing, CSS" },
    ];
    assert.deepEqual([...headingIds(blocks)], [
      [0, "summary"],
      [2, "summary-2"],
      [3, "section"],
      [4, "forms-routing-css"],
    ]);
  });
});

describe("formatPostDate", () => {
  it("formats the ISO date in UTC", () => {
    assert.equal(formatPostDate("2026-11-17"), "November 17, 2026");
  });
});

describe("blog SEO helpers", () => {
  it("post priority sits below the Notes index", () => {
    assert.ok(BLOG_POST_PRIORITY < PAGES.blog.priority);
    assert.ok(BLOG_POST_PRIORITY > 0);
  });

  it("jsonLdHtml escapes < so a title can't close the script tag", () => {
    const html = jsonLdHtml({ headline: "</script><b>x</b>" });
    assert.ok(!html.includes("<"));
    assert.deepEqual(JSON.parse(html), { headline: "</script><b>x</b>" });
  });
});
