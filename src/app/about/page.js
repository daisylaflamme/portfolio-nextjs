"use client";

import Image from "next/image";
import Link from "next/link";

const QUICK_FACTS = [
  {
    icon: "/icons/contact-location.svg",
    label: "Based in",
    value: "Greater Boston, MA",
  },
  {
    icon: "/icons/about-briefcase.svg",
    label: "12+ years",
    value: "UI / Front-End",
  },
  {
    icon: "/icons/about-specialties.svg",
    label: "UI Systems,",
    value: "E-commerce, Accessibility",
  },
];

const SKILLS = [
  {
    icon: "/icons/about-ui-systems.svg",
    title: "UI Systems & Patterns",
    description:
      "Designing reusable component libraries that stay consistent across brands, viewports, and evolving product requirements.",
  },
  {
    icon: "/icons/about-integrations.svg",
    title: "Complex UI/UX Integrations",
    description:
      "Integrating payment providers, analytics, and third-party tools without breaking performance, SEO, or accessibility.",
  },
  {
    icon: "/icons/about-debugging.svg",
    title: "UI Debugging & Polish",
    description:
      "Tracking down front-end issues, cross-browser flaws, and polishing interfaces until they feel solid.",
  },
  {
    icon: "/icons/about-collaboration.svg",
    title: "UI/UX Product Collaboration",
    description:
      "Translating product requirements into UI flows, facilitating trade-offs, and keeping engineering and design aligned.",
  },
  {
    icon: "/icons/about-mentoring.svg",
    title: "Mentoring & Training",
    description:
      "Coaching developers on front-end best practices, reviewing code, and sharing patterns that make the whole team faster.",
  },
  {
    icon: "/icons/about-ecommerce.svg",
    title: "Enterprise E-commerce UI",
    description:
      "Leading UI work for multi-brand furniture portals, checkout flows, and complex e-commerce experiences.",
  },
];

const CAREER_PATH = [
  { title: "Non-profits", description: "Building websites and donation platforms to support social causes." },
  { title: "Startups", description: "Helping founders prototype ideas and launch their first digital products." },
  { title: "Small Businesses", description: "Designing practical, maintainable websites focused on usability and growth." },
  { title: "Digital Marketing", description: "Combining front-end engineering with analytics, SEO, and conversion optimization." },
  { title: "Enterprise E-commerce", description: "Developing scalable UI systems and complex integrations for multi-brand platforms." },
];

export default function AboutPage() {
  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8" id="main-content">
      <article className="max-w-4xl mx-auto">
        <header className="text-center mb-10 md:mb-12">
          <p className="text-base md:text-lg text-[var(--color-font-secondary)] max-w-xl mx-auto">
            Senior UI / Front-End Engineer crafting clean interfaces for complex systems.
          </p>
        </header>

        <section
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-start mb-10"
          aria-labelledby="bio-heading"
        >
          <div className="order-2 lg:order-1">
            <h2 id="bio-heading" className="sr-only">
              Bio
            </h2>
            <div className="space-y-4 text-[var(--color-font-primary)] text-[15px] md:text-base leading-relaxed">
              <p>
                I&apos;m a senior front-end engineer with over a decade of experience designing and building UI for large-scale e-commerce platforms. My happiest place is that intersection of visual design, interaction details, and production-ready code. Continuous learning is central to my identity — it’s what keeps me curious, adaptable, and excited to take on new challenges in design and engineering.
              </p>
              <p>
              Over the years I've become the person teams call when something complex needs to be reliable, well-tested, and production-ready: checkout flows, third-party integrations, accessibility fixes, or an entire component system that behaves consistently across brands. I care deeply about the small details that make interfaces feel effortless.
              </p>
              <p>
                Earlier in my career I worked in UMass Boston&apos;s entrepreneurship incubator, helping startups like Boston Strategics, ODAI, CollegeMiner, Bioarray and ClariLegal shape their online presence. I partnered with founders to design wireframes and build their first websites.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex flex-col items-center shrink-0">
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] shadow-md">
              <Image
                src="/images/about/profile.png"
                alt="Daisy Laflamme, Senior UI and Front-End Engineer"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 160px, 192px"
                priority
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md lg:max-w-xs mt-6">
              {QUICK_FACTS.map((item) => (
                <div
                  key={item.label}
                  className="contact-section rounded-xl p-3 md:p-4 flex flex-col items-center text-center"
                >
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-petal-bg)] border border-[var(--color-petal-border)] text-[var(--color-font-secondary)] mb-2"
                    aria-hidden
                  >
                    <img
                      src={item.icon}
                      alt=""
                      width={20}
                      height={20}
                      className="opacity-90"
                    />
                  </span>
                  <span className="font-semibold text-sm text-[var(--color-font-primary)] block">
                    {item.label}
                  </span>
                  <span className="text-sm text-[var(--color-font-secondary)]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mb-10"
          aria-labelledby="skills-heading"
        >
          <h2
            id="skills-heading"
            className="font-playfair-display font-medium text-2xl md:text-3xl text-[var(--color-font-primary)] text-center mb-6"
          >
            What I&apos;m Best At
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {SKILLS.map((skill) => (
              <li key={skill.title}>
                <div className="contact-section rounded-2xl p-5 h-full flex flex-col">
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-petal-bg)] border border-[var(--color-petal-border)] text-[var(--color-font-secondary)] mb-3 shrink-0"
                    aria-hidden
                  >
                    <img src={skill.icon} alt="" width={22} height={22} />
                  </span>
                  <h3 className="font-semibold text-[var(--color-font-primary)] mb-2">
                    {skill.title}
                  </h3>
                  <p className="text-sm text-[var(--color-font-secondary)] project-card__description flex-1">
                    {skill.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="contact-section rounded-2xl p-6 md:p-8 mb-10"
          aria-labelledby="career-path-heading"
        >
          <h2
            id="career-path-heading"
            className="font-playfair-display font-medium text-2xl md:text-3xl text-[var(--color-font-primary)] mb-6"
          >
            Career Path
          </h2>
          <ul className="relative pl-6 border-l-2 border-[var(--color-petal-border)] border-solid space-y-0" role="list">
            {CAREER_PATH.map((stage, index) => (
              <li
                key={stage.title}
                className="relative pb-6 last:pb-0"
              >
                <span
                  className="absolute left-0 top-1.5 -translate-x-[calc(0.5rem+5px)] w-3 h-3 rounded-full bg-[var(--color-shadow-accent)] border-2 border-[var(--color-primary-bg)] shrink-0"
                  aria-hidden
                />
                <h3 className="font-semibold text-[var(--color-font-primary)] mb-1">
                  {stage.title}
                </h3>
                <p className="text-[var(--color-font-secondary)] text-sm md:text-base leading-relaxed">
                  {stage.description}
                </p>
                {index < CAREER_PATH.length - 1 && (
                  <span className="absolute bottom-2 left-0 -translate-x-[calc(0.5rem+3px)] flex items-center justify-center w-5 h-5 text-[var(--color-shadow-accent)]" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[var(--color-petal-border)]">
          <p className="text-sm text-[var(--color-font-secondary)]">
            View details on my experience, skills, and recent projects?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/resume"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] text-[var(--color-font-primary)] font-medium text-sm hover:bg-[var(--color-center-circle)] transition-colors"
            >
              View Resume
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[var(--color-shadow-accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Contact Me
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
