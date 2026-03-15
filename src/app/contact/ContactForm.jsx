"use client";

import { useState, useCallback } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;
const HONEYPOT_FIELD = "website_url";

/** Simple classes for inputs/labels – easy to restyle later. */
const inputClass =
  "w-full px-3 py-2 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-primary)] placeholder:text-[var(--color-font-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:border-transparent";
const labelClass = "block text-sm font-medium text-[var(--color-font-primary)] mb-1";
const errorClass = "mt-1 text-sm text-red-600";
const textareaClass = inputClass + " resize-y";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const validateName = useCallback((val) => {
    const s = val.trim();
    if (!s) return "Name is required.";
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

  const validateMessage = useCallback((val) => {
    const s = val.trim();
    if (!s) return "Message is required.";
    if (s.length < MIN_MESSAGE_LENGTH)
      return `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`;
    if (s.length > 5000) return "Message is too long.";
    return null;
  }, []);

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "name") setErrors((prev) => ({ ...prev, name: validateName(name) ?? "" }));
    if (field === "email") setErrors((prev) => ({ ...prev, email: validateEmail(email) ?? "" }));
    if (field === "message")
      setErrors((prev) => ({ ...prev, message: validateMessage(message) ?? "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setTouched({ name: true, email: true, message: true });

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const messageErr = validateMessage(message);
    const newErrors = {};
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (messageErr) newErrors.message = messageErr;
    setErrors(newErrors);

    if (nameErr || emailErr || messageErr) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          [HONEYPOT_FIELD]: honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setHoneypot("");
      setErrors({});
      setTouched({});
    } catch {
      setStatus("error");
      setSubmitError("Network error. Please try again.");
    }
  };

  const isSubmitting = status === "sending";

  return (
    <section
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
        onSubmit={handleSubmit}
        className="space-y-4 relative"
        noValidate
        aria-describedby={submitError ? "submit-error" : undefined}
      >
        {/* Honeypot – keep off-screen and invisible for accessibility */}
        <div
          className="absolute -left-[9999px] w-px h-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="contact-website-url">Leave this blank</label>
          <input
            id="contact-website-url"
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (touched.name) setErrors((prev) => ({ ...prev, name: validateName(e.target.value) ?? "" }));
            }}
            onBlur={handleBlur("name")}
            className={inputClass}
            aria-required="true"
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? "name-error" : undefined}
            disabled={isSubmitting}
          />
          {touched.name && errors.name && (
            <p id="name-error" className={errorClass} role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) ?? "" }));
            }}
            onBlur={handleBlur("email")}
            className={inputClass}
            aria-required="true"
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
          />
          {touched.email && errors.email && (
            <p id="email-error" className={errorClass} role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-message" className={labelClass}>
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Your message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (touched.message)
                setErrors((prev) => ({ ...prev, message: validateMessage(e.target.value) ?? "" }));
            }}
            onBlur={handleBlur("message")}
            rows={4}
            className={textareaClass}
            aria-required="true"
            aria-invalid={touched.message && !!errors.message}
            aria-describedby={touched.message && errors.message ? "message-error" : undefined}
            disabled={isSubmitting}
          />
          {touched.message && errors.message && (
            <p id="message-error" className={errorClass} role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {status === "success" && (
          <p className="text-sm text-green-700" role="status" aria-live="polite">
            Thank you! Your message has been sent.
          </p>
        )}

        {submitError && (
          <p id="submit-error" className="text-sm text-red-600" role="alert" aria-live="assertive">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto text-sm font-medium text-[var(--color-font-primary)] px-5 py-2.5 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] hover:bg-[var(--color-center-circle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] disabled:opacity-60 disabled:pointer-events-none"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </button>
      </form>
    </section>
  );
}
