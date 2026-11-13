import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FeaturedWorkItem } from "@/data/types";
import { publicFileExists } from "@/lib/archive";

interface FeaturedDashboardCardProps {
  item: FeaturedWorkItem;
  /** Shown instead of the hero image until the framed screenshot exists. */
  preview: ReactNode;
  /** Only the first card on the page is the LCP image. */
  priority?: boolean;
}

/** Large card on /work/dashboards linking to a live dashboard. */
export default function FeaturedDashboardCard({ item, preview, priority = false }: FeaturedDashboardCardProps) {
  const hero = item.heroImage && publicFileExists(item.heroImage) ? item.heroImage : null;

  return (
    <article
      aria-labelledby={`${item.id}-title`}
      className="grid overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
    >
      <div className="relative aspect-[16/10] bg-surface-2">
        {hero ? (
          <Image
            src={hero}
            alt={item.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1152px) 640px, (min-width: 1024px) 55vw, calc(100vw - 2rem)"
            className="object-contain p-3 sm:p-5"
          />
        ) : (
          preview
        )}
      </div>
      <div className="flex flex-col gap-3.5 p-5 sm:p-7">
        <p className="font-mono text-[13px] text-accent">{item.eyebrow}</p>
        <h2 id={`${item.id}-title`} className="font-display text-[1.75rem] font-semibold leading-tight text-fg sm:text-3xl">
          {item.title}
        </h2>
        <p className="text-base leading-relaxed text-body">{item.summary}</p>
        <p className="font-mono text-[13px] text-muted">{item.stack.join(" · ")}</p>
        <Link
          href={item.href}
          className="mt-1 inline-flex min-h-12 items-center self-start rounded-lg bg-accent px-5 font-mono text-on-accent hover:opacity-90"
        >
          open dashboard<span className="sr-only">: {item.title}</span>
          <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </div>
    </article>
  );
}
