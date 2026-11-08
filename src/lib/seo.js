export const SITE_URL = "https://www.daisylaflamme.net";
export const SITE_NAME = "Daisy Laflamme";

/**
 * Every public page, in sitemap order. Layouts build their metadata from this and
 * src/app/sitemap.ts lists it, so adding a page here keeps both in sync.
 */
export const PAGES = {
  home: {
    path: "/",
    title: "Daisy Laflamme | Senior Frontend & UI Engineer",
    description:
      "Daisy Laflamme is a senior frontend and UI engineer building accessible, high-performance interfaces for multi-brand e-commerce, marketing, and product teams with React, Next.js, Angular, and TypeScript.",
    priority: 1,
  },
  work: {
    path: "/web-projects",
    title: "Work",
    description:
      "Case studies by Daisy Laflamme: multi-brand e-commerce UI, checkout and payments, accessibility-first components, maps, CMS tools and AI products.",
    priority: 0.9,
  },
  about: {
    path: "/about",
    title: "About",
    description:
      "Senior UI / Front-End Engineer with over a decade of experience designing and building interfaces for large-scale e-commerce and complex systems.",
    priority: 0.8,
  },
  resume: {
    path: "/resume",
    title: "Résumé",
    description:
      "Résumé of Daisy Laflamme, senior front-end and UI engineer: experience, skills and education across e-commerce, payments, accessibility and design systems.",
    priority: 0.8,
  },
  certificates: {
    path: "/certificates",
    title: "Education and Certificates",
    description:
      "Daisy Laflamme's degrees, training programs and certificates in front-end engineering, UX, accessibility, analytics and AI.",
    priority: 0.6,
  },
  contact: {
    path: "/contact",
    title: "Contact",
    description:
      "Get in touch with Daisy Laflamme, senior front-end and UI engineer based in Braintree, MA and available for remote work.",
    priority: 0.7,
  },
};

/**
 * Per-page metadata: title (the root layout's template adds " | Daisy Laflamme"),
 * description, canonical URL and Open Graph tags that point at this page.
 * Next replaces openGraph wholesale in child segments, so every field is set here.
 */
export function pageMetadata({ title, description, path }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
    },
  };
}
