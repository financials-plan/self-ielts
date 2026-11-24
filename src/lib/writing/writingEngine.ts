import {
  calculateCriteriaBand,
  roundIeltsBand,
  type IeltsTrack,
} from "@/lib/ksa/bandCalculator";
import type { KsaDimension } from "@/lib/ksa/errorTaxonomy";

export type WritingTaskType =
  | "academic_task1"
  | "gt_task1_letter"
  | "task2_essay";

export type WritingMode = "guided" | "drill" | "exam";

export type WritingCriterion = "TA_TR" | "CC" | "LR" | "GRA";

export type WritingErrorCode =
  | "W_RUBRIC_GAP"
  | "W_NO_OVERVIEW_OR_BULLET"
  | "W_SKIPPED_REVISION";

export interface AcademicVisualSpec {
  chartTitle: string;
  yAxisUnit: string;
  categories: string[];
  series: Array<{
    name: string;
    tone: "accent" | "mint" | "warn";
    values: number[];
  }>;
}

export interface ModelAnnotation {
  criterion: WritingCriterion;
  noteVi: string;
}

export interface UpgradeCollocation {
  basicEn: string;
  upgradedEn: string;
  usageVi: string;
}

export interface WritingLessonContent {
  id: string;
  track: IeltsTrack | "shared";
  taskType: WritingTaskType;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  recommendedMinutes: number;
  minWords: number;
  ksaFocus: KsaDimension[];
  promptEn: string;
  letterTone?: "formal" | "semi_formal" | "informal";
  threeBullets?: [string, string, string];
  visualDataSpec?: AcademicVisualSpec;
  deconstructPrompts: {
    taskTypeTargetVi: string;
    keyRequirementsVi: string[];
    ideaSparkQuestionsVi: string[];
  };
  selfAuditChecklist: Array<{
    id: string;
    labelVi: string;
    ksaDimension: KsaDimension;
  }>;
  modelComparison: {
    band65: {
      band: 6.5;
      essayEn: string;
      annotationsVi: ModelAnnotation[];
    };
    band80: {
      band: 8.0;
      essayEn: string;
      annotationsVi: ModelAnnotation[];
      upgradeCollocations: UpgradeCollocation[];
    };
  };
}

export interface WritingOutlineInput {
  thesisOrOverview: string;
  bodyOne: string;
  bodyTwo: string;
  bodyThreeOrConclusion: string;
}

export interface WritingOfflineMetrics {
  wordCount: number;
  minWords: number;
  meetsWordMinimum: boolean;
  paragraphCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  complexSentenceCount: number;
  complexRatioPct: number;
  cohesiveMarkersFound: string[];
  repeatedWords: Array<{ word: string; count: number }>;
  contractionsFound: string[];
  hasOverviewSignal: boolean;
  overviewContainsNumbers: boolean;
  taskSpecificWarningsVi: string[];
  criteria: {
    taskScore: number;
    coherenceScore: number;
    lexicalScore: number;
    grammarScore: number;
  };
  estimatedBand: number;
  recommendedErrorCodes: WritingErrorCode[];
  selfAuditCount: number;
}

export interface WritingDraftDelta {
  wordCountDelta: number;
  complexSentenceDelta: number;
  repeatedWordsReduced: number;
  bandDelta: number;
  summaryVi: string;
}

export interface AiInlineDiffItem {
  originalSnippet: string;
  upgradedSnippet: string;
  criterion: WritingCriterion;
  reasonVi: string;
}

export interface AiWritingFeedback {
  providerName: string;
  model: string;
  aiGeneratedNoticeVi: string;
  estimatedBand: number;
  criteriaNotes: {
    taTrVi: string;
    ccVi: string;
    lrVi: string;
    graVi: string;
  };
  inlineDiffs: AiInlineDiffItem[];
  ksaActionTipVi: string;
}

export const WRITING_TASK_LABELS_VI: Record<WritingTaskType, string> = {
  academic_task1: "Academic Task 1 · Chart / Data",
  gt_task1_letter: "General Training · Letter",
  task2_essay: "Task 2 Essay (Chung Acad & GT)",
};

