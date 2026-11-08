import Link from "next/link";

export const CONTACT_LINKS = {
  email: "mailto:laflammedaisy@gmail.com",
  linkedin: "https://www.linkedin.com/in/desislavalaflamme/",
  github: "https://github.com/daisylaflamme",
};

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-xl font-semibold text-fg sm:text-2xl">
          Hiring for a senior front-end role? Let’s talk.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[15px]">
          <li>
            <a href={CONTACT_LINKS.email} className="inline-flex min-h-11 items-center text-fg hover:text-accent">
              email
            </a>
          </li>
          <li>
            <a href={CONTACT_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-fg hover:text-accent">
              linkedin<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={CONTACT_LINKS.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-fg hover:text-accent">
              github<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <Link href="/certificates" className="inline-flex min-h-11 items-center text-fg hover:text-accent">
              certificates
            </Link>
          </li>
        </ul>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-sm text-muted sm:px-6">© {new Date().getFullYear()} Daisy Laflamme</p>
    </footer>
  );
}
