import type { Metadata } from "next";
import Link from "next/link";
import { dashboards, retailDashboard } from "@/data/dashboards";
import FeaturedDashboardCard from "./FeaturedDashboardCard";
import { withAvailableFiles } from "@/lib/archive";
import { PAGES, pageMetadata } from "@/lib/seo";
import ImageSetButton from "@/components/ImageSetButton";
import WorkHeader from "../WorkHeader";
import EmptyArchive from "../EmptyArchive";

export const metadata: Metadata = pageMetadata(PAGES.dashboards);

export default function DashboardsPage() {
  const items = withAvailableFiles(dashboards);

  return (
    <main className="flex-1">
      <WorkHeader
        current="dashboards"
        intro="Interactive data interfaces built in React and D3, plus earlier Tableau and JavaScript dashboards from 2013–2014. Select a screenshot to see it full size."
      />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <FeaturedDashboardCard item={retailDashboard} />
      </div>

      <section aria-labelledby="earlier-dashboards" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <h2 id="earlier-dashboards" className="font-display text-2xl font-semibold text-fg">
          Earlier dashboards (2013–2014)
        </h2>

        {items.length === 0 ? <EmptyArchive /> : null}

        <ul className="mt-5 flex flex-col gap-6">
          {items.map((item) => (
            <li key={item.id} id={item.id} className="scroll-mt-24">
              <article
                aria-labelledby={`${item.id}-title`}
                className="grid gap-5 rounded-2xl border border-line bg-surface p-4 sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8"
              >
                <ImageSetButton
                  item={item}
                  aspectClass="aspect-[16/10]"
                  sizes="(min-width: 1152px) 620px, (min-width: 1024px) 54vw, calc(100vw - 4rem)"
                />
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-[13px] text-muted">
                    {[item.year, ...(item.tools ?? [])].join(" · ")}
                  </p>
                  <h3 id={`${item.id}-title`} className="font-display text-2xl font-semibold leading-snug text-fg">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-body">{item.summary}</p>
                  {item.id === retailDashboard.before ? (
                    <p className="text-[15px] leading-relaxed text-body">
                      <span className="font-semibold text-fg">Before:</span> the first version of the{" "}
                      <Link href={retailDashboard.href} className="font-semibold text-fg underline underline-offset-4 hover:text-accent">
                        Larry’s Secret dashboard
                      </Link>{" "}
                      above.
                    </p>
                  ) : null}
                  {item.highlights && item.highlights.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                      {item.highlights.map((point) => (
                        <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-body">
                          <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.link ? (
                    <Link
                      href={item.link.href}
                      className="mt-1 inline-flex min-h-11 items-center self-start font-semibold text-fg underline underline-offset-4 hover:text-accent"
                    >
                      {item.link.label}
                      <span className="sr-only">: {item.title}</span>
                      <span aria-hidden="true">&nbsp;→</span>
                    </Link>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
