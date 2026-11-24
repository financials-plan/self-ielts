import { describe, expect, it } from "vitest";
import {
  calculateNextSrsReview,
  previewSrsIntervals,
} from "@/lib/ksa/srs";

describe("SM-2 Spaced Repetition System", () => {
  const fixedNow = 1_700_000_000_000;

  it("progresses intervals across again, hard, good, easy ratings", () => {
    const initial = { intervalDays: 1, easeFactor: 2.5, repetitions: 0 };

    const again = calculateNextSrsReview(initial, "again", fixedNow);
    expect(again.repetitions).toBe(0);
    expect(again.intervalDays).toBe(1);
    expect(again.easeFactor).toBe(2.3);

    const good1 = calculateNextSrsReview(initial, "good", fixedNow);
    expect(good1.repetitions).toBe(1);
    expect(good1.intervalDays).toBe(1);

    const good2 = calculateNextSrsReview(good1, "good", fixedNow);
    expect(good2.repetitions).toBe(2);
    expect(good2.intervalDays).toBe(6);

    const good3 = calculateNextSrsReview(good2, "good", fixedNow);
    expect(good3.repetitions).toBe(3);
    expect(good3.intervalDays).toBe(15);

    const easy1 = calculateNextSrsReview(initial, "easy", fixedNow);
    expect(easy1.intervalDays).toBe(4);
    expect(easy1.easeFactor).toBe(2.65);

    const hard2 = calculateNextSrsReview(good2, "hard", fixedNow);
    expect(hard2.intervalDays).toBe(7);
    expect(hard2.easeFactor).toBe(2.35);
  });

  it("clamps easeFactor between 1.3 and 3.0", () => {
    const low = calculateNextSrsReview(
      { intervalDays: 6, easeFactor: 1.35, repetitions: 2 },
      "again",
      fixedNow
    );
    expect(low.easeFactor).toBe(1.3);

    const high = calculateNextSrsReview(
      { intervalDays: 10, easeFactor: 2.95, repetitions: 3 },
      "easy",
      fixedNow
    );
    expect(high.easeFactor).toBe(3.0);
  });

  it("previews localized Vietnamese interval labels", () => {
    const labels = previewSrsIntervals({
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 1,
    });
    expect(labels.again).toBe("1 ngày");
    expect(labels.good).toBe("6 ngày");
    expect(labels.easy).toBe("10 ngày");
  });
});
