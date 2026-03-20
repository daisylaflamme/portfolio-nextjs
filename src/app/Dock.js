"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Same as desktop footer: Home first, then LinkedIn, GitHub, Email (same links and icons as contact page)
const DOCK_ITEMS = [
  { label: "Home", href: "/", external: false, icon: "home" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/desislavalaflamme/", external: true, icon: "/icons/contact-linkedin.svg" },
  { label: "GitHub", href: "https://github.com/daisylaflamme/portfolio-nextjs", external: true, icon: "/icons/contact-github.svg" },
  { label: "Email", href: "mailto:laflammedaisy@gmail.com", external: true, icon: "/icons/contact-email.svg" },
];

// Same box style as Footer.js
const ICON_BOX_CLASS =
  "flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-secondary)] hover:bg-[var(--color-center-circle)] hover:border-[var(--color-center-circle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-petal-bg)]";

function HomeIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function Dock() {
  const pathname = usePathname();

  return (
    <nav
      className="dock lg:hidden fixed bottom-0 left-0 right-0 z-30 font-inter border-t border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] text-[var(--color-font-primary)] shadow-[0_-2px_12px_rgba(46,46,46,0.06)] safe-area-pb"
      aria-label="Quick links"
    >
      <div className="flex flex-row flex-nowrap justify-center items-center gap-4 sm:gap-6 py-4 sm:py-6 px-3 sm:px-4 max-w-lg mx-auto">
        {DOCK_ITEMS.map((item) => {
          const isActive = !item.external && pathname === (item.href === "/" ? "/" : item.href);
          const boxClass = `${ICON_BOX_CLASS} ${isActive ? "!border-[var(--color-shadow-accent)] text-[var(--color-shadow-accent)]" : ""}`;
          const iconContent =
            item.icon === "home" ? (
              <HomeIcon className="w-[22px] h-[22px] shrink-0" />
            ) : (
              <img src={item.icon} alt="" width={22} height={22} className="shrink-0" />
            );
          const content = <span className={boxClass}>{iconContent}</span>;
          if (item.external) {
            return (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                {content}
              </a>
            );
          }
          return (
            <Link key={item.label} href={item.href} aria-label={item.label} aria-current={isActive ? "page" : undefined}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
