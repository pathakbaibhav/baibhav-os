import { describe, expect, it } from "vitest";
import { ALL_PATHS, descriptionFor, pathFor, routeFor, titleFor } from "./routes";
import { LAUNCHPAD_ORDER } from "./apps";
import { PROJECTS } from "@/data/projects";
import { POSTS } from "@/data/writing";

describe("routes", () => {
  it("the desktop is /", () => {
    expect(pathFor(null)).toBe("/");
    expect(routeFor([])).toBeNull();
  });

  it("each app has its own path", () => {
    expect(pathFor("about", { section: "journey" })).toBe("/about");
    expect(routeFor(["terminal"])).toEqual({ app: "terminal", params: {} });
  });

  it("a project case study gets a slug URL; the index does not", () => {
    expect(pathFor("projects", { sel: "01", view: "case" })).toBe("/projects/asl-engine");
    expect(pathFor("projects", { sel: "01", view: "index" })).toBe("/projects");
    expect(routeFor(["projects", "asl-engine"])).toEqual({ app: "projects", params: { sel: "01", view: "case" } });
  });

  it("unknown pages are 404s", () => {
    expect(routeFor(["nope"])).toBeUndefined();
    expect(routeFor(["projects", "nope"])).toBeUndefined();
    expect(routeFor(["about", "extra"])).toBeUndefined();
    expect(routeFor(["projects", "asl-engine", "extra"])).toBeUndefined();
  });

  it("titles and descriptions name the app or project", () => {
    expect(titleFor(null)).toBe("Baibhav Pathak · baibhavOS");
    expect(titleFor({ app: "about", params: {} })).toBe("About Me · Baibhav Pathak");
    expect(titleFor(routeFor(["projects", "asl-engine"])!)).toBe("Real-Time ASL Gesture Engine · Baibhav Pathak");
    expect(descriptionFor(routeFor(["projects", "asl-engine"])!)).toMatch(/^A Flask API/);
    expect(descriptionFor({ app: "lab", params: {} })).toContain("Baibhav Pathak");
  });

  it("every prerendered path round-trips", () => {
    expect(ALL_PATHS).toHaveLength(LAUNCHPAD_ORDER.length + PROJECTS.length + POSTS.length);
    for (const segs of ALL_PATHS) {
      const r = routeFor(segs);
      expect(r).toBeTruthy();
      expect(pathFor(r!.app, r!.params)).toBe(`/${segs.join("/")}`);
    }
  });
});
