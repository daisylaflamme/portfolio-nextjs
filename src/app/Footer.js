"use client";

// Reuse same links and icon paths as contact page
const FOOTER_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/desislavalaflamme/", icon: "/icons/contact-linkedin.svg" },
  { label: "GitHub", href: "https://github.com/daisylaflamme/portfolio-nextjs", icon: "/icons/contact-github.svg" },
  { label: "Email", href: "mailto:laflammedaisy@gmail.com", icon: "/icons/contact-email.svg" },
];

export default function Footer() {
  return (
    <footer
      className="hidden lg:flex flex-shrink-0 justify-center items-center gap-6 py-6 border-t border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] text-[var(--color-font-primary)] font-inter"
      aria-label="Connect"
    >
      {FOOTER_LINKS.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target={item.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className="flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-secondary)] hover:bg-[var(--color-center-circle)] hover:border-[var(--color-center-circle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-petal-bg)]"
          aria-label={item.label}
        >
          <img src={item.icon} alt="" width={22} height={22} className="shrink-0" />
        </a>
      ))}
    </footer>
  );
}
