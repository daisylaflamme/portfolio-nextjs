import Image from "next/image";
import {
  CERTIFICATE_PROVIDER_LABELS,
  certifications,
  courseHistory,
  courseHistoryCount,
  diplomas,
  recentLearning,
} from "@/data/certificates";
import type { Certificate } from "@/data/types";
import CertificateImageButton from "./CertificateImageButton";

/** A comma only screen readers and text extraction see, so stacked lines don't run together ("…2012016"). */
function Pause() {
  return <span className="sr-only">, </span>;
}

function providerLabel(cert: Certificate): string | null {
  return cert.provider ? CERTIFICATE_PROVIDER_LABELS[cert.provider] : null;
}

const h2Class = "font-playfair-display font-medium text-2xl md:text-3xl text-[var(--color-font-primary)] mb-6";
const h3Class = "font-semibold text-lg text-[var(--color-font-primary)] mb-4";
const panelClass = "contact-section rounded-2xl p-5 md:p-6";

/**
 * Degrees, certifications, recent learning and the full course history.
 * Lives on /about#education (the old /certificates page redirects there).
 */
export default function Education() {
  return (
    <section id="education" aria-labelledby="education-heading" className="mb-10 scroll-mt-24">
      <h2 id="education-heading" className={h2Class}>
        Education
      </h2>

      <div className="space-y-8">
        <section aria-labelledby="degrees-heading">
          <h3 id="degrees-heading" className={h3Class}>
            Degrees
          </h3>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3" role="list">
            {diplomas.map((degree) => (
              <li key={degree.title} className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] shadow-[0_4px_20px_rgba(140,126,104,0.15)]">
                {/* The thumbnail opens the diploma; the visible title and year sit below it as text. */}
                <CertificateImageButton
                  image={degree.image}
                  alt={`${degree.title} diploma, ${degree.year}`}
                  label={`${degree.title} diploma`}
                  ariaLabel={`View ${degree.title} diploma`}
                  className="relative block h-28 w-full cursor-zoom-in bg-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-shadow-accent)]"
                >
                  <Image
                    src={degree.thumbnail}
                    alt=""
                    fill
                    // Box width: one column under sm, three columns in a max-w-4xl page above it.
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) calc((100vw - 6rem) / 3), calc(100vw - 2rem)"
                    className="object-contain p-3"
                  />
                </CertificateImageButton>
                <p className="flex flex-1 flex-col gap-1 border-t border-[var(--color-petal-border)] px-4 py-3 text-sm">
                  <span className="block font-medium text-[var(--color-font-primary)]">{degree.title}</span>
                  <Pause />
                  <span className="block text-[var(--color-font-secondary)]">{degree.year}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="certifications-heading">
          <h3 id="certifications-heading" className={h3Class}>
            Certifications
          </h3>
          <ul className={`${panelClass} divide-y divide-[var(--color-petal-border)] py-1 md:py-1`} role="list">
            {certifications.map((cert) => (
              <li key={cert.title} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
                <p className="text-[var(--color-font-primary)]">
                  <span className="block font-medium">{cert.title}</span>
                  <Pause />
                  <span className="block text-sm text-[var(--color-font-secondary)]">{cert.year}</span>
                </p>
                <CertificateImageButton
                  image={cert.image}
                  alt={`${cert.title} certificate, ${cert.year}`}
                  label={`${cert.title} certificate`}
                  ariaLabel={`View certificate: ${cert.title}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] px-4 text-sm font-medium text-[var(--color-font-primary)] hover:bg-[var(--color-center-circle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-shadow-accent)]"
                >
                  View certificate
                </CertificateImageButton>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recent-learning-heading">
          <h3 id="recent-learning-heading" className={h3Class}>
            Recent learning
          </h3>
          <ul className={`${panelClass} space-y-3`} role="list">
            {recentLearning.map((course) => {
              const provider = providerLabel(course);
              return (
                <li key={course.title} className="text-[var(--color-font-primary)]">
                  <span className="block font-medium">{course.title}</span>
                  <Pause />
                  <span className="block text-sm text-[var(--color-font-secondary)]">
                    {provider ? (
                      <>
                        {provider}
                        <span aria-hidden="true"> · </span>
                        <Pause />
                      </>
                    ) : null}
                    {course.year}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <details className={`${panelClass} group`}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-shadow-accent)] [&::-webkit-details-marker]:hidden">
            <h3 className="font-semibold text-lg text-[var(--color-font-primary)]">
              Full course history{" "}
              <span className="font-normal text-[var(--color-font-secondary)]">({courseHistoryCount} courses)</span>
            </h3>
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-[var(--color-font-secondary)] transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="mt-4 space-y-5 border-t border-[var(--color-petal-border)] pt-4">
            {courseHistory.map((group) => (
              <section key={group.year} aria-labelledby={`courses-${group.year}`}>
                <h4 id={`courses-${group.year}`} className="mb-2 font-mono text-sm font-semibold text-[var(--color-font-secondary)]">
                  {group.year}
                </h4>
                <ul className="space-y-1.5 text-sm text-[var(--color-font-primary)]" role="list">
                  {group.courses.map((course) => {
                    const provider = providerLabel(course);
                    return (
                      <li key={`${course.title}-${course.image}`}>
                        {course.title}
                        {provider ? (
                          <span className="text-[var(--color-font-secondary)]">
                            <span aria-hidden="true"> · </span>
                            <Pause />
                            {provider}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
