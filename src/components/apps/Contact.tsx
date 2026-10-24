"use client";

import { useState, type FormEvent } from "react";
import { PROFILE } from "@/data/profile";
import { LIMITS, validateContact, type ContactErrors } from "@/lib/contact";
import { btnGhost, btnSolid } from "./ui";

// Contact: direct links first (email and LinkedIn are the fastest ways to reach me),
// then a message form that emails me through /api/contact.

type Status = "idle" | "sending" | "sent" | "error" | "offline" | "limited";

const field = "min-h-11 w-full rounded-xl border bg-card px-3.5 text-[15px] text-fg outline-none placeholder:text-muted focus:border-accent";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = Object.fromEntries(form) as Record<string, string>;
    const v = validateContact(input);
    if (!v.ok) return setErrors(v.errors);
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const body = (await res.json().catch(() => ({}))) as { errors?: ContactErrors };
      if (res.ok) {
        setStatus("sent");
        (e.target as HTMLFormElement).reset();
      } else if (res.status === 503) setStatus("offline");
      else if (res.status === 429) setStatus("limited");
      else if (res.status === 422 && body.errors) {
        setErrors(body.errors);
        setStatus("idle");
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const err = (k: keyof ContactErrors) =>
    errors[k] && (
      <span id={`contact-${k}-error`} className="text-xs text-warm">
        {errors[k]}
      </span>
    );

  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto px-6 py-7 @3xl:flex-row @3xl:px-9">
      <section aria-label="Reach me directly" className="flex flex-col gap-5 @3xl:w-[300px] @3xl:flex-none">
        <div className="eyebrow">Contact</div>
        <h1 className="text-[28px] font-extrabold leading-tight">Let&apos;s build something that stays up.</h1>
        <p className="text-[15px] leading-relaxed text-fg2">
          I&apos;m open to backend, platform and SWE roles. Email or LinkedIn reach me fastest; the form works too.
        </p>
        <div className="flex flex-col gap-2.5">
          <a href={`mailto:${PROFILE.email}`} className={`${btnSolid} justify-center`}>Email me</a>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className={`${btnGhost} justify-center`}>Message me on LinkedIn ↗</a>
        </div>
        <dl className="font-mono text-[13px]">
          {[
            ["email", PROFILE.email, `mailto:${PROFILE.email}`],
            ["linkedin", "/in/baibhavkp", PROFILE.linkedin],
            ["github", "/pathakbaibhav", PROFILE.github],
          ].map(([k, v, href]) => (
            <div key={k} className="flex gap-4 border-t border-hair py-2.5">
              <dt className="w-20 flex-none text-muted">{k}</dt>
              <dd className="min-w-0 truncate">
                <a href={href} target={k === "email" ? undefined : "_blank"} rel="noreferrer" className="text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
                  {v}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Send a message" className="flex min-w-0 flex-1 flex-col gap-4">
        {status === "sent" ? (
          <div role="status" className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-6">
            <div className="text-lg font-bold">Message sent. Thank you!</div>
            <p className="text-sm text-fg2">I&apos;ll reply to the email you gave, usually within a day.</p>
            <button type="button" onClick={() => setStatus("idle")} className="mt-2 self-start cursor-pointer text-sm text-accent">
              Send another →
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Send a message</h2>
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" name="name" autoComplete="name" maxLength={LIMITS.name} aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-error" : undefined} className={field} style={{ borderColor: errors.name ? "var(--warm)" : "var(--line)" }} />
              {err("name")}
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={LIMITS.email} aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined} className={field} style={{ borderColor: errors.email ? "var(--warm)" : "var(--line)" }} />
              {err("email")}
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" name="message" rows={6} maxLength={LIMITS.message} aria-invalid={!!errors.message} aria-describedby={errors.message ? "contact-message-error" : undefined} className={`${field} py-3`} style={{ borderColor: errors.message ? "var(--warm)" : "var(--line)" }} />
              {err("message")}
            </div>
            {/* Honeypot for bots: hidden from people and screen readers. */}
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={status === "sending"} className={`${btnSolid} cursor-pointer disabled:opacity-60`}>
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
              <div role="status" aria-live="polite" className="text-sm text-warm">
                {status === "offline" && (
                  <>The form isn&apos;t connected yet. Please <a href={`mailto:${PROFILE.email}`} className="underline">email me</a> or <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="underline">message me on LinkedIn</a>.</>
                )}
                {status === "limited" && "That's a few messages in a row; please try again in a few minutes."}
                {status === "error" && (
                  <>Something went wrong sending that. Please <a href={`mailto:${PROFILE.email}`} className="underline">email me</a> instead.</>
                )}
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
