"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import BuildingIcon from "./BuildingIcon";
import {
  formatRoleSubtitle,
  formatWelcomeMessage,
  readPersonalizationSlugs,
  savePersonalizationSlugs,
} from "../lib/personalization";

function getSubtitle(pathname) {
  if (pathname === "/about") return "About Me";
  if (pathname === "/web-projects") return "Web Projects";
  if (pathname === "/resume") return "Resume";
  if (pathname === "/certificates") return "Certificates";
  if (pathname === "/contact") return "Let's Connect!";
  return "User Interface Portfolio";
}

function HeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedResumeVisit = useRef(false);
  const [persistedSlugs, setPersistedSlugs] = useState({
    company: "",
    role: "",
  });

  const urlCompany = searchParams.get("company");
  const urlRole = searchParams.get("role");
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");

  useEffect(() => {
    if (urlCompany || urlRole) {
      savePersonalizationSlugs({ company: urlCompany, role: urlRole });
      setPersistedSlugs(readPersonalizationSlugs());
      return;
    }

    setPersistedSlugs(readPersonalizationSlugs());
  }, [urlCompany, urlRole]);

  const companySlug = urlCompany || persistedSlugs.company;
  const roleSlug = urlRole || persistedSlugs.role;

  const isHome = pathname === "/";
  const welcomeMessage =
    isHome && companySlug ? formatWelcomeMessage(companySlug) : "";
  const roleSubtitle = isHome && roleSlug ? formatRoleSubtitle(roleSlug) : "";
  const subtitle = roleSubtitle || getSubtitle(pathname);

  useEffect(() => {
    if (hasTrackedResumeVisit.current) return;
    if (utmSource !== "resume") return;

    const notifyKey = [
      "resume-visit-notified",
      urlCompany || "",
      urlRole || "",
      utmCampaign || "",
      utmMedium || "",
    ].join(":");

    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(notifyKey)) {
        hasTrackedResumeVisit.current = true;
        return;
      }
    } catch {
      // sessionStorage may be unavailable; continue with ref-only guard.
    }

    hasTrackedResumeVisit.current = true;

    try {
      sessionStorage.setItem(notifyKey, "1");
    } catch {
      // Ignore storage failures.
    }

    const payload = {
      source: "resume",
      company: urlCompany || "",
      role: urlRole || "",
      campaign: utmCampaign || "",
      medium: utmMedium || "",
    };

    track("resume_portfolio_visit", {
      company: payload.company,
      role: payload.role,
      campaign: payload.campaign,
      medium: payload.medium,
    });

    void fetch("/api/resume-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) {
          try {
            sessionStorage.removeItem(notifyKey);
          } catch {
            // Ignore.
          }
        }
      })
      .catch(() => {
        try {
          sessionStorage.removeItem(notifyKey);
        } catch {
          // Ignore.
        }
      });
  }, [utmSource, urlCompany, urlRole, utmCampaign, utmMedium]);

  return (
    <>
      <h1
        className={`font-playfair-display font-medium tracking-tight text-[clamp(1.65rem,5vw,2.25rem)] mt-[clamp(0.5rem,1.5vw,1rem)] ${
          welcomeMessage ? "mb-[clamp(0.85rem,2.2vw,1.35rem)]" : "mb-[clamp(1rem,2.5vw,1.5rem)]"
        }`}
      >
        <Link
          href="/"
          className="cursor-pointer no-underline hover:no-underline text-[var(--color-font-primary)]"
        >
          Daisy Laflamme
        </Link>
      </h1>

      {welcomeMessage ? (
        <>
          <p className="font-playfair-display text-[clamp(0.95rem,2.6vw,1.125rem)] text-[var(--color-welcome-accent)] mb-3 flex items-center justify-center gap-2 px-4 max-w-[40rem] mx-auto text-balance">
            <BuildingIcon className="w-4 h-4 shrink-0" />
            <span>{welcomeMessage}</span>
          </p>
          <div
            className="mx-auto mb-3 sm:mb-3.5 h-px w-12 sm:w-14 bg-[var(--color-petal-border)]"
            aria-hidden="true"
          />
        </>
      ) : null}

      <h2 className="font-inter font-medium text-[clamp(0.95rem,2.5vw,1.125rem)] text-font-secondary max-w-[min(48rem,92vw)] mx-auto px-4 text-balance leading-snug mb-0">
        {subtitle}
      </h2>
    </>
  );
}

function HeaderFallback() {
  const pathname = usePathname();

  return (
    <>
      <h1 className="font-playfair-display font-medium tracking-tight text-[clamp(1.65rem,5vw,2.25rem)] mt-[clamp(0.5rem,1.5vw,1rem)] mb-[clamp(1rem,2.5vw,1.5rem)]">
        <Link
          href="/"
          className="cursor-pointer no-underline hover:no-underline text-[var(--color-font-primary)]"
        >
          Daisy Laflamme
        </Link>
      </h1>
      <h2 className="font-inter font-medium text-[clamp(0.95rem,2.5vw,1.125rem)] text-font-secondary max-w-[min(48rem,92vw)] mx-auto px-4 text-balance leading-snug mb-0">
        {getSubtitle(pathname)}
      </h2>
    </>
  );
}

export default function Header() {
  return (
    <header className="header-shell text-center px-2 py-[clamp(0.35rem,1.2vw,0.85rem)]">
      <Suspense fallback={<HeaderFallback />}>
        <HeaderContent />
      </Suspense>
    </header>
  );
}
