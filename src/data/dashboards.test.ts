import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { retailDashboard } from "./dashboards.ts";

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
