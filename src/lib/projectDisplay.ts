import type { Project, ProjectTag } from "@/data/types";

/**
 * Display helpers for project data (src/data/projects.ts).
 * Keeps the data file simple while giving cards and the case-study modal
 * readable labels and structure.
 */

const TAG_LABELS: Partial<Record<ProjectTag, string>> = {
  angular: "Angular",
  react: "React",
  nextjs: "Next.js",
  d3: "D3",
  typescript: "TypeScript",
  javascript: "JavaScript",
  vite: "Vite",
  tailwind: "Tailwind",
  "shadcn-ui": "shadcn/ui",
  bootstrap: "Bootstrap",
  scss: "SCSS",
  css: "CSS",
  html: "HTML",
  wordpress: "WordPress",
  stripe: "Stripe",
  supabase: "Supabase",
  "runway-api": "Runway API",
  ecommerce: "E-commerce",
  payments: "Payments",
  "api-integrations": "APIs",
  maps: "Maps",
  "ui-components": "UI components",
  accessibility: "Accessibility",
  cms: "CMS",
  ai: "AI",
  "ux-design": "UX design",
  ux: "UX",
  "product-design": "Product design",
  "instructional-design": "Instructional design",
  volunteer: "Volunteer",
  startup: "Startup",
  "small-business": "Small business",
  publishing: "Publishing",
  pdf: "PDF",
};

/** Tags that describe the work (shown on cards), in priority order. */
const TOPIC_TAGS: ProjectTag[] = [
  "payments",
  "accessibility",
  "ai",
  "maps",
  "ui-components",
  "ecommerce",
  "cms",
  "api-integrations",
  "ux-design",
  "product-design",
  "wordpress",
  "instructional-design",
  "volunteer",
  "startup",
  "small-business",
];

/** Tags that describe the stack (shown in the modal), in priority order. */
const STACK_TAGS: ProjectTag[] = [
  "angular",
  "react",
  "nextjs",
  "d3",
  "typescript",
  "javascript",
  "vite",
  "tailwind",
  "shadcn-ui",
  "supabase",
  "stripe",
  "runway-api",
  "wordpress",
  "bootstrap",
  "scss",
  "css",
  "html",
];

/** True for a path on this site ("/work/…"), which opens in the same tab. */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/** The project's own page on this site, if its `link` is one, with its button label. */
export function internalLink(project: Pick<Project, "link" | "linkLabel">): { href: string; label: string } | null {
  return project.link && isInternalHref(project.link)
    ? { href: project.link, label: project.linkLabel ?? "visit site" }
    : null;
}

export function tagLabel(tag: ProjectTag): string {
  return TAG_LABELS[tag] ?? tag.replace(/-/g, " ");
}

/** Up to `max` short topic labels for a card eyebrow, e.g. "Payments · E-commerce". */
export function topicLabels(project: Pick<Project, "tags">, max = 3): string[] {
  const { tags } = project;
  const topics = TOPIC_TAGS.filter((tag) => tags.includes(tag)).map(tagLabel);
  if (topics.length < max) {
    const framework = STACK_TAGS.find((tag) => tags.includes(tag));
    if (framework) topics.push(tagLabel(framework));
  }
  return topics.slice(0, max);
}

/** Stack labels for the modal meta row. Uses `project.stack` when present. */
export function stackLabels(project: Pick<Project, "stack" | "tags">): string[] {
  if (project.stack && project.stack.length > 0) return project.stack;
  const { tags } = project;
  return STACK_TAGS.filter((tag) => tags.includes(tag)).map(tagLabel).slice(0, 6);
}

export function projectImages(project: Pick<Project, "images" | "thumbnail">): string[] {
  if (project.images.length > 0) return project.images;
  if (project.thumbnail) return [project.thumbnail];
  return [];
}

const NO_BREAK_BEFORE = /(?:\b(?:e\.g|i\.e|vs|etc|approx|Inc|Co)\.|\b[A-Z]\.)$/;

/**
 * Split prose into sentences without breaking on "e.g.", "vs.", initials or decimals.
 */
export function splitSentences(text: string): string[] {
  if (!text) return [];
  const parts: string[] = [];
  let buffer = "";
  const chunks = text.split(/(?<=[.!?])\s+/);
  for (const chunk of chunks) {
    buffer = buffer ? `${buffer} ${chunk}` : chunk;
    if (!NO_BREAK_BEFORE.test(buffer)) {
      parts.push(buffer.trim());
      buffer = "";
    }
  }
  if (buffer.trim()) parts.push(buffer.trim());
  return parts;
}

/**
 * Structured case-study content for the modal.
 * Prefers the explicit fields (problem, whatIBuilt, impact, teamContribution);
 * otherwise breaks the long description into a short overview + scannable highlights.
 */
export interface CaseStudyContent {
  overview: string;
  overviewHeading: string;
  highlights: string[];
  highlightsHeading: string;
  team: string;
  impact: string[];
}

export function caseStudyContent(project: Project): CaseStudyContent {
  const built = project.whatIBuilt ?? [];
  if (project.problem || built.length > 0) {
    return {
      overview: project.problem ?? "",
      overviewHeading: "The problem",
      highlights: built,
      highlightsHeading: "What I built",
      team: project.teamContribution ?? "",
      impact: project.impact ?? [],
    };
  }

  const sentences = splitSentences(project.description);
  const [first = "", ...rest] = sentences;
  return {
    overview: first,
    overviewHeading: "Overview",
    highlights: rest,
    highlightsHeading: "Highlights",
    team: "",
    impact: project.impact ?? [],
  };
}
