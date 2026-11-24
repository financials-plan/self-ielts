import {
  calculateCriteriaBand,
  roundIeltsBand,
} from "@/lib/ksa/bandCalculator";
import type { KsaDimension } from "@/lib/ksa/errorTaxonomy";

export type SpeakingPartNumber = 1 | 2 | 3;

export type SpeakingMode = "shadowing" | "cue_drill" | "mock_exam";

export type SpeakingErrorCode =
  | "S_ENDING_SOUNDS"
  | "S_VOCAB_FREEZE"
  | "S_SPEAKING_ANXIETY";

export type SpeakingCriterion = "FC" | "LR" | "GRA" | "PRON";

export interface ShadowingLine {
  id: string;
  speaker: string;
  accent: "en-GB" | "en-AU" | "en-US";
  rawText: string;
  stressMarkedText: string;
  ipaChunkNoteVi: string;
}

export interface SpeakingUpgradePhrase {
  basicEn: string;
  naturalEn: string;
  noteVi: string;
}

export interface SpeakingCuePrompt {
  id: string;
  partNumber: SpeakingPartNumber;
  promptEn: string;
  bulletPointsEn?: string[];
  prepSeconds: number;
  speakSeconds: number;
  frameworkTag: "A.R.E" | "PPF (Past-Present-Future)" | "P.E.E.C";
  rescuePromptsVi: string[];
  modelBand80En: string;
  upgradePhrases: SpeakingUpgradePhrase[];
}

export interface SpeakingLessonContent {
  id: string;
  track: "shared";
  partNumber: SpeakingPartNumber;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  ksaFocus: KsaDimension[];
  shadowingLines: ShadowingLine[];
  prompts: SpeakingCuePrompt[];
}

export interface SpeakingFluencyMetrics {
  durationMs: number;
  wordCount: number;
  wpm: number;
  pacingTier: "too_slow" | "natural_band7" | "rushed";
  hesitationCount: number;
  longestPauseMs: number;
  voicedRatioPct: number;
  waveformBars: number[];
  fillersFound: string[];
  discourseMarkersFound: string[];
  criteria: {
    fluencyScore: number;
    lexicalScore: number;
    grammarScore: number;
    pronunciationScore: number;
  };
  estimatedBand: number;
  recommendedErrorCodes: SpeakingErrorCode[];
  diagnosticAdviceVi: string;
}

export interface SpeakingImprovementDelta {
  wpmDelta: number;
  hesitationReduced: number;
  anxietyDelta: number | null;
  bandDelta: number;
  summaryVi: string;
}

export interface AiSpeakingFeedback {
  providerName: string;
  model: string;
  aiGeneratedNoticeVi: string;
  transcript: string;
  estimatedBand: number;
  criteriaNotes: {
    fcVi: string;
    lrVi: string;
    graVi: string;
    pronVi: string;
  };
  naturalUpgrades: SpeakingUpgradePhrase[];
  ksaActionTipVi: string;
}

export const SPEAKING_CRITERION_LABELS_VI: Record<SpeakingCriterion, string> = {
  FC: "Fluency & Coherence",
  LR: "Lexical Resource",
  GRA: "Grammatical Range & Accuracy",
  PRON: "Pronunciation & Intonation",
};

const FILLER_WORDS = ["um", "uh", "er", "ah", "you know", "basically"];

const DISCOURSE_MARKERS = [
  "actually",
  "for instance",
  "for example",
  "in fact",
  "looking ahead",
  "primarily because",
  "mainly because",
  "on the whole",
  "to be honest",
  "that said",
  "broadly speaking",
  "off the top of my head",
];

const SILENCE_RMS_THRESHOLD = 0.02;
const HESITATION_MIN_MS = 1500;

function downsampleWaveform(samples: number[], targetBars: number = 32): number[] {
  if (samples.length === 0) {
    return Array.from({ length: targetBars }, () => 12);
  }
  const bars: number[] = [];
  const step = samples.length / targetBars;
  for (let i = 0; i < targetBars; i++) {
    const start = Math.floor(i * step);
    const end = Math.max(start + 1, Math.floor((i + 1) * step));
    let peak = 0;
    for (let j = start; j < Math.min(end, samples.length); j++) {
      peak = Math.max(peak, samples[j]);
    }
    const normalized = Math.min(100, Math.max(8, Math.round(peak * 320)));
    bars.push(normalized);
  }
  return bars;
}

