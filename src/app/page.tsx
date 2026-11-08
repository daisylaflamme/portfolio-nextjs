import Link from "next/link";
import { projects } from "@/data/projects";
import type { Metadata } from "next";
import type { Project } from "@/data/types";
import { getLanguageStats, type LanguageStats } from "@/lib/github";
import { CONTACT_LINKS } from "@/components/SiteFooter";
import { PAGES } from "@/lib/seo";
import { WORK_CATEGORIES } from "@/lib/work";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: PAGES.home.title },
  description: PAGES.home.description,
  alternates: { canonical: PAGES.home.path },
};


const SELECTED_CASES: ReadonlyArray<{ id: Project["id"]; note: string }> = [
  { id: "store-details-maps", note: "~80% lower annual mapping cost" },
  { id: "blueport-multisite-platform-ui", note: "20+ storefronts, one component set" },
  { id: "checkout-multi-payments", note: "Affirm, Acima, Progressive and more" },
  { id: "gifspark-ai-greeting-app", note: "Runway, React, Stripe" },
  { id: "angular-modal-system", note: "Accessibility-first patterns" },
];

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function LanguagesCard({ languages, isSample }: LanguageStats) {
  const max = Math.max(...languages.map((l) => l.pct), 1);
  const summary = languages.map((l) => `${l.name} ${l.pct}%`).join(", ");
  return (
    <figure className="m-0 flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <figcaption className="font-mono text-sm text-muted">
        {"// languages across my GitHub repos"}
        {isSample ? " (sample)" : ""}
      </figcaption>
      <p className="sr-only">Languages by share of code: {summary}.</p>
      <ul className="flex flex-col gap-3" aria-hidden="true">
        {languages.map((lang) => (
          <li key={lang.name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-right font-mono text-sm font-medium text-fg">{lang.name}</span>
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                className="block h-7 rounded bg-accent"
                style={{ width: `${Math.round((lang.pct / max) * 82)}%` }}
              />
              <span className="font-mono text-[13px] text-muted">{lang.pct}%</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export default async function Home() {
  const { languages, isSample } = await getLanguageStats();
  const byId = new Map(projects.map((p) => [p.id, p]));
  const cases = SELECTED_CASES.flatMap((c) => {
    const project = byId.get(c.id);
    return project ? [{ ...c, project }] : [];
  });

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12 lg:pb-20 lg:pt-20">
        <div className="flex flex-col gap-5">
          <h1 className="font-display text-[clamp(2.1rem,6.5vw,3.75rem)] font-bold leading-[1.06] tracking-tight text-balance">
            Design-minded engineer for commerce, marketing and product UI.
          </h1>
          <p className="font-mono text-base text-accent sm:text-lg">
            Daisy Laflamme · Senior Frontend &amp; UI Engineer
          </p>
          <p className="max-w-xl font-mono text-[15px] leading-7 text-muted sm:text-base">
            I build accessible, fast interfaces — and the data stories and visuals around them.
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              href={PAGES.work.path}
              className="inline-flex min-h-12 items-center rounded-lg bg-accent px-6 font-mono text-base font-medium text-on-accent no-underline transition-opacity hover:opacity-90"
            >
              view work
            </Link>
            <a
              href={CONTACT_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-line px-5 font-mono text-base text-fg no-underline transition-colors hover:border-field"
            >
              github <ArrowUpRight />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
        <LanguagesCard languages={languages} isSample={isSample} />
      </section>

      {/* Work hub */}
      <section aria-labelledby="work-hub-heading" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 id="work-hub-heading" className="mb-4 font-mono text-sm font-medium text-muted">
          {"// choose a body of work"}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {WORK_CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link
                href={category.path}
                className="flex h-full min-h-44 flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-6 no-underline transition-colors hover:border-accent sm:p-7"
              >
                <span className="font-mono text-[13px] text-accent">{category.path}</span>
                <span className="flex flex-col gap-2">
                  <span className="font-display text-2xl font-semibold text-fg">{category.label}</span>
                  <span className="text-base leading-relaxed text-muted">{category.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Selected case studies */}
      <section aria-labelledby="cases-heading" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 id="cases-heading" className="mb-3 font-mono text-sm font-medium text-muted">
          {"// selected case studies"}
        </h2>
        <ul>
          {cases.map(({ id, note, project }) => (
            <li key={id} className="border-t border-line last:border-b">
              <Link
                href={`${PAGES.work.path}?project=${id}`}
                className="group flex flex-col gap-1 py-5 text-fg no-underline sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="font-display text-xl font-semibold group-hover:text-accent sm:text-[22px]">
                  {project.title}
                </span>
                <span className="text-[15px] text-muted">
                  {note} <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
