"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  Flag,
  Layers,
  Pin,
  XCircle,
} from "lucide-react";
import {
  EVIDENCE_CELL_META,
  QUESTION_TYPE_LABELS_VI,
  type EvidenceCell,
  type ReadingAttemptEvaluation,
} from "@/lib/reading/readingEngine";
import { Badge, KsaBadge, TrackBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CopyChipButton } from "@/components/lucian/CopyChipButton";
import { useToast } from "@/components/lucian/ToastProvider";
import { cn } from "@/lib/utils";

interface ReadingDiagnosticReportProps {
  evaluation: ReadingAttemptEvaluation;
  onSelectQuestion?: (questionId: string) => void;
  onRetry?: () => void;
}

const MATRIX_ORDER: Array<{
  key: EvidenceCell;
  accentStyle: string;
  softStyle: string;
}> = [
  {
    key: "calibrated_mastery",
    accentStyle: "text-[var(--ux-mint)]",
    softStyle: "border-[var(--ux-mint)]/35 bg-[var(--ux-mint-soft)]",
  },
  {
    key: "lucky_guess",
    accentStyle: "text-[var(--ux-warn)]",
    softStyle: "border-[var(--ux-warn)]/35 bg-[var(--ux-warn-soft)]",
  },
  {
    key: "qualifier_trap",
    accentStyle: "text-[var(--ux-accent)]",
    softStyle: "border-[var(--ux-accent)]/35 bg-[var(--ux-accent-soft)]",
  },
  {
    key: "misread_locator",
    accentStyle: "text-[var(--ux-danger)]",
    softStyle: "border-[var(--ux-danger)]/35 bg-[var(--ux-danger-soft)]",
  },
];