export function analyzeSpeakingFluencyOffline(params: {
  durationMs: number;
  rmsSamples: number[];
  sampleIntervalMs?: number;
  transcript?: string | null;
  partNumber: SpeakingPartNumber;
}): SpeakingFluencyMetrics {
  const durationMs = Math.max(1000, Math.round(params.durationMs));
  const intervalMs = Math.max(50, params.sampleIntervalMs ?? 100);
  const samples = params.rmsSamples ?? [];
  const transcript = (params.transcript ?? "").trim();

  // Detect silence runs >= 1500ms & voiced ratio
  let hesitationCount = 0;
  let longestSilentRunMs = 0;
  let currentSilentRunMs = 0;
  let voicedFrames = 0;
  let voicedTransitions = 0;
  let wasVoiced = false;

  for (const rms of samples) {
    const isVoiced = rms >= SILENCE_RMS_THRESHOLD;
    if (isVoiced) {
      voicedFrames += 1;
      if (!wasVoiced) voicedTransitions += 1;
      if (currentSilentRunMs >= HESITATION_MIN_MS) {
        hesitationCount += 1;
      }
      currentSilentRunMs = 0;
    } else {
      currentSilentRunMs += intervalMs;
      if (currentSilentRunMs > longestSilentRunMs) {
        longestSilentRunMs = currentSilentRunMs;
      }
    }
    wasVoiced = isVoiced;
  }

  if (currentSilentRunMs >= HESITATION_MIN_MS && voicedFrames > 0) {
    hesitationCount += 1;
  }

  const voicedRatioPct =
    samples.length > 0
      ? Math.round((voicedFrames / samples.length) * 100)
      : transcript.length > 0
        ? 72
        : 0;

  const words = transcript ? transcript.split(/\s+/).filter(Boolean) : [];
  const minutes = durationMs / 60_000;

  let wordCount = words.length;
  let wpm = 0;

  if (wordCount > 0) {
    wpm = Math.round(wordCount / Math.max(0.1, minutes));
  } else if (voicedFrames > 0) {
    // Offline fallback estimate when speaking without Web Speech transcript:
    // ~2.4 spoken syllables/words per second during voiced frames + burst transitions
    const voicedSeconds = (voicedFrames * intervalMs) / 1000;
    wordCount = Math.max(
      voicedTransitions,
      Math.round(voicedSeconds * 2.2)
    );
    wpm = Math.round(wordCount / Math.max(0.1, minutes));
  }

  const pacingTier: SpeakingFluencyMetrics["pacingTier"] =
    wpm < 95 ? "too_slow" : wpm <= 165 ? "natural_band7" : "rushed";

  const lowerTranscript = transcript.toLowerCase();
  const fillersFound = FILLER_WORDS.filter((f) =>
    new RegExp(`\\b${f}\\b`, "i").test(lowerTranscript)
  );
  const discourseMarkersFound = DISCOURSE_MARKERS.filter((m) =>
    new RegExp(`\\b${m}\\b`, "i").test(lowerTranscript)
  );

  // Heuristic 4-Criteria Speaking Band Estimation (Offline 0đ)
  let fluencyBase = pacingTier === "natural_band7" ? 7.0 : wpm >= 75 ? 6.0 : 5.5;
  if (hesitationCount >= 3) fluencyBase -= 1.0;
  else if (hesitationCount >= 1) fluencyBase -= 0.5;
  if (fillersFound.length >= 2) fluencyBase -= 0.5;
  if (discourseMarkersFound.length >= 2) fluencyBase += 0.5;

  let lexicalBase = 6.0;
  const uniqueTokens = new Set(
    lowerTranscript.match(/[a-z]{4,}/g) ?? []
  ).size;
  if (uniqueTokens >= 35 || discourseMarkersFound.length >= 2) lexicalBase += 1.0;
  else if (uniqueTokens >= 18) lexicalBase += 0.5;

  let grammarBase = 6.0;
  const hasComplex =
    /\b(although|because|whereas|which|while|even though|if)\b/i.test(
      lowerTranscript
    );
  if (hasComplex && wordCount >= 35) grammarBase += 1.0;
  else if (wordCount >= 25) grammarBase += 0.5;

  let pronBase = voicedRatioPct >= 65 ? 7.0 : voicedRatioPct >= 45 ? 6.0 : 5.5;
  if (hesitationCount === 0 && pacingTier === "natural_band7") {
    pronBase += 0.5;
  }

  const clampBand = (n: number) =>
    roundIeltsBand(Math.max(4.5, Math.min(8.5, n)));

  const fluencyScore = clampBand(fluencyBase);
  const lexicalScore = clampBand(lexicalBase);
  const grammarScore = clampBand(grammarBase);
  const pronunciationScore = clampBand(pronBase);
  const estimatedBand = calculateCriteriaBand([
    fluencyScore,
    lexicalScore,
    grammarScore,
    pronunciationScore,
  ]);

  const recommendedErrorCodes: SpeakingErrorCode[] = [];
  if (hesitationCount >= 2 || fillersFound.length >= 2) {
    recommendedErrorCodes.push("S_SPEAKING_ANXIETY");
  }
  if (wpm < 95 || (params.partNumber >= 2 && wordCount < 45)) {
    recommendedErrorCodes.push("S_VOCAB_FREEZE");
  }
  if (recommendedErrorCodes.length === 0 && estimatedBand < 7.0) {
    recommendedErrorCodes.push("S_ENDING_SOUNDS");
  }

  let diagnosticAdviceVi =
    "Nhịp nói tự nhiên, kiểm soát khoảng lặng tốt. Hãy thử thu lại Bản 2 để chèn thêm 2 cụm Discourse Markers nâng Lexical.";
  if (hesitationCount >= 2) {
    diagnosticAdviceVi = `Phát hiện ${hesitationCount} khoảng lặng kéo dài >= 1.5s (lâu nhất ${(longestSilentRunMs / 1000).toFixed(1)}s). Dùng cụm câu giờ tự nhiên (Rescue Prompt) thay vì im lặng.`;
  } else if (pacingTier === "too_slow") {
    diagnosticAdviceVi = `Tốc độ nói ${wpm} từ/phút còn chậm. Tập nói theo cụm ngắt nhịp (/) ở Shadowing Lab trước khi bấm thu âm.`;
  } else if (pacingTier === "rushed") {
    diagnosticAdviceVi = `Tốc độ nói ${wpm} từ/phút hơi nhanh dễ nuốt âm cuối (-s/-ed). Giảm nhẹ nhịp xuống 120–150 WPM để rõ trọng âm.`;
  }

  return {
    durationMs,
    wordCount,
    wpm,
    pacingTier,
    hesitationCount,
    longestPauseMs: longestSilentRunMs,
    voicedRatioPct,
    waveformBars: downsampleWaveform(samples, 32),
    fillersFound,
    discourseMarkersFound,
    criteria: {
      fluencyScore,
      lexicalScore,
      grammarScore,
      pronunciationScore,
    },
    estimatedBand,
    recommendedErrorCodes,
    diagnosticAdviceVi,
  };
}

