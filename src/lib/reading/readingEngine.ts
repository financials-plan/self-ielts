import { rawToReadingBand, type IeltsTrack } from "@/lib/ksa/bandCalculator";
import type { KsaDimension } from "@/lib/ksa/errorTaxonomy";

export type ReadingMode = "guided" | "drill" | "exam";

export type ReadingQuestionType =
  | "tfng"
  | "ynng"
  | "matching_headings"
  | "matching_info"
  | "summary_completion"
  | "mcq";

export type ReadingErrorCode =
  | "R_PARAPHRASE_MISS"
  | "R_TFNG_LOGIC"
  | "R_TIME_SINK"
  | "R_ASSUMPTION_BIAS";

export type EvidenceCell =
  | "calibrated_mastery"
  | "lucky_guess"
  | "qualifier_trap"
  | "misread_locator";

export type PacingTier = "optimal" | "slow" | "time_sink";

export interface ReadingSentence {
  id: string;
  text: string;
}

export interface ReadingParagraph {
  id: string;
  label: string;
  heading?: string;
  sentences: ReadingSentence[];
}

export interface ContextualVocabItem {
  id: string;
  term: string;
  sentenceId: string;
  pos: string;
  contextClueVi: string;
  definitionVi: string;
  collocationEn: string;
}

export interface QuestionDecomposer {
  subjectEn: string;
  relationEn: string;
  qualifierEn: string;
  trapNoteVi: string;
}

export interface ParaphraseBridgeItem {
  questionPhrase: string;
  passagePhrase: string;
  techniqueVi: string;
}

export interface ReadingQuestion {
  id: string;
  number: number;
  type: ReadingQuestionType;
  promptEn: string;
  instructionVi?: string;
  wordLimit?: number;
  options?: Array<{ value: string; label: string }>;
  acceptedAnswers: string[];
  evidenceSentenceIds: string[];
  explanationVi: string;
  recommendedErrorCode: ReadingErrorCode;
  ksaDimension: KsaDimension;
  decomposer?: QuestionDecomposer;
  paraphraseBridge: ParaphraseBridgeItem;
}

export interface ReadingLessonContent {
  id: string;
  track: IeltsTrack;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  recommendedMinutes: number;
  ksaFocus: KsaDimension[];
  headingBank?: Array<{ value: string; label: string }>;
  paragraphs: ReadingParagraph[];
  contextualVocab: ContextualVocabItem[];
  questions: ReadingQuestion[];
}

export interface ReadingAnswerInput {
  answer: string;
  pinnedSentenceId: string | null;
  timeSpentSec: number;
  flagged: boolean;
}

export interface ReadingAttemptSubmission {
  lessonId: string;
  mode: ReadingMode;
  confidenceBefore?: number | null;
  durationSec: number;
  answers: Record<string, ReadingAnswerInput>;
  vocabLookups?: {
    step1Count: number;
    step2Count: number;
  };
}

export interface EvaluatedReadingQuestion {
  questionId: string;
  number: number;
  type: ReadingQuestionType;
  userAnswer: string;
  acceptedAnswers: string[];
  isCorrect: boolean;
  pinnedSentenceId: string | null;
  isEvidenceValid: boolean;
  evidenceSentenceIds: string[];
  evidenceCell: EvidenceCell;
  timeSpentSec: number;
  pacingTier: PacingTier;
  flagged: boolean;
  explanationVi: string;
  recommendedErrorCode: ReadingErrorCode;
  ksaDimension: KsaDimension;
  paraphraseBridge: ParaphraseBridgeItem;
  promptEn: string;
}

export interface ReadingAttemptEvaluation {
  lessonId: string;
  track: IeltsTrack;
  mode: ReadingMode;
  correctCount: number;
  totalQuestions: number;
  scaledOutOf40: number;
  bandScore: number;
  academicEquivalentBand: number;
  generalEquivalentBand: number;
  evidenceAccuracyPct: number;
  matrixCounts: Record<EvidenceCell, number>;
  pacingSummary: {
    durationSec: number;
    avgQuestionSec: number;
    timeSinkQuestions: number[];
    flaggedCount: number;
  };
  vocabLookups: {
    step1Count: number;
    step2Count: number;
  };
  diagnosticAdviceVi: string;
  questions: EvaluatedReadingQuestion[];
}

