"use client";

import { useEffect, useState } from "react";
import { PLANNED, POSTS, readingMinutes, type Post } from "@/data/writing";
import type { AppProps } from "./ui";

// Build logs and deep dives. The index lists posts newest first; params.post opens one.

const date = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });

export function Writing({ params, setParams }: AppProps) {
  const post = POSTS.find((p) => p.slug === params.post);
  if (post) return <Article post={post} onBack={() => setParams({ post: "" })} />;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 py-6 @3xl:px-10">
      <header>
        <div className="eyebrow">Writing</div>
        <h1 className="mt-1.5 text-[28px] font-extrabold">Notes from the build log.</h1>
      </header>
      {POSTS.length > 0 ? (
        <ul>
          {POSTS.map((p) => (
            <li key={p.slug}>
              <button type="button" onClick={() => setParams({ post: p.slug })} className="flex w-full cursor-pointer flex-col gap-1.5 border-t border-hair py-4 text-left">
                <span className="font-mono text-[11px] text-muted">
                  {date(p.date)} · {readingMinutes(p.body)} min read{p.tags.length ? ` · ${p.tags.join(", ")}` : ""}
                </span>
                <span className="text-lg font-semibold text-fg">{p.title}</span>
                <span className="text-sm leading-relaxed text-fg2">{p.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <section aria-label="Coming soon" className="flex flex-col gap-3">
          <p className="max-w-[60ch] text-sm leading-relaxed text-fg2">The first posts are in the works. Here&apos;s what&apos;s coming:</p>
          <ol>
            {PLANNED.map((t, i) => (
              <li key={t} className="flex gap-4 border-t border-hair py-3 text-sm">
                <span className="w-6 flex-none font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-fg">{t}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function Article({ post, onBack }: { post: Post; onBack: () => void }) {
  // The Markdown renderer loads with the first post, not with the OS. Posts are
  // authored in this repo, so their Markdown is trusted.
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import("marked").then(({ marked }) => alive && setHtml(marked.parse(post.body, { async: false })));
    return () => {
      alive = false;
    };
  }, [post.body]);
  return (
    <div className="h-full overflow-y-auto">
      <article className="mx-auto flex max-w-[720px] flex-col gap-5 px-6 pb-16 pt-6 @3xl:px-10">
        <button type="button" onClick={onBack} className="cursor-pointer self-start font-mono text-xs text-muted hover:text-fg">
          ← writing
        </button>
        <header className="flex flex-col gap-2">
          <span className="font-mono text-xs text-muted">
            {date(post.date)} · {readingMinutes(post.body)} min read
          </span>
          <h1 className="text-[clamp(28px,5cqw,40px)] font-extrabold leading-tight">{post.title}</h1>
          <p className="text-lg leading-normal text-warm">{post.summary}</p>
        </header>
        {html === null ? <p className="font-mono text-xs text-muted">loading…</p> : <div className="prose-os" dangerouslySetInnerHTML={{ __html: html }} />}
      </article>
    </div>
  );
}
