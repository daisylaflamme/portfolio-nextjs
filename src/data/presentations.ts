import type { WorkItem } from "./types";

/**
 * Presentations for /work/presentations: a cover image plus a link to the slides
 * and, when available, a PDF. No SlideShare embeds.
 *
 * Covers: save the first slide of each deck as public/images/archive/presentations/<id>.png
 * (or .jpg) and run `npm run images:archive`. A PDF is optional: put it at the `pdf`
 * path and the Download PDF button appears.
 */
const dir = "/images/archive/presentations";

export const presentations: WorkItem[] = [
  {
    id: "javascript-learning-platform",
    title: "JavaScript Learning Platform",
    summary:
      "Concept and user testing for JS Girls, an online platform that teaches JavaScript to women through visual, interactive tutorials.",
    year: 2015,
    images: [`${dir}/javascript-learning-platform.webp`],
    imageAlt: "Title slide of the JS Girls JavaScript learning platform presentation",
    tags: ["education", "ux-research", "javascript"],
    link: { label: "View slides", href: "https://www.slideshare.net/slideshow/js-gurls/55312555" },
    pdf: `${dir}/javascript-learning-platform.pdf`,
  },
  {
    id: "hci-project",
    title: "Human Computer Interaction Project",
    summary:
      "Usability review of Validately’s home page and demo flow, with a redesign proposal to make the product easier to understand and learn.",
    year: 2015,
    images: [`${dir}/hci-project.webp`],
    imageAlt: "Title slide of the Human Computer Interaction project presentation",
    tags: ["ux-research", "usability"],
    link: {
      label: "View slides",
      href: "https://www.slideshare.net/slideshow/human-computer-interaction-project/54834580",
    },
    pdf: `${dir}/hci-project.pdf`,
  },
  {
    id: "retail-kpi-dashboard",
    title: "Retail KPI Dashboard",
    summary: "Sales KPIs and a market basket analysis for a clothing-store chain, built in Tableau.",
    year: 2013,
    images: [`${dir}/retail-kpi-dashboard.webp`],
    imageAlt: "Title slide of the Retail KPI Dashboard presentation",
    tags: ["tableau", "data-visualization", "retail"],
    link: { label: "View slides", href: "https://www.slideshare.net/slideshow/dashboard-18693099/18693099" },
    pdf: `${dir}/retail-kpi-dashboard.pdf`,
  },
  {
    id: "smart-tv-apis",
    title: "Smart TV and API Integration",
    summary:
      "Research on building Smart TV apps: Samsung’s HTML and JavaScript app platform, its device APIs and SDK, and how TV apps connect with phones and tablets.",
    year: 2013,
    images: [`${dir}/smart-tv-apis.webp`],
    imageAlt: "Title slide of the Smart TV and APIs Integration presentation",
    tags: ["javascript"],
    link: { label: "View slides", href: "https://www.slideshare.net/slideshow/smart-tv-and-apis/18796485" },
    pdf: `${dir}/smart-tv-apis.pdf`,
  },
  {
    id: "jqsa-website-plan",
    title: "JQSA Website Plan",
    summary:
      "Team plan for the JQSA website: site map, page structure, theme and layout, and a WordPress build with PayPal donations, slideshows and social links.",
    year: 2013,
    images: [`${dir}/jqsa-website-plan.webp`],
    imageAlt: "Title slide of the JQSA Web Site Plan presentation by Johnie Orchanian, Daisy Laflamme and Runcong Chen",
    tags: ["education", "nonprofit"],
    link: { label: "View slides", href: "https://www.slideshare.net/slideshow/jqsa-website-plan/18796429" },
    pdf: `${dir}/jqsa-website-plan.pdf`,
  },
];
