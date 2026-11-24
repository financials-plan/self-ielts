import { rawToListeningBand } from "@/lib/ksa/bandCalculator";
import type { KsaDimension } from "@/lib/ksa/errorTaxonomy";

export type ListeningMode = "guided" | "drill" | "exam";

export type ListeningQuestionType =
  | "note_completion"
  | "map_labelling"
  | "mcq"
  | "matching";

export type ExpectedPos =
  | "noun"
  | "number"
  | "noun_plural"
  | "adjective"
  | "place_code"
  | "choice";

export type ListeningErrorCode =
  | "L_CONNECTED_SPEECH"
  | "L_SPELLING_OR_SUFFIX"
  | "L_DISTRACTOR_TRAP"
  | "L_LOST_TRACK_PANIC";

export type XrayType = "evidence" | "distractor" | "signpost" | "neutral";

export interface ListeningSegment {
  id: string;
  startSec: number;
  endSec: number;
  speaker: string;
  accent: "en-GB" | "en-AU" | "en-US";
  text: string;
  xrayType: XrayType;
  xrayNoteVi?: string;
  connectedSpeechNoteVi?: string;
  questionIds?: string[];
}

export interface ListeningMapLayout {
  width: number;
  height: number;
  startNode: { x: number; y: number; label: string };
  roads: Array<{ x1: number; y1: number; x2: number; y2: number; name?: string }>;
  landmarks: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  candidateZones: Array<{
    code: "A" | "B" | "C" | "D" | "E" | "F";
    x: number;
    y: number;
  }>;
  walkPathSteps: Array<{
    segmentId: string;
    x: number;
    y: number;
    hintVi: string;
  }>;
}

export interface DictationDrill {
  id: string;
  segmentId: string;
  promptContextVi: string;
  targetText: string;
  focusPhenomenonVi: string;
}

export interface ListeningQuestion {
  id: string;
  number: number;
  type: ListeningQuestionType;
  promptEn: string;
  instructionVi?: string;
  wordLimit?: number;
  options?: Array<{ value: string; label: string }>;
  acceptedAnswers: string[];
  anchorKeywords: string[];
  expectedPos: ExpectedPos;
  evidenceSegmentId: string;
  distractorSegmentId?: string;
  distractorTrapNoteVi: string;
  explanationVi: string;
  recommendedErrorCode: ListeningErrorCode;
  ksaDimension: KsaDimension;
}

export interface ListeningLessonContent {
  id: string;
  track: "shared";
  partNumber: 1 | 2 | 3 | 4;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  durationSec: number;
  ksaFocus: KsaDimension[];
  audioUrl?: string;
  segments: ListeningSegment[];
  mapLayout?: ListeningMapLayout;
  dictationDrills: DictationDrill[];
  questions: ListeningQuestion[];
}

export interface ListeningAnswerInput {
  answer: string;
  reanchored: boolean;
}

export interface ListeningAttemptSubmission {
  lessonId: string;
  mode: ListeningMode;
  confidenceBefore?: number | null;
  durationSec: number;
  preGateCompleted: boolean;
  posPredictionsMatched: number;
  reanchorCount: number;
  dictationCompletedCount: number;
  answers: Record<string, ListeningAnswerInput>;
}

export type DictationTokenStatus =
  | "matched"
  | "missing_s_ending"
  | "missing_ed_ending"
  | "spelling_or_linking_miss"
  | "missing_word";

export interface DictationTokenDiff {
  expected: string;
  actual: string;
  status: DictationTokenStatus;
}

export interface DictationEvaluationResult {
  accuracyPct: number;
  missingSCnt: number;
  missingEdCnt: number;
  otherMissCnt: number;
  tokens: DictationTokenDiff[];
  recommendedErrorCode: ListeningErrorCode | null;
  adviceVi: string;
}

export interface EvaluatedListeningQuestion {
  questionId: string;
  number: number;
  type: ListeningQuestionType;
  promptEn: string;
  userAnswer: string;
  acceptedAnswers: string[];
  isCorrect: boolean;
  reanchored: boolean;
  suffixWarning: "missing_s" | "missing_ed" | null;
  evidenceSegmentId: string;
  distractorSegmentId?: string;
  distractorTrapNoteVi: string;
  explanationVi: string;
  recommendedErrorCode: ListeningErrorCode;
  ksaDimension: KsaDimension;
}

export interface ListeningAttemptEvaluation {
  lessonId: string;
  partNumber: 1 | 2 | 3 | 4;
  mode: ListeningMode;
  correctCount: number;
  totalQuestions: number;
  scaledOutOf40: number;
  bandScore: number;
  preGateCompleted: boolean;
  posPredictionsMatched: number;
  reanchorCount: number;
  dictationCompletedCount: number;
  suffixNearMissCount: number;
  diagnosticAdviceVi: string;
  questions: EvaluatedListeningQuestion[];
}

