// Contact form validation, shared by the form (instant feedback) and the API route (the real check).

export type ContactInput = { name: string; email: string; message: string; company?: string };
export type ContactErrors = Partial<Record<"name" | "email" | "message", string>>;

export const LIMITS = { name: 80, email: 120, message: 4000, minMessage: 10 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(input: Partial<ContactInput>): { ok: true; value: ContactInput } | { ok: false; errors: ContactErrors } {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const message = String(input.message ?? "").trim();
  const errors: ContactErrors = {};
  if (!name) errors.name = "Please add your name.";
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;
  if (!EMAIL.test(email) || email.length > LIMITS.email) errors.email = "That email doesn't look right.";
  if (message.length < LIMITS.minMessage) errors.message = "A little more detail, please.";
  else if (message.length > LIMITS.message) errors.message = `Keep it under ${LIMITS.message} characters.`;
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { name, email, message, company: String(input.company ?? "") } };
}

/** Sliding-window limiter, per key (the sender's IP): `max` messages per `windowMs`. */
export function rateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    hits.set(key, [...recent, now]);
    return true;
  };
}
