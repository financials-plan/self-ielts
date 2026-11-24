"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookmarkPlus,
  CheckCircle2,
  Headphones,
  Layers,
  Play,
  Square,
  Volume2,
  XCircle,
} from "lucide-react";
import {
  evaluateDictationAttempt,
  formatAudioClipRef,
  QUESTION_TYPE_LABELS_VI,
  type DictationEvaluationResult,
  type ListeningAttemptEvaluation,
  type ListeningLessonContent,
  type ListeningSegment,
} from "@/lib/listening/listeningEngine";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/lucian/ToastProvider";
import { cn } from "@/lib/utils";

interface ListeningDiagnosticAndLabsProps {
  lesson: ListeningLessonContent;
  evaluation: ListeningAttemptEvaluation;
  playingSegmentId: string | null;
  onPlaySegment: (segment: ListeningSegment, rate?: number) => void;
  onStopAudio: () => void;
  onDictationCompleted?: () => void;
  onRetry?: () => void;
}

export function ListeningDiagnosticAndLabs({
  lesson,
  evaluation,
  playingSegmentId,
  onPlaySegment,
  onStopAudio,
  onDictationCompleted,
  onRetry,
}: ListeningDiagnosticAndLabsProps) {
  const toast = useToast();
  const [savedSegIds, setSavedSegIds] = useState<Record<string, boolean>>({});
  const [savingSegId, setSavingSegId] = useState<string | null>(null);
  const [loggedQIds, setLoggedQIds] = useState<Record<string, boolean>>({});
  const [loggingQId, setLoggingQId] = useState<string | null>(null);

  // Dictation Lab state per drill id
  const [dictationInputs, setDictationInputs] = useState<Record<string, string>>(
    {}
  );
  const [dictationResults, setDictationResults] = useState<
    Record<string, DictationEvaluationResult>
  >({});

  async function handleSaveAudioClipToSrs(seg: ListeningSegment) {
    if (savedSegIds[seg.id] || savingSegId) return;
    setSavingSegId(seg.id);
    const audioClipRef = formatAudioClipRef(
      lesson.id,
      seg.id,
      seg.startSec,
      seg.endSec
    );
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "listening",
          cardType: "audio_clip",
          front: `[${lesson.partType} · ${seg.startSec}s–${seg.endSec}s] "${seg.text.slice(0, 120)}${seg.text.length > 120 ? "..." : ""}"`,
          back:
            seg.connectedSpeechNoteVi ||
            seg.xrayNoteVi ||
            `Đoạn audio ${seg.speaker} (${seg.accent})`,
          audioClipRef,
        }),
      });
      if (res.ok) {
        setSavedSegIds((prev) => ({ ...prev, [seg.id]: true }));
        toast.success(
          "Đã lưu Audio Flashcard 0-byte vào SRS",
          `Con trỏ ${seg.startSec}s–${seg.endSec}s đã sẵn sàng để nghe lại khi ôn tập.`
        );
      } else {
        toast.error("Không thể lưu Audio Flashcard vào SRS");
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu SRS");
    } finally {
      setSavingSegId(null);
    }
  }

  async function handleLogListeningError(
    q: ListeningAttemptEvaluation["questions"][number]
  ) {
    if (loggedQIds[q.questionId] || loggingQId) return;
    setLoggingQId(q.questionId);
    try {
      const snippet = `Listening Part ${evaluation.partNumber} Q${q.number} (${QUESTION_TYPE_LABELS_VI[q.type]}): "${q.promptEn.slice(0, 130)}" — Trả lời: ${q.userAnswer || "(Trống)"} | Đáp án: ${q.acceptedAnswers[0]}${q.suffixWarning ? ` (${q.suffixWarning})` : ""}`;
      const res = await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "listening",
          ksaDimension: q.ksaDimension,
          errorCode: q.recommendedErrorCode,
          contextSnippet: snippet,
          resolutionNote: q.distractorTrapNoteVi,
        }),
      });
      if (res.ok) {
        setLoggedQIds((prev) => ({ ...prev, [q.questionId]: true }));
        toast.success("Đã ghi vào Sổ lỗi K–S–A");
      } else {
        toast.error("Không thể ghi lỗi vào Sổ lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối khi ghi lỗi");
    } finally {
      setLoggingQId(null);
    }
  }

  function handleCheckDictation(drillId: string, targetText: string) {
    const userText = dictationInputs[drillId] ?? "";
    const result = evaluateDictationAttempt(targetText, userText);
    setDictationResults((prev) => ({ ...prev, [drillId]: result }));
    onDictationCompleted?.();
  }

  return (
    <div className="space-y-6">
      {/* 1. Score & KSA Telemetry Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="K">Part {evaluation.partNumber}</Badge>
                <Badge variant="neutral">
                  Chế độ: {evaluation.mode.toUpperCase()}
                </Badge>
                {evaluation.suffixNearMissCount > 0 && (
                  <Badge variant="A">
                    Rơi đuôi -s/-ed: {evaluation.suffixNearMissCount} câu
                  </Badge>
                )}
              </div>
              <CardTitle className="font-display text-xl font-semibold">
                Chẩn đoán K–S–A &amp; Soi bẫy Distractor
              </CardTitle>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Làm lại lượt mới
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-4">
              <p className="text-xs font-medium text-[var(--ux-ink-2)]">
                Câu đúng
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {evaluation.correctCount}/{evaluation.totalQuestions}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Quy đổi tương đương {evaluation.scaledOutOf40}/40
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-accent)]/30 bg-[var(--ux-accent-soft)] p-4">
              <p className="text-xs font-semibold text-[var(--ux-accent)]">
                Band Listening ước tính
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {evaluation.bandScore.toFixed(1)}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-2)]">
                Áp dụng chung Academic &amp; GT
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-4">
              <p className="text-xs font-medium text-[var(--ux-ink-2)]">
                Pre-listening POS Gate (S)
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {evaluation.posPredictionsMatched}/{evaluation.totalQuestions}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Dự đoán đúng loại từ trước khi nghe
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-4">
              <p className="text-xs font-medium text-[var(--ux-ink-2)]">
                Let-go &amp; Re-anchor (A)
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {evaluation.reanchorCount} lần
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Chủ động bỏ câu lỡ để cứu mạch sau
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 p-3.5 text-xs leading-relaxed text-[var(--ux-ink)]">
            <strong className="font-semibold">Kết luận K–S–A:</strong>{" "}
            {evaluation.diagnosticAdviceVi}
          </div>

          {/* Per-Question Breakdown */}
          <div className="space-y-3">
            {evaluation.questions.map((q) => {
              const seg = lesson.segments.find(
                (s) => s.id === q.evidenceSegmentId
              );
              const isLogged = Boolean(loggedQIds[q.questionId]);
              return (
                <div
                  key={q.questionId}
                  className="space-y-2.5 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-[var(--ux-ink)]">
                        Q{q.number}
                      </span>
                      <Badge variant="neutral">
                        {QUESTION_TYPE_LABELS_VI[q.type]}
                      </Badge>
                      {q.isCorrect ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[var(--ux-mint)]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đúng ({q.userAnswer})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-[var(--ux-danger)]">
                          <XCircle className="h-3.5 w-3.5" />
                          Chọn: {q.userAnswer || "(Trống)"} · Đáp án:{" "}
                          {q.acceptedAnswers[0]}
                        </span>
                      )}
                      {q.suffixWarning && (
                        <Badge variant="A">
                          Cảnh báo: Rơi đuôi{" "}
                          {q.suffixWarning === "missing_s" ? "-s" : "-ed"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {seg && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            playingSegmentId === seg.id
                              ? onStopAudio()
                              : onPlaySegment(seg, 0.9)
                          }
                        >
                          {playingSegmentId === seg.id ? (
                            <>
                              <Square className="h-3 w-3" />
                              Dừng
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5" />
                              Nghe lại câu gốc
                            </>
                          )}
                        </Button>
                      )}
                      {!q.isCorrect && (
                        <Button
                          size="sm"
                          variant={isLogged ? "secondary" : "outline"}
                          disabled={isLogged || loggingQId === q.questionId}
                          onClick={() => handleLogListeningError(q)}
                        >
                          <AlertTriangle
                            className={cn(
                              "h-3.5 w-3.5",
                              isLogged
                                ? "text-[var(--ux-mint)]"
                                : "text-[var(--ux-warn)]"
                            )}
                          />
                          {isLogged ? "Đã ghi Sổ lỗi ✓" : "Ghi Sổ lỗi"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-[var(--ux-ink)]">
                    {q.promptEn}
                  </p>
                  <p className="leading-relaxed text-[var(--ux-ink-2)]">
                    {q.explanationVi}
                  </p>
                  <p className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 px-3 py-2 text-[11px] text-[var(--ux-ink-2)]">
                    <strong className="text-[var(--ux-ink)]">Bẫy cần nhớ:</strong>{" "}
                    {q.distractorTrapNoteVi}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Distractor X-Ray 3-Layer Transcript + 0-Byte Audio Flashcard Saver */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <KsaBadge dimension="K" label="Distractor X-Ray Transcript" />
              <CardTitle className="mt-1.5 font-display text-lg font-semibold">
                Soi Transcript 3 lớp &amp; Lưu Audio Flashcard 0-byte
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <Badge variant="S">Evidence</Badge>
              <Badge variant="A">Distractor Trap</Badge>
              <Badge variant="K">Signpost Cue</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {lesson.segments.map((seg) => {
            const isPlaying = playingSegmentId === seg.id;
            const isSaved = Boolean(savedSegIds[seg.id]);
            const layerBorder =
              seg.xrayType === "evidence"
                ? "border-l-[var(--ux-mint)] bg-[var(--ux-mint-soft)]/35"
                : seg.xrayType === "distractor"
                  ? "border-l-[var(--ux-danger)] bg-[var(--ux-danger-soft)]/35"
                  : seg.xrayType === "signpost"
                    ? "border-l-[var(--ux-accent)] bg-[var(--ux-accent-soft)]/35"
                    : "border-l-[var(--ux-line-2)] bg-[var(--ux-surface)]";

            return (
              <div
                key={seg.id}
                className={cn(
                  "space-y-2 rounded-xl border border-[var(--ux-line)] border-l-4 p-4 text-xs",
                  layerBorder
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[var(--ux-ink)]">
                      {seg.startSec}s–{seg.endSec}s
                    </span>
                    <span className="font-semibold text-[var(--ux-ink)]">
                      {seg.speaker}
                    </span>
                    <Badge variant="neutral">{seg.accent}</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        isPlaying ? onStopAudio() : onPlaySegment(seg, 1.0)
                      }
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-3 w-3" />
                          Dừng
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Nghe đoạn này
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant={isSaved ? "secondary" : "outline"}
                      disabled={isSaved || savingSegId === seg.id}
                      onClick={() => handleSaveAudioClipToSrs(seg)}
                    >
                      {isSaved ? (
                        <>
                          <Layers className="h-3.5 w-3.5 text-[var(--ux-mint)]" />
                          Đã lưu Audio 0-byte ✓
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          Lưu Audio SRS
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[var(--ux-ink)]">
                  {seg.text}
                </p>

                {seg.xrayNoteVi && (
                  <p className="text-[11px] text-[var(--ux-ink-2)]">
                    <strong className="text-[var(--ux-ink)]">Phân tích:</strong>{" "}
                    {seg.xrayNoteVi}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 3. Dictation Lab (-s / -ed Suffix Tail Detector) */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <KsaBadge dimension="K" label="Dictation Lab · Bắt lỗi đuôi -s/-ed" />
            <CardTitle className="font-display text-lg font-semibold">
              Nghe chép chính tả phân đoạn (Chống rơi âm cuối)
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {lesson.dictationDrills.map((drill) => {
            const seg = lesson.segments.find((s) => s.id === drill.segmentId);
            const res = dictationResults[drill.id];
            const isPlaying = Boolean(seg && playingSegmentId === seg.id);

            return (
              <div
                key={drill.id}
                className="space-y-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--ux-ink)]">
                      {drill.promptContextVi}
                    </p>
                    <p className="text-[11px] text-[var(--ux-accent)]">
                      Trọng tâm: {drill.focusPhenomenonVi}
                    </p>
                  </div>

                  {seg && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          isPlaying ? onStopAudio() : onPlaySegment(seg, 0.85)
                        }
                      >
                        <Headphones className="h-3.5 w-3.5" />
                        {isPlaying ? "Đang phát..." : "Nghe chậm 0.85x"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          isPlaying ? onStopAudio() : onPlaySegment(seg, 1.0)
                        }
                      >
                        1.0x
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="text"
                    placeholder="Gõ chính xác câu tiếng Anh bạn vừa nghe..."
                    value={dictationInputs[drill.id] ?? ""}
                    onChange={(e) =>
                      setDictationInputs((prev) => ({
                        ...prev,
                        [drill.id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="primary"
                    size="md"
                    className="shrink-0"
                    onClick={() =>
                      handleCheckDictation(drill.id, drill.targetText)
                    }
                  >
                    Kiểm tra đuôi từ
                  </Button>
                </div>

                {res && (
                  <div className="space-y-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-[var(--ux-ink)]">
                        Độ chính xác: {res.accuracyPct}%
                      </span>
                      {(res.missingSCnt > 0 || res.missingEdCnt > 0) && (
                        <Badge variant="A">
                          Rơi {res.missingSCnt} đuôi -s · {res.missingEdCnt}{" "}
                          đuôi -ed
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 leading-relaxed">
                      {res.tokens.map((tok, i) => {
                        const cls =
                          tok.status === "matched"
                            ? "border-[var(--ux-mint)]/35 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]"
                            : tok.status === "missing_s_ending" ||
                                tok.status === "missing_ed_ending"
                              ? "border-[var(--ux-warn)]/50 bg-[var(--ux-warn-soft)] text-[var(--ux-warn)] font-semibold"
                              : "border-[var(--ux-danger)]/45 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]";
                        return (
                          <span
                            key={`${tok.expected}-${i}`}
                            title={
                              tok.actual
                                ? `Bạn gõ: "${tok.actual}"`
                                : "Chưa gõ từ này"
                            }
                            className={cn(
                              "rounded border px-1.5 py-0.5 font-mono text-[11px]",
                              cls
                            )}
                          >
                            {tok.expected}
                            {tok.status === "missing_s_ending" && " (-s!)"}
                            {tok.status === "missing_ed_ending" && " (-ed!)"}
                          </span>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-[var(--ux-ink-2)]">
                      {res.adviceVi}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
