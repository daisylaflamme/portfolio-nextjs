# Portfolio Next.js — Architecture

A Next.js 14 (App Router) portfolio site for Daisy Laflamme: UI/Front-End Engineer. It uses React 18, Tailwind CSS 4, and DaisyUI, with a flower-style home navigation and shared glass-style UI.

**Production:** Deployed with [Vercel](https://vercel.com) at **[https://www.daisylaflamme.net/](https://www.daisylaflamme.net/)**.

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18
- **Styling:** Tailwind CSS 4, DaisyUI 5
- **Fonts:** Inter, Playfair Display (Google Fonts)
- **Email (contact form):** [Resend](https://resend.com) (server-side API route)
- **Analytics:** [Vercel Analytics](https://vercel.com/docs/analytics) (`@vercel/analytics`)

---

## Directory structure

```
src/
├── app/
│   ├── layout.js              # Root layout: Header, NavMenu, Dock, Footer, Analytics
│   ├── page.js                # Home: flower navigation (petals + Connect)
│   ├── globals.css            # Design tokens, shared styles, flower/modals
│   ├── Header.js              # Site title + route-based subtitle (client)
│   ├── NavMenu.js             # Hamburger + sidebar nav (client)
│   ├── Dock.js                # Fixed bottom quick links (mobile/tablet; client)
│   ├── Footer.js              # Social/contact icons (desktop; client)
│   ├── GoToTop.js             # Scroll-to-top button (client)
│   ├── FilterDropdown.js      # Multi-select project filter (client)
│   ├── about/
│   │   ├── layout.js
│   │   └── page.js
│   ├── certificates/
│   │   └── page.js
│   ├── resume/
│   │   └── page.js
│   ├── web-projects/
│   │   ├── page.js            # Grid, filters, modal state (client)
│   │   ├── ProjectCard.js
│   │   └── ProjectModal.js
│   ├── contact/
│   │   ├── page.js            # Contact info + ContactForm
│   │   └── ContactForm.jsx    # Resend-backed form (client)
│   └── api/
│       └── contact/
│           └── route.ts       # POST → Resend (server only; secrets in env)
└── data/
    ├── projects.js            # Project entries for /web-projects
    └── certificates.js        # Certificate entries for /certificates

public/
├── images/
└── icons/                     # Contact / social SVGs
```

---

## Component-based architecture

UI is split into focused components under `src/app/` (and route-specific co-located files):

| Component | File | Role |
|-----------|------|------|
| **Header** | `Header.js` | Title + subtitle from current route |
| **NavMenu** | `NavMenu.js` | Hamburger, sidebar, nav links, active state |
| **Dock** | `Dock.js` | Fixed bottom bar: Home, LinkedIn, GitHub, Email (below `lg`) |
| **Footer** | `Footer.js` | Same social links as dock (from `lg` up) |
| **GoToTop** | `GoToTop.js` | Appears after scroll; smooth scroll to top |
| **FilterDropdown** | `FilterDropdown.js` | Multi-select filter for project tags |
| **ProjectCard** | `web-projects/ProjectCard.js` | Thumbnail, summary, “View Details” |
| **ProjectModal** | `web-projects/ProjectModal.js` | `<dialog>` with images, description, external link |
| **ContactForm** | `contact/ContactForm.jsx` | Name, email, message; posts to `/api/contact` |

**Pages** compose these components: e.g. `web-projects/page.js` uses `FilterDropdown`, `ProjectCard`, `ProjectModal`, `GoToTop`; `contact/page.js` uses `ContactForm` beside contact info.

---

## Hooks usage (React)

Client components use hooks for state, effects, and navigation:

| Hook(s) | Where used | Purpose |
|---------|------------|---------|
| `useState` | `NavMenu`, `Dock`, `GoToTop`, `FilterDropdown`, `web-projects/page`, `ProjectModal`, `ContactForm`, `certificates/page` | Open/close UI, filters, modal, form state, loading |
| `useEffect` | `GoToTop`, `FilterDropdown`, `ProjectModal`, `certificates/page` | Scroll listener, click-outside, `<dialog>` lifecycle, certificates UX |
| `useCallback` | `GoToTop`, `ContactForm` | Stable handlers (scroll, validation) |
| `useMemo` | `web-projects/page` | Derived filtered project list from selected tags |
| `useRef` | `FilterDropdown`, `ProjectModal` | DOM refs (dropdown container, dialog) |
| `usePathname` | `NavMenu`, `Header`, `Dock` | Active route / subtitle |

---

## Layout and shell

- **`layout.js`** — Wraps `<html>` / `<body>`, loads `globals.css`, metadata, **Header**, **NavMenu**, `{children}`, **Dock** (small screens), **Footer** (large screens), **`<Analytics />`** (Vercel).

- **Header** — `usePathname()` for subtitle.

- **NavMenu** — `useState` + `usePathname()` for drawer and active link.

---

## Routes and pages

| Route | Role |
|-------|------|
| `/` | Home: flower nav (Connect → contact, petal links) |
| `/about` | About page |
| `/web-projects` | Filterable grid + modal from `projects.js` |
| `/resume` | Resume |
| `/certificates` | Certificates from `certificates.js` |
| `/contact` | Contact info + **ContactForm** (Resend) |

---

## Contact API architecture (Resend)

The contact form does **not** use PHP or public env URLs for secrets. Flow:

1. **Browser** — `ContactForm` sends `POST /api/contact` with JSON: `{ name, email, message, website_url }` (`website_url` is an empty honeypot when humans submit).
2. **Server** — `src/app/api/contact/route.ts` (App Router Route Handler):
   - Reads **`RESEND_API_KEY`**, **`CONTACT_TO_EMAIL`**, **`CONTACT_FROM_EMAIL`** from environment (never exposed to the client).
   - Validates input (required fields, email format, minimum message length).
   - If honeypot is filled → returns success without sending (anti-spam).
   - Calls **Resend** `emails.send` with HTML body, subject including sender name, **`replyTo`** set to the visitor’s email.
3. **Response** — JSON `{ ok: true }` or `{ error: "..." }` with appropriate HTTP status.

**Setup:** See **`CONTACT_SETUP.md`** and **`.env.local.example`**. On Vercel, add the three env vars and redeploy.

---

## Data

- **`src/data/projects.js`** — `projects` array for `/web-projects`.
- **`src/data/certificates.js`** — Used by `/certificates`.

---

## Styling and design system

- **`globals.css`** — `@theme` tokens, Tailwind import, DaisyUI plugin; glass styles (`.project-card`, `.contact-section`, `.project-modal-box`); flower navigation classes.

- **Tailwind** — Utility classes across components; DaisyUI for modal patterns where used.

---

## Environment (contact + deploy)

| Variable | Where | Purpose |
|----------|-------|---------|
| `RESEND_API_KEY` | Server only (`.env.local`, Vercel) | Resend API authentication |
| `CONTACT_TO_EMAIL` | Server only | Inbox that receives form submissions |
| `CONTACT_FROM_EMAIL` | Server only | Verified sender domain in Resend (or `onboarding@resend.dev` for testing) |

Do not commit `.env.local`.

---

## Scripts

- `npm run dev` — Development server (e.g. http://localhost:3000).
- `npm run build` — Production build.
- `npm run start` — Run production server after `build`.
- `npm run lint` — Next.js lint.

---

## Summary

Single **Next.js 14 App Router** app with a **shared layout** (Header, NavMenu, Dock, Footer, analytics), **multiple routes** (home, about, web-projects, resume, certificates, contact), **component-based UI**, and **hooks** for navigation, modals, filters, and forms. **Contact** is handled by a **server Route Handler** and **Resend**; no PHP in this repo.
