import { describe, expect, it } from "vitest";
import { baseName, usageOf } from "./skills";
import { SKILLS } from "@/data/skills";

describe("skill usage", () => {
  it("normalises names with notes and qualifiers", () => {
    expect(baseName("AWS (EC2, S3, Lambda)")).toBe("aws");
    expect(baseName("JWT / RBAC")).toBe("jwt");
    expect(baseName("GitHub Actions · 61 tests")).toBe("github actions");
    expect(baseName("TCP/IP")).toBe("tcp/ip");
  });

  it("finds Python in both jobs and most projects", () => {
    const u = usageOf("Python");
    expect(u.jobs.map((j) => j.id)).toEqual(["ipserlabs", "ppd"]);
    expect(u.projects.map((p) => p.slug)).toEqual(["asl-engine", "subway-optimizer", "cellular-drone"]);
  });

  it("matches qualified skill names", () => {
    expect(usageOf("AWS (EC2, S3, Lambda)").jobs.map((j) => j.id)).toEqual(["ppd"]);
    expect(usageOf("JWT").jobs.map((j) => j.id)).toEqual(["ipserlabs"]);
    expect(usageOf("SystemC").projects.map((p) => p.slug)).toEqual(["vit-soc"]);
  });

  it("single letters never match by accident", () => {
    expect(usageOf("C").projects).toEqual([]);
  });

  it("every skill group has unique items", () => {
    for (const g of SKILLS) expect(new Set(g.items).size).toBe(g.items.length);
  });
});