export function ReadingDiagnosticReport({
  evaluation,
  onSelectQuestion,
  onRetry,
}: ReadingDiagnosticReportProps) {
  const toast = useToast();
  const [savedCardIds, setSavedCardIds] = useState<Record<string, boolean>>({});
  const [savingCardId, setSavingCardId] = useState<string | null>(null);
  const [loggedErrorIds, setLoggedErrorIds] = useState<Record<string, boolean>>(
    {}
  );
  const [loggingErrorId, setLoggingErrorId] = useState<string | null>(null);

  async function handleSaveParaphraseToSrs(qId: string, front: string, back: string) {
    if (savedCardIds[qId] || savingCardId) return;
    setSavingCardId(qId);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "reading",
          cardType: "paraphrase",
          front: `Question: "${front}" ↔ Passage: ?`,
          back,
        }),
      });
      if (res.ok) {
        setSavedCardIds((prev) => ({ ...prev, [qId]: true }));
        toast.success("Đã lưu cặp Paraphrase vào Kho thẻ SRS");
      } else {
        toast.error("Không thể lưu thẻ vào SRS");
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu SRS");
    } finally {
      setSavingCardId(null);
    }
  }

  async function handleLogErrorToJournal(
    q: ReadingAttemptEvaluation["questions"][number]
  ) {
    if (loggedErrorIds[q.questionId] || loggingErrorId) return;
    setLoggingErrorId(q.questionId);
    try {
      const contextSnippet = `Reading Q${q.number} (${QUESTION_TYPE_LABELS_VI[q.type]}): "${q.promptEn.slice(0, 140)}" — Trả lời: ${q.userAnswer || "(Trống)"} | Đáp án: ${q.acceptedAnswers[0]} | Bằng chứng: ${q.evidenceSentenceIds.join(", ")}`;
      const res = await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "reading",
          ksaDimension:
            q.evidenceCell === "lucky_guess" ? "A" : q.ksaDimension,
          errorCode:
            q.evidenceCell === "lucky_guess"
              ? "R_ASSUMPTION_BIAS"
              : q.recommendedErrorCode,
          contextSnippet,
          resolutionNote: q.paraphraseBridge.techniqueVi,
        }),
      });
      if (res.ok) {
        setLoggedErrorIds((prev) => ({ ...prev, [q.questionId]: true }));
        toast.success("Đã ghi vào Sổ lỗi K–S–A");
      } else {
        toast.error("Không thể ghi lỗi vào Sổ lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối khi ghi lỗi");
    } finally {
      setLoggingErrorId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Score & Track Calibration Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <TrackBadge track={evaluation.track} />
                <Badge variant="neutral">
                  Chế độ: {evaluation.mode.toUpperCase()}
                </Badge>
                <Badge variant="S">
                  Ghim bằng chứng đúng: {evaluation.evidenceAccuracyPct}%
                </Badge>
              </div>
              <CardTitle className="font-display text-xl font-semibold">
                Báo cáo Chẩn đoán K–S–A Reading
              </CardTitle>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Làm lại bài này
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
                Band {evaluation.track === "general" ? "General" : "Academic"}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {evaluation.bandScore.toFixed(1)}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-2)]">
                {evaluation.track === "academic"
                  ? `Nếu là GT: ${evaluation.generalEquivalentBand.toFixed(1)}`
                  : `Nếu là Academic: ${evaluation.academicEquivalentBand.toFixed(1)}`}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-4">
              <p className="text-xs font-medium text-[var(--ux-ink-2)]">
                Tốc độ trung bình
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {evaluation.pacingSummary.avgQuestionSec}s
                <span className="ml-1 font-sans text-xs font-normal text-[var(--ux-ink-3)]">
                  / câu
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Tổng {Math.floor(evaluation.pacingSummary.durationSec / 60)}m{" "}
                {evaluation.pacingSummary.durationSec % 60}s
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-4">
              <p className="text-xs font-medium text-[var(--ux-ink-2)]">
                Tra từ 2 nấc (A)
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {evaluation.vocabLookups.step1Count}
                <span className="mx-1 text-sm text-[var(--ux-ink-3)]">/</span>
                {evaluation.vocabLookups.step2Count}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Gợi ý ngữ cảnh / Mở nghĩa
              </p>
            </div>
          </div>

          {/* 4-Cell Evidence-Pinning Matrix */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-[var(--ux-ink)]">
                Ma trận 4 ô Ghim Bằng chứng (Skills × Attitudes)
              </h3>
              <KsaBadge dimension="S" label="S + A Diagnostic" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MATRIX_ORDER.map((item) => {
                const meta = EVIDENCE_CELL_META[item.key];
                const count = evaluation.matrixCounts[item.key];
                return (
                  <div
                    key={item.key}
                    className={cn("rounded-xl border p-3.5", item.softStyle)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn("text-xs font-semibold", item.accentStyle)}
                      >
                        {meta.titleVi}
                      </span>
                      <KsaBadge dimension={meta.ksaTag} label={meta.ksaTag} />
                    </div>
                    <p className="mt-1.5 font-mono text-xl font-semibold text-[var(--ux-ink)]">
                      {count} câu
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--ux-ink-2)]">
                      {meta.shortDescVi}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 p-3.5 text-xs leading-relaxed text-[var(--ux-ink)]">
              <strong className="font-semibold">Kết luận K–S–A:</strong>{" "}
              {evaluation.diagnosticAdviceVi}
            </div>
          </div>

          {/* Pacing Heatmap (A) */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 font-display text-base font-semibold text-[var(--ux-ink)]">
                <Clock className="h-4 w-4 text-[var(--ux-warn)]" />
                Biểu đồ nhiệt Thời gian từng câu (Pacing Heatmap)
              </h3>
              <span className="text-[11px] text-[var(--ux-ink-3)]">
                Mục tiêu &le; 60s/câu · &gt; 90s = Sa lầy (Time Sink)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {evaluation.questions.map((q) => {
                const tierClass =
                  q.pacingTier === "time_sink"
                    ? "border-[var(--ux-danger)]/45 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]"
                    : q.pacingTier === "slow"
                      ? "border-[var(--ux-warn)]/45 bg-[var(--ux-warn-soft)] text-[var(--ux-warn)]"
                      : "border-[var(--ux-mint)]/35 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]";
                return (
                  <button
                    key={q.questionId}
                    type="button"
                    onClick={() => onSelectQuestion?.(q.questionId)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border px-2 py-2 text-center transition-colors hover:brightness-95 cursor-pointer",
                      tierClass
                    )}
                  >
                    <span className="flex items-center gap-1 font-mono text-xs font-semibold">
                      Q{q.number}
                      {q.flagged && <Flag className="h-2.5 w-2.5" />}
                    </span>
                    <span className="font-mono text-[11px]">
                      {q.timeSpentSec}s
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Paraphrase Bridge & 1-Click SRS / Error Log */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg font-semibold">
            Giải thích đáp án, Cầu nối Paraphrase &amp; Nạp SRS / Sổ lỗi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {evaluation.questions.map((q) => {
            const cellMeta = EVIDENCE_CELL_META[q.evidenceCell];
            const isSaved = Boolean(savedCardIds[q.questionId]);
            const isLogged = Boolean(loggedErrorIds[q.questionId]);
            return (
              <div
                key={q.questionId}
                className="space-y-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--ux-ink)]">
                        Q{q.number}
                      </span>
                      <Badge variant="neutral">
                        {QUESTION_TYPE_LABELS_VI[q.type]}
                      </Badge>
                      {q.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ux-mint)]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đúng ({q.userAnswer})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ux-danger)]">
                          <XCircle className="h-3.5 w-3.5" />
                          Chọn: {q.userAnswer || "(Trống)"} · Đáp án:{" "}
                          {q.acceptedAnswers[0]}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ux-line)] bg-[var(--ux-surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--ux-ink-2)]">
                        <Pin className="h-3 w-3" />
                        {cellMeta.titleVi}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--ux-ink)]">
                      {q.promptEn}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectQuestion?.(q.questionId)}
                    className="shrink-0 rounded-lg border border-[var(--ux-line-2)] px-2.5 py-1 font-mono text-[11px] text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] cursor-pointer"
                  >
                    Xem câu gốc ({q.evidenceSentenceIds.join(", ")})
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-[var(--ux-ink-2)]">
                  {q.explanationVi}
                </p>

                {/* Paraphrase Bridge Box */}
                <div className="flex flex-col justify-between gap-3 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-3 sm:flex-row sm:items-center">
                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <KsaBadge dimension="K" label="Paraphrase Bridge" />
                      <span className="text-[11px] text-[var(--ux-ink-3)]">
                        {q.paraphraseBridge.techniqueVi}
                      </span>
                    </div>
                    <p className="font-mono text-[12px] text-[var(--ux-ink)]">
                      {q.paraphraseBridge.questionPhrase}{" "}
                      <span className="text-[var(--ux-accent)]">↔</span>{" "}
                      {q.paraphraseBridge.passagePhrase}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <CopyChipButton
                      text={`${q.paraphraseBridge.questionPhrase} ↔ ${q.paraphraseBridge.passagePhrase}`}
                      label="Chép"
                    />
                    <Button
                      size="sm"
                      variant={isSaved ? "secondary" : "outline"}
                      disabled={isSaved || savingCardId === q.questionId}
                      onClick={() =>
                        handleSaveParaphraseToSrs(
                          q.questionId,
                          q.paraphraseBridge.questionPhrase,
                          `${q.paraphraseBridge.passagePhrase} (${q.paraphraseBridge.techniqueVi})`
                        )
                      }
                    >
                      {isSaved ? (
                        <>
                          <Layers className="h-3.5 w-3.5 text-[var(--ux-mint)]" />
                          Đã lưu SRS ✓
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          Lưu SRS
                        </>
                      )}
                    </Button>

                    {(!q.isCorrect || q.evidenceCell === "lucky_guess") && (
                      <Button
                        size="sm"
                        variant={isLogged ? "secondary" : "outline"}
                        disabled={isLogged || loggingErrorId === q.questionId}
                        onClick={() => handleLogErrorToJournal(q)}
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
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