export const QUESTION_TYPE_LABELS_VI: Record<ReadingQuestionType, string> = {
  tfng: "True / False / Not Given",
  ynng: "Yes / No / Not Given",
  matching_headings: "Matching Headings",
  matching_info: "Matching Information",
  summary_completion: "Summary / Note Completion",
  mcq: "Multiple Choice",
};

export const EVIDENCE_CELL_META: Record<
  EvidenceCell,
  {
    titleVi: string;
    ksaTag: KsaDimension;
    shortDescVi: string;
  }
> = {
  calibrated_mastery: {
    titleVi: "Đúng + Đúng bằng chứng",
    ksaTag: "S",
    shortDescVi: "Khớp cả hiểu nghĩa lẫn thao tác định vị câu gốc.",
  },
  lucky_guess: {
    titleVi: "Đoán mò ăn may",
    ksaTag: "A",
    shortDescVi:
      "Đúng đáp án nhưng chưa ghim đúng câu gốc — dễ sụp điểm khi gặp đề bẫy.",
  },
  qualifier_trap: {
    titleVi: "Đúng dòng, sập bẫy Qualifier",
    ksaTag: "K",
    shortDescVi:
      "Tìm đúng câu chứng minh nhưng hiểu nhầm Paraphrase hoặc từ giới hạn.",
  },
  misread_locator: {
    titleVi: "Đọc lệch đoạn / Sai định vị",
    ksaTag: "S",
    shortDescVi: "Sai cả đáp án lẫn câu bằng chứng — cần rèn lại từ khóa định vị.",
  },
};

export function normalizeReadingAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/[.,;:!?'"“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function classifyEvidenceOutcome(
  isAnswerCorrect: boolean,
  pinnedSentenceId: string | null,
  validSentenceIds: string[]
): EvidenceCell {
  const hasValidEvidence = Boolean(
    pinnedSentenceId && validSentenceIds.includes(pinnedSentenceId)
  );
  if (isAnswerCorrect && hasValidEvidence) {
    return "calibrated_mastery";
  }
  if (isAnswerCorrect && !hasValidEvidence) {
    return "lucky_guess";
  }
  if (!isAnswerCorrect && hasValidEvidence) {
    return "qualifier_trap";
  }
  return "misread_locator";
}

export function classifyPacingTier(timeSpentSec: number): PacingTier {
  if (timeSpentSec > 90) return "time_sink";
  if (timeSpentSec > 60) return "slow";
  return "optimal";
}

