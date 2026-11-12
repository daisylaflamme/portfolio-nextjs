/**
 * Captures pages with Playwright and frames them like the existing case-study heroes
 * (public/images/projects/asi-header, checkout): a light-gray browser window with
 * three dots and an empty URL pill, and a dark phone with a thin lighter outline, a
 * camera notch and a header-coloured strip above the page. Both sit on a transparent
 * background with a soft shadow.
 *
 * Writes WebP (q85) per config entry: <name>-desktop.webp, <name>-phone.webp and, with
 * `hero: true`, a 1600×1000 <name>-hero.webp (laptop and phone together).
 *
 * Usage:
 *   npm run build && npm run screenshots
 *   npm run screenshots -- --base http://localhost:3100   (use a running server)
 *   npm run screenshots -- --only retail-dashboard
 *
 * Config: scripts/screenshots.config.mjs. Build-time only: nothing here ships to the browser.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import entries from "./screenshots.config.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 3200;
const MAX_BYTES = 250 * 1024;

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  phone: { width: 390, height: 844 },
};

// Frame colours sampled from the existing hero composites.
const BROWSER = {
  outline: "#393e4a",
  bar: "#dfe2e8",
  pill: "#ffffff",
  dots: ["#ff5f56", "#febd2d", "#28c740"],
};
const PHONE = { outline: "#4f5560", bezel: "#11141a", notch: "#050607" };

// ---------- CLI ----------

const args = process.argv.slice(2);
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const only = argValue("--only");
let base = argValue("--base");

// ---------- Server ----------

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs / 1000}s`);
}

function startServer() {
  if (!existsSync(join(ROOT, ".next", "BUILD_ID"))) {
    throw new Error("No production build found. Run `npm run build` first, or pass --base <url>.");
  }
  // One command string: npx needs a shell on Windows, and Node warns about args + shell.
  const child = spawn(`npx next start -p ${PORT}`, {
    cwd: ROOT,
    stdio: "ignore",
    shell: true,
    // Its own process group on macOS/Linux, so the whole group can be stopped.
    detached: process.platform !== "win32",
  });
  const stop = () => {
    if (child.exitCode !== null) return;
    // The shell has its own child process; kill the whole tree.
    if (process.platform === "win32") spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    else {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    }
  };
  process.on("exit", stop);
  return stop;
}

// ---------- Capture ----------

/** Waits for fonts, visible images and every chart (elements marked data-chart). */
async function waitUntilRendered(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      !document.querySelector("[data-chart-loading]") &&
      [...document.querySelectorAll("[data-chart]")].every((el) => el.getAttribute("data-chart-ready") === "true"),
    null,
    { timeout: 20_000 },
  );
  await page.evaluate(async () => {
    const visible = [...document.images].filter((img) => img.getBoundingClientRect().top < window.innerHeight);
    await Promise.all(
      visible.map((img) =>
        img.complete
          ? img.decode().catch(() => {})
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
    // Two frames, so the last layout and paint have happened.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

async function capture(browser, entry, viewportName) {
  const viewport = VIEWPORTS[viewportName];
  if (!viewport) throw new Error(`Unknown viewport "${viewportName}" in ${entry.name}`);
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    colorScheme: entry.theme,
    reducedMotion: "reduce",
    hasTouch: viewportName === "phone",
    isMobile: viewportName === "phone",
  });
  await context.addInitScript((theme) => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage blocked: colorScheme still picks the theme.
    }
  }, entry.theme);
  const page = await context.newPage();
  await page.goto(new URL(entry.route, base).href, { waitUntil: "networkidle" });
  await waitUntilRendered(page);
  const target = entry.scrollTo?.[viewportName];
  if (target) {
    // Put the element just below the (sticky) site header, then let anything lazy settle.
    await page.locator(target).first().evaluate((el) => {
      const header = document.querySelector("body > header, header");
      const sticky = header && ["sticky", "fixed"].includes(getComputedStyle(header).position);
      const offset = (sticky ? header.getBoundingClientRect().height : 0) + 24;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
    });
    await page.waitForLoadState("networkidle");
    await waitUntilRendered(page);
  }
  const png = await page.screenshot({ type: "png" });
  await context.close();
  return png;
}

// ---------- Frames ----------

const svg = (w, h, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);

