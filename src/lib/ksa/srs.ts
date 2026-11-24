export type SrsRating = "again" | "hard" | "good" | "easy";

export interface SrsCardState {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

export interface SrsReviewResult extends SrsCardState {
  nextReviewAt: number;
}

const MS_PER_DAY = 86_400_000;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

export function calculateNextSrsReview(
  state: SrsCardState,
  rating: SrsRating,
  nowMs: number = Date.now()
): SrsReviewResult {
  const prevInterval = Math.max(1, Math.round(state.intervalDays || 1));
  const prevEase = Math.max(MIN_EASE, Math.min(MAX_EASE, state.easeFactor || 2.5));
  const prevReps = Math.max(0, Math.floor(state.repetitions || 0));

  let intervalDays: number;
  let easeFactor: number;
  let repetitions: number;

  if (rating === "again") {
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(MIN_EASE, Number((prevEase - 0.2).toFixed(2)));
  } else if (rating === "hard") {
    repetitions = prevReps + 1;
    intervalDays =
      prevReps === 0 ? 1 : Math.max(1, Math.round(prevInterval * 1.2));
    easeFactor = Math.max(MIN_EASE, Number((prevEase - 0.15).toFixed(2)));
  } else if (rating === "good") {
    repetitions = prevReps + 1;
    if (prevReps === 0) intervalDays = 1;
    else if (prevReps === 1) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round(prevInterval * prevEase));
    easeFactor = prevEase;
  } else {
    // easy
    repetitions = prevReps + 1;
    if (prevReps === 0) intervalDays = 4;
    else if (prevReps === 1) intervalDays = 10;
    else intervalDays = Math.max(1, Math.round(prevInterval * prevEase * 1.3));
    easeFactor = Math.min(MAX_EASE, Number((prevEase + 0.15).toFixed(2)));
  }

  return {
    intervalDays,
    easeFactor,
    repetitions,
    nextReviewAt: nowMs + intervalDays * MS_PER_DAY,
  };
}

export function formatIntervalVi(days: number): string {
  if (days <= 1) return "1 ngày";
  if (days < 30) return `${days} ngày`;
  const months = Math.round(days / 30);
  return `${months} tháng`;
}

export function previewSrsIntervals(
  state: SrsCardState
): Record<SrsRating, string> {
  return {
    again: formatIntervalVi(calculateNextSrsReview(state, "again", 0).intervalDays),
    hard: formatIntervalVi(calculateNextSrsReview(state, "hard", 0).intervalDays),
    good: formatIntervalVi(calculateNextSrsReview(state, "good", 0).intervalDays),
    easy: formatIntervalVi(calculateNextSrsReview(state, "easy", 0).intervalDays),
  };
}