export const QUESTION_TYPE_LABELS_VI: Record<ListeningQuestionType, string> = {
  note_completion: "Note / Form Completion",
  map_labelling: "Map / Plan Labelling",
  mcq: "Multiple Choice",
  matching: "Speaker / Task Matching",
};

export const EXPECTED_POS_LABELS_VI: Record<ExpectedPos, string> = {
  noun: "Danh từ số ít",
  noun_plural: "Danh từ số nhiều (-s)",
  number: "Con số / Mã / Giờ",
  adjective: "Tính từ",
  place_code: "Vị trí bản đồ (A–F)",
  choice: "Phương án A / B / C",
};

export interface ParsedAudioClipRef {
  lessonId: string;
  segmentId: string;
  startSec: number;
  endSec: number;
}

export function formatAudioClipRef(
  lessonId: string,
  segmentId: string,
  startSec: number,
  endSec: number
): string {
  return `listening:${lessonId}:${segmentId}:${Math.round(startSec)}-${Math.round(endSec)}`;
}

export function parseAudioClipRef(ref: string | null | undefined): ParsedAudioClipRef | null {
  if (!ref) return null;
  const parts = ref.split(":");
  if (parts.length !== 4 || parts[0] !== "listening") return null;
  const [, lessonId, segmentId, range] = parts;
  if (!lessonId || !segmentId || !range) return null;
  const [rawStart, rawEnd] = range.split("-");
  const startSec = Number(rawStart);
  const endSec = Number(rawEnd);
  if (!Number.isFinite(startSec) || !Number.isFinite(endSec)) return null;
  return { lessonId, segmentId, startSec, endSec };
}

export function normalizeListeningAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/[.,;:!?'"“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function cleanToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^[^a-z0-9'-]+|[^a-z0-9'-]+$/g, "");
}

export function evaluateDictationAttempt(
  targetText: string,
  userText: string
): DictationEvaluationResult {
  const expectedWords = targetText
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);
  const userWords = userText
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);

  if (expectedWords.length === 0) {
    return {
      accuracyPct: 100,
      missingSCnt: 0,
      missingEdCnt: 0,
      otherMissCnt: 0,
      tokens: [],
      recommendedErrorCode: null,
      adviceVi: "Không có dữ liệu mẫu.",
    };
  }

  let matchedCnt = 0;
  let missingSCnt = 0;
  let missingEdCnt = 0;
  let otherMissCnt = 0;

  const tokens: DictationTokenDiff[] = expectedWords.map((exp, idx) => {
    const act = userWords[idx] ?? "";
    if (!act) {
      otherMissCnt += 1;
      return { expected: exp, actual: "", status: "missing_word" };
    }
    if (act === exp) {
      matchedCnt += 1;
      return { expected: exp, actual: act, status: "matched" };
    }
    if (
      (exp.endsWith("s") && `${act}s` === exp) ||
      (exp.endsWith("es") && `${act}es` === exp)
    ) {
      missingSCnt += 1;
      return { expected: exp, actual: act, status: "missing_s_ending" };
    }
    if (
      (exp.endsWith("ed") && `${act}ed` === exp) ||
      (exp.endsWith("d") && `${act}d` === exp)
    ) {
      missingEdCnt += 1;
      return { expected: exp, actual: act, status: "missing_ed_ending" };
    }
    otherMissCnt += 1;
    return { expected: exp, actual: act, status: "spelling_or_linking_miss" };
  });

  const accuracyPct = Math.round((matchedCnt / expectedWords.length) * 100);

  let recommendedErrorCode: ListeningErrorCode | null = null;
  let adviceVi =
    "Tuyệt vời! Bạn đã nghe chính xác từng âm cuối và từ nối.";

  if (missingSCnt > 0 || missingEdCnt > 0) {
    recommendedErrorCode = "L_SPELLING_OR_SUFFIX";
    const parts: string[] = [];
    if (missingSCnt > 0) parts.push(`${missingSCnt} chỗ rơi đuôi -s/-es`);
    if (missingEdCnt > 0) parts.push(`${missingEdCnt} chỗ rơi đuôi -ed`);
    adviceVi = `Phát hiện ${parts.join(" và ")}. Hãy nghe lại ở tốc độ 0.85x, chú ý dấu hiệu danh từ số nhiều hoặc thì quá khứ/bị động.`;
  } else if (otherMissCnt > 0) {
    recommendedErrorCode = "L_CONNECTED_SPEECH";
    adviceVi =
      "Có từ bị lướt âm hoặc nối âm chưa bắt kịp. Hãy nghe lại cụm bị lệch và lưu Audio Flashcard 0-byte vào Kho SRS.";
  }

  return {
    accuracyPct,
    missingSCnt,
    missingEdCnt,
    otherMissCnt,
    tokens,
    recommendedErrorCode,
    adviceVi,
  };
}

