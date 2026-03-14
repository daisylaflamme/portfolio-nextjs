"use client";

import { useState, useMemo } from "react";
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

function CertificateAccordion({ items, openIndex, setOpenIndex, getThumbnailSrc: getSrc, sectionId = "", compact = false }) {
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
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className={`w-full flex items-center text-left bg-[var(--color-petal-bg)] hover:bg-[var(--color-center-circle)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-inset transition-colors ${compact ? "gap-2 px-3 py-2.5" : "gap-3 px-4 py-4"}`}
              aria-controls={`${sectionId}-cert-content-${index}`}
              aria-expanded={isOpen}
              id={`${sectionId}-cert-toggle-${index}`}
            >
              <img
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
                  <img
                    src={cert.image}
                    alt={`${cert.title}, ${cert.year}`}
                    className="w-full max-w-lg rounded-lg border border-[var(--color-petal-border)] shadow-sm object-contain bg-[var(--color-petal-bg)]"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CertificatesPage() {
  const [diplomaModal, setDiplomaModal] = useState(null);
  const [programsOpenIndex, setProgramsOpenIndex] = useState(-1);
  const [certificatesOpenIndex, setCertificatesOpenIndex] = useState(-1);

  const sortedCertificates = useMemo(
    () => [...certificates].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
    []
  );

  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8" id="main-content">
      <div className="max-w-4xl mx-auto space-y-12">
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
                  <div className="absolute inset-3 flex items-center justify-center">
                    <img
                      src={d.thumbnail}
                      alt=""
                      className="max-w-full max-h-full object-contain object-center"
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

      {/* Diploma modal */}
      {diplomaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDiplomaModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="diploma-modal-title"
        >
          <div
            className="project-modal-box rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 id="diploma-modal-title" className="text-lg font-semibold text-[var(--color-font-primary)]">
                  {diplomaModal.title}
                </h3>
                <p className="text-sm text-[var(--color-font-secondary)] mt-1">{diplomaModal.year}</p>
              </div>
              <button
                type="button"
                onClick={() => setDiplomaModal(null)}
                className="p-2 rounded-lg text-[var(--color-font-secondary)] hover:bg-[var(--color-center-circle)] hover:text-[var(--color-font-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)]"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={diplomaModal.image}
              alt={`${diplomaModal.title}, ${diplomaModal.year}`}
              className="w-full rounded-lg border border-[var(--color-petal-border)] shadow-sm object-contain bg-[var(--color-petal-bg)]"
            />
          </div>
        </div>
      )}

      <GoToTop />
    </main>
  );
}
