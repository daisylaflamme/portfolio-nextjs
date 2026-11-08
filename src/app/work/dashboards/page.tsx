import type { Metadata } from "next";
import Link from "next/link";
import { dashboards } from "@/data/dashboards";
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
        intro="Dashboards for retail sales, customers and demographics, built in Tableau and JavaScript. Select a screenshot to see it full size."
      />

      {items.length === 0 ? <EmptyArchive /> : null}

      <ul className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6">
        {items.map((item, i) => (
          <li key={item.id} id={item.id} className="scroll-mt-24">
            <article
              aria-labelledby={`${item.id}-title`}
              className="grid gap-5 rounded-2xl border border-line bg-surface p-4 sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8"
            >
              <ImageSetButton
                item={item}
                priority={i === 0}
                aspectClass="aspect-[16/10]"
                sizes="(min-width: 1152px) 620px, (min-width: 1024px) 54vw, calc(100vw - 4rem)"
              />
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[13px] text-muted">
                  {[item.year, ...(item.tools ?? [])].join(" · ")}
                </p>
                <h2 id={`${item.id}-title`} className="font-display text-2xl font-semibold leading-snug text-fg">
                  {item.title}
                </h2>
                <p className="text-base leading-relaxed text-body">{item.summary}</p>
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
    </main>
  );
}
