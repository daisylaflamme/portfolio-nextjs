/**
 * Shapes of the content in src/data. Every field the UI reads is listed here, so a
 * typo in projects.ts or certificates.ts fails `npm run typecheck` instead of
 * silently rendering nothing.
 */

/** Every tag used in projects.ts. Filters and display labels are checked against it. */
export const PROJECT_TAGS = [
  "html",
  "css",
  "scss",
  "bootstrap",
  "tailwind",
  "shadcn-ui",
  "javascript",
  "typescript",
  "angular",
  "react",
  "nextjs",
  "vite",
  "wordpress",
  "supabase",
  "stripe",
  "runway-api",
  "ecommerce",
  "payments",
  "cms",
  "api-integrations",
  "ui-components",
  "maps",
  "accessibility",
  "ai",
  "ux",
  "ux-design",
  "product-design",
  "qa",
  "seo",
  "digital-product",
  "digital-media",
  "publishing",
  "pdf",
  "instructional-design",
  "volunteer",
  "startup",
  "small-business",
] as const;

export type ProjectTag = (typeof PROJECT_TAGS)[number];

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  /** URL-safe and unique; used in ?project=<id> deep links. */
  id: string;
  title: string;
  /** One or two sentences for cards. */
  summary: string;
  /** Long form; split into an overview and highlights when `problem`/`whatIBuilt` are absent. */
  description: string;
  thumbnail: string;
  /**
   * Optional composite (e.g. devices on a transparent background) for the project cards.
   * Shown whole with object-contain, so its frames are never cropped.
   */
  heroImage?: string;
  /** Full-size images for the case-study gallery; the first one is also the card image. */
  images: string[];
  /** Alt text for the first image. */
  imageAlt: string;
  /** Optional alt text for every image, in `images` order (the case-study gallery and lightbox use it). */
  imageAlts?: string[];
  /** Live site, or null when the work isn't public any more. */
  link: string | null;
  extraLinks?: ProjectLink[];
  tags: ProjectTag[];

  // Case-study fields, set on featured projects.
  role?: string;
  team?: string;
  dates?: string;
  /** Display names, e.g. "Angular"; overrides the stack derived from tags. */
  stack?: string[];
  problem?: string;
  whatIBuilt?: string[];
  impact?: string[];
  /** Optional "Team" paragraph in the modal. */
  teamContribution?: string;
}

export type CertificateProvider = "linkedin" | "lynda" | "udemy";

export interface Certificate {
  /** Empty string when the provider's logo is used instead (see `provider`). */
  thumbnail: string;
  image: string;
  title: string;
  year: number;
  provider?: CertificateProvider;
}

/** Tags for the archive categories (graphics, dashboards, presentations). */
export const WORK_TAGS = [
  // Marketing & design sections, in display order
  "landing-pages",
  "branding",
  "advertising",
  "print",
  "illustration",
  // Tools and topics
  "photoshop",
  "tableau",
  "javascript",
  "jquery",
  "data-visualization",
  "retail",
  "demographics",
  "ux-research",
  "usability",
  "education",
  "nonprofit",
] as const;

export type WorkTag = (typeof WORK_TAGS)[number];

/**
 * One piece of archive work: a design, a dashboard or a presentation.
 * Image paths point into public/images/archive/<category>/ (see npm run images:archive).
 */
export interface WorkItem {
  /** URL-safe and unique within its category. */
  id: string;
  title: string;
  /** One or two short sentences. */
  summary: string;
  year: number;
  /** One or more images; the first is the cover. */
  images: string[];
  /** Describes what the images show; extra images get "(2 of 3)" appended. */
  imageAlt: string;
  tags: WorkTag[];
  /** External page for the work, e.g. the slides online. */
  link?: ProjectLink;
  /** A PDF in public/, e.g. "/images/archive/presentations/hci-project.pdf". */
  pdf?: string;
  /** Short write-up bullets (dashboards). */
  highlights?: string[];
  /** Tools used, as display names. */
  tools?: string[];
}
