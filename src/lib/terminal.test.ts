import { describe, expect, it } from "vitest";
import { PROMPT, runCommand } from "./terminal";
import { PROJECTS, filterProjects } from "@/data/projects";
import { search } from "./search";

describe("spotlight search", () => {
  it("finds the ASL case study by slug, as the Help tour promises", () => {
    expect(search("asl")[0]).toMatchObject({ kind: "PROJECT", app: "projects", params: { sel: "01", view: "case" } });
  });
  it("matches apps and ranks prefix matches first", () => {
    expect(search("ter")[0]).toMatchObject({ label: "Terminal", kind: "APP" });
  });
  it("searches project stacks", () => {
    expect(search("fastapi").map((h) => h.label)).toContain("Boston Subway Route Optimizer");
  });
  it("returns nothing for blank queries", () => {
    expect(search("  ")).toEqual([]);
  });
});

describe("terminal", () => {
  it("echoes the command, then prints output", () => {
    const r = runCommand("whoami");
    expect(r.lines[0]).toEqual({ text: `${PROMPT} whoami`, kind: "cmd" });
    expect(r.lines[1].text).toContain("Baibhav Pathak");
  });

  it("is case- and whitespace-insensitive", () => {
    expect(runCommand("  SUDO   hire-me ").href).toMatch(/^mailto:/);
  });

  it("lists every project", () => {
    expect(runCommand("projects").lines).toHaveLength(PROJECTS.length + 1);
  });

  it("clear wipes the screen", () => {
    expect(runCommand("clear")).toEqual({ lines: [], clear: true });
  });

  it("open <app> resolves by id or label", () => {
    expect(runCommand("open lab").open).toBe("lab");
    expect(runCommand("open about me").open).toBe("about");
    expect(runCommand("open nope").lines[1].kind).toBe("err");
  });

  it("route is stubbed until the API is live", () => {
    expect(runCommand("route park-street harvard").lines[1].text).toContain("phase 4");
  });

  it("unknown commands suggest help", () => {
    expect(runCommand("ls").lines[1]).toEqual({ text: "command not found: ls (try help)", kind: "err" });
  });

  it("empty input just echoes the prompt", () => {
    expect(runCommand("   ").lines).toHaveLength(1);
  });
});

describe("project filters", () => {
  it("Featured, category and All", () => {
    expect(filterProjects(PROJECTS, "All")).toHaveLength(PROJECTS.length);
    expect(filterProjects(PROJECTS, "Featured").every((p) => p.featured)).toBe(true);
    expect(filterProjects(PROJECTS, "IoT").map((p) => p.slug)).toEqual(["cellular-drone"]);
  });
});
