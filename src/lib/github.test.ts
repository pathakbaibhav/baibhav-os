import { describe, expect, it } from "vitest";
import { describeEvents, parseContributions, pickRepos } from "./github";

// Trimmed from the real github.com/users/<user>/contributions markup (Oct 2026).
const HTML = `
<h2 tabindex="-1" id="js-contribution-activity-description" class="f4 text-normal mb-2">
      1,043
      contributions
        in the last year
</h2>
<td tabindex="0" data-ix="1" style="width: 10px" data-date="2025-10-26" id="contribution-day-component-0-1" data-level="0" role="gridcell" class="ContributionCalendar-day"></td>
<td tabindex="0" data-ix="0" style="width: 10px" data-date="2025-10-19" id="contribution-day-component-0-0" data-level="2" role="gridcell" class="ContributionCalendar-day"></td>
<tool-tip id="t1" for="contribution-day-component-0-0" popover="manual" class="sr-only">3 contributions on October 19th.</tool-tip>
<tool-tip id="t2" for="contribution-day-component-0-1" popover="manual" class="sr-only">No contributions on October 26th.</tool-tip>
`;

describe("github parsing", () => {
  it("reads every day's level and count, sorted by date, and the yearly total", () => {
    expect(parseContributions(HTML)).toEqual({
      total: 1043,
      days: [
        { date: "2025-10-19", level: 2, count: 3 },
        { date: "2025-10-26", level: 0, count: 0 },
      ],
    });
  });

  it("returns null when the markup has no calendar", () => {
    expect(parseContributions("<html></html>")).toBeNull();
  });

  it("keeps own, live repos, newest push first", () => {
    const base = { description: null, language: "Python", stargazers_count: 1, html_url: "u" };
    const repos = pickRepos([
      { ...base, name: "old", pushed_at: "2024-01-01T00:00:00Z", fork: false },
      { ...base, name: "fork", pushed_at: "2026-01-01T00:00:00Z", fork: true },
      { ...base, name: "new", pushed_at: "2026-02-01T00:00:00Z", fork: false },
      { ...base, name: "gone", pushed_at: "2026-03-01T00:00:00Z", fork: false, archived: true },
      { ...base, name: "pathakbaibhav", pushed_at: "2026-04-01T00:00:00Z", fork: false },
    ]);
    expect(repos.map((r) => r.name)).toEqual(["new", "old"]);
  });

  it("describes events in plain words and skips noise", () => {
    const ev = (type: string, payload: object) => ({ type, repo: { name: "pathakbaibhav/baibhav-os" }, created_at: "2026-10-24T08:00:00Z", payload });
    expect(
      describeEvents([
        ev("PushEvent", { ref: "refs/heads/main", size: 2, commits: [{ message: "a" }, { message: "Phase 4: Settings\n\nbody" }] }),
        ev("PushEvent", { ref: "refs/heads/main" }),
        ev("WatchEvent", {}),
        ev("CreateEvent", { ref_type: "repository", ref: null }),
      ]).map((a) => a.text),
    ).toEqual(['pushed "Phase 4: Settings"', "pushed to main", "created the repository"]);
  });
});
