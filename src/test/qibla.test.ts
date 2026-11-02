import { describe, expect, it } from "vitest";
import { compassPoint, distanceToKaaba, qiblaBearing } from "@/lib/qibla";

describe("qibla", () => {
  it("Addis Ababa faces roughly north-north-east", () => {
    expect(qiblaBearing(9.03, 38.74)).toBeCloseTo(4.7, 1);
  });
  it("London faces about 119° (south-east)", () => {
    expect(qiblaBearing(51.51, -0.13)).toBeCloseTo(119, 0);
    expect(compassPoint(qiblaBearing(51.51, -0.13))).toBe("SE");
  });
  it("Addis Ababa is about 1,380 km from the Kaaba", () => {
    expect(Math.round(distanceToKaaba(9.03, 38.74) / 10) * 10).toBeGreaterThan(1350);
    expect(distanceToKaaba(9.03, 38.74)).toBeLessThan(1420);
  });
});
