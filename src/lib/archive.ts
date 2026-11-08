import fs from "node:fs";
import path from "node:path";
import type { WorkItem } from "@/data/types";

// Server-only: reads public/ at build time.

/** True when a public path such as "/images/archive/x.webp" exists in public/. */
export function publicFileExists(src: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", src));
}

/**
 * Keep only the images that have been added to public/, and drop items with none
 * left, so a missing file never renders as a broken image. A PDF that isn't there
 * is dropped too. `npm run images:archive` lists what's missing.
 */
export function withAvailableFiles(items: readonly WorkItem[]): WorkItem[] {
  return items.flatMap((item) => {
    const images = item.images.filter(publicFileExists);
    if (images.length === 0) return [];
    const pdf = item.pdf && publicFileExists(item.pdf) ? item.pdf : undefined;
    return [{ ...item, images, pdf }];
  });
}
