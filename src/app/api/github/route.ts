import { NextResponse } from "next/server";
import { GITHUB_USER, describeEvents, parseContributions, pickRepos, type GitHubSummary } from "@/lib/github";

// Everything the GitHub app shows, in one cached response. Unauthenticated GitHub
// API calls are limited to 60 an hour, so results are cached for an hour; set
// GITHUB_TOKEN to raise the limit.

export const dynamic = "force-dynamic";

const HOUR = 3600;
const headers: Record<string, string> = {
  "User-Agent": "baibhavOS",
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function get<T>(url: string, as: "json" | "text"): Promise<T> {
  const res = await fetch(url, { headers, next: { revalidate: HOUR }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return (as === "json" ? res.json() : res.text()) as Promise<T>;
}

export async function GET() {
  const api = `https://api.github.com/users/${GITHUB_USER}`;
  const [profile, repos, events, calendar] = await Promise.allSettled([
    get<{ login: string; html_url: string; public_repos: number; followers: number }>(api, "json"),
    get<Parameters<typeof pickRepos>[0]>(`${api}/repos?per_page=100&sort=pushed`, "json"),
    get<Parameters<typeof describeEvents>[0]>(`${api}/events/public?per_page=50`, "json"),
    get<string>(`https://github.com/users/${GITHUB_USER}/contributions`, "text"),
  ]);
  if (profile.status === "rejected") {
    return NextResponse.json({ ok: false, error: String(profile.reason) }, { status: 502 });
  }
  const summary: GitHubSummary = {
    login: profile.value.login,
    url: profile.value.html_url,
    publicRepos: profile.value.public_repos,
    followers: profile.value.followers,
    repos: repos.status === "fulfilled" ? pickRepos(repos.value) : [],
    activity: events.status === "fulfilled" ? describeEvents(events.value) : [],
    contributions: calendar.status === "fulfilled" ? parseContributions(calendar.value) : null,
    fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json({ ok: true, ...summary });
}
