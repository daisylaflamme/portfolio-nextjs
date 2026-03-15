"use client";

import Link from "next/link";
import ContactForm from "./ContactForm";

const CONTACT_LINKS = {
  email: "mailto:daisy@daisylaflamme.net",
  linkedin: "https://www.linkedin.com/in/desislavalaflamme/",
  github: "https://github.com/daisylaflamme",
};

export default function ContactPage() {
  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section
          className="contact-section rounded-2xl p-6 md:p-8 shadow-md"
          aria-labelledby="contact-info-heading"
        >
          <h2
            id="contact-info-heading"
            className="text-lg font-semibold text-[var(--color-font-primary)] mb-6"
          >
            Contact Information
          </h2>
          <ul className="space-y-4" role="list">
            <li>
              <a
                href={CONTACT_LINKS.email}
                className="flex items-center gap-3 text-[var(--color-font-primary)] hover:text-[var(--color-shadow-accent)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-petal-bg)] border border-[var(--color-petal-border)] text-[var(--color-font-secondary)] shrink-0">
                  <img src="/icons/contact-email.svg" alt="" width={22} height={22} className="shrink-0" />
                </span>
                <span>laflammedaisy@gmail.com</span>
              </a>
            </li>
            <li className="flex items-center gap-3 text-[var(--color-font-primary)]">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-petal-bg)] border border-[var(--color-petal-border)] text-[var(--color-font-secondary)] shrink-0">
                <img src="/icons/contact-location.svg" alt="" width={22} height={22} className="shrink-0" />
              </span>
              <span>Boston, MA | Remote</span>
            </li>
            <li>
              <a
                href={CONTACT_LINKS.linkedin}
                className="flex items-center gap-3 text-[var(--color-font-primary)] hover:text-[var(--color-shadow-accent)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-petal-bg)] border border-[var(--color-petal-border)] text-[var(--color-font-secondary)] shrink-0">
                  <img src="/icons/contact-linkedin.svg" alt="" width={22} height={22} className="shrink-0" />
                </span>
                <span>LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href={CONTACT_LINKS.github}
                className="flex items-center gap-3 text-[var(--color-font-primary)] hover:text-[var(--color-shadow-accent)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-petal-bg)] border border-[var(--color-petal-border)] text-[var(--color-font-secondary)] shrink-0">
                  <img src="/icons/contact-github.svg" alt="" width={22} height={22} className="shrink-0" />
                </span>
                <span>GitHub</span>
              </a>
            </li>
          </ul>

          <div className="mt-6 pt-6 border-t border-[var(--color-petal-border)]">
            <h3 className="text-base font-semibold text-[var(--color-font-primary)] mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/web-projects"
                  className="text-[var(--color-font-primary)] hover:text-[var(--color-shadow-accent)] transition-colors"
                >
                  Web Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/resume"
                  className="text-[var(--color-font-primary)] hover:text-[var(--color-shadow-accent)] transition-colors"
                >
                  Resume
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <ContactForm />
      </div>
    </main>
  );
}
