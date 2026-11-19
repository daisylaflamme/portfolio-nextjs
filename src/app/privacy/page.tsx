import Link from "next/link";
import type { Metadata } from "next";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.privacy);

/** Last reviewed date, shown on the page. Update it when anything below changes. */
const LAST_UPDATED = "November 19, 2026";

const SECTIONS: { id: string; heading: string; paragraphs: string[] }[] = [
  {
    id: "analytics",
    heading: "Analytics",
    paragraphs: [
      "This site uses Vercel Web Analytics to count visits and Vercel Speed Insights to measure how fast pages load. They don’t use cookies. Vercel reports anonymous, aggregated numbers: which pages are viewed, where visits come from (the referring site and approximate country), and the type of browser and device. I can’t see who you are.",
    ],
  },
  {
    id: "contact-form",
    heading: "Contact form",
    paragraphs: [
      "If you send a message, your name, email and message are sent to my inbox through an email service (Resend) so I can reply. They aren’t saved in a database on this site, and I don’t add you to a mailing list or share your details.",
    ],
  },
  {
    id: "resume-links",
    heading: "Résumé links",
    paragraphs: [
      "Links in my résumé and applications can include tags such as the company and role I applied for. When a page opens from one of those links, the site records one anonymous analytics event and sends me an email that the link was opened. The email contains only those tags, never your name, email or IP address.",
    ],
  },
  {
    id: "browser-storage",
    heading: "Stored in your browser",
    paragraphs: [
      "Your theme choice (light or dark) is saved in your browser so it stays the same on your next visit. Résumé link tags are kept for the current tab only and are cleared when you close it. Nothing stored in your browser is sent to me.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="font-mono text-[13px] text-accent">{"// privacy"}</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-fg">
          {PAGES.privacy.title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-body">
          A personal portfolio, so the short version: no cookies, no ads, and no personal data kept on this site.
        </p>
        <p className="mt-2 text-sm text-muted">Last updated {LAST_UPDATED}</p>
      </header>
      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.id} aria-labelledby={`privacy-${section.id}`}>
            <h2
              id={`privacy-${section.id}`}
              className="font-display text-xl font-semibold text-fg sm:text-2xl"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((text) => (
              <p key={text} className="mt-3 text-base leading-7 text-body">
                {text}
              </p>
            ))}
          </section>
        ))}
        <section aria-labelledby="privacy-questions">
          <h2 id="privacy-questions" className="font-display text-xl font-semibold text-fg sm:text-2xl">
            Questions
          </h2>
          <p className="mt-3 text-base leading-7 text-body">
            Ask me anything about this, or ask me to delete a message you sent, through the{" "}
            <Link href={PAGES.contact.path} className="text-accent underline underline-offset-4 hover:text-fg">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
