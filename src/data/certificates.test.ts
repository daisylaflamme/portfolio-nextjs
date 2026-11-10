import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  RECENT_LEARNING_TITLES,
  certificates,
  certifications,
  courseHistory,
  courseHistoryCount,
  diplomas,
  recentLearning,
} from "./certificates.ts";

const PUBLIC_DIR = fileURLToPath(new URL("../../public", import.meta.url));

describe("education content", () => {
  it("every recent-learning title matches exactly one course", () => {
    for (const title of RECENT_LEARNING_TITLES) {
      assert.equal(certificates.filter((cert) => cert.title === title).length, 1, title);
    }
    assert.deepEqual(
      recentLearning.map((cert) => cert.title),
      [...RECENT_LEARNING_TITLES],
    );
  });

  it("recent learning plus the course history covers every course once", () => {
    assert.equal(recentLearning.length + courseHistoryCount, certificates.length);
    const historyTitles = courseHistory.flatMap((group) => group.courses.map((cert) => cert.title));
    for (const title of RECENT_LEARNING_TITLES) assert.ok(!historyTitles.includes(title), title);
  });

  it("the course history is grouped newest year first", () => {
    const years = courseHistory.map((group) => group.year);
    assert.deepEqual(years, [...years].sort((a, b) => b - a));
    for (const group of courseHistory) {
      assert.ok(group.courses.every((cert) => cert.year === group.year), String(group.year));
    }
  });

  it("degree and certification images exist under public/", () => {
    const paths = [...diplomas, ...certifications].flatMap((cert) => [cert.thumbnail, cert.image]);
    assert.deepEqual(paths.filter((src) => !existsSync(PUBLIC_DIR + src)), []);
  });
});
