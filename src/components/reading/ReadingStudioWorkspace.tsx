"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  HelpCircle,
  Layers,
  Pin,
  PinOff,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { ReadingAttemptSummary } from "@/lib/db/readingService";
import {
  QUESTION_TYPE_LABELS_VI,
  type ContextualVocabItem,
  type ReadingAnswerInput,
  type ReadingAttemptEvaluation,
  type ReadingLessonContent,
  type ReadingMode,
} from "@/lib/reading/readingEngine";
import { Badge, KsaBadge, TrackBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MorphSubmitButton, type MorphStatus } from "@/components/lucian/MorphSubmitButton";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { useToast } from "@/components/lucian/ToastProvider";
import { ReadingDiagnosticReport } from "./ReadingDiagnosticReport";
import { cn } from "@/lib/utils";

interface ReadingStudioWorkspaceProps {
  lesson: ReadingLessonContent;
  initialMode: ReadingMode;
  recentAttempts: ReadingAttemptSummary[];
}

function createInitialAnswers(
  lesson: ReadingLessonContent
): Record<string, ReadingAnswerInput> {
  const map: Record<string, ReadingAnswerInput> = {};
  for (const q of lesson.questions) {
    map[q.id] = {
      answer: "",
      pinnedSentenceId: null,
      timeSpentSec: 0,
      flagged: false,
    };
  }
  return map;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function renderSentenceWithVocab(
  text: string,
  vocabItems: ContextualVocabItem[],
  onSelectVocab: (item: ContextualVocabItem) => void
) {
  if (vocabItems.length === 0) return text;

  const target = vocabItems[0];
  const lowerText = text.toLowerCase();
  const lowerTerm = target.term.toLowerCase();
  const idx = lowerText.indexOf(lowerTerm);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const matched = text.slice(idx, idx + target.term.length);
  const after = text.slice(idx + target.term.length);

  return (
    <>
      {before}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectVocab(target);
        }}
        title="Bấm để mở Gợi ý từ vựng 2 bước (Vocab Guard)"
        className="inline rounded border-b border-dashed border-[var(--ux-accent)] bg-[var(--ux-accent-soft)]/50 px-0.5 font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-accent-soft)] cursor-pointer"
      >
        {matched}
      </button>
      {after}
    </>
  );
}

