# Daisy Laflamme — portfolio

Portfolio site for Daisy Laflamme, senior front-end and UI engineer: case studies, résumé, certificates and a contact form.

**Production:** [www.daisylaflamme.net](https://www.daisylaflamme.net/), deployed on [Vercel](https://vercel.com).

## Stack

| Area | What |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript, `strict: true`, no `any` |
| Styling | Tailwind CSS 4, daisyUI 5; light and dark themes |
| Fonts | Inter, Space Grotesk, JetBrains Mono, self-hosted by `next/font` |
| Images | `next/image`; project screenshots stored as WebP (see below) |
| Email | [Resend](https://resend.com), called from server route handlers |
| Analytics | Vercel Analytics and Speed Insights |
| Tests | Playwright with `@axe-core/playwright` |
| CI | GitHub Actions on every pull request |

Requires Node 20.9 or later (Next 16's minimum); `.nvmrc` pins the version CI uses.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # only needed for the contact form; see "Environment"
npm run dev                        # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint 9 (flat config: `eslint.config.mjs`) |
| `npm run typecheck` | Generates Next's route types, then `tsc --noEmit` |
| `npm run test:unit` | Unit tests (Node's built-in test runner, `src/**/*.test.ts`) |
| `npm run test:e2e` | Playwright tests against the production build |
| `npm run images:projects` | Converts new project screenshots to WebP (see "Images") |
| `npm run images:archive` | Converts archive images to WebP and lists any that are missing (see "Images") |
| `npm run github:check` | Tests `GITHUB_TOKEN` against the home page query and prints the result (see "GitHub token") |

## Architecture

```
src/
├── app/                      Routes (App Router)
│   ├── layout.tsx            Shell: theme script, header, footer, analytics, metadata defaults
│   ├── page.tsx              Home (server component; GitHub language stats, revalidated daily)
│   ├── work/
│   │   ├── WorkHeader.tsx    Category heading and tabs shared by every /work page
│   │   ├── web-engineering/  Case studies: filters, cards, case-study dialog
│   │   ├── dashboards/       Dashboard screenshots and write-ups
│   │   ├── marketing-design/ Design gallery with lightbox
│   │   └── presentations/    Deck covers with slide links and PDFs
│   ├── about/  resume/  certificates/  contact/
│   ├── api/contact/          POST: contact form → Resend
│   ├── api/resume-visit/     POST: email when the site is opened from a résumé link
│   ├── sitemap.ts  robots.ts
│   └── globals.css           Design tokens (both themes), dialog styles, reduced motion
├── components/               SiteHeader, SiteFooter, ThemeToggle, ResumeVisitTracker, ImageLightbox, ImageSetButton
├── data/
│   ├── types.ts              Project, ProjectTag, WorkItem, WorkTag, Certificate
│   ├── projects.ts           Case studies + featuredProjectIds
│   ├── graphics.ts  dashboards.ts  presentations.ts   Archive work (WorkItem)
│   └── certificates.ts
└── lib/
    ├── seo.ts                PAGES: path, title, description for every route
    ├── work.ts               WORK_CATEGORIES: the four Work tabs and home tiles
    ├── archive.ts            Hides archive items whose images aren't in public/ yet
    ├── projectDisplay.ts     Labels, stack, case-study sections from a Project
    ├── projectSections.ts    Featured / earlier grouping and tag filtering
    ├── github.ts             GitHub GraphQL language stats, typed, with fallback (github.test.ts)
    ├── personalization.ts    ?company= / ?role= slugs for résumé links
    └── theme.ts              Inline script that applies the saved theme before first paint
e2e/                          Playwright specs
scripts/                      Node scripts (image conversion)
```

### How the main pieces fit

- **Content is data.** Projects and certificates live in `src/data` and are typed by `src/data/types.ts`, so a missing field or a misspelled tag fails `npm run typecheck`. Only ids listed in `featuredProjectIds` get the large case-study layout; everything else appears under "Earlier work".
- **One list of pages.** `PAGES` in `src/lib/seo.ts` drives each route's title, description, canonical URL and Open Graph tags, the sitemap, and the Playwright route list. To add a page, add it there.
- **Work categories.** `/work/web-engineering`, `/work/dashboards`, `/work/marketing-design` and `/work/presentations` share `WorkHeader`, whose tabs are links with `aria-current`. `WORK_CATEGORIES` in `src/lib/work.ts` feeds the tabs and the home page tiles. `/web-projects` redirects permanently to `/work/web-engineering`, keeping `?project=`.
- **Case-study state.** Filter chips are local state; the open case study is the URL (`/work/web-engineering?project=<id>`), read with `useSearchParams` inside a Suspense boundary. Deep links, reloads and sharing all work, and the rest of the page is still prerendered.
- **Dialogs.** The case-study dialog, the image lightbox (case studies, design gallery, dashboards) and the diploma viewer use native `<dialog>` with `showModal()`. The browser traps focus, closes on Escape and returns focus to the trigger; `html.has-open-dialog` stops the page behind from scrolling.
- **Theme.** `data-theme` on `<html>` is set by an inline script before first paint, from `localStorage` or else the OS preference. `ThemeToggle` reads it with `useSyncExternalStore`, so the server markup and the hydrated toggle always agree.
- **Accessibility.** Every page is checked with axe in both themes. Motion is turned off under `prefers-reduced-motion`.

### Images

Images are WebP, at most 1600px wide, and originals are moved to the git-ignored `assets/originals/`.

- **Case studies** (`public/images/projects`): drop the PNG or JPG there, reference it in `src/data/projects.ts`, and run `npm run images:projects`. It converts the file and updates the path. See `public/images/projects/README.md`.
- **Archive work** (`public/images/archive`): copy the files listed in `public/images/archive/README.md` and run `npm run images:archive`. It converts them and lists anything still missing. Until an image is present, the page hides that item instead of showing a broken image.

## Testing

Unit tests run directly in Node 24 (TypeScript type stripping), with no extra test framework: `npm run test:unit`. `src/lib/github.test.ts` covers the GitHub query with a mocked `fetch`: aggregation, the time ranges, and every failure path (bad token, rate limits, GraphQL errors, unknown user, network and timeout).

The Playwright tests run against the production build, in Chromium, at 390px and 1280px wide:

```bash
npx playwright install chromium   # once
npm run build
npm run test:e2e                   # starts `next start` on port 3100, or reuses one already running
npx playwright show-report         # HTML report from the last run
```

| Spec | Covers |
| --- | --- |
| `smoke.spec.ts` | Every route returns 200 with its title, heading, header and footer; no horizontal overflow; no console errors; main navigation, including the mobile menu |
| `home.spec.ts` | The language chart: a labelled sample without a token, or a working time-range switch with one |
| `theme.spec.ts` | The theme choice survives reloads and carries across pages |
| `project-modal.spec.ts` | Opens from a card; `?project=<id>` deep link; Escape closes and returns focus; unknown ids stay closed; Next updates the URL |
| `filters.spec.ts` | The result count matches the data for single and combined filters and resets on clear |
| `a11y.spec.ts` | Zero serious or critical axe violations (WCAG 2.2 AA tags) on every route and in the open dialog, in light and dark |
| `work-hub.spec.ts` | `/web-projects` redirect; category tabs and home tiles; design gallery and lightbox (keys, focus, scroll lock); dashboards and presentations content; no SlideShare or Tableau requests; axe on the open lightbox |

Expected titles, ids and counts are read from `src/lib/seo.ts` and `src/data`, so editing content doesn't break the tests. Use `npx playwright test --ui` to debug, or `PORT=4000 npm run test:e2e` to use a different port.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request (and on demand): `npm ci`, lint, typecheck, unit tests, build, then the Playwright tests. Browsers are cached between runs. When a run fails, the HTML report and traces are uploaded as the `playwright-report` artifact.

## Environment

| Variable | Needed for | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | Contact form, résumé-visit email | Server only |
| `CONTACT_TO_EMAIL` | Same | Inbox that receives messages |
| `CONTACT_FROM_EMAIL` | Same | A sender verified in Resend, or `onboarding@resend.dev` for testing |
| `GITHUB_TOKEN` | Home page language chart | Optional. A fine-grained, read-only token (below). Without it, or if GitHub fails, the chart shows labelled sample data and the reason is logged |

Copy `.env.local.example` to `.env.local` for local use (it's git-ignored). On Vercel, set these under Project → Settings → Environment Variables. `CONTACT_SETUP.md` walks through the Resend setup.

### GitHub token

The home page sums language bytes across my public, non-fork repositories with one GraphQL request, for each range in `LANGUAGE_RANGES` (`src/lib/github.ts`): **All time** (the default) and **Last 12 months** (repos pushed in that time). A switch on the card changes the range without another request. The page is regenerated at most once a day (ISR), so the token is used about once a day.

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → **Generate new token**.
2. Name it `portfolio-nextjs (Vercel)`, set **Resource owner** to your account and pick an expiration (set a reminder to rotate it).
3. **Repository access: Public repositories (read-only)**. Leave every permission at **No access**.
4. Generate and copy the token (it starts with `github_pat_`).
5. Locally: put `GITHUB_TOKEN=github_pat_…` in `.env.local` and run `npm run github:check`.
6. Vercel: Project → Settings → Environment Variables → add `GITHUB_TOKEN`, mark it **Sensitive**, select **Production** and **Preview**, save, then redeploy (new variables only apply to new deployments).

If the token expires or is revoked, the chart switches back to sample data and the Vercel function logs show `[github] GitHub GraphQL HTTP 401 …`.
