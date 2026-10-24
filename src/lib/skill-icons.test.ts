import { describe, expect, it } from "vitest";
import { hasIcon, iconFor, luminance } from "./skill-icons";
import { SKILLS } from "@/data/skills";

describe("skill icons", () => {
  it("every skill has a brand logo or a glyph", () => {
    const missing = SKILLS.flatMap((g) => g.items).filter((s) => !hasIcon(s));
    expect(missing).toEqual([]);
  });

  it("uses the brand logo where Simple Icons has one", () => {
    expect(iconFor("Python")).toMatchObject({ kind: "brand", hex: "#3776AB", title: "Python" });
  });

  it("falls back to a neutral glyph for removed or generic marks", () => {
    expect(iconFor("AWS (EC2, S3, Lambda)").kind).toBe("glyph");
    expect(iconFor("UART").kind).toBe("glyph");
  });

  it("measures luminance for tile contrast", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#FFFFFF")).toBeCloseTo(1);
  });
});
