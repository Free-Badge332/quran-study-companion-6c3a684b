import { describe, expect, it } from "vitest";
import { isThemeChoice, resolveTheme } from "@/lib/theme";

describe("theme preference", () => {
  it("light and dark choices ignore the phone setting", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("system follows the phone setting", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("rejects unknown saved values", () => {
    expect(isThemeChoice("sepia")).toBe(false);
    expect(isThemeChoice("system")).toBe(true);
  });
});