export function scoreReadingAttempt(
  lesson: ReadingLessonContent,
  submission: ReadingAttemptSubmission
): ReadingAttemptEvaluation {
  const matrixCounts: Record<EvidenceCell, number> = {
    calibrated_mastery: 0,
    lucky_guess: 0,
    qualifier_trap: 0,
    misread_locator: 0,
  };

  let correctCount = 0;
  let validEvidenceCount = 0;
  let flaggedCount = 0;
  const timeSinkQuestions: number[] = [];

  const questions: EvaluatedReadingQuestion[] = lesson.questions.map((q) => {
    const rawInput = submission.answers[q.id];
    const userAnswer = rawInput?.answer?.trim() ?? "";
    const pinnedSentenceId = rawInput?.pinnedSentenceId ?? null;
    const timeSpentSec = Math.max(0, Math.round(rawInput?.timeSpentSec ?? 0));
    const flagged = Boolean(rawInput?.flagged);

    const normalizedUser = normalizeReadingAnswer(userAnswer);
    const isCorrect =
      normalizedUser.length > 0 &&
      q.acceptedAnswers.some(
        (acc) => normalizeReadingAnswer(acc) === normalizedUser
      );

    const isEvidenceValid = Boolean(
      pinnedSentenceId && q.evidenceSentenceIds.includes(pinnedSentenceId)
    );
    const evidenceCell = classifyEvidenceOutcome(
      isCorrect,
      pinnedSentenceId,
      q.evidenceSentenceIds
    );
    const pacingTier = classifyPacingTier(timeSpentSec);

    if (isCorrect) correctCount += 1;
    if (isEvidenceValid) validEvidenceCount += 1;
    if (flagged) flaggedCount += 1;
    if (pacingTier === "time_sink") timeSinkQuestions.push(q.number);
    matrixCounts[evidenceCell] += 1;

    return {
      questionId: q.id,
      number: q.number,
      type: q.type,
      userAnswer,
      acceptedAnswers: q.acceptedAnswers,
      isCorrect,
      pinnedSentenceId,
      isEvidenceValid,
      evidenceSentenceIds: q.evidenceSentenceIds,
      evidenceCell,
      timeSpentSec,
      pacingTier,
      flagged,
      explanationVi: q.explanationVi,
      recommendedErrorCode: q.recommendedErrorCode,
      ksaDimension: q.ksaDimension,
      paraphraseBridge: q.paraphraseBridge,
      promptEn: q.promptEn,
    };
  });

  const totalQuestions = Math.max(1, lesson.questions.length);
  const scaledOutOf40 = Math.round((correctCount / totalQuestions) * 40);
  const academicEquivalentBand = rawToReadingBand(scaledOutOf40, "academic");
  const generalEquivalentBand = rawToReadingBand(scaledOutOf40, "general");
  const bandScore =
    lesson.track === "general" ? generalEquivalentBand : academicEquivalentBand;

  const evidenceAccuracyPct = Math.round(
    (validEvidenceCount / totalQuestions) * 100
  );
  const durationSec = Math.max(1, Math.round(submission.durationSec));
  const avgQuestionSec = Math.round(
    questions.reduce((acc, q) => acc + q.timeSpentSec, 0) / totalQuestions
  );

  let diagnosticAdviceVi =
    "Tỷ lệ ghim đúng câu bằng chứng và độ chính xác đang đồng bộ tốt. Hãy lưu 2–3 cặp Paraphrase mới vào Kho thẻ SRS.";
  if (matrixCounts.qualifier_trap >= matrixCounts.misread_locator && matrixCounts.qualifier_trap > 0) {
    diagnosticAdviceVi =
      "Bạn định vị đúng đoạn chứa thông tin nhưng bị trượt ở từ giới hạn hoặc Paraphrase (Qualifier Trap). Hãy mở bảng Paraphrase Bridge bên dưới và lưu ngay vào SRS.";
  } else if (matrixCounts.lucky_guess >= 2) {
    diagnosticAdviceVi = `Có ${matrixCounts.lucky_guess} câu trả lời đúng nhưng chưa ghim đúng câu chứng minh (Đoán mò ăn may). Hãy siết kỷ luật bắt buộc ghim bằng chứng trước khi chốt đáp án.`;
  } else if (matrixCounts.misread_locator > 0) {
    diagnosticAdviceVi =
      "Một số câu bị lệch vị trí đoạn văn. Hãy dùng bước khoanh từ khóa cố định (tên riêng, năm, thuật ngữ) để định vị đoạn trước khi phân tích câu.";
  }

  return {
    lessonId: lesson.id,
    track: lesson.track,
    mode: submission.mode,
    correctCount,
    totalQuestions,
    scaledOutOf40,
    bandScore,
    academicEquivalentBand,
    generalEquivalentBand,
    evidenceAccuracyPct,
    matrixCounts,
    pacingSummary: {
      durationSec,
      avgQuestionSec,
      timeSinkQuestions,
      flaggedCount,
    },
    vocabLookups: {
      step1Count: submission.vocabLookups?.step1Count ?? 0,
      step2Count: submission.vocabLookups?.step2Count ?? 0,
    },
    diagnosticAdviceVi,
    questions,
  };
}
