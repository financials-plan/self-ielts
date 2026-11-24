import { describe, expect, it } from "vitest";
import {
  buildContributionDays,
  computeCountUpValue,
  computeRadarPolygon,
  computeRingDash,
  easeOutCubic,
  evaluatePasswordStrength,
} from "@/lib/lucian/helpers";

describe("Lucian UX/UI helper calculations", () => {
  it("evaluates password strength levels and individual rules accurately", () => {
    const empty = evaluatePasswordStrength("");
    expect(empty.score).toBe(0);
    expect(empty.level).toBe("empty");

    const weak = evaluatePasswordStrength("abc");
    expect(weak.score).toBe(1);
    expect(weak.level).toBe("weak");
    expect(weak.rules.minLength).toBe(false);

    const fair = evaluatePasswordStrength("abcdefgh");
    expect(fair.score).toBe(1);
    expect(fair.rules.minLength).toBe(true);

    const good = evaluatePasswordStrength("Abcdefg1");
    expect(good.score).toBe(3);
    expect(good.level).toBe("good");

    const strong = evaluatePasswordStrength("Abcdefg1!");
    expect(strong.score).toBe(4);
    expect(strong.level).toBe("strong");
    expect(Object.values(strong.rules).every(Boolean)).toBe(true);
  });

  it("computes 5-axis radar polygons bounded within radius", () => {
    const { vertices, pointsAttr } = computeRadarPolygon(
      [9, 4.5, 6, 7.5, 0],
      9,
      130,
      122,
      80
    );
    expect(vertices).toHaveLength(5);
    expect(pointsAttr.split(" ")).toHaveLength(5);
    // Axis 0 at top: full value 9 -> (130, 122 - 80) = (130, 42)
    expect(vertices[0]).toEqual({ x: 130, y: 42, value: 9 });
    // Axis 4 value 0 -> center (130, 122)
    expect(vertices[4]).toEqual({ x: 130, y: 122, value: 0 });
  });

  it("computes concentric ring dash offsets including >100% second lap", () => {
    const half = computeRingDash(50, 50);
    expect(half.hasLap).toBe(false);
    expect(half.primaryOffset).toBeCloseTo(half.circumference / 2, 1);

    const overGoal = computeRingDash(125, 50);
    expect(overGoal.hasLap).toBe(true);
    expect(overGoal.primaryOffset).toBe(0);
    expect(overGoal.lapOffset).toBeCloseTo(overGoal.circumference * 0.75, 1);
  });

  it("builds deterministic 84-day contribution grids reflecting streak days", () => {
    const days = buildContributionDays(
      84,
      5,
      "2026-11-24",
      { "2026-11-10": 4 },
      "2026-11-24"
    );
    expect(days).toHaveLength(84);
    expect(days[days.length - 1]).toEqual({
      date: "2026-11-24",
      count: 2,
      level: 2,
    });
    expect(days.find((d) => d.date === "2026-11-10")?.level).toBe(4);
    expect(days.filter((d) => d.count > 0)).toHaveLength(6); // 5 streak days + 2026-11-10
  });

  it("eases and interpolates count-up numbers cleanly without overshoot", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(2)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 5);

    expect(computeCountUpValue(40, 0, 800)).toBe(0);
    expect(computeCountUpValue(40, 800, 800)).toBe(40);
    expect(computeCountUpValue(40, 5000, 800)).toBe(40);

    const mid = computeCountUpValue(7.5, 400, 800, 1);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(7.5);
    expect(Number(mid.toFixed(1))).toBe(mid);

    expect(computeCountUpValue(12, 100, 0)).toBe(12);
  });
});
