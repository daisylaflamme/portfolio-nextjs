"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Web Projects", href: "/web-projects" },
  { label: "About Me", href: "/about" },
  { label: "Resume", href: "/resume" },
  { label: "Certificates", href: "/certificates" },
  { label: "Contact", href: "/contact" },
];

function HamburgerIcon({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="var(--color-font-secondary)"
      className="w-7 h-7"
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      )}
    </svg>
  );
}

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg text-[var(--color-font-primary)] hover:bg-[var(--color-petal-bg)] border border-transparent hover:border-[var(--color-petal-border)] transition-colors"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <HamburgerIcon open={open} />
      </button>

      {/* Backdrop */}
      <div
        role="presentation"
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 max-w-[85vw] shadow-xl transition-transform duration-300 ease-out bg-[var(--color-primary-bg)] border-r border-[var(--color-petal-border)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Site navigation"
      >
        <nav className="pt-16 px-4 pb-6 flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 font-medium transition-colors border-b border-[var(--color-petal-border)] last:border-b-0 ${
                  isActive
                    ? "bg-[var(--color-petal-bg)] text-[var(--color-shadow-accent)]"
                    : "text-[var(--color-font-primary)] hover:bg-[var(--color-petal-bg)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
