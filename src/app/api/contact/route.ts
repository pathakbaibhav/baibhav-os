import { NextResponse, type NextRequest } from "next/server";
import { PROFILE } from "@/data/profile";
import { rateLimiter, validateContact } from "@/lib/contact";

// Contact form → email, via Resend (https://resend.com). Needs RESEND_API_KEY; without
// it the route answers 503 and the form points people to email and LinkedIn instead.
//   CONTACT_TO    where messages go (default: the profile email)
//   CONTACT_FROM  verified sender (default: Resend's shared test sender)

const allow = rateLimiter(3, 10 * 60_000); // per IP; per server instance, which is enough for a portfolio

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  const v = validateContact((body ?? {}) as Record<string, string>);
  if (!v.ok) return NextResponse.json({ ok: false, error: "invalid", errors: v.errors }, { status: 422 });

  // Honeypot: real people never see or fill the "company" field. Pretend it worked.
  if (v.value.company) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!allow(ip)) return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });

  const { name, email, message } = v.value;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "baibhavOS <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO ?? PROFILE.email],
      reply_to: email,
      subject: `baibhavOS: message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>\nSent from the baibhavOS contact form.`,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!res?.ok) return NextResponse.json({ ok: false, error: "send-failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
