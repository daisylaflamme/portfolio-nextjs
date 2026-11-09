# CLAUDE.md

Daisy Laflamme's portfolio: Next.js 16 (App Router, Turbopack), React 19, strict TypeScript, Tailwind 4 + daisyUI, deployed on Vercel. Read this before every task. The README has the longer version (architecture tree, test table, env setup).

## Commands

Node 24 (`.nvmrc`; `engines` allows >= 20.9).

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve it |
| `npm run lint` | ESLint 9 flat config (`next lint` no longer exists) |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run test:unit` | Node's built-in test runner on `src/**/*.test.ts` (type stripping, no framework) |
| `npm run test:e2e` | Playwright (Chromium, 390px and 1280px projects) against `next start -p 3100`; build first |
| `npm run images:projects` | Project screenshots in `public/images/projects` → WebP, rewrites paths in `projects.ts` |
| `npm run images:archive` | Archive images in `public/images/archive` → WebP, lists missing files |
| `npm run github:check` | Tests `GITHUB_TOKEN` against the home page GraphQL query |

Before calling a task done: lint, typecheck, test:unit, build, test:e2e. CI (`.github/workflows/ci.yml`) runs the same on every PR.

## Where things live

- `src/app/` routes. Work categories under `src/app/work/` share `WorkHeader` (tabs are links with `aria-current`). `/web-projects` 308-redirects to `/work/web-engineering`, keeping `?project=`.
- `src/data/` content: `projects.ts` (case studies, `featuredProjectIds`), `graphics.ts`, `dashboards.ts`, `presentations.ts`, `landingPages.ts` (derived from projects), `certificates.ts`. Every shape is in `types.ts`; add new tags to `PROJECT_TAGS` / `WORK_TAGS` there.
  - Project images: `images[0]` is the card image (object-cover) and the first gallery image; `imageAlts` (optional, same order as `images`) gives per-image alt text, falling back to `imageAlt`. Optional `heroImage` is a device composite for the **featured** card, shown whole with object-contain and padding (still `priority`); regular cards ignore it.
- `src/lib/` helpers: `seo.ts` (`PAGES`, titles, sitemap), `work.ts` (category list), `github.ts` (GraphQL languages, typed, falls back to labelled sample data), `archive.ts` (hides items whose images are missing).
- Résumé PDF: `public/resume/`, linked from `RESUME_PDF` in `src/lib/resume.ts` (home hero and /resume). To update it, replace the file and the `details` text.
- `src/components/` shared UI, including `ImageLightbox` (the `<dialog>` pattern used everywhere).
- `e2e/` Playwright specs. Expected titles, ids and counts come from `src/data` and `src/lib/seo.ts`, never hard-coded.

## Rules

**Code**
- `strict` TypeScript, no `any` (lint error), no `.js` files (`allowJs: false`).
- Server components by default; `"use client"` only where there's state or events.
- Use GraphQL, new libraries or new abstractions only when they solve a real problem here.

**Mobile first and accessibility (WCAG 2.2 AA)**
- Design at 390px first, then `sm`/`md`/`lg`. No horizontal scroll at 390px (the smoke test checks).
- Zero serious or critical axe violations in light and dark themes. Add an axe check for any new page or dialog state.
- Real buttons and links, 44px minimum targets, visible focus, `aria-current` / `aria-pressed` / `aria-expanded` where they apply.
- Dialogs use native `<dialog>` with `showModal()`: focus moves in, Escape closes, focus returns to the trigger, and the `has-open-dialog` class locks scroll (remove it only when no `dialog[open]` remains).
- Color is never the only signal. Every animation stops under `prefers-reduced-motion` (handled globally in `globals.css`).

**Performance**
- `next/image` with accurate `sizes`. `priority` only on the page's LCP image.
- Images are WebP through the scripts above (max 1600px wide, q85). Never commit originals; they go to git-ignored `assets/originals/`.
- No third-party embeds (SlideShare, Tableau): use a cover image plus a link.

**Content**
- Never invent facts, client names, dates or metrics. Use only what Daisy or a source shows; label assumptions in the report and ask.
- Captions are short and professional. Alt text says what the image shows; call design mockups "mockup".

**Git**
- One branch per task, one commit per step.
- End commits with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Push or open PRs only when asked. PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## Environment

- `GITHUB_TOKEN`: optional, fine-grained, **Public repositories (read-only)**, no permissions. Without it the home chart shows labelled sample data.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`: contact form and résumé-visit email. See `.env.local.example` and `CONTACT_SETUP.md`.
- The build and tests need no secrets.

## Gotchas

- Next 16 only allows image quality 75 by default; `next.config.ts` sets `images.qualities: [75, 90]`.
- `?project=` sync: call `history.replaceState(null, …)`. Passing `history.state` (which carries Next's `__NA`) skips Next's `useSearchParams` update.
- The lightbox's dark background sits on the `<dialog>`, not `::backdrop`, so axe can measure the contrast of its white controls.
- React hooks lint v7 rejects setState in effects and refs read during render. Prefer `useSyncExternalStore`, `key` resets, or deriving from props/URL.
- `.ts` files imported by Node scripts and unit tests must not use the `@/` alias (Node can't resolve it).
- Windows:
  - Stale `next start` processes can outlive the shell; kill them by command line before running Playwright.
  - On a busy machine, run the full suite with `--workers=2`.
  - Write files with the editor tools or node scripts rather than heredocs that contain quotes.
