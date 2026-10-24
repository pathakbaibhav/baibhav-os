// Posts for the Writing app, newest first. Bodies are Markdown. Each post gets
// its own page at /writing/<slug>.

export type Post = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  tags: string[];
  body: string;
};

export const POSTS: Post[] = [];

/** Shown while there are no posts yet; the real posts come from the content questionnaire. */
export const PLANNED = [
  "How micro-batching took the ASL API from 443 to 1,569 req/s",
  "Rerouting Boston's subway around live closures",
  "50+ automation tools later: lessons from shipping internal tooling at PPD",
  "Squeezing a Vision Transformer onto an edge chip",
];

/** Rough reading time at 220 words a minute. */
export const readingMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
