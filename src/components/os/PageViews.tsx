"use client";

import { Analytics } from "@vercel/analytics/react";

// Anonymous page views (Vercel Analytics: no cookies, no personal data). The OS
// changes the URL with history.replaceState as windows focus, which automatic
// tracking can't see, so each window view is reported here instead. Case studies
// and posts are grouped by route so the dashboard can compare them.

export function PageViews({ path }: { path: string }) {
  const route = path.replace(/^\/(projects|writing)\/[^/]+$/, "/$1/[slug]");
  return <Analytics route={route} path={path} />;
}
