import { projects } from "./projects";
import type { WorkItem, WorkTag } from "./types";

/**
 * Landing pages and campaign sites for the "Landing pages" section of
 * /work/marketing-design. They're also case studies on /work/web-engineering, so the
 * images and alt text come from projects.ts; only the short caption is written here.
 */
const ENTRIES: ReadonlyArray<{ id: string; summary: string; year: number; tags?: WorkTag[] }> = [
  {
    id: "gphomestay-digital-experiences",
    summary: "Ad campaign landing pages, host testimonials, a Salesforce lead form and a customer quiz for a homestay program.",
    year: 2016,
  },
  {
    id: "dragon-boat-campaign",
    summary: "Mobile-first event landing pages and a matching desktop microsite.",
    year: 2016,
  },
  {
    id: "wechat-raffle-game",
    summary: "Mobile raffle game for an event, built with jQuery and the WeChat SDK.",
    year: 2016,
  },
  {
    id: "globalu-site-pages",
    summary: "Responsive tour, destination and itinerary templates built from PSD designs.",
    year: 2016,
  },
  {
    id: "cambridge-institute-web-properties",
    summary: "Marketing and orientation sites, a WordPress migration and a QuickBase registration form.",
    year: 2016,
    tags: ["education"],
  },
];

export const landingPages: WorkItem[] = ENTRIES.map(({ id, summary, year, tags = [] }) => {
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error(`landingPages: no project with id "${id}"`);
  return {
    id,
    title: project.title,
    summary,
    year,
    images: project.images,
    imageAlt: project.imageAlt,
    tags: ["landing-pages", ...tags],
    link: { label: "Read the case study", href: `/work/web-engineering?project=${id}` },
  };
});
