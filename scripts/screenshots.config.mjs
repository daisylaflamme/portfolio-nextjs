/**
 * Pages for `npm run screenshots`. Each entry is captured at the listed viewports and
 * framed like the existing case-study heroes (browser window and phone).
 *
 * - route:     path on the site
 * - name:      file prefix, e.g. "retail-dashboard" → retail-dashboard-hero.webp
 * - viewports: any of "desktop" (1280×800) and "phone" (390×844)
 * - theme:     "dark" or "light"
 * - outDir:    folder under the repo, usually public/images/projects/<name>
 * - hero:      also write the 1600×1000 laptop + phone composite (needs both viewports)
 * - scrollTo:  optional { desktop?: selector, phone?: selector } to capture from that
 *              element (placed just below the site header) instead of the page top
 */
const entries = [
  {
    route: "/work/dashboards/larrys-secret",
    name: "retail-dashboard",
    viewports: ["desktop", "phone"],
    theme: "dark",
    outDir: "public/images/projects/retail-dashboard",
    hero: true,
    // The laptop shows the filters, KPIs and first charts; the phone keeps the title.
    scrollTo: { desktop: '[aria-label="Filter by store"]' },
  },
];

export default entries;
