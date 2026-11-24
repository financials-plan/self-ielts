export type IeltsTrack = "academic" | "general";

interface ThresholdBand {
  minCorrect: number;
  band: number;
}

const LISTENING_THRESHOLDS: ThresholdBand[] = [
  { minCorrect: 39, band: 9.0 },
  { minCorrect: 37, band: 8.5 },
  { minCorrect: 35, band: 8.0 },
  { minCorrect: 32, band: 7.5 },
  { minCorrect: 30, band: 7.0 },
  { minCorrect: 26, band: 6.5 },
  { minCorrect: 23, band: 6.0 },
  { minCorrect: 18, band: 5.5 },
  { minCorrect: 16, band: 5.0 },
  { minCorrect: 13, band: 4.5 },
  { minCorrect: 10, band: 4.0 },
  { minCorrect: 8, band: 3.5 },
  { minCorrect: 6, band: 3.0 },
  { minCorrect: 4, band: 2.5 },
  { minCorrect: 2, band: 2.0 },
  { minCorrect: 1, band: 1.0 },
  { minCorrect: 0, band: 0.0 },
];

const READING_ACADEMIC_THRESHOLDS: ThresholdBand[] = [
  { minCorrect: 39, band: 9.0 },
  { minCorrect: 37, band: 8.5 },
  { minCorrect: 35, band: 8.0 },
  { minCorrect: 33, band: 7.5 },
  { minCorrect: 30, band: 7.0 },
  { minCorrect: 27, band: 6.5 },
  { minCorrect: 23, band: 6.0 },
  { minCorrect: 19, band: 5.5 },
  { minCorrect: 15, band: 5.0 },
  { minCorrect: 13, band: 4.5 },
  { minCorrect: 10, band: 4.0 },
  { minCorrect: 8, band: 3.5 },
  { minCorrect: 6, band: 3.0 },
  { minCorrect: 4, band: 2.5 },
  { minCorrect: 2, band: 2.0 },
  { minCorrect: 1, band: 1.0 },
  { minCorrect: 0, band: 0.0 },
];

const READING_GENERAL_THRESHOLDS: ThresholdBand[] = [
  { minCorrect: 40, band: 9.0 },
  { minCorrect: 39, band: 8.5 },
  { minCorrect: 37, band: 8.0 },
  { minCorrect: 36, band: 7.5 },
  { minCorrect: 34, band: 7.0 },
  { minCorrect: 32, band: 6.5 },
  { minCorrect: 30, band: 6.0 },
  { minCorrect: 27, band: 5.5 },
  { minCorrect: 23, band: 5.0 },
  { minCorrect: 19, band: 4.5 },
  { minCorrect: 15, band: 4.0 },
  { minCorrect: 12, band: 3.5 },
  { minCorrect: 9, band: 3.0 },
  { minCorrect: 6, band: 2.5 },
  { minCorrect: 4, band: 2.0 },
  { minCorrect: 2, band: 1.5 },
  { minCorrect: 1, band: 1.0 },
  { minCorrect: 0, band: 0.0 },
];

function lookupBand(correct: number, table: ThresholdBand[]): number {
  const clamped = Math.max(0, Math.min(40, Math.round(correct)));
  for (const row of table) {
    if (clamped >= row.minCorrect) {
      return row.band;
    }
  }
  return 0.0;
}

export function roundIeltsBand(score: number): number {
  const clamped = Math.max(0, Math.min(9, score));
  return Math.round(clamped * 2 + 1e-9) / 2;
}

export function rawToListeningBand(correct: number): number {
  return lookupBand(correct, LISTENING_THRESHOLDS);
}

export function rawToReadingBand(correct: number, track: IeltsTrack): number {
  return lookupBand(
    correct,
    track === "general" ? READING_GENERAL_THRESHOLDS : READING_ACADEMIC_THRESHOLDS
  );
}

export function calculateCriteriaBand(
  criteria: [number, number, number, number]
): number {
  const sum = criteria.reduce((acc, v) => acc + Math.max(0, Math.min(9, v)), 0);
  return roundIeltsBand(sum / 4);
}

export function calculateOverallBand(skills: {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
}): number {
  const avg =
    (Math.max(0, Math.min(9, skills.listening)) +
      Math.max(0, Math.min(9, skills.reading)) +
      Math.max(0, Math.min(9, skills.writing)) +
      Math.max(0, Math.min(9, skills.speaking))) /
    4;
  return roundIeltsBand(avg);
}
