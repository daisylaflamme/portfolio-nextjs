/**
 * Display helpers for project data (src/data/projects.js).
 * Keeps the data file simple while giving cards and the case-study modal
 * readable labels and structure.
 */

const TAG_LABELS = {
  angular: "Angular",
  react: "React",
  nextjs: "Next.js",
  typescript: "TypeScript",
  javascript: "JavaScript",
  vite: "Vite",
  tailwind: "Tailwind",
  "shadcn-ui": "shadcn/ui",
  "framer-motion": "Framer Motion",
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
  "digital-publishing": "Digital publishing",
  publishing: "Publishing",
  pdf: "PDF",
};

/** Tags that describe the work (shown on cards), in priority order. */
const TOPIC_TAGS = [
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
const STACK_TAGS = [
  "angular",
  "react",
  "nextjs",
  "typescript",
  "javascript",
  "vite",
  "tailwind",
  "shadcn-ui",
  "framer-motion",
  "supabase",
  "stripe",
  "runway-api",
  "wordpress",
  "bootstrap",
  "scss",
  "css",
  "html",
];

export function tagLabel(tag) {
  return TAG_LABELS[tag] ?? tag.replace(/-/g, " ");
}

/** Up to `max` short topic labels for a card eyebrow, e.g. "Payments · E-commerce". */
export function topicLabels(project, max = 3) {
  const tags = project.tags ?? [];
  const topics = TOPIC_TAGS.filter((tag) => tags.includes(tag)).map(tagLabel);
  if (topics.length < max) {
    const framework = STACK_TAGS.find((tag) => tags.includes(tag));
    if (framework) topics.push(tagLabel(framework));
  }
  return topics.slice(0, max);
}

/** Stack labels for the modal meta row. Uses `project.stack` when present. */
export function stackLabels(project) {
  if (Array.isArray(project.stack) && project.stack.length > 0) return project.stack;
  const tags = project.tags ?? [];
  return STACK_TAGS.filter((tag) => tags.includes(tag)).map(tagLabel).slice(0, 6);
}

export function projectImages(project) {
  if (Array.isArray(project.images) && project.images.length > 0) return project.images;
  if (project.image) return [project.image];
  if (project.thumbnail) return [project.thumbnail];
  return [];
}

const NO_BREAK_BEFORE = /(?:\b(?:e\.g|i\.e|vs|etc|approx|Inc|Co)\.|\b[A-Z]\.)$/;

/**
 * Split prose into sentences without breaking on "e.g.", "vs.", initials or decimals.
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  if (!text) return [];
  const parts = [];
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
 * Prefers explicit fields (problem, whatIBuilt, impact, teamContribution);
 * otherwise breaks the long description into a short overview + scannable highlights.
 */
export function caseStudyContent(project) {
  const built = project.whatIBuilt ?? project.built;
  const hasStructured = Boolean(project.problem || (Array.isArray(built) && built.length));

  if (hasStructured) {
    return {
      overview: project.problem ?? "",
      overviewHeading: "The problem",
      highlights: Array.isArray(built) ? built : [],
      highlightsHeading: "What I built",
      team: project.teamContribution ?? "",
      impact: Array.isArray(project.impact) ? project.impact : [],
    };
  }

  const sentences = splitSentences(project.description ?? "");
  const [first = "", ...rest] = sentences;
  return {
    overview: first,
    overviewHeading: "Overview",
    highlights: rest,
    highlightsHeading: "Highlights",
    team: "",
    impact: Array.isArray(project.impact) ? project.impact : [],
  };
}
