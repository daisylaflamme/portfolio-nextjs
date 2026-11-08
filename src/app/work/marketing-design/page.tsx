import type { Metadata } from "next";
import { graphics } from "@/data/graphics";
import type { WorkTag } from "@/data/types";
import { withAvailableFiles } from "@/lib/archive";
import { PAGES, pageMetadata } from "@/lib/seo";
import ImageSetButton from "@/components/ImageSetButton";
import WorkHeader from "../WorkHeader";
import EmptyArchive from "../EmptyArchive";

export const metadata: Metadata = pageMetadata(PAGES.marketingDesign);

const SECTIONS: ReadonlyArray<{ tag: WorkTag; heading: string }> = [
  { tag: "branding", heading: "Brand identity" },
  { tag: "advertising", heading: "Ads and banners" },
  { tag: "print", heading: "Print" },
  { tag: "illustration", heading: "Illustration and retouching" },
];

export default function MarketingDesignPage() {
  const items = withAvailableFiles(graphics);
  // Each item sits in the first section whose tag it has, so nothing appears twice.
  const sections = SECTIONS.map((section, i) => ({
    ...section,
    items: items.filter(
      (item) => item.tags.includes(section.tag) && !SECTIONS.slice(0, i).some((s) => item.tags.includes(s.tag))
    ),
  })).filter((section) => section.items.length > 0);
  const firstId = sections[0]?.items[0]?.id;

  return (
    <main className="flex-1">
      <WorkHeader
        current="marketing-design"
        intro="Logos, campaign ads, flyers and illustration from client, nonprofit and university work. Select any piece to see it full size."
      />

      {sections.length === 0 ? <EmptyArchive /> : null}

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 sm:px-6">
        {sections.map((section) => (
          <section key={section.tag} aria-labelledby={`${section.tag}-heading`}>
            <h2 id={`${section.tag}-heading`} className="mb-5 font-display text-2xl font-semibold text-fg">
              {section.heading}
            </h2>
            <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <li key={item.id}>
                  <figure className="m-0 flex flex-col gap-3">
                    <ImageSetButton
                      item={item}
                      priority={item.id === firstId}
                      sizes="(min-width: 1152px) 352px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, calc(100vw - 2rem)"
                    />
                    <figcaption className="flex flex-col gap-1">
                      <span className="font-semibold text-fg">{item.title}</span>
                      <span className="text-[15px] leading-relaxed text-muted">{item.summary}</span>
                      <span className="font-mono text-xs text-muted">{item.year}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
