import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as copy from "./content.ts";
import { retailDashboard } from "../../../data/dashboards.ts";

/** Words that would frame the dashboard as coursework. Only the source note may mention the class. */
const BANNED = /\b(course(work)?|class|students?|homework|assignments?|IT 478|2013)\b/i;

describe("Larry's Secret copy", () => {
  it("shared copy has no course, class or year references (except the source note)", () => {
    for (const [name, value] of Object.entries(copy)) {
      if (name === "RETAIL_DASHBOARD_SOURCE") continue;
      assert.doesNotMatch(JSON.stringify(value), BANNED, name);
    }
  });

  it("the portfolio entry has none either", () => {
    const { source, ...rest } = retailDashboard;
    assert.equal(source, copy.RETAIL_DASHBOARD_SOURCE);
    assert.doesNotMatch(JSON.stringify(rest), BANNED);
  });

  it("the source note names the class once", () => {
    assert.match(copy.RETAIL_DASHBOARD_SOURCE, /Business Intelligence class at UMass Boston/);
  });
});