export const CRITERION_LABELS_VI: Record<WritingCriterion, string> = {
  TA_TR: "Task Achievement / Response",
  CC: "Coherence & Cohesion",
  LR: "Lexical Resource",
  GRA: "Grammatical Range & Accuracy",
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "from",
  "this",
  "they",
  "their",
  "them",
  "have",
  "been",
  "were",
  "will",
  "would",
  "could",
  "should",
  "which",
  "while",
  "where",
  "when",
  "what",
  "into",
  "over",
  "more",
  "most",
  "some",
  "many",
  "such",
  "than",
  "also",
  "about",
  "there",
  "these",
  "those",
  "your",
  "very",
  "only",
  "both",
  "each",
  "much",
  "make",
  "made",
  "during",
  "between",
  "through",
  "because",
  "however",
  "overall",
]);

const SUBORDINATE_MARKERS = [
  "although",
  "even though",
  "whereas",
  "while",
  "despite",
  "in spite of",
  "because",
  "since",
  "unless",
  "provided that",
  "rather than",
  "whether",
  "when",
  "if",
  "once",
  "which",
  "who",
  "whereby",
  "whom",
  "whose",
];

const COHESIVE_MARKERS = [
  "overall",
  "in general",
  "in contrast",
  "on the other hand",
  "however",
  "nevertheless",
  "nonetheless",
  "furthermore",
  "moreover",
  "consequently",
  "therefore",
  "concurrently",
  "equally",
  "for instance",
  "for example",
  "in addition",
  "meanwhile",
  "similarly",
  "by comparison",
  "unfortunately",
  "to conclude",
  "in conclusion",
];

const OVERVIEW_MARKERS = [
  "overall",
  "in general",
  "broadly speaking",
  "on the whole",
  "main trend",
  "it is evident that",
  "it is clear that",
];

