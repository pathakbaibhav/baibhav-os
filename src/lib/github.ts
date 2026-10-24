// Parsing for the GitHub app's data: the REST API (profile, repos, public events)
// and the public contributions calendar, which the REST API doesn't offer without
// a token. Pure functions, so the route handler stays thin and this is testable.

export const GITHUB_USER = "pathakbaibhav";

export type ContribDay = { date: string; level: number; count: number };
export type Repo = { name: string; description: string | null; language: string | null; stars: number; pushedAt: string; url: string };
export type Activity = { repo: string; at: string; text: string };
export type GitHubSummary = {
  login: string;
  url: string;
  publicRepos: number;
  followers: number;
  repos: Repo[];
  activity: Activity[];
  contributions: { total: number; days: ContribDay[] } | null;
  fetchedAt: string;
};

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

/** github.com/users/<user>/contributions → every day's level (0–4) and count, plus the yearly total. */
export function parseContributions(html: string): { total: number; days: ContribDay[] } | null {
  const tips = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^([\d,]+) contributions?/);
    tips.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }
  const days: ContribDay[] = [];
  for (const m of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
    const date = attr(m[0], "data-date");
    const level = attr(m[0], "data-level");
    if (!date || level === undefined) continue;
    days.push({ date, level: Number(level), count: tips.get(attr(m[0], "id") ?? "") ?? 0 });
  }
  if (!days.length) return null;
  days.sort((a, b) => (a.date < b.date ? -1 : 1));
  const heading = html.match(/id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions?/);
  const total = heading ? Number(heading[1].replace(/,/g, "")) : days.reduce((n, d) => n + d.count, 0);
  return { total, days };
}

type RawRepo = { name: string; description: string | null; language: string | null; stargazers_count: number; pushed_at: string; html_url: string; fork: boolean; archived?: boolean };

/** Own, public, non-archived repos, most recently pushed first (minus the profile-README repo). */
export function pickRepos(raw: RawRepo[], limit = 8): Repo[] {
  return raw
    .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== GITHUB_USER.toLowerCase())
    .sort((a, b) => (a.pushed_at < b.pushed_at ? 1 : -1))
    .slice(0, limit)
    .map((r) => ({ name: r.name, description: r.description, language: r.language, stars: r.stargazers_count, pushedAt: r.pushed_at, url: r.html_url }));
}

type RawEvent = { type: string; repo: { name: string }; created_at: string; payload: { ref?: string | null; ref_type?: string; size?: number; commits?: { message: string }[]; action?: string } };

/** Public events as one human line each; noisy kinds (stars, deletes) are skipped. */
export function describeEvents(raw: RawEvent[], limit = 8): Activity[] {
  const out: Activity[] = [];
  for (const e of raw) {
    const repo = e.repo.name.replace(`${GITHUB_USER}/`, "");
    const p = e.payload;
    let text: string | null = null;
    if (e.type === "PushEvent") {
      const n = p.size ?? p.commits?.length;
      const msg = p.commits?.[p.commits.length - 1]?.message.split("\n")[0];
      const branch = p.ref?.replace("refs/heads/", "");
      text = msg ? `pushed "${msg}"` : `pushed ${n ? `${n} commit${n === 1 ? "" : "s"} ` : ""}to ${branch ?? "a branch"}`;
    } else if (e.type === "CreateEvent") {
      text = p.ref_type === "repository" ? "created the repository" : `created ${p.ref_type} ${p.ref ?? ""}`.trim();
    } else if (e.type === "PullRequestEvent") {
      text = `${p.action} a pull request`;
    } else if (e.type === "IssuesEvent") {
      text = `${p.action} an issue`;
    } else if (e.type === "ReleaseEvent") {
      text = "published a release";
    }
    if (text) out.push({ repo, at: e.created_at, text });
    if (out.length >= limit) break;
  }
  return out;
}
