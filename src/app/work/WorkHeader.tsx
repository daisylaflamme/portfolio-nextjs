import Link from "next/link";
import { WORK_CATEGORIES, type WorkCategory } from "@/lib/work";

interface WorkHeaderProps {
  current: WorkCategory["id"];
  intro: string;
}

/**
 * Heading, intro and category tabs shared by every /work page. The tabs are plain
 * links; the current one carries aria-current="page".
 */
export default function WorkHeader({ current, intro }: WorkHeaderProps) {
  const category = WORK_CATEGORIES.find((c) => c.id === current);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <p className="font-mono text-[13px] text-accent">{"// work"}</p>
        <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.5rem)] font-bold leading-tight tracking-tight">
          {category?.label}
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg">{intro}</p>
      </section>

      <nav aria-label="Work categories" className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="flex gap-6 overflow-x-auto border-b border-line text-[15px] font-semibold sm:gap-8 sm:text-base">
          {WORK_CATEGORIES.map((cat) => {
            const active = cat.id === current;
            return (
              <li key={cat.id} className="shrink-0">
                <Link
                  href={cat.path}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-12 items-center border-b-[3px] no-underline transition-colors ${
                    active ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
                  }`}
                >
                  {cat.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