const CONTRACTION_REGEX =
  /\b(don't|doesn't|didn't|can't|couldn't|won't|wouldn't|shouldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|i'm|i've|i'll|i'd|it's|we're|we've|they're|you're|that's|there's)\b/gi;

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function analyzeWritingOffline(
  lesson: WritingLessonContent,
  essayText: string,
  outline: WritingOutlineInput,
  selfAuditCheckedIds: string[]
): WritingOfflineMetrics {
  const trimmed = essayText.trim();
  const wordCount = countWords(trimmed);
  const meetsWordMinimum = wordCount >= lesson.minWords;

  const paragraphs = trimmed
    ? trimmed
        .split(/\n\s*\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
  const paragraphCount = paragraphs.length;

  const sentences = trimmed
    ? trimmed
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3)
    : [];
  const sentenceCount = Math.max(wordCount > 0 ? 1 : 0, sentences.length);
  const avgWordsPerSentence =
    sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;

  let complexSentenceCount = 0;
  for (const s of sentences) {
    const lower = s.toLowerCase();
    const hasSub =
      s.includes(";") ||
      SUBORDINATE_MARKERS.some((marker) =>
        new RegExp(`\\b${marker}\\b`, "i").test(lower)
      );
    if (hasSub) {
      complexSentenceCount += 1;
    }
  }
  const complexRatioPct =
    sentenceCount > 0
      ? Math.round((complexSentenceCount / sentenceCount) * 100)
      : 0;

  const lowerEssay = trimmed.toLowerCase();
  const cohesiveMarkersFound = COHESIVE_MARKERS.filter((m) =>
    new RegExp(`\\b${m}\\b`, "i").test(lowerEssay)
  );

  // Repeated words frequency (>= 4 times, length >= 4, non-stopword)
  const tokens =
    lowerEssay.match(/[a-z]{4,}/g)?.filter((t) => !STOP_WORDS.has(t)) ?? [];
  const freqMap = new Map<string, number>();
  for (const tok of tokens) {
    freqMap.set(tok, (freqMap.get(tok) ?? 0) + 1);
  }
  const repeatedWords = Array.from(freqMap.entries())
    .filter(([, cnt]) => cnt >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));

  const uniqueRatio =
    tokens.length > 0 ? freqMap.size / tokens.length : 0;

  const contractionsMatches = trimmed.match(CONTRACTION_REGEX) ?? [];
  const contractionsFound = Array.from(
    new Set(contractionsMatches.map((c) => c.toLowerCase()))
  );

  // Task-specific checks
  const taskSpecificWarningsVi: string[] = [];
  const recommendedErrorCodesSet = new Set<WritingErrorCode>();

  if (!meetsWordMinimum) {
    taskSpecificWarningsVi.push(
      `Bài viết hiện có ${wordCount} từ, chưa đạt ngưỡng tối thiểu ${lesson.minWords} từ (sẽ bị trừ điểm Task Achievement/Response).`
    );
    recommendedErrorCodesSet.add("W_RUBRIC_GAP");
  }

  let hasOverviewSignal = false;
  let overviewContainsNumbers = false;

  if (lesson.taskType === "academic_task1") {
    const overviewSentence = sentences.find((s) =>
      OVERVIEW_MARKERS.some((m) => s.toLowerCase().includes(m))
    );
    hasOverviewSignal = Boolean(overviewSentence);
    if (!overviewSentence) {
      taskSpecificWarningsVi.push(
        "Chưa phát hiện đoạn Overview (mở bằng 'Overall, ...' hoặc 'In general, ...'). Thiếu Overview rất khó vượt Band 5.0–6.0 ở tiêu chí Task Achievement."
      );
      recommendedErrorCodesSet.add("W_NO_OVERVIEW_OR_BULLET");
    } else if (/\d/.test(overviewSentence)) {
      overviewContainsNumbers = true;
      taskSpecificWarningsVi.push(
        "Câu Overview của bạn đang chứa số liệu cụ thể. Hãy rút số liệu sang 2 đoạn Body để giữ Overview khái quát xu hướng chính."
      );
      recommendedErrorCodesSet.add("W_NO_OVERVIEW_OR_BULLET");
    }
  } else if (lesson.taskType === "gt_task1_letter") {
    const hasGreeting = /\b(dear|hi|hello)\b/i.test(
      sentences[0] ?? lowerEssay.slice(0, 80)
    );
    const hasSignoff =
      /(yours faithfully|yours sincerely|best regards|kind regards|warm wishes|cheers|see you soon|best wishes)/i.test(
        lowerEssay.slice(-180)
      );
    hasOverviewSignal = hasGreeting && hasSignoff;
    if (!hasGreeting || !hasSignoff) {
      taskSpecificWarningsVi.push(
        "Kiểm tra lại lời chào đầu thư (Dear...) và kết thư chuẩn văn phong (Yours faithfully/sincerely hoặc Best wishes)."
      );
      recommendedErrorCodesSet.add("W_RUBRIC_GAP");
    }
    if (lesson.letterTone === "formal" && contractionsFound.length > 0) {
      taskSpecificWarningsVi.push(
        `Thư trang trọng (Formal Letter) không nên dùng dạng viết tắt: ${contractionsFound.join(", ")}. Hãy viết đầy đủ (do not, cannot, I am...).`
      );
      recommendedErrorCodesSet.add("W_RUBRIC_GAP");
    }
    if (
      !outline.bodyOne.trim() ||
      !outline.bodyTwo.trim() ||
      !outline.bodyThreeOrConclusion.trim()
    ) {
      taskSpecificWarningsVi.push(
        "Dàn ý chưa đủ cả 3 gạch đầu dòng (bullet points) của đề General Training Letter."
      );
      recommendedErrorCodesSet.add("W_NO_OVERVIEW_OR_BULLET");
    }
  } else {
    hasOverviewSignal = paragraphCount >= 4;
    if (paragraphCount < 4) {
      taskSpecificWarningsVi.push(
        `Bài Task 2 hiện mới chia ${paragraphCount} đoạn. Nên chia rõ 4 đoạn (Introduction – Body 1 – Body 2 – Conclusion) để đảm bảo mạch Coherence.`
      );
      recommendedErrorCodesSet.add("W_NO_OVERVIEW_OR_BULLET");
    }
  }

  if (repeatedWords.length > 0) {
    taskSpecificWarningsVi.push(
      `Phát hiện từ lặp nhiều lần (>= 4 lần): ${repeatedWords.map((r) => `${r.word} (${r.count}x)`).join(", ")}. Hãy thay bằng từ đồng nghĩa hoặc đại từ quy chiếu.`
    );
    recommendedErrorCodesSet.add("W_RUBRIC_GAP");
  }

  if (selfAuditCheckedIds.length < lesson.selfAuditChecklist.length) {
    recommendedErrorCodesSet.add("W_SKIPPED_REVISION");
  }

  // Heuristic 4-Criteria Band Estimation (Offline 0đ)
  let taskBase = meetsWordMinimum ? 6.5 : wordCount >= lesson.minWords * 0.7 ? 5.5 : 4.5;
  if (lesson.taskType === "academic_task1") {
    if (!hasOverviewSignal) taskBase -= 1.0;
    else if (!overviewContainsNumbers) taskBase += 0.5;
  } else if (lesson.taskType === "gt_task1_letter") {
    if (!hasOverviewSignal) taskBase -= 0.5;
    if (lesson.letterTone === "formal" && contractionsFound.length > 0) {
      taskBase -= 0.5;
    } else if (meetsWordMinimum) {
      taskBase += 0.5;
    }
  } else if (paragraphCount >= 4 && meetsWordMinimum) {
    taskBase += 0.5;
  }

  let coherenceBase = 5.5;
  if (paragraphCount >= (lesson.taskType === "task2_essay" ? 4 : 3)) {
    coherenceBase += 0.5;
  }
  if (cohesiveMarkersFound.length >= 4) coherenceBase += 1.0;
  else if (cohesiveMarkersFound.length >= 2) coherenceBase += 0.5;

  let lexicalBase = 5.5;
  if (uniqueRatio >= 0.62 && tokens.length >= 45) lexicalBase += 1.5;
  else if (uniqueRatio >= 0.52 && tokens.length >= 30) lexicalBase += 1.0;
  if (repeatedWords.length >= 2) lexicalBase -= 0.5;
  if (lesson.letterTone === "formal" && contractionsFound.length > 0) {
    lexicalBase -= 0.5;
  }

  let grammarBase = 5.5;
  if (complexRatioPct >= 45 && sentenceCount >= 6) grammarBase += 1.5;
  else if (complexRatioPct >= 25 && sentenceCount >= 4) grammarBase += 1.0;
  if (avgWordsPerSentence < 10 && wordCount > 40) grammarBase -= 0.5;

  const clampBand = (n: number) => roundIeltsBand(Math.max(4.0, Math.min(8.5, n)));
  const taskScore = clampBand(taskBase);
  const coherenceScore = clampBand(coherenceBase);
  const lexicalScore = clampBand(lexicalBase);
  const grammarScore = clampBand(grammarBase);
  const estimatedBand = calculateCriteriaBand([
    taskScore,
    coherenceScore,
    lexicalScore,
    grammarScore,
  ]);

  return {
    wordCount,
    minWords: lesson.minWords,
    meetsWordMinimum,
    paragraphCount,
    sentenceCount,
    avgWordsPerSentence,
    complexSentenceCount,
    complexRatioPct,
    cohesiveMarkersFound,
    repeatedWords,
    contractionsFound,
    hasOverviewSignal,
    overviewContainsNumbers,
    taskSpecificWarningsVi,
    criteria: {
      taskScore,
      coherenceScore,
      lexicalScore,
      grammarScore,
    },
    estimatedBand,
    recommendedErrorCodes: Array.from(recommendedErrorCodesSet),
    selfAuditCount: selfAuditCheckedIds.length,
  };
}

