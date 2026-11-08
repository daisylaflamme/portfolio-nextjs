// npm run images:archive
//
// 1. Converts every JPG/PNG/GIF in public/images/archive/** to WebP (max 1600px wide,
//    quality 85) next to it, and moves the original to assets/originals/ (git-ignored).
//    The format is read from the file itself, so archive GIFs saved as .jpg work too.
// 2. Lists every image and PDF that src/data/{graphics,dashboards,presentations}.ts
//    reference but that isn't in public/ yet. Pages hide items whose images are missing.
//
// Reading the .ts data files needs Node's built-in type stripping (Node 22.18+ / 23.6+).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(import.meta.url)("sharp");
sharp.cache(false); // Windows: don't hold file handles open

const MAX_WIDTH = 1600;
const QUALITY = 85;
const publicDir = path.join(root, "public");
const archiveDir = path.join(publicDir, "images/archive");
const originalsDir = path.join(root, "assets/originals/images/archive");

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
    : [];

// --- 1. Convert ---
let converted = 0;
for (const file of walk(archiveDir).filter((f) => /\.(jpe?g|png|gif)$/i.test(f))) {
  const out = file.replace(/\.(jpe?g|png|gif)$/i, ".webp");
  const image = sharp(file, { animated: false, limitInputPixels: false });
  const { width = MAX_WIDTH } = await image.metadata();
  await image.resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true }).webp({ quality: QUALITY, effort: 6 }).toFile(out);
  const dest = path.join(originalsDir, path.relative(archiveDir, file));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(file, dest);
  converted++;
  console.log(`converted ${path.relative(publicDir, file)} -> ${path.basename(out)}`);
}
console.log(`${converted} file(s) converted.\n`);

// --- 2. Report missing files ---
if (!process.features.typescript) {
  console.log("Skipping the missing-file report: this Node version can't read the .ts data files (needs 22.18+).");
  process.exit(0);
}

const load = async (name) => (await import(pathToFileURL(path.join(root, "src/data", `${name}.ts`)).href))[name];
const categories = {
  graphics: await load("graphics"),
  dashboards: await load("dashboards"),
  presentations: await load("presentations"),
};

let missing = 0;
for (const [category, items] of Object.entries(categories)) {
  const lines = [];
  for (const item of items) {
    for (const src of item.images) {
      if (!fs.existsSync(path.join(publicDir, src))) {
        lines.push(`  public${src.replace(/\.webp$/, ".(jpg|png|gif)")}   ${item.title}`);
      }
    }
    if (item.pdf && !fs.existsSync(path.join(publicDir, item.pdf))) {
      lines.push(`  public${item.pdf}   ${item.title} (optional)`);
    }
  }
  const required = lines.filter((l) => !l.endsWith("(optional)")).length;
  missing += required;
  console.log(`${category}: ${lines.length === 0 ? "all files present" : `${required} image(s) missing`}`);
  for (const line of lines) console.log(line);
}

if (missing > 0) {
  console.log(`\n${missing} image(s) missing. Add them under public/ with any of the listed extensions, then run this again.`);
  process.exitCode = 1;
}
