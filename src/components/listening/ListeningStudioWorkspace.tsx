"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Headphones,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  Zap,
} from "lucide-react";
import type { ListeningAttemptSummary } from "@/lib/db/listeningService";
import {
  EXPECTED_POS_LABELS_VI,
  QUESTION_TYPE_LABELS_VI,
  type ExpectedPos,
  type ListeningAnswerInput,
  type ListeningAttemptEvaluation,
  type ListeningLessonContent,
  type ListeningMode,
  type ListeningSegment,
} from "@/lib/listening/listeningEngine";
import {
  speakListeningSegment,
  stopSpeechPlayback,
} from "@/lib/listening/speechPlayer";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { useToast } from "@/components/lucian/ToastProvider";
import { MapSpatialTrainer } from "./MapSpatialTrainer";
import { ListeningDiagnosticAndLabs } from "./ListeningDiagnosticAndLabs";
import { cn } from "@/lib/utils";

interface ListeningStudioWorkspaceProps {
  lesson: ListeningLessonContent;
  initialMode: ListeningMode;
  recentAttempts: ListeningAttemptSummary[];
}

function createInitialAnswers(
  lesson: ListeningLessonContent
): Record<string, ListeningAnswerInput> {
  const map: Record<string, ListeningAnswerInput> = {};
  for (const q of lesson.questions) {
    map[q.id] = { answer: "", reanchored: false };
  }
  return map;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function ListeningStudioWorkspace({
  lesson,
  initialMode,
  recentAttempts,
}: ListeningStudioWorkspaceProps) {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<ListeningMode>(initialMode);
  const [preGateOpen, setPreGateOpen] = useState(true);
  const [preGateCountdown, setPreGateCountdown] = useState(30);
  const [posPredictions, setPosPredictions] = useState<
    Record<string, ExpectedPos>
  >({});

  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [playingSegmentIdx, setPlayingSegmentIdx] = useState<number | null>(
    null
  );
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [examAudioUsed, setExamAudioUsed] = useState(false);

  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ListeningAnswerInput>>(
    () => createInitialAnswers(lesson)
  );
  const [confidenceBefore, setConfidenceBefore] = useState<number>(3);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [reanchorCount, setReanchorCount] = useState(0);
  const [reanchorBanner, setReanchorBanner] = useState<string | null>(null);
  const [dictationCompletedCount, setDictationCompletedCount] = useState(0);

  const [submitStatus, setSubmitStatus] = useState<MorphStatus>("idle");
  const [evaluation, setEvaluation] =
    useState<ListeningAttemptEvaluation | null>(null);

  const cancelSpeechRef = useRef<(() => void) | null>(null);
  const playAllActiveRef = useRef(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const activeQuestion = lesson.questions[activeIdx] ?? lesson.questions[0];
  const activeAnswerState = answers[activeQuestion.id] ?? {
    answer: "",
    reanchored: false,
  };

  // Pre-listening 30s countdown timer
  useEffect(() => {
    if (!preGateOpen || evaluation) return;
    const t = window.setInterval(() => {
      setPreGateCountdown((prev) => {
        if (prev <= 1) {
          setPreGateOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [preGateOpen, evaluation]);

  // Active listening study timer
  useEffect(() => {
    if (preGateOpen || evaluation) return;
    const t = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(t);
  }, [preGateOpen, evaluation]);

  // Cancel any active speech synthesis when leaving page
  useEffect(() => {
    return () => {
      playAllActiveRef.current = false;
      cancelSpeechRef.current?.();
      stopSpeechPlayback();
    };
  }, []);

  const stopAudio = useCallback(() => {
    playAllActiveRef.current = false;
    setIsPlayingAll(false);
    setPlayingSegmentIdx(null);
    cancelSpeechRef.current?.();
    cancelSpeechRef.current = null;
    stopSpeechPlayback();
  }, []);

  const playSegmentByIndex = useCallback(
    (idx: number, rate: number, chainNext: boolean) => {
      const seg = lesson.segments[idx];
      if (!seg) {
        stopAudio();
        return;
      }
      setPlayingSegmentIdx(idx);
      cancelSpeechRef.current?.();
      cancelSpeechRef.current = speakListeningSegment(seg, rate, () => {
        if (chainNext && playAllActiveRef.current) {
          const next = idx + 1;
          if (next < lesson.segments.length) {
            playSegmentByIndex(next, rate, true);
          } else {
            stopAudio();
          }
        } else {
          setPlayingSegmentIdx(null);
        }
      });
    },
    [lesson.segments, stopAudio]
  );

  function handleStartFullAudio() {
    if (mode === "exam" && examAudioUsed) {
      toast.info(
        "Chế độ One-Shot Exam đã phát xong",
        "Đúng chuẩn phòng thi IELTS, mỗi bài chỉ được nghe một lượt."
      );
      return;
    }
    const effectiveRate = mode === "exam" ? 1.0 : playbackRate;
    if (mode === "exam") {
      setPlaybackRate(1.0);
      setExamAudioUsed(true);
    }
    playAllActiveRef.current = true;
    setIsPlayingAll(true);
    playSegmentByIndex(0, effectiveRate, true);
  }

  function handlePlaySingleSegment(seg: ListeningSegment, rate: number = 1.0) {
    const idx = lesson.segments.findIndex((s) => s.id === seg.id);
    if (idx === -1) return;
    playAllActiveRef.current = false;
    setIsPlayingAll(false);
    playSegmentByIndex(idx, rate, false);
  }

  const predictedCount = Object.keys(posPredictions).length;
  const posPredictionsMatched = useMemo(() => {
    return lesson.questions.filter(
      (q) => posPredictions[q.id] === q.expectedPos
    ).length;
  }, [lesson.questions, posPredictions]);

  function handleCompletePreGate() {
    setPreGateOpen(false);
    toast.success(
      "Đã mở khóa trình phát Audio",
      `Bạn đã dự đoán chính xác ${posPredictionsMatched}/${lesson.questions.length} loại từ.`
    );
  }

  function handleSetAnswer(value: string) {
    if (evaluation) return;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        answer: value,
      },
    }));
  }

  function handleReanchorNext() {
    if (evaluation) return;
    setReanchorCount((c) => c + 1);
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        reanchored: true,
      },
    }));

    const nextIdx = (activeIdx + 1) % lesson.questions.length;
    const nextQ = lesson.questions[nextIdx];
    setActiveIdx(nextIdx);
    setReanchorBanner(
      `Đã bỏ qua Q${activeQuestion.number} — Bám ngay từ khóa Q${nextQ.number}: "${nextQ.anchorKeywords.join(" · ")}"`
    );
  }

  async function handleSubmitAttempt() {
    if (submitStatus === "loading" || evaluation) return;
    stopAudio();
    setSubmitStatus("loading");
    try {
      const res = await fetch("/api/listening/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          mode,
          confidenceBefore,
          durationSec: Math.max(1, elapsedSec),
          preGateCompleted: !preGateOpen && predictedCount > 0,
          posPredictionsMatched,
          reanchorCount,
          dictationCompletedCount,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitStatus("error");
        toast.error(data.error || "Không thể nộp bài Listening.");
        return;
      }

      setSubmitStatus("done");
      setEvaluation(data.evaluation as ListeningAttemptEvaluation);
      toast.success(
        `Hoàn tất: ${data.evaluation.correctCount}/${data.evaluation.totalQuestions} câu đúng`,
        `Band Listening ước tính: ${data.evaluation.bandScore.toFixed(1)}`
      );
      router.refresh();
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch {
      setSubmitStatus("error");
      toast.error("Lỗi kết nối khi chấm bài Listening.");
    }
  }

  function handleResetAttempt() {
    stopAudio();
    setAnswers(createInitialAnswers(lesson));
    setElapsedSec(0);
    setEvaluation(null);
    setSubmitStatus("idle");
    setActiveIdx(0);
    setReanchorCount(0);
    setReanchorBanner(null);
    setExamAudioUsed(false);
    setPreGateOpen(true);
    setPreGateCountdown(30);
  }

  const activeSegment =
    playingSegmentIdx !== null ? lesson.segments[playingSegmentIdx] ?? null : null;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/listening"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ux-line-2)] px-2.5 text-xs font-medium text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Thư viện Listening
            </Link>
            <Badge variant="K">{lesson.partType}</Badge>
            <Badge variant="neutral">Chung Academic &amp; GT</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--ux-ink)]">
              <Clock className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
              {formatClock(elapsedSec)}
            </div>

            <SlidingPillTabs
              size="sm"
              ariaLabel="Chọn chế độ trình phát Listening"
              disabled={Boolean(evaluation) || isPlayingAll}
              value={mode}
              onChange={(next) => setMode(next)}
              options={[
                { value: "guided", label: "Guided" },
                { value: "drill", label: "Drill" },
                { value: "exam", label: "One-Shot Exam" },
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

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 px-3 py-2 text-xs">
            <span className="font-medium text-[var(--ux-ink-2)]">
              Tự tin trước khi nghe (A):
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

      {/* Step A: Pre-listening 30s Keyword & POS Prediction Gate (S) */}
      {preGateOpen && !evaluation ? (
        <div className="space-y-4 rounded-xl border border-[var(--ux-accent)]/35 bg-[var(--ux-surface)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <KsaBadge
                  dimension="S"
                  label="Pre-listening Gate · Dự đoán 30 giây"
                />
                <span className="font-mono text-xs font-semibold text-[var(--ux-warn)]">
                  Tự mở khóa sau {preGateCountdown}s
                </span>
              </div>
              <h2 className="font-display text-lg font-semibold text-[var(--ux-ink)]">
                Khoanh từ khóa mỏ neo &amp; dự đoán loại từ trước khi bật băng
              </h2>
              <p className="text-xs text-[var(--ux-ink-2)]">
                Thói quen 30 giây vàng trong phòng thi giúp tai bắt đúng chỗ cần
                điền và không bị rơi đuôi số nhiều <code>-s</code>.
              </p>
            </div>

            <Button variant="primary" size="md" onClick={handleCompletePreGate}>
              <ShieldCheck className="h-4 w-4" />
              Mở khóa Audio ngay ({predictedCount}/{lesson.questions.length})
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {lesson.questions.map((q) => (
              <div
                key={q.id}
                className="space-y-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[var(--ux-ink)]">
                    Q{q.number}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {q.anchorKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded border border-[var(--ux-accent)]/30 bg-[var(--ux-accent-soft)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--ux-accent)]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="font-medium text-[var(--ux-ink)]">{q.promptEn}</p>
                <select
                  aria-label={`Dự đoán loại từ cho câu ${q.number}`}
                  value={posPredictions[q.id] ?? ""}
                  onChange={(e) =>
                    setPosPredictions((prev) => ({
                      ...prev,
                      [q.id]: e.target.value as ExpectedPos,
                    }))
                  }
                  className="h-8 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-2.5 text-xs text-[var(--ux-ink)]"
                >
                  <option value="">-- Chọn loại thông tin cần nghe --</option>
                  {(Object.keys(EXPECTED_POS_LABELS_VI) as ExpectedPos[]).map(
                    (posKey) => (
                      <option key={posKey} value={posKey}>
                        {EXPECTED_POS_LABELS_VI[posKey]}
                      </option>
                    )
                  )}
                </select>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Step B: 3-Mode Audio Player + Workspace */
        <>
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              {isPlayingAll ? (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={mode === "exam"}
                  onClick={stopAudio}
                >
                  <Square className="h-3.5 w-3.5" />
                  {mode === "exam" ? "Đang phát (Khóa dừng)" : "Dừng phát"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={mode === "exam" && examAudioUsed}
                  onClick={handleStartFullAudio}
                >
                  {mode === "exam" && examAudioUsed ? (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      Đã hết 1 lượt thi
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      {mode === "exam"
                        ? "Bắt đầu phát One-Shot (1.0x)"
                        : "Phát toàn bài Audio"}
                    </>
                  )}
                </Button>
              )}

              <div className="flex items-center gap-1 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)] p-1 text-xs">
                {[0.85, 1.0, 1.15].map((r) => (
                  <button
                    key={r}
                    type="button"
                    disabled={mode === "exam" || isPlayingAll}
                    onClick={() => setPlaybackRate(r)}
                    className={cn(
                      "rounded px-2 py-0.5 font-mono text-[11px] font-semibold cursor-pointer disabled:opacity-50",
                      playbackRate === r
                        ? "bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                        : "text-[var(--ux-ink-2)]"
                    )}
                  >
                    {r}x
                  </button>
                ))}
              </div>

              <span className="font-mono text-xs text-[var(--ux-ink-2)]">
                {activeSegment
                  ? `Đang đọc đoạn ${(playingSegmentIdx ?? 0) + 1}/${lesson.segments.length} (${activeSegment.speaker})`
                  : "Sẵn sàng phát qua Web Speech (0đ Offline)"}
              </span>
            </div>

            {!evaluation && (
              <button
                type="button"
                onClick={handleReanchorNext}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--ux-warn)]/45 bg-[var(--ux-warn-soft)] px-3 text-xs font-semibold text-[var(--ux-warn)] hover:brightness-95 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                Lỡ nhịp — Bám câu kế (Re-anchor)
              </button>
            )}
          </div>

          {reanchorBanner && (
            <div className="rounded-xl border border-[var(--ux-warn)]/35 bg-[var(--ux-warn-soft)] px-4 py-2.5 text-xs font-medium text-[var(--ux-ink)]">
              {reanchorBanner}
            </div>
          )}

          {/* Main Grid: Map/Guided Segment Timeline on Left, Question Sheet on Right */}
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              {lesson.mapLayout && (
                <MapSpatialTrainer
                  layout={lesson.mapLayout}
                  activeSegmentId={activeSegment?.id ?? null}
                  selectedZone={activeAnswerState.answer}
                  showPathTrail={mode === "guided" || Boolean(evaluation)}
                  onSelectZone={
                    !evaluation && activeQuestion.type === "map_labelling"
                      ? (code) => handleSetAnswer(code)
                      : undefined
                  }
                />
              )}

              <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-ink)]">
                    <Headphones className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
                    Mạch phân đoạn Audio ({lesson.segments.length} đoạn)
                  </span>
                  <span className="text-[11px] text-[var(--ux-ink-3)]">
                    {mode === "guided"
                      ? "Guided: Bấm từng đoạn để nghe lại"
                      : mode === "drill"
                        ? "Drill: Theo dõi vị trí đoạn đang chạy"
                        : "Exam: Khóa tua lại chuẩn phòng thi"}
                  </span>
                </div>

                <div className="space-y-2">
                  {lesson.segments.map((seg, idx) => {
                    const isCurrent = playingSegmentIdx === idx;
                    return (
                      <div
                        key={seg.id}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                          isCurrent
                            ? "border-[var(--ux-accent)] bg-[var(--ux-accent-soft)]"
                            : "border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] font-semibold text-[var(--ux-ink)]">
                            Đoạn {idx + 1} · {seg.startSec}s–{seg.endSec}s ·{" "}
                            {seg.speaker}
                          </p>
                          {(mode === "guided" || Boolean(evaluation)) && (
                            <p className="mt-0.5 truncate text-[11px] text-[var(--ux-ink-2)]">
                              {seg.text}
                            </p>
                          )}
                        </div>
                        {mode === "guided" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              isCurrent
                                ? stopAudio()
                                : handlePlaySingleSegment(seg, playbackRate)
                            }
                          >
                            {isCurrent ? "Dừng" : "Nghe"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Pane: Answer Controls */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                  {lesson.questions.map((q, idx) => {
                    const ans = answers[q.id];
                    const isActive = idx === activeIdx;
                    const hasAns = Boolean(ans?.answer.trim());
                    const evalItem = evaluation?.questions.find(
                      (eqItem) => eqItem.questionId === q.id
                    );

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          "relative flex h-9 items-center justify-center rounded-lg border font-mono text-xs font-semibold cursor-pointer",
                          evalItem
                            ? evalItem.isCorrect
                              ? "border-[var(--ux-mint)]/50 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]"
                              : "border-[var(--ux-danger)]/50 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]"
                            : isActive
                              ? "border-[var(--ux-accent)] bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                              : hasAns
                                ? "border-[var(--ux-accent)]/40 bg-[var(--ux-accent-soft)] text-[var(--ux-ink)]"
                                : "border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 text-[var(--ux-ink-2)]"
                        )}
                      >
                        Q{q.number}
                        {ans?.reanchored && !evalItem && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--ux-warn)]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[var(--ux-ink)]">
                        Question {activeQuestion.number}
                      </span>
                      <Badge variant="neutral">
                        {QUESTION_TYPE_LABELS_VI[activeQuestion.type]}
                      </Badge>
                    </div>
                    <Badge variant="K">
                      {EXPECTED_POS_LABELS_VI[activeQuestion.expectedPos]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-[var(--ux-ink-3)]">Mỏ neo:</span>
                    {activeQuestion.anchorKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded border border-[var(--ux-accent)]/30 bg-[var(--ux-accent-soft)] px-1.5 py-0.5 font-mono font-semibold text-[var(--ux-accent)]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {activeQuestion.instructionVi && (
                    <p className="rounded-md border border-[var(--ux-line)] bg-[var(--ux-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--ux-ink-2)]">
                      {activeQuestion.instructionVi}
                    </p>
                  )}

                  <p className="text-sm leading-relaxed font-medium text-[var(--ux-ink)]">
                    {activeQuestion.promptEn}
                  </p>

                  {activeQuestion.type === "note_completion" ? (
                    <Input
                      type="text"
                      disabled={Boolean(evaluation)}
                      placeholder="Gõ từ hoặc số bạn nghe được (chú ý đuôi -s/-ed)..."
                      value={activeAnswerState.answer}
                      onChange={(e) => handleSetAnswer(e.target.value)}
                    />
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
                              "flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer",
                              selected
                                ? "border-[var(--ux-accent)] bg-[var(--ux-accent-soft)] font-semibold text-[var(--ux-ink)] ring-1 ring-[var(--ux-accent)]/40"
                                : "border-[var(--ux-line)] bg-[var(--ux-surface)] text-[var(--ux-ink-2)] hover:text-[var(--ux-ink)]"
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
                    idleLabel="Nộp bài & Mở Distractor X-Ray"
                    loadingLabel="Đang chấm & phân tích K–S–A..."
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
                    Làm lại bài nghe này
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Post-Submission Diagnostic & Labs */}
      {evaluation && (
        <div ref={reportRef}>
          <ListeningDiagnosticAndLabs
            lesson={lesson}
            evaluation={evaluation}
            playingSegmentId={activeSegment?.id ?? null}
            onPlaySegment={handlePlaySingleSegment}
            onStopAudio={stopAudio}
            onDictationCompleted={() =>
              setDictationCompletedCount((c) => c + 1)
            }
            onRetry={handleResetAttempt}
          />
        </div>
      )}

      {/* Recent Attempts */}
      {recentAttempts.length > 0 && (
        <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-[var(--ux-ink)]">
            Lịch sử luyện bài nghe này
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
