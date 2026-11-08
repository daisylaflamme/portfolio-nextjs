"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { savePersonalizationSlugs } from "@/lib/personalization";

/**
 * Invisible: preserves the v1 Header behavior.
 * - Saves ?company= / ?role= slugs for the session.
 * - On ?utm_source=resume, records one Vercel Analytics event and notifies /api/resume-visit.
 * Must be rendered inside <Suspense> (it reads search params).
 */
export default function ResumeVisitTracker() {
  const searchParams = useSearchParams();
  const hasTracked = useRef(false);

  const urlCompany = searchParams.get("company");
  const urlRole = searchParams.get("role");
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");

  useEffect(() => {
    if (urlCompany || urlRole) {
      savePersonalizationSlugs({ company: urlCompany, role: urlRole });
    }
  }, [urlCompany, urlRole]);

  useEffect(() => {
    if (hasTracked.current) return;
    if (utmSource !== "resume") return;

    const notifyKey = [
      "resume-visit-notified",
      urlCompany || "",
      urlRole || "",
      utmCampaign || "",
      utmMedium || "",
    ].join(":");

    try {
      if (sessionStorage.getItem(notifyKey)) {
        hasTracked.current = true;
        return;
      }
    } catch {
      // sessionStorage may be unavailable; continue with the ref-only guard.
    }

    hasTracked.current = true;

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

    const clearKey = () => {
      try {
        sessionStorage.removeItem(notifyKey);
      } catch {
        // Ignore.
      }
    };

    void fetch("/api/resume-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) clearKey();
      })
      .catch(clearKey);
  }, [utmSource, urlCompany, urlRole, utmCampaign, utmMedium]);

  return null;
}
