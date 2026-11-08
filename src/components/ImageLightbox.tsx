"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

// Screenshots taller than this (height / width) are treated as full-page captures:
// shown at readable width and scrolled vertically instead of shrunk to fit.
const TALL_RATIO = 2;

/**
 * One image in the lightbox. Keyed by src so scroll position and the
 * "tall" measurement reset when the image changes.
 */
function LightboxImage({ src, alt }: { src: string; alt: string }) {
  const [tall, setTall] = useState(false);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0) setTall(naturalHeight / naturalWidth > TALL_RATIO);
  };

  return (
    <div
      className={`max-h-full overflow-y-auto overscroll-contain rounded-lg ${tall ? "h-full" : ""}`}
      tabIndex={tall ? 0 : -1}
      aria-label={tall ? "Scroll to see the full page" : undefined}
    >
      {/* Original file, no resizing or recompression: this is the "see it clearly" view. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        draggable={false}
        className={
          tall
            ? "block h-auto w-auto max-w-[min(92vw,1200px)]"
            : "block h-auto max-h-[calc(100dvh-9rem)] w-auto max-w-[92vw] object-contain"
        }
      />
    </div>
  );
}

export interface ImageLightboxProps {
  images: string[];
  altFor: (index: number) => string;
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  /** Text under the image; defaults to the alt text. */
  captionFor?: (index: number) => string;
  /** Accessible name of the dialog. */
  label?: string;
}

/**
 * Full-screen image viewer on a native <dialog>. Works on its own (gallery pages) or
 * stacked above the case-study dialog, where Escape closes only this layer. Either way
 * the browser returns focus to the button that opened it.
 */
export default function ImageLightbox({
  images,
  altFor,
  index,
  open,
  onClose,
  onIndexChange,
  captionFor = altFor,
  label = "Screenshot viewer",
}: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const count = images.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("has-open-dialog");
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      // Keep the page locked while another dialog (the case study) is still open underneath.
      if (!document.querySelector("dialog[open]")) document.documentElement.classList.remove("has-open-dialog");
      onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const go = (step: number) => onIndexChange((index + step + count) % count);
  const close = () => dialogRef.current?.close();

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (count < 2) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  // Click on the dark area around the image closes the viewer.
  const handleBackgroundClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) close();
  };

  // Horizontal swipe on touch screens moves between images.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || count < 2) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const current = images[Math.min(index, count - 1)];
  const navButton =
    // Dark backing + ring keeps the arrow visible over light screenshots (non-text contrast).
    "absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white ring-1 ring-white/40 hover:bg-black/85";

  return (
    <dialog
      ref={dialogRef}
      className="lightbox-dialog"
      aria-label={label}
      onKeyDown={handleKeyDown}
      onClick={handleBackgroundClick}
    >
      {open && current ? (
        <div className="flex h-full flex-col text-white" onClick={handleBackgroundClick}>
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="font-mono text-[14px] text-white/80" aria-live="polite">
              {count > 1 ? `${index + 1} / ${count}` : ""}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close viewer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <CloseIcon />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16"
            onClick={handleBackgroundClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {count > 1 ? (
              <button type="button" onClick={() => go(-1)} aria-label="Previous screenshot" className={`${navButton} left-2 sm:left-4`}>
                <Chevron dir="left" />
              </button>
            ) : null}

            <LightboxImage key={current} src={current} alt={altFor(index)} />

            {count > 1 ? (
              <button type="button" onClick={() => go(1)} aria-label="Next screenshot" className={`${navButton} right-2 sm:right-4`}>
                <Chevron dir="right" />
              </button>
            ) : null}
          </div>

          <p className="mx-auto max-w-3xl px-4 py-3 text-center text-[14px] text-white/80 sm:px-6">{captionFor(index)}</p>
        </div>
      ) : null}
    </dialog>
  );
}
