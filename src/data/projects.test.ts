import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { projects } from "./projects.ts";

const PUBLIC_DIR = fileURLToPath(new URL("../../public", import.meta.url));
const onDisk = (src: string) => existsSync(PUBLIC_DIR + decodeURI(src));

describe("project images", () => {
  for (const project of projects) {
    it(`${project.id}: every image path exists under public/`, () => {
      const paths = [project.thumbnail, project.heroImage, ...project.images].filter(
        (src): src is string => Boolean(src),
      );
      const missing = paths.filter((src) => !src.startsWith("/") || !onDisk(src));
      assert.deepEqual(missing, [], `missing files for ${project.id}`);
    });

    if (project.imageAlts) {
      it(`${project.id}: one alt text per image`, () => {
        assert.equal(project.imageAlts?.length, project.images.length);
        assert.ok(project.imageAlts?.every((alt) => alt.trim().length > 0), "empty alt text");
      });
    }
  }
});
