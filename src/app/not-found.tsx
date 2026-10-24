import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not found · baibhavOS", robots: { index: false } };

// Any path the OS doesn't know. Plain server HTML: no OS boot for a dead link.
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-bg px-6 text-center text-fg">
      <p className="font-mono text-sm text-accent">zsh: no such file or directory</p>
      <h1 className="text-[clamp(28px,6vw,44px)] font-extrabold">404 · that window doesn&apos;t exist.</h1>
      <p className="max-w-[44ch] text-fg2">The link may be old, or mistyped. Everything that does exist is one click away on the desktop.</p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-[10px] bg-[var(--solid-btn)] px-[18px] text-sm font-semibold text-[var(--solid-btn-fg)] no-underline"
      >
        Back to the desktop
      </Link>
    </main>
  );
}
