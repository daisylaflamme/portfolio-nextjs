"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { diplomas, programs, certificates } from "@/data/certificates";
import GoToTop from "../GoToTop";

function ChevronIcon({ open, compact = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-shadow-accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${compact ? "w-4 h-4" : "w-5 h-5"} ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const PROVIDER_THUMBNAILS = {
  linkedin: "/images/certificates/thumbnails/linkedin.jpg",
  lynda: "/images/certificates/thumbnails/lynda.jpg",
};

function getThumbnailSrc(cert) {
  if (cert.provider && PROVIDER_THUMBNAILS[cert.provider]) {
    return PROVIDER_THUMBNAILS[cert.provider];
  }
  return cert.thumbnail;
}

// Full-size certificate images only load once their row has been opened; after that they
// stay mounted so the collapse animation still shows the image.
function CertificateAccordion({ items, openIndex, setOpenIndex, getThumbnailSrc: getSrc, sectionId = "", compact = false }) {
  const [opened, setOpened] = useState(() => new Set());
  const toggle = (index, isOpen) => {
    if (!isOpen) setOpened((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
    setOpenIndex(isOpen ? -1 : index);
  };

  return (
    <div className="rounded-xl border border-[var(--color-petal-border)] overflow-hidden shadow-[0_2px_10px_rgba(46,46,46,0.08)] bg-[var(--color-primary-bg)]">
      {items.map((cert, index) => {
        const isOpen = openIndex === index;
        const thumbnailSrc = getSrc ? getSrc(cert) : cert.thumbnail;
        return (
          <div
            key={`${sectionId}-${cert.title}-${cert.year}-${index}`}
            className="border-b border-[var(--color-petal-border)] last:border-b-0"
          >
            <button
              type="button"
              onClick={() => toggle(index, isOpen)}
              className={`w-full flex items-center text-left bg-[var(--color-petal-bg)] hover:bg-[var(--color-center-circle)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-inset transition-colors ${compact ? "gap-2 px-3 py-2.5" : "gap-3 px-4 py-4"}`}
              aria-controls={`${sectionId}-cert-content-${index}`}
              aria-expanded={isOpen}
              id={`${sectionId}-cert-toggle-${index}`}
            >
              <Image
                src={thumbnailSrc}
                alt=""
                className={`object-cover rounded-lg border border-[var(--color-petal-border)] shrink-0 ${compact ? "w-10 h-10" : "w-14 h-14"}`}
                width={compact ? 40 : 56}
                height={compact ? 40 : 56}
              />
              <span className="flex-1 min-w-0">
                <span className={`block font-medium text-[var(--color-font-primary)] ${compact ? "text-xs" : "text-sm md:text-base"}`}>
                  {cert.title}
                </span>
                <span className="block text-xs text-[var(--color-font-secondary)] mt-0.5">
                  {cert.year}
                </span>
              </span>
              <ChevronIcon open={isOpen} compact={compact} />
            </button>
            <div
              id={`${sectionId}-cert-content-${index}`}
              role="region"
              aria-labelledby={`${sectionId}-cert-toggle-${index}`}
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className={`border-t border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] ${compact ? "pt-1.5 pb-3 px-3" : "pt-2 pb-4 px-4"}`}>
                  {opened.has(index) ? (
                    <Image
                      src={cert.image}
                      alt={`${cert.title}, ${cert.year}`}
                      width={1024}
                      height={768}
                      sizes="(min-width: 576px) 512px, calc(100vw - 4rem)"
                      className="h-auto w-full max-w-lg rounded-lg border border-[var(--color-petal-border)] shadow-sm object-contain bg-[var(--color-petal-bg)]"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Diploma viewer on a native <dialog>: focus moves in and returns to the card that
 * opened it, Escape closes it, and the page behind is inert and doesn't scroll.
 */
function DiplomaDialog({ diploma, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (diploma && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("has-open-dialog");
    } else if (!diploma && dialog.open) {
      dialog.close();
    }
  }, [diploma]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.classList.remove("has-open-dialog");
      onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="diploma-modal-title"
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl bg-transparent p-0 text-fg backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      {diploma ? (
        <div className="project-modal-box rounded-2xl max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h2 id="diploma-modal-title" className="text-lg font-semibold text-[var(--color-font-primary)]">
                {diploma.title}
              </h2>
              <p className="text-sm text-[var(--color-font-secondary)] mt-1">{diploma.year}</p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="p-2 rounded-lg text-[var(--color-font-secondary)] hover:bg-[var(--color-center-circle)] hover:text-[var(--color-font-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)]"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Image
            src={diploma.image}
            alt={`${diploma.title}, ${diploma.year}`}
            width={1200}
            height={900}
            sizes="(min-width: 704px) 624px, calc(100vw - 5rem)"
            className="h-auto w-full rounded-lg border border-[var(--color-petal-border)] shadow-sm object-contain bg-[var(--color-petal-bg)]"
          />
        </div>
      ) : null}
    </dialog>
  );
}

export default function CertificatesPage() {
  const [diplomaModal, setDiplomaModal] = useState(null);
  const [programsOpenIndex, setProgramsOpenIndex] = useState(-1);
  const [certificatesOpenIndex, setCertificatesOpenIndex] = useState(-1);
  const closeDiploma = useCallback(() => setDiplomaModal(null), []);

  const sortedCertificates = useMemo(
    () => [...certificates].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
    []
  );

  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8" id="main-content">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-fg">Education and certificates</h1>
        {/* Degrees */}
        <section aria-labelledby="degrees-heading">
          <h2 id="degrees-heading" className="text-xl font-semibold text-[var(--color-font-primary)] mb-6">
            Degrees
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {diplomas.map((d, index) => (
              <button
                key={`${d.title}-${d.year}-${index}`}
                type="button"
                onClick={() => setDiplomaModal(d)}
                className="diploma-frame group text-left rounded-xl overflow-hidden border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] shadow-[0_4px_20px_rgba(140,126,104,0.15)] hover:shadow-[0_8px_28px_rgba(140,126,104,0.22)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-2 transition-all duration-200"
              >
                <div className="aspect-[4/3] max-h-44 relative bg-[var(--color-primary-bg)] p-3">
                  <div className="absolute inset-3">
                    <Image
                      src={d.thumbnail}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, calc(100vw - 4rem)"
                      className="object-contain object-center"
                    />
                  </div>
                  <div className="absolute inset-3 border-2 border-[var(--color-petal-border)] rounded pointer-events-none" aria-hidden />
                </div>
                <div className="px-4 py-3 border-t border-[var(--color-petal-border)]">
                  <p className="text-sm font-medium text-[var(--color-font-primary)] group-hover:text-[var(--color-shadow-accent)] transition-colors">
                    {d.title}
                  </p>
                  <p className="text-xs text-[var(--color-font-secondary)] mt-1">{d.year}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Programs */}
        <section aria-labelledby="programs-heading">
          <h2 id="programs-heading" className="text-xl font-semibold text-[var(--color-font-primary)] mb-6">
            Training Programs
          </h2>
          <CertificateAccordion
            sectionId="programs"
            items={programs}
            openIndex={programsOpenIndex}
            setOpenIndex={setProgramsOpenIndex}
            getThumbnailSrc={getThumbnailSrc}
          />
        </section>

        {/* Certificates only */}
        <section aria-labelledby="courses-heading">
          <h2 id="courses-heading" className="text-xl font-semibold text-[var(--color-font-primary)] mb-6">
            Certificates
          </h2>
          <CertificateAccordion
            sectionId="courses"
            items={sortedCertificates}
            openIndex={certificatesOpenIndex}
            setOpenIndex={setCertificatesOpenIndex}
            getThumbnailSrc={getThumbnailSrc}
            compact
          />
        </section>
      </div>

      <DiplomaDialog diploma={diplomaModal} onClose={closeDiploma} />

      <GoToTop />
    </main>
  );
}