export function ReadingStudioWorkspace({
  lesson,
  initialMode,
  recentAttempts,
}: ReadingStudioWorkspaceProps) {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<ReadingMode>(initialMode);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ReadingAnswerInput>>(() =>
    createInitialAnswers(lesson)
  );
  const [confidenceBefore, setConfidenceBefore] = useState<number>(3);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showDrillDecomposer, setShowDrillDecomposer] = useState(false);

  // Contextual Vocab Guard 2-step state
  const [selectedVocab, setSelectedVocab] =
    useState<ContextualVocabItem | null>(null);
  const [vocabRevealedIds, setVocabRevealedIds] = useState<
    Record<string, boolean>
  >({});
  const [vocabSavedIds, setVocabSavedIds] = useState<Record<string, boolean>>(
    {}
  );
  const [vocabStep1Count, setVocabStep1Count] = useState(0);
  const [vocabStep2Count, setVocabStep2Count] = useState(0);

  const [submitStatus, setSubmitStatus] = useState<MorphStatus>("idle");
  const [evaluation, setEvaluation] = useState<ReadingAttemptEvaluation | null>(
    null
  );
  const [evidenceWarning, setEvidenceWarning] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const activeQuestion = lesson.questions[activeIdx] ?? lesson.questions[0];
  const activeAnswerState = answers[activeQuestion.id] ?? {
    answer: "",
    pinnedSentenceId: null,
    timeSpentSec: 0,
    flagged: false,
  };

  // Live timer tracking both total duration & per-question pacing
  useEffect(() => {
    if (evaluation) return;
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
      setAnswers((prev) => {
        const qId = lesson.questions[activeIdx]?.id;
        if (!qId || !prev[qId]) return prev;
        return {
          ...prev,
          [qId]: {
            ...prev[qId],
            timeSpentSec: prev[qId].timeSpentSec + 1,
          },
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [evaluation, activeIdx, lesson.questions]);

  const vocabBySentence = useMemo(() => {
    const map = new Map<string, ContextualVocabItem[]>();
    for (const item of lesson.contextualVocab) {
      const list = map.get(item.sentenceId) ?? [];
      list.push(item);
      map.set(item.sentenceId, list);
    }
    return map;
  }, [lesson.contextualVocab]);

  const evaluatedQuestionMap = useMemo(() => {
    const map = new Map<string, ReadingAttemptEvaluation["questions"][number]>();
    if (!evaluation) return map;
    for (const q of evaluation.questions) {
      map.set(q.questionId, q);
    }
    return map;
  }, [evaluation]);

  const examRemainingSec = Math.max(
    0,
    lesson.recommendedMinutes * 60 - elapsedSec
  );

  function handlePinSentence(sentenceId: string) {
    if (evaluation) return;
    setEvidenceWarning(null);
    setAnswers((prev) => {
      const current = prev[activeQuestion.id];
      const nextPin =
        current?.pinnedSentenceId === sentenceId ? null : sentenceId;
      return {
        ...prev,
        [activeQuestion.id]: {
          ...current,
          pinnedSentenceId: nextPin,
        },
      };
    });
  }

  function handleSetAnswer(value: string) {
    if (evaluation) return;
    if (
      (mode === "guided" || mode === "drill") &&
      !activeAnswerState.pinnedSentenceId &&
      value.trim().length > 0
    ) {
      setEvidenceWarning(
        `Chế độ ${mode === "guided" ? "Guided" : "Focused Drill"} khuyến khích bấm chọn 1 câu bằng chứng bên bài đọc trước khi chốt Câu ${activeQuestion.number}.`
      );
    } else {
      setEvidenceWarning(null);
    }

    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        answer: value,
      },
    }));
  }

  function handleFlagAndMoveOn() {
    if (evaluation) return;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        flagged: true,
      },
    }));
    const nextUnanswered = lesson.questions.findIndex(
      (q, i) => i > activeIdx && !answers[q.id]?.answer.trim()
    );
    const nextIdx =
      nextUnanswered !== -1
        ? nextUnanswered
        : (activeIdx + 1) % lesson.questions.length;
    setActiveIdx(nextIdx);
    toast.info(
      `Đã cắm cờ Câu ${activeQuestion.number} và chuyển tiếp`,
      "Giữ kỷ luật thời gian — quay lại sau khi xử lý xong câu dễ."
    );
  }

  function handleSelectVocab(item: ContextualVocabItem) {
    setSelectedVocab(item);
    setVocabStep1Count((c) => c + 1);
  }

  function handleUnlockVocabMeaning(vocabId: string) {
    if (!vocabRevealedIds[vocabId]) {
      setVocabRevealedIds((prev) => ({ ...prev, [vocabId]: true }));
      setVocabStep2Count((c) => c + 1);
    }
  }

  async function handleSaveVocabToSrs(item: ContextualVocabItem) {
    if (vocabSavedIds[item.id]) return;
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "reading",
          cardType: "vocab",
          front: `${item.term} (${item.pos})`,
          back: `${item.definitionVi} — Collocation: "${item.collocationEn}"`,
        }),
      });
      if (res.ok) {
        setVocabSavedIds((prev) => ({ ...prev, [item.id]: true }));
        toast.success(`Đã lưu "${item.term}" vào Kho thẻ SRS`);
      } else {
        toast.error("Không thể lưu từ vựng vào SRS");
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu SRS");
    }
  }

  async function handleSubmitAttempt() {
    if (submitStatus === "loading" || evaluation) return;

    if (mode === "guided") {
      const missingPin = lesson.questions.find(
        (q) => answers[q.id]?.answer.trim() && !answers[q.id]?.pinnedSentenceId
      );
      if (missingPin) {
        const idx = lesson.questions.findIndex((q) => q.id === missingPin.id);
        setActiveIdx(idx);
        setEvidenceWarning(
          `Ở Guided Mode, hãy bấm ghim 1 câu bằng chứng bên trái cho Câu ${missingPin.number} trước khi nộp bài.`
        );
        toast.info(
          `Câu ${missingPin.number} chưa có câu bằng chứng`,
          "Bấm chọn câu chứng minh ở đoạn văn bên trái rồi bấm Nộp bài."
        );
        return;
      }
    }

    setSubmitStatus("loading");
    setEvidenceWarning(null);
    try {
      const res = await fetch("/api/reading/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          mode,
          confidenceBefore,
          durationSec: Math.max(1, elapsedSec),
          answers,
          vocabLookups: {
            step1Count: vocabStep1Count,
            step2Count: vocabStep2Count,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitStatus("error");
        toast.error(data.error || "Không thể nộp bài Reading.");
        return;
      }

      setSubmitStatus("done");
      setEvaluation(data.evaluation as ReadingAttemptEvaluation);
      toast.success(
        `Hoàn tất: ${data.evaluation.correctCount}/${data.evaluation.totalQuestions} câu đúng`,
        `Quy đổi ${lesson.track === "general" ? "General Training" : "Academic"}: Band ${data.evaluation.bandScore.toFixed(1)}`
      );
      router.refresh();
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch {
      setSubmitStatus("error");
      toast.error("Lỗi kết nối khi chấm bài Reading.");
    }
  }

  function handleResetAttempt() {
    setAnswers(createInitialAnswers(lesson));
    setElapsedSec(0);
    setEvaluation(null);
    setSubmitStatus("idle");
    setActiveIdx(0);
    setEvidenceWarning(null);
    setShowDrillDecomposer(false);
  }

  const answeredCount = lesson.questions.filter(
    (q) => answers[q.id]?.answer.trim().length > 0
  ).length;
  const pinnedCount = lesson.questions.filter(
    (q) => Boolean(answers[q.id]?.pinnedSentenceId)
  ).length;

  const activeWordCount = activeAnswerState.answer
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Studio Header & 3-Tier Mode Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/reading"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ux-line-2)] px-2.5 text-xs font-medium text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Thư viện Reading
            </Link>
            <TrackBadge track={lesson.track} />
            <Badge variant="neutral">{lesson.partType}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold",
                mode === "exam" && examRemainingSec <= 120
                  ? "border-[var(--ux-danger)]/40 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]"
                  : "border-[var(--ux-line)] bg-[var(--ux-surface-2)] text-[var(--ux-ink)]"
              )}
            >
              <Clock className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
              {mode === "exam"
                ? `Còn ${formatClock(examRemainingSec)}`
                : `Đã làm ${formatClock(elapsedSec)}`}
            </div>

            <SlidingPillTabs
              size="sm"
              ariaLabel="Chọn mức độ hỗ trợ K-S-A"
              disabled={Boolean(evaluation)}
              value={mode}
              onChange={(next) => {
                setMode(next);
                setEvidenceWarning(null);
              }}
              options={[
                { value: "guided", label: "Guided" },
                { value: "drill", label: "Focused Drill" },
                { value: "exam", label: "Exam Sim" },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[var(--ux-line)] pt-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-xl font-semibold text-[var(--ux-ink)] sm:text-2xl">
              {lesson.title}
            </h1>
            <p className="text-xs text-[var(--ux-ink-2)]">{lesson.subtitleVi}</p>
          </div>

          {/* Pre-Attempt Confidence Calibration (A) */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 px-3 py-2 text-xs">
            <span className="font-medium text-[var(--ux-ink-2)]">
              Tự tin trước khi làm (A):
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  disabled={Boolean(evaluation)}
                  onClick={() => setConfidenceBefore(lvl)}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer",
                    confidenceBefore === lvl
                      ? "bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                      : "bg-[var(--ux-surface)] text-[var(--ux-ink-2)] hover:text-[var(--ux-ink)]"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Split-Screen CD-IELTS Workspace */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* LEFT PANE: Interactive Passage + Evidence Pinning + 2-Step Vocab Guard */}
        <section className="flex flex-col overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ux-line)] bg-[var(--ux-surface-2)]/70 px-4 py-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ux-ink)]">
              <BookOpen className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
              Bài đọc &amp; Ghim câu bằng chứng
            </span>
            <span className="text-[11px] text-[var(--ux-ink-2)]">
              Bấm câu bất kỳ để ghim cho{" "}
              <strong className="font-mono text-[var(--ux-accent)]">
                Q{activeQuestion.number}
              </strong>
            </span>
          </div>

          {/* 2-Step Contextual Vocab Guard Drawer (A) */}
          {selectedVocab && (
            <div className="border-b border-[var(--ux-line)] bg-[var(--ux-accent-soft)]/50 p-3.5 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <KsaBadge dimension="A" label="Vocab Guard 2 nấc" />
                    <span className="font-mono text-sm font-semibold text-[var(--ux-ink)]">
                      {selectedVocab.term}
                    </span>
                    <span className="text-[11px] text-[var(--ux-ink-3)]">
                      ({selectedVocab.pos})
                    </span>
                  </div>
                  <p className="leading-relaxed text-[var(--ux-ink)]">
                    <strong>Bước 1 — Đoán qua ngữ cảnh:</strong>{" "}
                    {selectedVocab.contextClueVi}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVocab(null)}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface)] cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {!vocabRevealedIds[selectedVocab.id] ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnlockVocabMeaning(selectedVocab.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Đã tự đoán — Mở nghĩa chi tiết (Bước 2)
                  </Button>
                ) : (
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] px-3 py-2">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[var(--ux-ink)]">
                        Nghĩa: {selectedVocab.definitionVi}
                      </p>
                      <p className="font-mono text-[11px] text-[var(--ux-ink-2)]">
                        Collocation: {selectedVocab.collocationEn}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        vocabSavedIds[selectedVocab.id] ? "secondary" : "primary"
                      }
                      disabled={Boolean(vocabSavedIds[selectedVocab.id])}
                      onClick={() => handleSaveVocabToSrs(selectedVocab)}
                    >
                      {vocabSavedIds[selectedVocab.id] ? (
                        <>
                          <Layers className="h-3.5 w-3.5 text-[var(--ux-mint)]" />
                          Đã lưu SRS ✓
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          Lưu từ vào SRS
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Heading Bank Reference */}
          {lesson.headingBank && lesson.headingBank.length > 0 && (
            <div className="border-b border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 px-4 py-3 text-xs">
              <p className="mb-1.5 font-semibold text-[var(--ux-ink)]">
                List of Headings (Dùng cho các câu Matching Headings):
              </p>
              <ul className="grid gap-1 text-[var(--ux-ink-2)] sm:grid-cols-2">
                {lesson.headingBank.map((h) => (
                  <li key={h.value} className="leading-snug">
                    {h.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scrollable Reading Passage Body */}
          <div className="space-y-5 p-5 leading-[1.8] lg:max-h-[70vh] lg:overflow-y-auto sm:p-6">
            {lesson.paragraphs.map((para) => (
              <div key={para.id} className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[var(--ux-surface-2)] px-1.5 font-mono text-xs font-semibold text-[var(--ux-ink)]">
                    {para.label}
                  </span>
                  {para.heading && (
                    <h2 className="font-display text-sm font-semibold text-[var(--ux-ink)]">
                      {para.heading}
                    </h2>
                  )}
                </div>

                <p className="text-[15px] text-[var(--ux-ink)]">
                  {para.sentences.map((sentence) => {
                    const isPinnedByActive =
                      activeAnswerState.pinnedSentenceId === sentence.id;
                    const pinnedQuestionNums = lesson.questions
                      .filter((q) => answers[q.id]?.pinnedSentenceId === sentence.id)
                      .map((q) => q.number);
                    const evalForActive = evaluatedQuestionMap.get(
                      activeQuestion.id
                    );
                    const isCorrectEvidenceForActive = Boolean(
                      evalForActive?.evidenceSentenceIds.includes(sentence.id)
                    );
                    const sentenceVocabs =
                      vocabBySentence.get(sentence.id) ?? [];

                    return (
                      <span
                        key={sentence.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handlePinSentence(sentence.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handlePinSentence(sentence.id);
                          }
                        }}
                        data-active={
                          isPinnedByActive || isCorrectEvidenceForActive
                            ? "true"
                            : "false"
                        }
                        style={
                          {
                            "--ink-color": isCorrectEvidenceForActive
                              ? "var(--ux-mint-soft)"
                              : "var(--ux-accent-soft)",
                          } as CSSProperties
                        }
                        className={cn(
                          "ux-ink-mark mr-1.5 inline rounded px-1 py-0.5 transition-colors cursor-pointer",
                          !isPinnedByActive &&
                            !isCorrectEvidenceForActive &&
                            "hover:bg-[var(--ux-surface-2)]",
                          isPinnedByActive &&
                            "underline decoration-[var(--ux-accent)] decoration-2 underline-offset-4",
                          isCorrectEvidenceForActive &&
                            "underline decoration-[var(--ux-mint)] decoration-2 underline-offset-4"
                        )}
                      >
                        {pinnedQuestionNums.length > 0 && (
                          <span className="mr-1 inline-flex items-center gap-0.5 rounded bg-[var(--ux-accent)] px-1 py-0.2 font-mono text-[10px] font-semibold text-[var(--ux-accent-ink)] align-middle">
                            <Pin className="h-2.5 w-2.5" />
                            {pinnedQuestionNums.map((n) => `Q${n}`).join(",")}
                          </span>
                        )}
                        {isCorrectEvidenceForActive && !isPinnedByActive && (
                          <span className="mr-1 inline-flex items-center rounded bg-[var(--ux-mint)] px-1 py-0.2 font-mono text-[10px] font-semibold text-[var(--ux-mint-ink)] align-middle">
                            Bằng chứng Q{activeQuestion.number}
                          </span>
                        )}
                        {renderSentenceWithVocab(
                          sentence.text,
                          sentenceVocabs,
                          handleSelectVocab
                        )}
                      </span>
                    );
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT PANE: Navigator, Decomposer, Pin Status, Answer Controls */}
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-5">
          <div className="space-y-4">
            {/* Progress & Question Navigator */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[var(--ux-ink)]">
                  Đã trả lời {answeredCount}/{lesson.questions.length} · Đã ghim{" "}
                  {pinnedCount}/{lesson.questions.length}
                </span>
                {!evaluation && (
                  <button
                    type="button"
                    onClick={handleFlagAndMoveOn}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--ux-warn)]/40 bg-[var(--ux-warn-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ux-warn)] hover:brightness-95 cursor-pointer"
                  >
                    <Flag className="h-3 w-3" />
                    Cắm cờ &amp; sang câu kế
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                {lesson.questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isActive = idx === activeIdx;
                  const hasAnswer = Boolean(ans?.answer.trim());
                  const hasPin = Boolean(ans?.pinnedSentenceId);
                  const evalItem = evaluatedQuestionMap.get(q.id);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setActiveIdx(idx);
                        setEvidenceWarning(null);
                      }}
                      className={cn(
                        "relative flex h-9 items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-all cursor-pointer",
                        evalItem
                          ? evalItem.isCorrect
                            ? "border-[var(--ux-mint)]/50 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]"
                            : "border-[var(--ux-danger)]/50 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]"
                          : isActive
                            ? "border-[var(--ux-accent)] bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                            : hasAnswer
                              ? "border-[var(--ux-accent)]/35 bg-[var(--ux-accent-soft)] text-[var(--ux-ink)]"
                              : "border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 text-[var(--ux-ink-2)] hover:text-[var(--ux-ink)]"
                      )}
                    >
                      {q.number}
                      {ans?.flagged && !evalItem && (
                        <span
                          aria-label="Đã cắm cờ"
                          className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--ux-warn)]"
                        />
                      )}
                      {hasPin && !evalItem && (
                        <span
                          aria-label="Đã ghim bằng chứng"
                          className="absolute right-0.5 bottom-0.5 h-1.5 w-1.5 rounded-full bg-[var(--ux-mint)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Question Card */}
            <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-[var(--ux-ink)]">
                    Question {activeQuestion.number}
                  </span>
                  <Badge variant="neutral">
                    {QUESTION_TYPE_LABELS_VI[activeQuestion.type]}
                  </Badge>
                </div>
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    activeAnswerState.timeSpentSec > 90
                      ? "font-semibold text-[var(--ux-danger)]"
                      : "text-[var(--ux-ink-3)]"
                  )}
                >
                  {activeAnswerState.timeSpentSec}s
                </span>
              </div>

              {activeQuestion.instructionVi && (
                <p className="rounded-md border border-[var(--ux-line)] bg-[var(--ux-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--ux-ink-2)]">
                  {activeQuestion.instructionVi}
                </p>
              )}

              <p className="text-sm leading-relaxed font-medium text-[var(--ux-ink)]">
                {activeQuestion.promptEn}
              </p>

              {/* T/F/NG & Y/N/NG 3-Part Decomposer (K + S) */}
              {activeQuestion.decomposer &&
                (mode === "guided" || Boolean(evaluation) || mode === "drill") && (
                  <div className="space-y-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ux-accent)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Tách 3 mảnh logic (K + S)
                      </span>
                      {mode === "drill" && !evaluation && (
                        <button
                          type="button"
                          onClick={() => setShowDrillDecomposer((s) => !s)}
                          className="text-[11px] font-medium text-[var(--ux-ink-2)] hover:underline cursor-pointer"
                        >
                          {showDrillDecomposer ? "Ẩn gợi ý" : "Mở gợi ý tách câu"}
                        </button>
                      )}
                    </div>

                    {(mode === "guided" ||
                      Boolean(evaluation) ||
                      showDrillDecomposer) && (
                      <div className="space-y-1.5 text-[11px] leading-relaxed">
                        <p>
                          <strong className="text-[var(--ux-ink)]">
                            [Chủ thể]:
                          </strong>{" "}
                          <span className="text-[var(--ux-ink-2)]">
                            {activeQuestion.decomposer.subjectEn}
                          </span>
                        </p>
                        <p>
                          <strong className="text-[var(--ux-ink)]">
                            [Quan hệ]:
                          </strong>{" "}
                          <span className="text-[var(--ux-ink-2)]">
                            {activeQuestion.decomposer.relationEn}
                          </span>
                        </p>
                        <p>
                          <strong className="text-[var(--ux-warn)]">
                            [Từ giới hạn / Qualifier]:
                          </strong>{" "}
                          <span className="text-[var(--ux-ink)]">
                            {activeQuestion.decomposer.qualifierEn}
                          </span>
                        </p>
                        {Boolean(evaluation) && (
                          <p className="border-t border-[var(--ux-line)] pt-1.5 text-[var(--ux-ink-2)]">
                            {activeQuestion.decomposer.trapNoteVi}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Evidence Pinning Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] px-3 py-2 text-xs">
                {activeAnswerState.pinnedSentenceId ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 font-medium text-[var(--ux-mint)]">
                      <Pin className="h-3.5 w-3.5" />
                      Đã ghim câu bằng chứng:{" "}
                      <strong className="font-mono">
                        {activeAnswerState.pinnedSentenceId.toUpperCase()}
                      </strong>
                    </span>
                    {!evaluation && (
                      <button
                        type="button"
                        onClick={() =>
                          handlePinSentence(activeAnswerState.pinnedSentenceId!)
                        }
                        className="inline-flex items-center gap-1 text-[11px] text-[var(--ux-ink-3)] hover:text-[var(--ux-danger)] cursor-pointer"
                      >
                        <PinOff className="h-3 w-3" />
                        Bỏ ghim
                      </button>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--ux-ink-3)]">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Chưa ghim bằng chứng — bấm 1 câu bên bài đọc
                  </span>
                )}
              </div>

              {evidenceWarning && (
                <p className="rounded-lg border border-[var(--ux-warn)]/40 bg-[var(--ux-warn-soft)] px-3 py-2 text-xs text-[var(--ux-warn)]">
                  {evidenceWarning}
                </p>
              )}

              {/* Answer Input per Question Type */}
              {activeQuestion.type === "summary_completion" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor={`q-input-${activeQuestion.id}`}
                      className="font-semibold text-[var(--ux-ink)]"
                    >
                      Điền từ từ bài đọc
                    </label>
                    <span
                      className={cn(
                        "font-mono text-[11px]",
                        activeQuestion.wordLimit &&
                          activeWordCount > activeQuestion.wordLimit
                          ? "font-semibold text-[var(--ux-danger)]"
                          : "text-[var(--ux-ink-3)]"
                      )}
                    >
                      {activeWordCount}
                      {activeQuestion.wordLimit
                        ? ` / ${activeQuestion.wordLimit} từ`
                        : " từ"}
                    </span>
                  </div>
                  <Input
                    id={`q-input-${activeQuestion.id}`}
                    type="text"
                    disabled={Boolean(evaluation)}
                    placeholder="Nhập từ tiếng Anh chính xác..."
                    value={activeAnswerState.answer}
                    onChange={(e) => handleSetAnswer(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {(activeQuestion.options ?? []).map((opt) => {
                    const selected = activeAnswerState.answer === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={Boolean(evaluation)}
                        onClick={() => handleSetAnswer(opt.value)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer disabled:cursor-default",
                          selected
                            ? "border-[var(--ux-accent)] bg-[var(--ux-accent-soft)] font-semibold text-[var(--ux-ink)] ring-1 ring-[var(--ux-accent)]/40"
                            : "border-[var(--ux-line)] bg-[var(--ux-surface)] text-[var(--ux-ink-2)] hover:border-[var(--ux-line-2)] hover:text-[var(--ux-ink)]"
                        )}
                      >
                        <span>{opt.label}</span>
                        {selected && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Prev / Next + Submit Controls */}
          <div className="space-y-3 border-t border-[var(--ux-line)] pt-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Câu trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={activeIdx === lesson.questions.length - 1}
                onClick={() =>
                  setActiveIdx((i) =>
                    Math.min(lesson.questions.length - 1, i + 1)
                  )
                }
              >
                Câu kế
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {!evaluation ? (
              <MorphSubmitButton
                className="w-full"
                status={submitStatus}
                idleLabel="Nộp bài & Chấm điểm K–S–A"
                loadingLabel="Đang chấm & phân tích ma trận..."
                doneLabel="Đã chấm xong!"
                icon={<CheckCircle2 className="h-4 w-4" />}
                onClick={handleSubmitAttempt}
              />
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetAttempt}
              >
                <RotateCcw className="h-4 w-4" />
                Làm lại lượt mới
              </Button>
            )}
          </div>
        </section>
      </div>

      {/* Post-Submission KSA Diagnostic Report */}
      {evaluation && (
        <div ref={reportRef}>
          <ReadingDiagnosticReport
            evaluation={evaluation}
            onRetry={handleResetAttempt}
            onSelectQuestion={(qId) => {
              const idx = lesson.questions.findIndex((q) => q.id === qId);
              if (idx !== -1) {
                setActiveIdx(idx);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />
        </div>
      )}

      {/* Past Attempts History for This Passage */}
      {recentAttempts.length > 0 && (
        <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-[var(--ux-ink)]">
            Lịch sử các lượt làm gần đây cho bài đọc này
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {recentAttempts.slice(0, 4).map((att) => (
              <div
                key={att.id}
                className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[var(--ux-accent)]">
                    Band {att.bandScore?.toFixed(1) ?? "—"}
                  </span>
                  <Badge variant="neutral">{att.mode.toUpperCase()}</Badge>
                </div>
                <p className="mt-1 font-mono text-[11px] text-[var(--ux-ink)]">
                  Đúng: {att.rawScore ?? 0}/{lesson.questions.length} ·{" "}
                  {formatClock(att.durationSec)}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                  {new Date(att.completedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
