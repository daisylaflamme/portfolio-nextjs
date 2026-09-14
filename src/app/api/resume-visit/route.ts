/*
 * RESUME-LINK VISIT NOTIFY (Resend)
 * ---------------------------------
 * Sends you an email when someone opens the portfolio with utm_source=resume.
 * Reuses the same Resend env vars as the contact form:
 *   RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
 *
 * Privacy: only application-level slugs (company, role, campaign, medium).
 * No visitor names, emails, or IP addresses are stored or emailed.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

const MAX_SLUG_LENGTH = 80;
const DEDUPE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes per identical payload

/** In-memory dedupe for same-instance bursts (Strict Mode / double-submit). */
const recentFingerprints = new Map<string, number>();

type ResumeVisitBody = {
  company?: unknown;
  role?: unknown;
  campaign?: unknown;
  medium?: unknown;
  source?: unknown;
};

function sanitizeSlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/[^a-zA-Z0-9_-]/g, "");
}

function pruneDedupeMap(now: number) {
  for (const [key, timestamp] of recentFingerprints) {
    if (now - timestamp > DEDUPE_WINDOW_MS) {
      recentFingerprints.delete(key);
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error("Resume visit API: missing Resend env vars");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  let body: ResumeVisitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const source = sanitizeSlug(body.source).toLowerCase();
  if (source !== "resume") {
    return NextResponse.json({ error: "Ignored." }, { status: 400 });
  }

  const company = sanitizeSlug(body.company);
  const role = sanitizeSlug(body.role);
  const campaign = sanitizeSlug(body.campaign);
  const medium = sanitizeSlug(body.medium);

  const now = Date.now();
  pruneDedupeMap(now);
  const fingerprint = `${company}|${role}|${campaign}|${medium}`;
  const lastSent = recentFingerprints.get(fingerprint);
  if (lastSent && now - lastSent < DEDUPE_WINDOW_MS) {
    return NextResponse.json({ ok: true, deduped: true });
  }
  recentFingerprints.set(fingerprint, now);

  const companyLabel = company || "(none)";
  const roleLabel = role || "(none)";
  const campaignLabel = campaign || "(none)";
  const mediumLabel = medium || "(none)";

  const subject = `Resume portfolio visit: ${company || campaign || "unknown"}`;
  const html = [
    "<p>Someone opened your portfolio from a resume link.</p>",
    "<ul>",
    `<li><strong>Company:</strong> ${escapeHtml(companyLabel)}</li>`,
    `<li><strong>Role:</strong> ${escapeHtml(roleLabel)}</li>`,
    `<li><strong>Campaign:</strong> ${escapeHtml(campaignLabel)}</li>`,
    `<li><strong>Medium:</strong> ${escapeHtml(mediumLabel)}</li>`,
    `<li><strong>Source:</strong> resume</li>`,
    "</ul>",
    "<p style=\"color:#666;font-size:12px\">No personal visitor data was collected.</p>",
  ].join("");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
    });

    if (error) {
      // Allow a retry later for the same fingerprint if send failed.
      recentFingerprints.delete(fingerprint);
      console.error("Resume visit Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: "Failed to send." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    recentFingerprints.delete(fingerprint);
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resume visit API error:", message);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
