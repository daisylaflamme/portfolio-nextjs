"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import type { Project } from "@/data/types";
import Image from "next/image";
import Link from "next/link";
import { caseStudyContent, isInternalHref, projectImages, stackLabels, topicLabels } from "@/lib/projectDisplay";
import ImageLightbox, { CloseIcon } from "@/components/ImageLightbox";

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
    </svg>
  );
}

const linkClass = (primary: boolean) =>
  primary
    ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-mono text-[15px] text-on-accent no-underline hover:opacity-90"
    : "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line px-5 font-mono text-[15px] text-fg no-underline hover:border-field";

/** A project link: pages on this site open in the same tab, other sites in a new one. */
function ProjectLink({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={linkClass(primary)}>
        {children} <span aria-hidden="true">→</span>
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass(primary)}>
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/**
 * How a screenshot sits in the gallery frame:
 * - contain: the whole image, scaled to fit
 * - top: full-page screenshots, cropped to their top instead of shrunk to a sliver
 * - native: screenshots narrower than the frame, shown no wider than their own pixel
 *   width so a small source isn't blown up into a blur (tall ones still crop to the top)
 */
type Fit =
  /** `wide`: width ÷ height of an image wider than the 16:10 frame (a component close-up). */
  | { kind: "contain"; wide?: number }
  | { kind: "top" }
  | { kind: "native"; width: number; tall: boolean };

const FRAME_RATIO = 16 / 10;

/**
 * The file's real pixel size. `naturalWidth` on a srcset image is divided by the chosen
 * candidate's density (an 804px file can report 383), so read it from a plain copy,
 * which comes straight from the cache.
 */
async function pixelSize(img: HTMLImageElement): Promise<{ width: number; height: number; framed: boolean }> {
  const probe = new window.Image();
  probe.src = img.currentSrc || img.src;
  await probe.decode();
  return { width: probe.naturalWidth, height: probe.naturalHeight, framed: transparentCorner(probe) };
}

/**
 * Device mockups (a phone or browser frame on a transparent background) have a see-through
 * corner; plain screenshots don't. A mockup is always shown whole: cropping cuts the frame.
 */
function transparentCorner(image: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data[3] < 255;
  } catch {
    return false;
  }
}

/** Below this share of the image visible, a top crop hides the point of the screenshot… */
const MIN_VISIBLE_WHEN_CROPPED = 0.6;
/** …unless showing it whole would shrink it past readable (phones): then keep the crop. */
const MIN_SCALE_WHEN_WHOLE = 0.4;

function fitFor(width: number, height: number, frame: { width: number; height: number }): Fit {
  const tall = height / width > 1.2;
  const native = width < frame.width * 0.9;
  // Crop to the top only when there's more image than frame and most of it still shows;
  // a very tall screenshot (a long checkout page) is shown whole instead.
  const shownWidth = native ? width : frame.width;
  const visible = frame.height / (height * (shownWidth / width));
  const crop = tall && visible < 1;
  if (crop && visible < MIN_VISIBLE_WHEN_CROPPED && frame.height / height >= MIN_SCALE_WHEN_WHOLE) {
    return { kind: "contain" };
  }
  if (native) return { kind: "native", width, tall: crop };
  return crop ? { kind: "top" } : { kind: "contain" };
}

