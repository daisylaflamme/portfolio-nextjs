/*
 * CONTACT FORM API (Resend)
 * -------------------------
 * SETUP:
 * 1. Install: npm install resend
 * 2. Env vars: add to .env.local (see .env.local.example). On Vercel: Project → Settings → Environment Variables.
 * 3. Test locally: npm run dev, open /contact, submit form. Check Resend dashboard for test emails.
 * 4. Deploy: push to Vercel; add RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL in Vercel env.
 *
 * REPLACE:
 * - CONTACT_TO_EMAIL: your inbox (e.g. laflammedaisy@gmail.com)
 * - CONTACT_FROM_EMAIL: verified domain in Resend, or use onboarding@resend.dev for testing only.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

/** Honeypot field name – must match the form. If this is filled, we treat as spam and return success anyway. */
const HONEYPOT_FIELD = "website_url";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
  [key: string]: string | undefined;
};

function validate(body: ContactBody): { error?: string } {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) return { error: "Name is required." };
  if (name.length > MAX_NAME_LENGTH) return { error: "Name is too long." };

  if (!email) return { error: "Email is required." };
  if (!EMAIL_REGEX.test(email)) return { error: "Please enter a valid email address." };
  if (email.length > MAX_EMAIL_LENGTH) return { error: "Email is too long." };

  if (!message) return { error: "Message is required." };
  if (message.length < MIN_MESSAGE_LENGTH)
    return { error: `Message must be at least ${MIN_MESSAGE_LENGTH} characters.` };
  if (message.length > MAX_MESSAGE_LENGTH) return { error: "Message is too long." };

  return {};
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error("Contact API: Missing RESEND_API_KEY, CONTACT_TO_EMAIL, or CONTACT_FROM_EMAIL");
    return NextResponse.json(
      { error: "Contact form is not configured. Please try again later." },
      { status: 500 }
    );
  }

  try {
    const body: ContactBody = await request.json();

    // Anti-spam: honeypot. If filled, pretend success and do not send.
    const honeypot = body[HONEYPOT_FIELD];
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const validation = validate(body);
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const name = (body.name as string).trim();
    const email = (body.email as string).trim();
    const message = (body.message as string).trim();

    const resend = new Resend(apiKey);

    // Subject includes sender name. replyTo so you can reply directly to the visitor.
    const subject = `Portfolio contact from ${name}`;
    const html = [
      "<p><strong>From:</strong> " + escapeHtml(name) + "</p>",
      "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>",
      "<p><strong>Message:</strong></p>",
      "<p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>",
    ].join("");

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
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
