import ImageSetButton from "@/components/ImageSetButton";
import { dashboards } from "@/data/dashboards";

const CHANGES = [
  "Static Tableau sheets → one interactive page with shareable filters",
  "Hard-coded discount tiers → a live what-if simulator",
  "Charts readable by screen readers, with data tables and keyboard access",
  "Dark and light themes, phone to desktop",
  "Customer data anonymized and aggregated before publishing",
];

/** The first (Tableau) version next to what this version changed. */
export default function ThenNow() {
  const before = dashboards.find((d) => d.id === "retail-kpi-dashboard");

  return (
    <section
      aria-labelledby="then-now-title"
      className="grid items-center gap-6 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:grid-cols-2 lg:gap-10"
    >
      {before ? (
        <ImageSetButton
          item={{
            ...before,
            // Feeds the button label, the lightbox caption and the dialog name.
            title: "First version of the Larry’s Secret dashboard",
            imageAlt: "First version of the Larry’s Secret dashboard, built in Tableau",
          }}
          aspectClass="aspect-[16/10]"
          sizes="(min-width: 1152px) 520px, (min-width: 1024px) 45vw, calc(100vw - 4rem)"
        />
      ) : null}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[13px] text-accent">{"// then → now"}</p>
        <h2 id="then-now-title" className="font-display text-xl font-semibold text-fg sm:text-2xl">
          From the first version to this one
        </h2>
        <ul className="flex flex-col gap-2">
          {CHANGES.map((c) => (
            <li key={c} className="flex gap-3 text-[15px] leading-relaxed text-body">
              <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
