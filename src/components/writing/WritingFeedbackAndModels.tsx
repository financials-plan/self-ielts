"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookmarkPlus,
  Check,
  Layers,
  Repeat2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { SafeAiConfigSummary } from "@/lib/db/profileService";
import {
  loadEphemeralByok,
  type EphemeralByokConfig,
} from "@/lib/ai/ephemeralClient";
import { AI_PROVIDERS } from "@/lib/ai/providers";
import {
  CRITERION_LABELS_VI,
  type AcademicVisualSpec,
  type AiWritingFeedback,
  type WritingDraftDelta,
  type WritingLessonContent,
  type WritingOfflineMetrics,
} from "@/lib/writing/writingEngine";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { useToast } from "@/components/lucian/ToastProvider";

export function AcademicDataChart({ spec }: { spec: AcademicVisualSpec }) {
  const maxVal = Math.max(
    10,
    ...spec.series.flatMap((s) => s.values)
  );
  const toneVar: Record<"accent" | "mint" | "warn", string> = {
    accent: "var(--ux-accent)",
    mint: "var(--ux-mint)",
    warn: "var(--ux-warn)",
  };

  return (
    <div className="space-y-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--ux-ink)]">
          {spec.chartTitle}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {spec.series.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: toneVar[s.tone] }}
              />
              <span className="text-[var(--ux-ink-2)]">{s.name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-2">
        {spec.categories.map((cat, catIdx) => (
          <div
            key={cat}
            className="flex flex-col items-center gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3"
          >
            <div className="flex h-36 w-full items-end justify-center gap-2.5 border-b border-[var(--ux-line)] pb-1">
              {spec.series.map((s) => {
                const v = s.values[catIdx] ?? 0;
                const hPct = Math.max(6, Math.round((v / maxVal) * 100));
                return (
                  <div
                    key={s.name}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <span className="font-mono text-[10px] font-semibold text-[var(--ux-ink)]">
                      {v}%
                    </span>
                    <div
                      className="w-full max-w-[26px] rounded-t-md transition-all"
                      style={{
                        height: `${hPct}%`,
                        backgroundColor: toneVar[s.tone],
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <span className="font-mono text-xs font-semibold text-[var(--ux-ink)]">
              {cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface WritingFeedbackAndModelsProps {
  lesson: WritingLessonContent;
  draftId: string;
  version: number;
  essayText: string;
  metrics: WritingOfflineMetrics;
  draftDelta: WritingDraftDelta | null;
  savedAiConfigs: SafeAiConfigSummary[];
  initialAiConsentActive: boolean;
  onStartDraft2: () => void;
}

export function WritingFeedbackAndModels({
  lesson,
  draftId,
  version,
  essayText,
  metrics,
  draftDelta,
  savedAiConfigs,
  initialAiConsentActive,
  onStartDraft2,
}: WritingFeedbackAndModelsProps) {
  const toast = useToast();

  const [ephemeralConfig, setEphemeralConfig] =
    useState<EphemeralByokConfig | null>(null);
  const [aiConsentActive, setAiConsentActive] = useState(
    initialAiConsentActive
  );
  const [inlineConsentTick, setInlineConsentTick] = useState(
    initialAiConsentActive
  );
  const [aiBusy, setAiBusy] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiWritingFeedback | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [modelTab, setModelTab] = useState<"6.5" | "8.0" | "side_by_side">(
    "8.0"
  );
  const [savedCollocations, setSavedCollocations] = useState<
    Record<string, boolean>
  >({});
  const [loggedError, setLoggedError] = useState(false);

  useEffect(() => {
    setEphemeralConfig(loadEphemeralByok());
  }, []);

  const activeSaved = savedAiConfigs[0] ?? null;
  const hasAnyKey = Boolean(ephemeralConfig || activeSaved);

  async function handleRequestAiFeedback() {
    if (!hasAnyKey || aiBusy) return;
    if (!aiConsentActive && !inlineConsentTick) {
      setAiError(
        "Vui lòng tick đồng ý gửi nội dung bài viết sang AI bên thứ ba (Luật BVDLCN 91/2025)."
      );
      return;
    }

    setAiBusy(true);
    setAiError(null);

    try {
      const payload = ephemeralConfig
        ? {
            lessonId: lesson.id,
            draftId,
            essayText,
            storageMode: "ephemeral" as const,
            provider: ephemeralConfig.provider,
            ephemeralApiKey: ephemeralConfig.apiKey,
            ephemeralBaseUrl: ephemeralConfig.baseUrl,
            preferredModel: ephemeralConfig.preferredModel,
            inlineAiConsentConfirmed: inlineConsentTick,
          }
        : {
            lessonId: lesson.id,
            draftId,
            essayText,
            storageMode: "saved" as const,
            provider: activeSaved!.provider,
            preferredModel: activeSaved!.preferredModel,
            inlineAiConsentConfirmed: inlineConsentTick,
          };

      const res = await fetch("/api/writing/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Không thể nhận phản hồi AI lúc này.");
      } else {
        setAiFeedback(data.feedback as AiWritingFeedback);
        if (inlineConsentTick) setAiConsentActive(true);
        toast.success("Đã nhận phân tích & Inline Diff từ AI (BYOK)");
      }
    } catch {
      setAiError(
        "Lỗi kết nối tới dịch vụ AI. Kết quả phân tích NLP Offline 0đ vẫn giữ nguyên."
      );
    } finally {
      setAiBusy(false);
    }
  }

  async function handleSaveCollocation(
    key: string,
    front: string,
    back: string
  ) {
    if (savedCollocations[key]) return;
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "writing",
          cardType: "collocation",
          front,
          back,
        }),
      });
      if (res.ok) {
        setSavedCollocations((prev) => ({ ...prev, [key]: true }));
        toast.success("Đã lưu Collocation nâng Band vào Kho thẻ SRS");
      } else {
        toast.error("Không thể lưu vào SRS");
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu SRS");
    }
  }

  async function handleLogWritingError() {
    if (loggedError) return;
    const code = metrics.recommendedErrorCodes[0] ?? "W_RUBRIC_GAP";
    const dim = code === "W_NO_OVERVIEW_OR_BULLET" ? "S" : "K";
    try {
      const res = await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "writing",
          ksaDimension: dim,
          errorCode: code,
          contextSnippet: `Writing (${lesson.partType} · Draft v${version}): ${metrics.wordCount} từ, Band NLP ${metrics.estimatedBand.toFixed(1)}. Cảnh báo: ${metrics.taskSpecificWarningsVi.slice(0, 2).join(" | ") || "Cần nâng cấp Collocation & câu phức."}`,
          resolutionNote: "Thực hành vòng sửa bài Draft 2 nâng cấp từ lặp và cấu trúc.",
        }),
      });
      if (res.ok) {
        setLoggedError(true);
        toast.success("Đã ghi vào Sổ lỗi K–S–A");
      }
    } catch {
      toast.error("Không thể ghi lỗi lúc này");
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Offline NLP Analyzer Report (0đ Forever) */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="free">Offline NLP Analyzer · 0đ</Badge>
                <Badge variant="K">Bản nháp v{version}</Badge>
              </div>
              <CardTitle className="font-display text-xl font-semibold">
                Chẩn đoán 4 tiêu chí &amp; Đề xuất nâng Band Writing
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loggedError}
                onClick={handleLogWritingError}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--ux-warn)]" />
                {loggedError ? "Đã ghi Sổ lỗi ✓" : "Ghi Sổ lỗi K–S–A"}
              </Button>
              <Button variant="primary" size="sm" onClick={onStartDraft2}>
                <Repeat2 className="h-3.5 w-3.5" />
                Viết nâng cấp Draft {version + 1} (A)
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {draftDelta && (
            <div className="rounded-xl border border-[var(--ux-mint)]/35 bg-[var(--ux-mint-soft)] p-3.5 text-xs text-[var(--ux-ink)]">
              <strong className="font-semibold text-[var(--ux-mint)]">
                Tiến bộ từ Draft 1 → Draft {version}:
              </strong>{" "}
              {draftDelta.summaryVi} (Thay đổi số từ:{" "}
              <span className="font-mono font-semibold">
                {draftDelta.wordCountDelta >= 0 ? "+" : ""}
                {draftDelta.wordCountDelta}
              </span>
              , Câu phức:{" "}
              <span className="font-mono font-semibold">
                {draftDelta.complexSentenceDelta >= 0 ? "+" : ""}
                {draftDelta.complexSentenceDelta}
              </span>
              )
            </div>
          )}

          {/* Metrics Overview */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--ux-accent)]/35 bg-[var(--ux-accent-soft)] p-3.5">
              <p className="text-xs font-semibold text-[var(--ux-accent)]">
                Band NLP ước tính
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.estimatedBand.toFixed(1)}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-2)]">
                4 tiêu chí: TA {metrics.criteria.taskScore} · CC{" "}
                {metrics.criteria.coherenceScore} · LR{" "}
                {metrics.criteria.lexicalScore} · GRA{" "}
                {metrics.criteria.grammarScore}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-3.5">
              <p className="text-xs text-[var(--ux-ink-2)]">Số từ &amp; Đoạn</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.wordCount}
                <span className="ml-1 font-sans text-xs font-normal text-[var(--ux-ink-3)]">
                  / &ge;{metrics.minWords} từ
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                {metrics.paragraphCount} đoạn · ~{metrics.avgWordsPerSentence}{" "}
                từ/câu
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-3.5">
              <p className="text-xs text-[var(--ux-ink-2)]">Câu phức (GRA)</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.complexSentenceCount}{" "}
                <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
                  ({metrics.complexRatioPct}%)
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Từ nối mạch lạc: {metrics.cohesiveMarkersFound.length}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-3.5">
              <p className="text-xs text-[var(--ux-ink-2)]">Từ lặp (&ge;4x)</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.repeatedWords.length}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                {metrics.repeatedWords.length > 0
                  ? metrics.repeatedWords.map((r) => r.word).join(", ")
                  : "Từ vựng phân bổ tốt"}
              </p>
            </div>
          </div>

          {metrics.taskSpecificWarningsVi.length > 0 && (
            <div className="space-y-1.5 rounded-xl border border-[var(--ux-warn)]/40 bg-[var(--ux-warn-soft)] p-4 text-xs">
              <p className="font-semibold text-[var(--ux-warn)]">
                Điểm cần chỉnh sửa trước khi viết Draft {version + 1}:
              </p>
              <ul className="list-inside list-disc space-y-1 text-[var(--ux-ink)]">
                {metrics.taskSpecificWarningsVi.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Optional Free BYOK AI Examiner & Inline Diff (Luật AI 134/2025 + Luật 91/2025) */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Badge variant="K" className="mb-1.5">
                <Sparkles className="h-3 w-3" />
                Tùy chọn AI Coach (Hybrid BYOK · 0đ)
              </Badge>
              <CardTitle className="font-display text-lg font-semibold">
                Nhận xét 4 tiêu chí &amp; Inline Diff nâng Band từ khóa miễn phí
              </CardTitle>
            </div>

            {hasAnyKey ? (
              <Button
                variant="primary"
                size="sm"
                disabled={aiBusy}
                onClick={handleRequestAiFeedback}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {aiBusy
                  ? "Đang gửi AI phân tích..."
                  : `Chấm bằng ${ephemeralConfig ? `${AI_PROVIDERS[ephemeralConfig.provider].name} (Phiên)` : AI_PROVIDERS[activeSaved!.provider].name}`}
              </Button>
            ) : (
              <Link
                href="/settings"
                className="inline-flex h-8 items-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
              >
                Gắn Gemini / Groq Free (0đ)
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl border border-[var(--ux-warn)]/30 bg-[var(--ksa-a-soft)] p-3 text-xs text-[var(--ux-ink-2)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ux-warn)]" />
            <p>
              <strong className="text-[var(--ux-ink)]">
                Minh bạch AI (Luật AI 134/2025/QH15):
              </strong>{" "}
              Bạn hoàn toàn không cần API Key vẫn luyện Writing trọn vẹn. Nếu
              chọn gửi AI chấm sâu, phản hồi luôn gắn nhãn AI tham khảo và chỉ
              gửi sau khi bạn xác nhận đồng ý.
            </p>
          </div>

          {hasAnyKey && !aiConsentActive && (
            <label
              htmlFor="writing-ai-consent"
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface-2)]/50 p-3 text-xs"
            >
              <input
                id="writing-ai-consent"
                type="checkbox"
                checked={inlineConsentTick}
                onChange={(e) => setInlineConsentTick(e.target.checked)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border ${
                  inlineConsentTick
                    ? "border-[var(--ux-accent)] bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                    : "border-[var(--ux-line-2)] bg-[var(--ux-surface)]"
                }`}
              >
                {inlineConsentTick && <Check className="h-3 w-3 stroke-[3]" />}
              </span>
              <span className="text-[var(--ux-ink-2)]">
                Tôi đồng ý gửi bài viết này sang nhà cung cấp AI bên thứ ba đã
                cấu hình theo{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[var(--ux-accent)] underline"
                >
                  Chính sách BVDLCN 91/2025
                </Link>
                .
              </span>
            </label>
          )}

          {aiError && (
            <p className="rounded-lg border border-[var(--ux-danger)]/35 bg-[var(--ux-danger-soft)] px-3.5 py-2 text-xs text-[var(--ux-danger)]">
              {aiError}
            </p>
          )}

          {aiFeedback && (
            <div className="space-y-4 rounded-xl border border-[var(--ux-accent)]/35 bg-[var(--ux-surface-2)]/40 p-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="K">{aiFeedback.aiGeneratedNoticeVi}</Badge>
                <span className="font-mono text-sm font-semibold text-[var(--ux-accent)]">
                  AI Band: {aiFeedback.estimatedBand.toFixed(1)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3">
                  <p className="font-semibold text-[var(--ux-ink)]">TA / TR</p>
                  <p className="mt-1 text-[var(--ux-ink-2)]">
                    {aiFeedback.criteriaNotes.taTrVi}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3">
                  <p className="font-semibold text-[var(--ux-ink)]">
                    Coherence &amp; Cohesion
                  </p>
                  <p className="mt-1 text-[var(--ux-ink-2)]">
                    {aiFeedback.criteriaNotes.ccVi}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3">
                  <p className="font-semibold text-[var(--ux-ink)]">
                    Lexical Resource
                  </p>
                  <p className="mt-1 text-[var(--ux-ink-2)]">
                    {aiFeedback.criteriaNotes.lrVi}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3">
                  <p className="font-semibold text-[var(--ux-ink)]">Grammar</p>
                  <p className="mt-1 text-[var(--ux-ink-2)]">
                    {aiFeedback.criteriaNotes.graVi}
                  </p>
                </div>
              </div>

              {/* Inline Diff Cards */}
              <div className="space-y-2.5">
                <p className="font-semibold text-[var(--ux-ink)]">
                  Inline Diff gợi ý nâng cấp câu (Áp dụng ngay vào Draft{" "}
                  {version + 1}):
                </p>
                {aiFeedback.inlineDiffs.map((diff, idx) => (
                  <div
                    key={idx}
                    className="space-y-1.5 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3"
                  >
                    <Badge variant="neutral">
                      {CRITERION_LABELS_VI[diff.criterion]}
                    </Badge>
                    <p className="rounded bg-[var(--ux-danger-soft)] px-2 py-1 font-mono text-[11px] text-[var(--ux-danger)] line-through">
                      - {diff.originalSnippet}
                    </p>
                    <p className="rounded bg-[var(--ux-mint-soft)] px-2 py-1 font-mono text-[11px] font-medium text-[var(--ux-mint)]">
                      + {diff.upgradedSnippet}
                    </p>
                    <p className="text-[var(--ux-ink-2)]">{diff.reasonVi}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Band 6.5 vs Band 8.0 Annotated Model Comparison (K) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <KsaBadge
                dimension="K"
                label="Bài mẫu đối chiếu 4 tiêu chí (Offline 0đ)"
              />
              <CardTitle className="mt-1.5 font-display text-lg font-semibold">
                So sánh Band 6.5 vs Band 8.0 &amp; Lưu Collocation vào SRS
              </CardTitle>
            </div>

            <SlidingPillTabs
              size="sm"
              ariaLabel="Chọn chế độ xem bài mẫu Writing"
              value={modelTab}
              onChange={setModelTab}
              options={[
                { value: "8.0", label: "Band 8.0" },
                { value: "6.5", label: "Band 6.5" },
                { value: "side_by_side", label: "Đối chiếu 2 cột" },
              ]}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div
            className={
              modelTab === "side_by_side" ? "grid gap-4 lg:grid-cols-2" : ""
            }
          >
            {(modelTab === "6.5" || modelTab === "side_by_side") && (
              <div className="space-y-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="A">Bài mẫu Band 6.5 (Vững ý, từ vựng phổ thông)</Badge>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ux-ink)]">
                  {lesson.modelComparison.band65.essayEn}
                </p>
                <div className="space-y-1 border-t border-[var(--ux-line)] pt-2.5 text-xs">
                  {lesson.modelComparison.band65.annotationsVi.map((ann, i) => (
                    <p key={i} className="text-[var(--ux-ink-2)]">
                      <strong className="text-[var(--ux-ink)]">
                        {CRITERION_LABELS_VI[ann.criterion]}:
                      </strong>{" "}
                      {ann.noteVi}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {(modelTab === "8.0" || modelTab === "side_by_side") && (
              <div className="space-y-3 rounded-xl border border-[var(--ux-mint)]/35 bg-[var(--ux-mint-soft)]/20 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="S">Bài mẫu Band 8.0 (Collocation &amp; Cấu trúc tinh gọn)</Badge>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ux-ink)]">
                  {lesson.modelComparison.band80.essayEn}
                </p>
                <div className="space-y-1 border-t border-[var(--ux-line)] pt-2.5 text-xs">
                  {lesson.modelComparison.band80.annotationsVi.map((ann, i) => (
                    <p key={i} className="text-[var(--ux-ink-2)]">
                      <strong className="text-[var(--ux-ink)]">
                        {CRITERION_LABELS_VI[ann.criterion]}:
                      </strong>{" "}
                      {ann.noteVi}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Collocations to SRS */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[var(--ux-ink)]">
              Cụm nâng Band 8.0 (Bấm lưu vào Knowledge Vault SRS):
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {lesson.modelComparison.band80.upgradeCollocations.map(
                (col, idx) => {
                  const k = `col-${idx}`;
                  const saved = Boolean(savedCollocations[k]);
                  return (
                    <div
                      key={k}
                      className="flex flex-col justify-between gap-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3.5 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="text-[var(--ux-ink-3)] line-through">
                          {col.basicEn}
                        </p>
                        <p className="font-mono font-semibold text-[var(--ux-accent)]">
                          {col.upgradedEn}
                        </p>
                        <p className="text-[var(--ux-ink-2)]">{col.usageVi}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={saved ? "secondary" : "outline"}
                        disabled={saved}
                        onClick={() =>
                          handleSaveCollocation(
                            k,
                            `Thay cho "${col.basicEn}" ở ${lesson.partType}: ?`,
                            `${col.upgradedEn} — ${col.usageVi}`
                          )
                        }
                      >
                        {saved ? (
                          <>
                            <Layers className="h-3.5 w-3.5 text-[var(--ux-mint)]" />
                            Đã lưu SRS ✓
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="h-3.5 w-3.5" />
                            Lưu Collocation vào SRS
                          </>
                        )}
                      </Button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