function Gallery({ project }: { project: Project }) {
  const images = projectImages(project);
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  // Measured per image, so switching screenshots never applies the previous one's fit.
  const [fits, setFits] = useState<Record<string, Fit>>({});
  const closeViewer = useCallback(() => setViewerOpen(false), []);

  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];
  const altFor = (i: number): string =>
    project.imageAlts?.[i] ??
    (i === 0 && project.imageAlt ? project.imageAlt : `${project.title}, screenshot ${i + 1} of ${images.length}`);

  const fit: Fit = fits[current] ?? { kind: "contain" };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const src = current;
    // Measure the gallery frame (the button), not the image's box, which may already be narrowed.
    const frameEl = img.closest("button") ?? img;
    // The 16:10 height, not clientHeight: on phones a previous wide image may have reshaped the frame.
    const frame = {
      width: frameEl.clientWidth,
      height: Math.min(frameEl.clientWidth / FRAME_RATIO, window.innerHeight * 0.62, 600),
    };
    pixelSize(img)
      .then(({ width, height, framed }) => {
        if (width > 0) {
          let next: Fit = framed ? { kind: "contain" } : fitFor(width, height, frame);
          if (next.kind === "contain" && width / height > FRAME_RATIO) next = { kind: "contain", wide: width / height };
          setFits((prev) => ({ ...prev, [src]: next }));
        }
      })
      .catch(() => {});
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setViewerOpen(true)}
        aria-label={`View full size: ${altFor(index)}`}
        // On phones a wide, short image sets the frame's shape, so it isn't a strip between empty bands.
        // Larger screens keep 16:10 so the thumbnails below don't jump under the pointer.
        style={fit.kind === "contain" && fit.wide ? ({ "--gallery-ratio": String(fit.wide) } as CSSProperties) : undefined}
        className={`group relative block aspect-[16/10] max-h-[min(62dvh,600px)] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-line bg-img ${
          fit.kind === "contain" && fit.wide ? "max-sm:aspect-(--gallery-ratio)" : ""
        }`}
      >
        {/* A `fill` image is always 100% of its box, so a small screenshot narrows the box. */}
        <span
          className="absolute inset-y-0 left-1/2 block w-full max-w-full -translate-x-1/2"
          style={fit.kind === "native" ? { width: `${fit.width}px` } : undefined}
        >
          <Image
            key={current}
            src={current}
            alt=""
            fill
            quality={90}
            sizes="(min-width: 1088px) 976px, (min-width: 768px) 90vw, 100vw"
            onLoad={handleLoad}
            className={fit.kind === "top" || (fit.kind === "native" && fit.tall) ? "object-cover object-top" : "object-contain"}
          />
        </span>
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
        // Scrolls sideways on phones; thumbnails stay 80×56 (above the 44px target size).
        <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1" aria-label="Screenshots">
          {images.map((src, i) => (
            <li key={src} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show screenshot ${i + 1} of ${images.length}`}
                aria-pressed={i === index}
                className={`relative block h-14 w-20 overflow-hidden rounded-lg border-2 bg-img ${
                  i === index ? "border-accent" : "border-transparent hover:border-field"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  // A device mockup set: show each frame whole rather than its top corner.
                  className={project.heroImage ? "object-contain p-0.5" : "object-cover object-top"}
                />
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
export interface ProjectModalProps {
  /** The open case study, or null when the dialog is closed. */
  project: Project | null;
  onClose: () => void;
  prevProject: Project | null;
  nextProject: Project | null;
  onNavigate: (project: Project) => void;
}

export default function ProjectModal({ project, onClose, prevProject, nextProject, onNavigate }: ProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
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

  // Leaving the page with the dialog open (e.g. the "open dashboard" link) unmounts it
  // without a close event; <html> persists across client navigations, so release the
  // scroll lock here unless another dialog is still open.
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      const othersOpen = [...document.querySelectorAll("dialog[open]")].some((d) => d !== dialog);
      if (!othersOpen) document.documentElement.classList.remove("has-open-dialog");
    };
  }, []);

  // After prev/next: back to the top and move focus to the new title.
  useEffect(() => {
    if (!project || !navigatedRef.current) return;
    navigatedRef.current = false;
    scrollRef.current?.scrollTo({ top: 0 });
    titleRef.current?.focus();
  }, [project]);

  const go = (target: Project) => {
    navigatedRef.current = true;
    onNavigate(target);
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  const content = project ? caseStudyContent(project) : null;
  const topics = project ? topicLabels(project).join(" · ") : "";
  const stack = project ? stackLabels(project) : [];
  const meta: Array<{ label: string; value: string }> = project
    ? [
        { label: "Role", value: project.role ?? "" },
        { label: "Team", value: project.team ?? "" },
        { label: "Dates", value: project.dates ?? "" },
        { label: "Stack", value: stack.join(" · ") },
      ].filter((item) => item.value !== "")
    : [];
  const links = project
    ? [
        ...(project.link ? [{ label: project.linkLabel ?? "visit site", href: project.link }] : []),
        ...(project.extraLinks ?? []),
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
                    <ProjectLink key={link.href} href={link.href} primary={i === 0}>
                      {link.label}
                    </ProjectLink>
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
