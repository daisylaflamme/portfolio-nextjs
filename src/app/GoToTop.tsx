"use client";

import { useSyncExternalStore } from "react";

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

const isPastFold = () => window.scrollY > window.innerHeight;

/**
 * Reusable "scroll to top" button. Fixed at bottom-right, visible only after
 * the user has scrolled below the fold (past one viewport height).
 * Use on any long page (e.g. web-projects, resume, about).
 */
export default function GoToTop() {
  const visible = useSyncExternalStore(subscribeToScroll, isPastFold, () => false);

  const scrollToTop = () => {
    // CSS scroll-behavior doesn't apply to JS scrolling, so honour reduced motion here.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-shadow-accent)] text-on-accent shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-2 transition-opacity"
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
