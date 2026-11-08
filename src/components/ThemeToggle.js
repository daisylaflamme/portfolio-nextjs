"use client";

import { useEffect, useState } from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme";

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/**
 * Dark mode switch. Icons are swapped with CSS (driven by <html data-theme>) so the
 * server-rendered markup is already correct before hydration.
 */
export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
  }, []);

  const toggle = () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this page.
    }
    setIsDark(next === "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark mode"
      aria-pressed={isDark === null ? undefined : isDark}
      title="Toggle dark mode"
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-fg transition-colors hover:border-field ${className}`}
    >
      <SunIcon className="in-data-[theme=light]:hidden" />
      <MoonIcon className="hidden in-data-[theme=light]:block" />
    </button>
  );
}
