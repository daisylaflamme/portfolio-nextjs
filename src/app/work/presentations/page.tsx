import type { Metadata } from "next";
import Image from "next/image";
import { presentations, SLIDESHARE_PROFILE } from "@/data/presentations";
import { withAvailableFiles } from "@/lib/archive";
import { PAGES, pageMetadata } from "@/lib/seo";
import WorkHeader from "../WorkHeader";
import EmptyArchive from "../EmptyArchive";

export const metadata: Metadata = pageMetadata(PAGES.presentations);

export default function PresentationsPage() {
  const items = withAvailableFiles(presentations);

  return (
    <main className="flex-1">
      <WorkHeader
        current="presentations"
        intro="Research and proposal decks on learning platforms, usability, retail analytics, Smart TV apps and website planning."
      />

      {items.length === 0 ? <EmptyArchive /> : null}

      <ul className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.id} id={item.id} className="scroll-mt-24">
            <article aria-labelledby={`${item.id}-title`} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="relative aspect-video border-b border-line bg-img">
                <Image
                  src={item.images[0]}
                  alt={item.imageAlt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1152px) 352px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, calc(100vw - 2rem)"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                <p className="font-mono text-[13px] text-muted">{item.year}</p>
                <h2 id={`${item.id}-title`} className="font-display text-xl font-semibold leading-snug text-fg">
                  {item.title}
                </h2>
                <p className="flex-1 text-[15px] leading-relaxed text-body">{item.summary}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.link ? (
                    <a
                      href={item.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 font-mono text-[15px] text-on-accent no-underline hover:opacity-90"
                    >
                      {item.link.label.toLowerCase()} <span aria-hidden="true">↗</span>
                      <span className="sr-only">: {item.title} (opens in a new tab)</span>
                    </a>
                  ) : null}
                  {item.pdf ? (
                    <a
                      href={item.pdf}
                      download
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 font-mono text-[15px] text-fg no-underline hover:border-field"
                    >
                      download pdf<span className="sr-only">: {item.title}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <a
          href={SLIDESHARE_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-[15px] text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          see all presentations on SlideShare <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </p>
    </main>
  );
}