export function compareSpeakingRecordings(
  attempt1: SpeakingFluencyMetrics,
  attempt2: SpeakingFluencyMetrics,
  anxiety1: number | null,
  anxiety2: number | null
): SpeakingImprovementDelta {
  const wpmDelta = attempt2.wpm - attempt1.wpm;
  const hesitationReduced = Math.max(
    0,
    attempt1.hesitationCount - attempt2.hesitationCount
  );
  const anxietyDelta =
    typeof anxiety1 === "number" && typeof anxiety2 === "number"
      ? anxiety1 - anxiety2
      : null;
  const bandDelta = Number(
    (attempt2.estimatedBand - attempt1.estimatedBand).toFixed(1)
  );

  let summaryVi = "Hoàn thành lượt nói lại Bản 2 (Re-record Loop).";
  if (hesitationReduced > 0 || bandDelta > 0) {
    summaryVi = `Tiến bộ rõ rệt: giảm ${hesitationReduced} khoảng lặng > 1.5s và cải thiện ${bandDelta >= 0 ? "+" : ""}${bandDelta.toFixed(1)} Band ước tính.`;
  } else if (anxietyDelta !== null && anxietyDelta > 0) {
    summaryVi = `Mức hồi hộp giảm ${anxietyDelta} điểm so với lượt đầu — tâm lý ổn định hơn hẳn.`;
  }

  return {
    wpmDelta,
    hesitationReduced,
    anxietyDelta,
    bandDelta,
    summaryVi,
  };
}
