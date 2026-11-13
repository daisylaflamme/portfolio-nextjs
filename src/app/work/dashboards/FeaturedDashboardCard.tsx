import Image from "next/image";
import Link from "next/link";
import type { FeaturedWorkItem } from "@/data/types";
import { publicFileExists } from "@/lib/archive";
import { larrysData } from "@/lib/dashboards/larrys/data";
import { selectDailyRevenue, selectKpis } from "@/lib/dashboards/larrys/selectors";
import { money, moneyShort, percent } from "@/lib/dashboards/larrys/format";

/**
 * Preview drawn from the real numbers, used until the framed screenshot exists.
 * Decorative: the card's text and link carry the meaning.
 */
function LivePreview() {
  const k = selectKpis(larrysData, { store: "all" });
  const days = selectDailyRevenue(larrysData, { store: "all" });
  const max = Math.max(...days.map((d) => d.revenue));
  const tiles = [
    ["Revenue", moneyShort(k.revenue)],
    ["Gross margin", percent(k.grossMargin)],
    ["Avg basket", money(k.avgBasket)],
  ];
  return (
    <div aria-hidden="true" className="flex h-full flex-col gap-3 p-4 sm:p-6">
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-surface px-3 py-2">
            <div className="text-[11px] text-muted">{label}</div>
            <div className="font-display text-lg font-bold text-fg sm:text-xl">{value}</div>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${days.length * 10} 100`} preserveAspectRatio="none" className="min-h-28 w-full flex-1 rounded-lg border border-line bg-surface">
        {days.map((d, i) => {
          const h = (d.revenue / max) * 86;
          return <rect key={d.date} x={i * 10 + 2} y={96 - h} width={6} height={h} rx={1.5} className="fill-accent" />;
        })}
      </svg>
    </div>
  );
}

/** Large card at the top of /work/dashboards linking to the live dashboard. */
export default function FeaturedDashboardCard({ item }: { item: FeaturedWorkItem }) {
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
            priority
            sizes="(min-width: 1152px) 640px, (min-width: 1024px) 55vw, calc(100vw - 2rem)"
            className="object-contain p-3 sm:p-5"
          />
        ) : (
          <LivePreview />
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