/** Colour of the capture's top-left pixel row: the page header, used for the phone strip. */
async function headerColor(png) {
  const { data } = await sharp(png).extract({ left: 8, top: 2, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  return `rgb(${data[0]},${data[1]},${data[2]})`;
}

/** Resizes a capture to `width` and rounds its corners with a mask. */
async function fitScreen(png, width, radius, height) {
  const meta = await sharp(png).metadata();
  const h = height ?? Math.round((width * meta.height) / meta.width);
  const resized = await sharp(png).resize(width, h, { fit: "cover", position: "top" }).png().toBuffer();
  const mask = svg(width, h, `<rect width="${width}" height="${h}" rx="${radius.bottom}" fill="#fff"/>`);
  const masked = await sharp(resized).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  return { buffer: masked, height: h };
}

/** Browser window: light bar with three dots and an empty URL pill. `width` is the outer width. */
async function browserFrame(png, width) {
  const k = width / 1150; // the existing heroes' laptop width
  const o = Math.max(1, Math.round(2 * k));
  const bar = Math.round(40 * k);
  const r = Math.round(14 * k);
  const screenW = width - 2 * o;
  const screen = await fitScreen(png, screenW, { bottom: Math.max(2, r - o) });
  const height = o + bar + screen.height + o;
  const dotR = 6 * k;
  const pillX = 84 * k;
  const pillH = 22 * k;
  const frame = svg(
    width,
    height,
    `<rect width="${width}" height="${height}" rx="${r}" fill="${BROWSER.outline}"/>
     <path d="M${o} ${o + r - o}a${r - o} ${r - o} 0 0 1 ${r - o} -${r - o}h${width - 2 * r}a${r - o} ${r - o} 0 0 1 ${r - o} ${r - o}v${bar - (r - o)}h-${screenW}z" fill="${BROWSER.bar}"/>
     ${BROWSER.dots.map((c, i) => `<circle cx="${(19 + 18 * i) * k}" cy="${o + bar / 2}" r="${dotR}" fill="${c}"/>`).join("")}
     <rect x="${pillX}" y="${o + (bar - pillH) / 2}" width="${width - pillX - 82 * k}" height="${pillH}" rx="${pillH / 2}" fill="${BROWSER.pill}"/>`,
  );
  const buffer = await sharp(frame)
    .composite([{ input: screen.buffer, left: o, top: o + bar }])
    .png()
    .toBuffer();
  return { buffer, width, height, radius: r };
}

/** Phone: dark bezel, thin lighter outline, notch, and a header-coloured strip above the page. */
async function phoneFrame(png, width, strip) {
  const k = width / 280; // the existing heroes' phone width
  const o = Math.max(1, Math.round(2.5 * k));
  const t = Math.round(8 * k);
  const r = Math.round(42 * k);
  const inner = o + t;
  const screenW = width - 2 * inner;
  const screenR = Math.max(4, r - inner);
  const notch = { w: 70 * k, h: 20 * k, y: inner + 9 * k };
  const stripH = Math.round(notch.y + notch.h + 8 * k - inner);
  const page = await sharp(png).resize(screenW).png().toBuffer();
  const pageH = (await sharp(page).metadata()).height;
  const screenH = stripH + pageH;
  const height = 2 * inner + screenH;

  const stripAndPage = await sharp({
    create: { width: screenW, height: screenH, channels: 4, background: strip },
  })
    .composite([
      { input: page, left: 0, top: stripH },
      { input: svg(screenW, screenH, `<rect width="${screenW}" height="${screenH}" rx="${screenR}" fill="#fff"/>`), blend: "dest-in" },
    ])
    .png()
    .toBuffer();

  const body = svg(
    width,
    height,
    `<rect width="${width}" height="${height}" rx="${r}" fill="${PHONE.outline}"/>
     <rect x="${o}" y="${o}" width="${width - 2 * o}" height="${height - 2 * o}" rx="${r - o}" fill="${PHONE.bezel}"/>`,
  );
  const notchSvg = svg(
    width,
    height,
    `<rect x="${(width - notch.w) / 2}" y="${notch.y}" width="${notch.w}" height="${notch.h}" rx="${notch.h / 2}" fill="${PHONE.notch}"/>`,
  );
  const buffer = await sharp(body)
    .composite([{ input: stripAndPage, left: inner, top: inner }, { input: notchSvg }])
    .png()
    .toBuffer();
  return { buffer, width, height, radius: r };
}

/** Soft drop shadow for a device of the given size, as an image `pad` larger on every side. */
async function shadowFor(device, pad) {
  const w = device.width + 2 * pad;
  const h = device.height + 2 * pad;
  const offset = Math.round(pad * 0.3);
  const shape = svg(
    w,
    h,
    `<rect x="${pad}" y="${pad + offset}" width="${device.width}" height="${device.height}" rx="${device.radius}" fill="rgba(0,0,0,0.32)"/>`,
  );
  return sharp(shape).blur(Math.max(1, pad / 2.4)).png().toBuffer();
}

/** A framed device on a transparent canvas with its shadow. */
async function withShadow(device, pad) {
  const shadow = await shadowFor(device, pad);
  return sharp(shadow)
    .composite([{ input: device.buffer, left: pad, top: pad }])
    .png()
    .toBuffer();
}

// ---------- Output ----------

async function writeWebp(png, file) {
  let out = await sharp(png).webp({ quality: 85, effort: 6, alphaQuality: 90 }).toBuffer();
  if (out.length > MAX_BYTES) {
    // Same quality with a smaller chroma footprint before warning.
    out = await sharp(png).webp({ quality: 85, effort: 6, alphaQuality: 80, smartSubsample: true }).toBuffer();
  }
  writeFileSync(file, out);
  const kb = Math.round(out.length / 1024);
  const meta = await sharp(out).metadata();
  console.log(`  ${relative(ROOT, file)}  ${meta.width}×${meta.height}  ${kb} KB${out.length > MAX_BYTES ? "  ⚠ over 250 KB" : ""}`);
}

async function run() {
  const list = entries.filter((e) => !only || e.name === only);
  if (list.length === 0) throw new Error(only ? `No config entry named "${only}"` : "No entries in screenshots.config.mjs");

  let stopServer = () => {};
  if (!base) {
    stopServer = startServer();
    base = `http://localhost:${PORT}`;
  }
  await waitForServer(base);

  const browser = await chromium.launch();
  try {
    for (const entry of list) {
      console.log(`${entry.name}: ${entry.route} (${entry.theme})`);
      const outDir = join(ROOT, entry.outDir);
      mkdirSync(outDir, { recursive: true });
      const shots = {};
      for (const v of entry.viewports) shots[v] = await capture(browser, entry, v);
      const strip = shots.phone ? await headerColor(shots.phone) : null;

      // Gallery images: max 1600px wide, framed on a transparent background.
      if (shots.desktop) {
        const pad = 40;
        const device = await browserFrame(shots.desktop, 1600 - 2 * pad);
        await writeWebp(await withShadow(device, pad), join(outDir, `${entry.name}-desktop.webp`));
      }
      if (shots.phone) {
        const pad = 40;
        const device = await phoneFrame(shots.phone, 800 - 2 * pad, strip);
        await writeWebp(await withShadow(device, pad), join(outDir, `${entry.name}-phone.webp`));
      }

      // Hero: laptop top right, phone overlapping bottom left, as in the existing heroes.
      if (entry.hero) {
        if (!shots.desktop || !shots.phone) throw new Error(`${entry.name}: hero needs both desktop and phone`);
        const W = 1600;
        const H = 1000;
        const laptop = await browserFrame(shots.desktop, 1150);
        const phone = await phoneFrame(shots.phone, 260, strip);
        const lPad = 44;
        const pPad = 36;
        const laptopAt = { left: 270, top: 50 };
        const phoneAt = { left: 60, top: H - phone.height - 52 };
        const hero = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
          .composite([
            { input: await shadowFor(laptop, lPad), left: laptopAt.left - lPad, top: laptopAt.top - lPad },
            { input: laptop.buffer, ...laptopAt },
            { input: await shadowFor(phone, pPad), left: phoneAt.left - pPad, top: phoneAt.top - pPad },
            { input: phone.buffer, ...phoneAt },
          ])
          .png()
          .toBuffer();
        await writeWebp(hero, join(outDir, `${entry.name}-hero.webp`));
      }
    }
  } finally {
    await browser.close();
    stopServer();
  }
}

run().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
