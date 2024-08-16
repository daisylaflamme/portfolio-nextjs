import { NextResponse } from "next/server";

// Forwards the contact form to your PHP script. Set CONTACT_PHP_URL in .env.local
// e.g. CONTACT_PHP_URL=https://daisylaflamme.net/contact.php

export async function POST(request) {
  const phpUrl = process.env.CONTACT_PHP_URL;
  if (!phpUrl) {
    console.error("CONTACT_PHP_URL is not set in .env");
    return NextResponse.json(
      { error: "Contact form is not configured. Set CONTACT_PHP_URL." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const formBody = new URLSearchParams({
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message || "").trim(),
      human: "4",
      submit: "Submit",
    });

    const res = await fetch(phpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
    });

    if (!res.ok) {
      console.error("PHP contact script error:", res.status, await res.text());
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
