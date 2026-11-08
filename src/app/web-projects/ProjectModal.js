"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { caseStudyContent, projectImages, stackLabels, topicLabels } from "@/lib/projectDisplay";
import ImageLightbox, { CloseIcon } from "./ImageLightbox";

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
    </svg>
  );
}

function ExternalLink({ href, children, primary = false }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-mono text-[15px] text-on-accent no-underline hover:opacity-90"
          : "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line px-5 font-mono text-[15px] text-fg no-underline hover:border-field"
      }
    >
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function Gallery({ project }) {
  const images = projectImages(project);
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  // Full-page screenshots get cropped to their top instead of shrunk to a sliver.
  const [tall, setTall] = useState(false);
  const closeViewer = useCallback(() => setViewerOpen(false), []);

  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];
  const altFor = (i) =>
    i === 0 && project.imageAlt ? project.imageAlt : `${project.title}, screenshot ${i + 1} of ${images.length}`;

  const handleLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0) setTall(naturalHeight / naturalWidth > 1.2);
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setViewerOpen(true)}
        aria-label={`View full size: ${altFor(index)}`}
        className="group relative block aspect-[16/10] max-h-[min(62dvh,600px)] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-line bg-img"
      >
        <Image
          key={current}
          src={current}
          alt=""
          fill
          quality={90}
          sizes="(min-width: 1088px) 976px, (min-width: 768px) 90vw, 100vw"
          onLoad={handleLoad}
          className={tall ? "object-cover object-top" : "object-contain"}
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 font-mono text-[13px] text-white transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
          <ExpandIcon /> view full size
        </span>
      </button>
      <ImageLightbox
        images={images}
        altFor={altFor}
        index={index}
        open={viewerOpen}
        onClose={closeViewer}
        onIndexChange={setIndex}
      />
      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Screenshots">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show screenshot ${i + 1} of ${images.length}`}
                aria-pressed={i === index}
                className={`relative block h-14 w-20 overflow-hidden rounded-lg border-2 bg-img ${
                  i === index ? "border-accent" : "border-transparent hover:border-field"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover object-top" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Case-study dialog built on native <dialog>: focus is trapped and restored by the
 * browser, Escape closes it, and the backdrop is inert.
 */
export default function ProjectModal({ project, onClose, prevProject, nextProject, onNavigate }) {
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const titleRef = useRef(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (project && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("has-open-dialog");
    } else if (!project && dialog.open) {
      dialog.close();
    }
  }, [project]);

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

  // After prev/next: back to the top and move focus to the new title.
  useEffect(() => {
    if (!project || !navigatedRef.current) return;
    navigatedRef.current = false;
    scrollRef.current?.scrollTo({ top: 0 });
    titleRef.current?.focus();
  }, [project]);

  const go = (target) => {
    navigatedRef.current = true;
    onNavigate(target);
  };

  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) dialogRef.current.close();
  };

  const content = project ? caseStudyContent(project) : null;
  const topics = project ? topicLabels(project).join(" · ") : "";
  const stack = project ? stackLabels(project) : [];
  const meta = project
    ? [
        project.role && { label: "Role", value: project.role },
        project.team && { label: "Team", value: project.team },
        project.dates && { label: "Dates", value: project.dates },
        stack.length > 0 && { label: "Stack", value: stack.join(" · ") },
      ].filter(Boolean)
    : [];
  const links = project
    ? [
        ...(project.link ? [{ label: "visit site", href: project.link }] : []),
        ...(Array.isArray(project.extraLinks) ? project.extraLinks.map((l) => ({ label: l.label, href: l.href })) : []),
      ]
    : [];

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onClick={handleBackdropClick}
    >
      {project && content ? (
        <div className="flex h-full max-h-[100dvh] flex-col bg-surface text-fg md:max-h-[calc(100dvh-3rem)] md:rounded-3xl md:border md:border-line md:shadow-[var(--shadow)]">
          {/* Top bar stays visible while the content scrolls */}
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-8">
            <p className="font-mono text-[13px] text-accent">{"// case study"}</p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-fg hover:border-field"
            >
              <CloseIcon />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
            <header className="flex flex-col gap-3 px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
              {topics ? <p className="font-mono text-[13px] text-muted">{topics}</p> : null}
              <h2
                id="project-dialog-title"
                ref={titleRef}
                tabIndex={-1}
                className="font-display text-[clamp(1.6rem,4vw,2.25rem)] font-semibold leading-tight outline-none"
              >
                {project.title}
              </h2>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-body">{project.summary}</p>
            </header>

            {meta.length > 0 ? (
              <dl className="flex flex-wrap gap-x-10 gap-y-4 border-y border-line bg-surface-2 px-5 py-4 text-[15px] sm:px-8">
                {meta.map((item) => (
                  <div key={item.label}>
                    <dt className="text-[13px] text-muted">{item.label}</dt>
                    <dd className="mt-1 font-semibold text-fg">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="flex flex-col gap-4 px-5 pt-7 sm:px-8">
              {/* Keyed so prev/next starts each case study at its first screenshot. */}
              <Gallery key={project.id} project={project} />
              {links.length > 0 ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {links.map((link, i) => (
                    <ExternalLink key={link.href} href={link.href} primary={i === 0}>
                      {link.label}
                    </ExternalLink>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="px-5 py-7 sm:px-8">
              <div className="flex min-w-0 max-w-[70ch] flex-col gap-7">
                {content.overview ? (
                  <section className="flex flex-col gap-2.5">
                    <h3 className="font-display text-lg font-semibold">{content.overviewHeading}</h3>
                    <p className="text-base leading-7 text-body">{content.overview}</p>
                  </section>
                ) : null}

                {content.highlights.length > 0 ? (
                  <section className="flex flex-col gap-2.5">
                    <h3 className="font-display text-lg font-semibold">{content.highlightsHeading}</h3>
                    <ul className="flex flex-col gap-3">
                      {content.highlights.map((item) => (
                        <li key={item} className="flex gap-3 text-base leading-7 text-body">
                          <span aria-hidden="true" className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {content.team ? (
                  <section className="flex flex-col gap-2.5">
                    <h3 className="font-display text-lg font-semibold">Team</h3>
                    <p className="text-base leading-7 text-body">{content.team}</p>
                  </section>
                ) : null}

                {content.impact.length > 0 ? (
                  <section className="flex flex-col gap-3">
                    <h3 className="font-display text-lg font-semibold">Impact</h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {content.impact.map((item) => (
                        <li key={item} className="rounded-xl border border-line bg-surface-2 p-4 text-[15px] font-medium leading-snug text-fg">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </div>
          </div>

          {prevProject || nextProject ? (
            <nav aria-label="More case studies" className="flex items-stretch justify-between gap-3 border-t border-line px-3 py-2 sm:px-6">
              {prevProject ? (
                <button
                  type="button"
                  onClick={() => go(prevProject)}
                  className="flex min-h-12 min-w-0 items-center gap-2 rounded-lg px-2 text-left text-[15px] font-semibold text-fg hover:text-accent"
                >
                  <span aria-hidden="true">←</span>
                  <span className="sr-only">Previous: </span>
                  <span className="truncate">{prevProject.title}</span>
                </button>
              ) : (
                <span />
              )}
              {nextProject ? (
                <button
                  type="button"
                  onClick={() => go(nextProject)}
                  className="flex min-h-12 min-w-0 items-center gap-2 rounded-lg px-2 text-right text-[15px] font-semibold text-fg hover:text-accent"
                >
                  <span className="sr-only">Next: </span>
                  <span className="truncate">{nextProject.title}</span>
                  <span aria-hidden="true">→</span>
                </button>
              ) : null}
            </nav>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
