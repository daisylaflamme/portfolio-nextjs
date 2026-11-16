import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AXIS_FONT_PX, LABEL_GAP, axisMargins, fitXTicks, textWidth } from "./axisLayout.ts";

describe("axisMargins", () => {
  it("sizes the left gutter to the widest y label plus the gap", () => {
    const m = axisMargins(["£0", "£500k", "£1.5M", "£2M"]);
    assert.equal(m.left, textWidth("£1.5M") + LABEL_GAP + 2);
    assert.ok(m.top >= AXIS_FONT_PX / 2, "room for half a label above the top tick");
    assert.ok(m.bottom >= AXIS_FONT_PX + LABEL_GAP, "room for the x labels below the baseline");
  });

  it("takes overrides", () => {
    assert.equal(axisMargins(["0%"], { right: 4 }).right, 4);
  });
});

describe("fitXTicks", () => {
  const months = Array.from({ length: 25 }, (_, i) => ({ key: String(i), x: 60 + i * 12, label: "Dec 09" }));

  it("keeps labels inside the plot's width and never lets two come closer than the gap", () => {
    const placed = fitXTicks(months, 60, 360);
    assert.ok(placed.length >= 2);
    for (const t of placed) {
      assert.ok(t.left >= 60, `${t.key} starts inside the plot`);
      assert.ok(t.left + t.width <= 360, `${t.key} ends inside the plot`);
    }
    for (let i = 1; i < placed.length; i++) assert.ok(placed[i].left >= placed[i - 1].left + placed[i - 1].width + 12);
  });

  it("always keeps the first and the last tick", () => {
    const placed = fitXTicks(months, 60, 360);
    assert.equal(placed[0].key, "0");
    assert.equal(placed.at(-1)?.key, "24");
  });

  it("drops the label before the last one when they would collide (narrow plot)", () => {
    // "Dec 10" is ~41px wide: the middle label sits 30px before the last one, so it must go.
    const ticks = [
      { key: "first", x: 70, label: "Dec 09" },
      { key: "middle", x: 240, label: "Dec 10" },
      { key: "last", x: 270, label: "Dec 11" },
    ];
    assert.deepEqual(fitXTicks(ticks, 50, 300).map((t) => t.key), ["first", "last"]);
  });
});
