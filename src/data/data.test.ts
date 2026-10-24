import { describe, expect, it } from "vitest";
import { PROJECTS } from "./projects";
import { JOBS } from "./experience";

describe("content data", () => {
  it("project numbers follow display order", () => {
    PROJECTS.forEach((p, i) => expect(p.num).toBe(String(i + 1).padStart(2, "0")));
  });

  it("project slugs are unique and URL-safe", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it("every project shows exactly two headline metrics", () => {
    PROJECTS.forEach((p) => expect(p.metrics).toHaveLength(2));
  });

  it("source links point at GitHub", () => {
    PROJECTS.filter((p) => p.source).forEach((p) => expect(p.source).toMatch(/^https:\/\/github\.com\/pathakbaibhav\//));
  });

  it("jobs are listed newest first", () => {
    expect(JOBS.map((j) => j.id)).toEqual(["zoppler", "ipserlabs", "ppd"]);
  });
});
