"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export const NAV_ITEMS = [
  { label: "Work", href: "/web-projects" },
  { label: "About", href: "/about" },
  { label: "Résumé", href: "/resume" },
  { label: "Contact", href: "/contact" },
];

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Logo({ className = "" }) {
  return (
    <Link
      href="/"
      className={`font-mono text-[17px] font-medium text-fg no-underline ${className}`}
      aria-label="Daisy Laflamme, home"
    >
      daisy<span className="text-accent">.</span>laflamme
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Close the mobile menu after navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Logo />

        <div className="flex items-center gap-2 sm:gap-4">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1 font-mono text-[15px]">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center rounded-md px-3 no-underline transition-colors ${
                        active ? "text-accent underline decoration-2 underline-offset-8" : "text-fg hover:text-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ThemeToggle />

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface text-fg md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label="Menu"
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <nav
        id={menuId}
        aria-label="Main"
        hidden={!open}
        className="border-t border-line bg-bg md:hidden"
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 font-mono text-base">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center border-b border-line no-underline last:border-b-0 ${
                    active ? "text-accent" : "text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
