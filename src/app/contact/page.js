"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

// Existing site links (same as home page petals)
const CONTACT_LINKS = {
  email: "mailto:daisy@daisylaflamme.net",
  linkedin: "https://www.linkedin.com/in/desislavalaflamme/",
  github: "https://github.com/daisylaflamme",
};

// Strip only script-dangerous chars so first + last name (with space) always works while typing
function stripNameForInput(value) {
  if (typeof value !== "string") return "";
  return value.replace(/</g, "").replace(/>/g, "");
}

// Name: full sanitize for validation/submit (allows letters, spaces, hyphens, apostrophes, periods)
function sanitizeName(value) {
  if (typeof value !== "string") return "";
  const allowed = value.replace(/[^\p{L}\p{N}\s.'\-]/gu, "");
  return allowed.trim();
}

// Message: allow spaces, punctuation, and newlines; only strip script-dangerous chars
function sanitizeMessage(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/</g, "")
    .replace(/>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

// Email: only trim and strip control chars so valid addresses aren't broken
function sanitizeEmail(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F]/g, "").trim();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Option 2: form posts directly to PHP on cPanel (no Next.js API). Set in Vercel if different.
const FORM_ACTION =
  typeof process.env.NEXT_PUBLIC_CONTACT_FORM_ACTION !== "undefined"
    ? process.env.NEXT_PUBLIC_CONTACT_FORM_ACTION
    : "https://www.daisylaflamme.net/contact.php";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = useCallback((val) => {
    const s = val.trim();
    if (!s) return "Name is required.";
    if (s.length < 2) return "Name must be at least 2 characters.";
    if (s.length > 100) return "Name must be under 100 characters.";
    return null;
  }, []);

  const validateEmail = useCallback((val) => {
    const s = val.trim();
    if (!s) return "Email is required.";
    if (!EMAIL_REGEX.test(s)) return "Please enter a valid email address.";
    if (s.length > 254) return "Email is too long.";
    return null;
  }, []);

  const handleNameChange = (e) => {
    const value = stripNameForInput(e.target.value);
    setName(value);
    if (touched.name) setErrors((prev) => ({ ...prev, name: validateName(sanitizeName(value)) }));
  };

  const handleEmailChange = (e) => {
    const safe = sanitizeEmail(e.target.value);
    setEmail(safe);
    if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(safe) }));
  };

  const handleMessageChange = (e) => {
    setMessage(sanitizeMessage(e.target.value));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "name") setErrors((prev) => ({ ...prev, name: validateName(sanitizeName(name)) }));
    if (field === "email") setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });

    if (honeypot) {
      setSubmitStatus("error");
      return;
    }

    const nameForValidation = sanitizeName(name);
    const nameErr = validateName(nameForValidation);
    const emailErr = validateEmail(email);
    const newErrors = {};
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    setErrors(newErrors);

    if (nameErr || emailErr) {
      setSubmitStatus("error");
      return;
    }

    // Option 2: submit to PHP by creating a temporary form and submitting it.
    // This avoids ref/timing issues with the React form.
    const form = document.createElement("form");
    form.method = "post";
    form.action = FORM_ACTION;
    form.style.display = "none";

    // Do not add an input named "submit" — it shadows form.submit() and breaks the call.
    const fields = [
      ["name", nameForValidation],
      ["email", email.trim()],
      ["message", (message || "").trim()],
      ["human", "4"],
    ];
    fields.forEach(([nameVal, value]) => {
      const input = document.createElement("input");
      input.name = nameVal;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

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

          {/* <section
            className="contact-section rounded-2xl p-6 md:p-8 shadow-md"
            aria-labelledby="send-message-heading"
          >
            <h2
              id="send-message-heading"
              className="text-lg font-semibold text-[var(--color-font-primary)] mb-6"
            >
              Send a Message
            </h2>
            <form
              action={FORM_ACTION}
              method="post"
              onSubmit={handleSubmit}
              className="space-y-4 relative"
              noValidate
            >
              <input type="hidden" name="human" value="4" />
              <input type="hidden" name="submit" value="Submit" />
              <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
                <label htmlFor="contact-website-url">Leave blank</label>
                <input
                  id="contact-website-url"
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-[var(--color-font-primary)] mb-1">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleBlur("name")}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-primary)] placeholder:text-[var(--color-font-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:border-transparent"
                  aria-invalid={touched.name && !!errors.name}
                  aria-describedby={touched.name && errors.name ? "name-error" : undefined}
                />
                {touched.name && errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-[var(--color-font-primary)] mb-1">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleBlur("email")}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-primary)] placeholder:text-[var(--color-font-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:border-transparent"
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={touched.email && errors.email ? "email-error" : undefined}
                />
                {touched.email && errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-[var(--color-font-primary)] mb-1">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Your message..."
                  value={message}
                  onChange={handleMessageChange}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-primary)] placeholder:text-[var(--color-font-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:border-transparent resize-y"
                />
              </div>

              {submitStatus === "error" && (errors.name || errors.email || errors.submit || honeypot) && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.submit || "Please fix the errors above before sending."}
                </p>
              )}
              {submitStatus === "success" && (
                <p className="text-sm text-green-700" role="status">
                  Thank you! Your message has been received.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto text-sm font-medium text-[var(--color-font-primary)] px-5 py-2.5 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] hover:bg-[var(--color-center-circle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSubmitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          </section> */}
      </div>
    </main>
  );
}