export function compareWritingDrafts(
  draft1: WritingOfflineMetrics,
  draft2: WritingOfflineMetrics
): WritingDraftDelta {
  const wordCountDelta = draft2.wordCount - draft1.wordCount;
  const complexSentenceDelta =
    draft2.complexSentenceCount - draft1.complexSentenceCount;
  const repeatedWordsReduced = Math.max(
    0,
    draft1.repeatedWords.length - draft2.repeatedWords.length
  );
  const bandDelta = Number((draft2.estimatedBand - draft1.estimatedBand).toFixed(1));

  let summaryVi =
    "Bạn đã hoàn thành vòng sửa Draft 2 (Attitude nâng chuẩn bài viết).";
  if (bandDelta > 0) {
    summaryVi = `Tuyệt vời! Bản Draft 2 tăng +${bandDelta.toFixed(1)} Band ước tính nhờ nâng chất lượng câu phức và giảm lỗi tiêu chí.`;
  } else if (complexSentenceDelta > 0 || repeatedWordsReduced > 0) {
    summaryVi = `Bản Draft 2 cải thiện ${complexSentenceDelta} câu phức và giảm ${repeatedWordsReduced} nhóm từ lặp.`;
  }

  return {
    wordCountDelta,
    complexSentenceDelta,
    repeatedWordsReduced,
    bandDelta,
    summaryVi,
  };
}
