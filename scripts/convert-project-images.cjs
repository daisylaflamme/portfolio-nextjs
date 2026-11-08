// npm run images:projects
// Converts PNG/JPG referenced by src/data/projects.js to WebP (max 1600px wide),
// moves every PNG/JPG out of public/ into assets/originals/ (not part of the build),
// and rewrites the paths in projects.js. Safe to re-run: only PNG/JPG still in
// public/images/projects are touched.
const fs = require("fs");
const path = require("path");
const root = process.argv[2] || path.resolve(__dirname, "..");
const sharp = require(require.resolve("sharp", { paths: [root] }));

const MAX_WIDTH = 1600; // modal shows ~976 CSS px; lightbox shows the file 1:1 up to this
const QUALITY = 85; // UI screenshots with small text need a bit more than the usual 75-80

const dataFile = path.join(root, "src/data/projects.js");
let data = fs.readFileSync(dataFile, "utf8");
const refs = new Set([...data.matchAll(/"(\/images\/projects\/[^"]+\.(?:png|jpe?g))"/gi)].map((m) => m[1]));

const pubDir = path.join(root, "public/images/projects");
const origDir = path.join(root, "assets/originals/images/projects");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

(async () => {
  let before = 0, after = 0, converted = 0, moved = 0;
  for (const file of walk(pubDir).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
    const rel = "/" + path.relative(path.join(root, "public"), file).split(path.sep).join("/");
    if (refs.has(rel)) {
      const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
      const img = sharp(file, { limitInputPixels: false });
      const meta = await img.metadata();
      await img
        .resize({ width: Math.min(meta.width, MAX_WIDTH), withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(out);
      before += fs.statSync(file).size;
      after += fs.statSync(out).size;
      data = data.split(`"${rel}"`).join(`"${rel.replace(/\.(png|jpe?g)$/i, ".webp")}"`);
      converted++;
    }
    const dest = path.join(origDir, path.relative(pubDir, file));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(file, dest);
    moved++;
  }
  fs.writeFileSync(dataFile, data);
  console.log(`converted ${converted}, moved ${moved} originals`);
  console.log(`referenced images: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
})().catch((e) => { console.error(e); process.exit(1); });
