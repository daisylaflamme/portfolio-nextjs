import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { onlineRetailDashboard, retailDashboard } from "./dashboards.ts";

const PUBLIC_DIR = fileURLToPath(new URL("../../public", import.meta.url));

describe("featured retail dashboard", () => {
  it("hero and gallery images exist under public/", () => {
    for (const src of [retailDashboard.heroImage, ...retailDashboard.images].filter((s): s is string => Boolean(s))) {
      assert.ok(existsSync(PUBLIC_DIR + src), `${src} is missing`);
    }
  });

  it("has 3–5 'what I built' bullets", () => {
    assert.ok(retailDashboard.whatIBuilt.length >= 3 && retailDashboard.whatIBuilt.length <= 5);
  });
});

describe("featured online retail dashboard", () => {
  it("has 3–5 'what I built' bullets and the brief's summary", () => {
    assert.ok(onlineRetailDashboard.whatIBuilt.length >= 3 && onlineRetailDashboard.whatIBuilt.length <= 5);
    assert.equal(onlineRetailDashboard.title, "Online retail dashboard");
    assert.match(onlineRetailDashboard.summary, /^A million invoice lines, aggregated on the server/);
  });

  it("hero and gallery images exist under public/", () => {
    assert.ok(onlineRetailDashboard.heroImage, "has a hero image");
    for (const src of [onlineRetailDashboard.heroImage, ...onlineRetailDashboard.images].filter((s): s is string => Boolean(s))) {
      assert.ok(existsSync(PUBLIC_DIR + src), `${src} is missing`);
    }
    assert.equal(onlineRetailDashboard.images.length, 2);
  });

  it("lists the stack, with the optional services marked, and the brief's role and dates", () => {
    assert.deepEqual(onlineRetailDashboard.stack, ["Next.js", "React", "TypeScript", "D3", "GraphQL", "Postgres (optional)", "Claude API (optional)"]);
    assert.equal(onlineRetailDashboard.role, "Designer and engineer (solo)");
    assert.equal(onlineRetailDashboard.dates, "2026");
    assert.ok(onlineRetailDashboard.whatIBuilt.some((b) => b.includes("Claude Code")), "says it was built with Claude Code");
  });
});