function detectSuffixNearMiss(
  userNorm: string,
  acceptedAnswers: string[]
): "missing_s" | "missing_ed" | null {
  if (!userNorm) return null;
  for (const acc of acceptedAnswers) {
    const accNorm = normalizeListeningAnswer(acc);
    if (`${userNorm}s` === accNorm || `${userNorm}es` === accNorm) {
      return "missing_s";
    }
    if (`${userNorm}ed` === accNorm || `${userNorm}d` === accNorm) {
      return "missing_ed";
    }
  }
  return null;
}

export function scoreListeningAttempt(
  lesson: ListeningLessonContent,
  submission: ListeningAttemptSubmission
): ListeningAttemptEvaluation {
  let correctCount = 0;
  let suffixNearMissCount = 0;

  const questions: EvaluatedListeningQuestion[] = lesson.questions.map((q) => {
    const raw = submission.answers[q.id];
    const userAnswer = raw?.answer?.trim() ?? "";
    const reanchored = Boolean(raw?.reanchored);
    const normUser = normalizeListeningAnswer(userAnswer);

    const isCorrect =
      normUser.length > 0 &&
      q.acceptedAnswers.some(
        (acc) => normalizeListeningAnswer(acc) === normUser
      );

    const suffixWarning = isCorrect
      ? null
      : detectSuffixNearMiss(normUser, q.acceptedAnswers);

    if (isCorrect) correctCount += 1;
    if (suffixWarning) suffixNearMissCount += 1;

    return {
      questionId: q.id,
      number: q.number,
      type: q.type,
      promptEn: q.promptEn,
      userAnswer,
      acceptedAnswers: q.acceptedAnswers,
      isCorrect,
      reanchored,
      suffixWarning,
      evidenceSegmentId: q.evidenceSegmentId,
      distractorSegmentId: q.distractorSegmentId,
      distractorTrapNoteVi: q.distractorTrapNoteVi,
      explanationVi: q.explanationVi,
      recommendedErrorCode: suffixWarning
        ? "L_SPELLING_OR_SUFFIX"
        : reanchored && !isCorrect
          ? "L_LOST_TRACK_PANIC"
          : q.recommendedErrorCode,
      ksaDimension: q.ksaDimension,
    };
  });

  const totalQuestions = Math.max(1, lesson.questions.length);
  const scaledOutOf40 = Math.round((correctCount / totalQuestions) * 40);
  const bandScore = rawToListeningBand(scaledOutOf40);

  let diagnosticAdviceVi =
    "Bạn giữ mạch nghe tốt và phân biệt rõ bẫy đổi ý. Hãy thử Dictation Lab bên dưới để khóa chắc âm cuối.";
  if (suffixNearMissCount > 0) {
    diagnosticAdviceVi = `Có ${suffixNearMissCount} câu viết đúng gốc từ nhưng rơi đuôi -s hoặc -ed. Rà lại bước dự đoán loại từ (POS Gate) trước khi nghe để tránh mất điểm oan.`;
  } else if (submission.reanchorCount > 0) {
    diagnosticAdviceVi = `Bạn đã kích hoạt Let-go & Re-anchor ${submission.reanchorCount} lần để cứu các câu phía sau. Hãy soi lại Distractor X-Ray để nhận diện từ báo hiệu chuyển ý.`;
  } else if (correctCount < Math.ceil(totalQuestions * 0.7)) {
    diagnosticAdviceVi =
      "Tập trung vào Distractor X-Ray transcript bên dưới: nghe lại các đoạn màu đỏ (bẫy tự sửa) và màu xanh dương (từ chuyển đoạn).";
  }

  return {
    lessonId: lesson.id,
    partNumber: lesson.partNumber,
    mode: submission.mode,
    correctCount,
    totalQuestions,
    scaledOutOf40,
    bandScore,
    preGateCompleted: submission.preGateCompleted,
    posPredictionsMatched: submission.posPredictionsMatched,
    reanchorCount: submission.reanchorCount,
    dictationCompletedCount: submission.dictationCompletedCount,
    suffixNearMissCount,
    diagnosticAdviceVi,
    questions,
  };
}
