import { describe, expect, it } from "vitest";
import {
  calculateCriteriaBand,
  calculateOverallBand,
  rawToListeningBand,
  rawToReadingBand,
  roundIeltsBand,
} from "@/lib/ksa/bandCalculator";

describe("IELTS Band Calculator (Academic & General Training)", () => {
  it("rounds IELTS scores cleanly using official half-up rules", () => {
    expect(roundIeltsBand(6.125)).toBe(6.0);
    expect(roundIeltsBand(6.25)).toBe(6.5);
    expect(roundIeltsBand(6.625)).toBe(6.5);
    expect(roundIeltsBand(6.75)).toBe(7.0);
    expect(roundIeltsBand(-1)).toBe(0);
    expect(roundIeltsBand(10)).toBe(9);
  });

  it("maps Listening raw scores (0-40) accurately", () => {
    expect(rawToListeningBand(0)).toBe(0.0);
    expect(rawToListeningBand(16)).toBe(5.0);
    expect(rawToListeningBand(23)).toBe(6.0);
    expect(rawToListeningBand(30)).toBe(7.0);
    expect(rawToListeningBand(35)).toBe(8.0);
    expect(rawToListeningBand(39)).toBe(9.0);
    expect(rawToListeningBand(40)).toBe(9.0);
  });

  it("differentiates Academic vs General Training Reading conversions accurately", () => {
    expect(rawToReadingBand(30, "academic")).toBe(7.0);
    expect(rawToReadingBand(30, "general")).toBe(6.0);
    expect(rawToReadingBand(34, "general")).toBe(7.0);
    expect(rawToReadingBand(39, "academic")).toBe(9.0);
    expect(rawToReadingBand(39, "general")).toBe(8.5);
    expect(rawToReadingBand(40, "general")).toBe(9.0);
  });

  it("computes Writing/Speaking criteria band and overall IELTS band", () => {
    expect(calculateCriteriaBand([6.5, 6.5, 6.0, 6.5])).toBe(6.5); // 6.375 -> 6.5
    expect(calculateCriteriaBand([7.0, 7.0, 6.5, 6.5])).toBe(7.0); // 6.75 -> 7.0
    expect(
      calculateOverallBand({
        listening: 7.5,
        reading: 7.0,
        writing: 6.5,
        speaking: 6.5,
      })
    ).toBe(7.0); // 6.875 -> 7.0
    expect(
      calculateOverallBand({
        listening: 6.5,
        reading: 6.5,
        writing: 6.0,
        speaking: 6.0,
      })
    ).toBe(6.5); // 6.25 -> 6.5
  });
});
