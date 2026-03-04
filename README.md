# Portfolio Next.js — Architecture

A Next.js 14 (App Router) portfolio site for Daisy Laflamme: UI/Front-End Engineer. It uses React 18, Tailwind CSS 4, and DaisyUI, with a flower-style home navigation and shared glass-style UI.

**Production:** Deployed with [Vercel](https://vercel.com) at **[https://www.daisylaflamme.net/](https://www.daisylaflamme.net/)**.

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18
- **Styling:** Tailwind CSS 4, DaisyUI 5
- **Fonts:** Inter, Playfair Display (Google Fonts)

---

## Directory structure

```
src/
├── app/
│   ├── layout.js          # Root layout: metadata, Header, NavMenu, children
│   ├── page.js            # Home: flower navigation (petals + Connect)
│   ├── globals.css        # Design tokens, shared components, flower/modals
│   ├── Header.js          # Site title + route-based subtitle (client)
│   ├── NavMenu.js         # Hamburger + sidebar nav (client)
│   ├── resume/
│   │   └── page.js        # Resume page (server component)
│   ├── web-projects/
│   │   ├── page.js        # Project grid + modal state (client)
│   │   ├── ProjectCard.js  # Card with thumbnail, summary, View Details
│   │   └── ProjectModal.js# Dialog for project details + link
│   ├── contact/
│   │   └── page.js        # Contact info + form (client validation, POST to PHP)
│   └── api/
│       └── contact/
│           └── route.js   # Optional: POST proxy to PHP (CONTACT_PHP_URL); not used in Option 2
└── data/
    └── projects.js       # Array of project objects (id, title, summary, description, thumbnail, image, imageAlt, link)

public/
├── images/                # Favicon, backgrounds, project images & thumbnails
└── icons/                 # Contact SVGs (email, location, linkedin, github)
```

---

## Layout and shell

- **`layout.js`**  
  - Wraps the app in `<html>` / `<body>`, loads `globals.css`, and sets metadata (title, description, favicon).  
  - Renders **Header**, **NavMenu**, then `{children}` for the current route.

- **Header**  
  - Shows “Daisy Laflamme” and a **subtitle that depends on the route** (e.g. “User Interface Portfolio”, “Web Projects”, “Resume”, “Let’s Connect!”). Uses `usePathname()` (client component).

- **NavMenu**  
  - Fixed hamburger button (top-left) toggles a sidebar with links: Home, Resume, Web Projects, Contact. Uses `useState` and `usePathname()` for open state and active styling.

---

## Routes and pages

| Route            | Role |
|------------------|------|
| `/`              | Home: flower navigation (center “Connect” + petal links to Resume, Photography, GitHub, Email, LinkedIn, Web Projects). |
| `/resume`        | Resume: two-column layout (summary, education, skills, experience). |
| `/web-projects`  | Project grid from `projects.js`; each card opens a modal with full description and optional “Visit Site” link. |
| `/contact`       | Contact info (email, location, LinkedIn, GitHub) + Quick Links (Web Projects, Resume) + “Send a Message” form. |

---

## Key components

- **Home (`page.js`)**  
  - Flower layout: center link “Connect” → `/contact`, petals array for internal/external links. Styled with `.flower_container`, `.flower_center`, `.flower_petal`, `.ios-icon` from `globals.css`.

- **ProjectCard**  
  - Renders thumbnail (Next.js `Image`), title, summary, and “View Details” button. Calls `onViewDetails(project)` to open the modal.

- **ProjectModal**  
  - `<dialog>` controlled by `project` (truthy = open). Shows title, description, image, optional “Visit Site” link, close button. Uses `.project-modal-box` and `.project-modal-backdrop`.

- **Contact page**  
  - Two sections (Contact Information, Send a Message) in a responsive grid. Form: name, email, message; client-side validation and sanitization; honeypot. **Option 2:** form posts directly to the PHP script on cPanel (`NEXT_PUBLIC_CONTACT_FORM_ACTION`); browser navigates to the PHP response page (success or error with “Back to contact” link).

---

## API

- **`POST /api/contact`** (optional)  
  - Used only if you switch to Option 1 (API proxy). Accepts JSON: `{ name, email, message }`; forwards to PHP via **`CONTACT_PHP_URL`**.  
  - **Current setup (Option 2):** The contact form does not use this route; it POSTs directly to the PHP URL from the browser.

---

## Data

- **`src/data/projects.js`**  
  - Exports a `projects` array. Each item: `id`, `title`, `summary`, `description`, `thumbnail`, `image`, `imageAlt`, optional `link`. Used only by `/web-projects` (page + ProjectCard/ProjectModal).

---

## Styling and design system

- **`globals.css`**  
  - **Design tokens** (in `@theme` and `:root`): fonts (Inter, Playfair Display), colors (e.g. `--color-primary-bg`, `--color-font-primary`, `--color-petal-bg`, `--color-shadow-accent`), and shared vars (e.g. `--blur`).  
  - **Shared UI:**  
    - `.project-card`, `.contact-section`, `.project-modal-box`: same “glass” style (gradients, shadow, border, backdrop-filter).  
    - `.project-modal-backdrop`: blur behind modal.  
  - **Flower navigation:** `.flower_container`, `.flower_center`, `.flower_petal`, `.ios-icon` (and pseudo-elements) for the home layout.  
  - **Body:** `background-color`, `color` from tokens.

- **Tailwind**  
  - Utility classes used throughout; DaisyUI used where applicable (e.g. modal actions).

---

## Environment

- **Option 2 (current):** Form posts to PHP from the browser.  
  - **`NEXT_PUBLIC_CONTACT_FORM_ACTION`** (optional) — full URL of the PHP script (e.g. `https://www.daisylaflamme.net/contact.php`). Defaults to that URL if unset.  
- **Option 1 (API proxy):** If you use the API route instead, set **`CONTACT_PHP_URL`** in Vercel to the same PHP URL.

---

## Scripts

- `npm run dev` — Development server (e.g. http://localhost:3000).
- `npm run build` — Production build https://www.daisylaflamme.net/.
- `npm run start` — Run production server after `build`.
- `npm run lint` — Next.js lint.

---

## Summary

The app is a **single Next.js 14 App Router app** with a **shared layout** (Header + NavMenu), **four main routes** (home flower, resume, web-projects grid + modal, contact form), and a **central design system** in `globals.css` (tokens + glass cards + flower nav). Data is static (`projects.js`). **Contact form (Option 2):** the browser POSTs directly to a PHP script on cPanel; no Vercel env required for the form to work. Upload `contact.php` to `public_html` and optionally set `NEXT_PUBLIC_CONTACT_FORM_ACTION` if the URL differs.
