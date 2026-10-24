import { describe, expect, it } from "vitest";
import { rateLimiter, validateContact } from "./contact";

describe("contact form", () => {
  it("accepts a reasonable message and trims it", () => {
    const r = validateContact({ name: " Ada ", email: "ada@example.com", message: "Hi! We're hiring backend engineers." });
    expect(r).toEqual({ ok: true, value: { name: "Ada", email: "ada@example.com", message: "Hi! We're hiring backend engineers.", company: "" } });
  });

  it("explains each problem", () => {
    const r = validateContact({ name: "", email: "nope", message: "hi" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["email", "message", "name"]);
  });

  it("caps message length", () => {
    expect(validateContact({ name: "A", email: "a@b.co", message: "x".repeat(4001) }).ok).toBe(false);
  });

  it("rate limits per sender", () => {
    const allow = rateLimiter(2, 1000);
    expect(allow("ip", 0)).toBe(true);
    expect(allow("ip", 10)).toBe(true);
    expect(allow("ip", 20)).toBe(false);
    expect(allow("other", 20)).toBe(true);
    expect(allow("ip", 1500)).toBe(true);
  });
});
