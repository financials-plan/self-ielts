"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookmarkPlus,
  Check,
  Layers,
  Play,
  Repeat2,
  ShieldAlert,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { SafeAiConfigSummary } from "@/lib/db/profileService";
import {
  loadEphemeralByok,
  type EphemeralByokConfig,
} from "@/lib/ai/ephemeralClient";
import { AI_PROVIDERS } from "@/lib/ai/providers";
import {
  blobToBase64,
  loadAudioBlobLocal,
} from "@/lib/speaking/browserAudioStore";
import {
  SPEAKING_CRITERION_LABELS_VI,
  type AiSpeakingFeedback,
  type SpeakingCuePrompt,
  type SpeakingFluencyMetrics,
  type SpeakingImprovementDelta,
  type SpeakingLessonContent,
} from "@/lib/speaking/speakingEngine";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/lucian/ToastProvider";

interface SpeakingFeedbackPanelProps {
  lesson: SpeakingLessonContent;
  prompt: SpeakingCuePrompt;
  recordingId: string;
  attemptNumber: number;
  storageKey: string;
  transcript: string;
  metrics: SpeakingFluencyMetrics;
  improvementDelta: SpeakingImprovementDelta | null;
  savedAiConfigs: SafeAiConfigSummary[];
  initialAiConsentActive: boolean;
  onRerecordAttempt2: () => void;
}

export function SpeakingFeedbackPanel({
  lesson,
  prompt,
  recordingId,
  attemptNumber,
  storageKey,
  transcript,
  metrics,
  improvementDelta,
  savedAiConfigs,
  initialAiConsentActive,
  onRerecordAttempt2,
}: SpeakingFeedbackPanelProps) {
  const toast = useToast();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [localBlob, setLocalBlob] = useState<Blob | null>(null);
  const [ephemeralConfig, setEphemeralConfig] =
    useState<EphemeralByokConfig | null>(null);
  const [aiConsentActive, setAiConsentActive] = useState(
    initialAiConsentActive
  );
  const [inlineConsentTick, setInlineConsentTick] = useState(
    initialAiConsentActive
  );
  const [aiBusy, setAiBusy] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiSpeakingFeedback | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [savedPhrases, setSavedPhrases] = useState<Record<string, boolean>>({});
  const [loggedError, setLoggedError] = useState(false);

  useEffect(() => {
    setEphemeralConfig(loadEphemeralByok());
  }, []);

  useEffect(() => {
    let createdUrl: string | null = null;
    if (storageKey.startsWith("http")) {
      setAudioUrl(storageKey);
      return;
    }
    if (storageKey.startsWith("idb:")) {
      void loadAudioBlobLocal(storageKey).then((blob) => {
        if (blob) {
          setLocalBlob(blob);
          createdUrl = URL.createObjectURL(blob);
          setAudioUrl(createdUrl);
        }
      });
    }
    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [storageKey]);

  const activeSaved = savedAiConfigs[0] ?? null;
  const hasAnyKey = Boolean(ephemeralConfig || activeSaved);

  async function handleRunAiSpeakingCoach() {
    if (!hasAnyKey || aiBusy) return;
    if (!aiConsentActive && !inlineConsentTick) {
      setAiError(
        "Vui lòng tick đồng ý gửi giọng nói / transcript sang AI bên thứ ba (Luật BVDLCN 91/2025)."
      );
      return;
    }

    setAiBusy(true);
    setAiError(null);

    try {
      let audioBase64: string | undefined;
      let audioMimeType: string | undefined;
      if (localBlob && localBlob.size > 0 && localBlob.size <= 2_400_000) {
        audioBase64 = await blobToBase64(localBlob);
        audioMimeType = localBlob.type || "audio/webm";
      }

      const payload = ephemeralConfig
        ? {
            lessonId: lesson.id,
            recordingId,
            partNumber: lesson.partNumber,
            transcript: transcript || undefined,
            audioBase64,
            audioMimeType,
            storageMode: "ephemeral" as const,
            provider: ephemeralConfig.provider,
            ephemeralApiKey: ephemeralConfig.apiKey,
            ephemeralBaseUrl: ephemeralConfig.baseUrl,
            preferredModel: ephemeralConfig.preferredModel,
            inlineAiConsentConfirmed: inlineConsentTick,
          }
        : {
            lessonId: lesson.id,
            recordingId,
            partNumber: lesson.partNumber,
            transcript: transcript || undefined,
            audioBase64,
            audioMimeType,
            storageMode: "saved" as const,
            provider: activeSaved!.provider,
            preferredModel: activeSaved!.preferredModel,
            inlineAiConsentConfirmed: inlineConsentTick,
          };

      const res = await fetch("/api/speaking/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Không thể chấm AI lúc này.");
      } else {
        setAiFeedback(data.feedback as AiSpeakingFeedback);
        if (inlineConsentTick) setAiConsentActive(true);
        toast.success("Đã nhận phân tích Speaking từ AI (BYOK)");
      }
    } catch {
      setAiError(
        "Lỗi kết nối tới dịch vụ AI. Phân tích WPM & khoảng lặng Offline 0đ vẫn giữ nguyên."
      );
    } finally {
      setAiBusy(false);
    }
  }

  async function handleSavePhraseToSrs(
    key: string,
    basicEn: string,
    naturalEn: string,
    noteVi: string
  ) {
    if (savedPhrases[key]) return;
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "speaking",
          cardType: "phrase",
          front: `Speaking Part ${lesson.partNumber} · Thay cho "${basicEn}": ?`,
          back: `${naturalEn} — ${noteVi}`,
        }),
      });
      if (res.ok) {
        setSavedPhrases((prev) => ({ ...prev, [key]: true }));
        toast.success("Đã lưu cụm nói tự nhiên vào Kho thẻ SRS");
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu SRS");
    }
  }

  async function handleLogSpeakingError() {
    if (loggedError) return;
    const code = metrics.recommendedErrorCodes[0] ?? "S_VOCAB_FREEZE";
    const dim =
      code === "S_SPEAKING_ANXIETY"
        ? "A"
        : code === "S_VOCAB_FREEZE"
          ? "S"
          : "K";
    try {
      const res = await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "speaking",
          ksaDimension: dim,
          errorCode: code,
          contextSnippet: `Speaking Part ${lesson.partNumber} (Lần thu ${attemptNumber}): ${metrics.wpm} WPM, ${metrics.hesitationCount} khoảng lặng >=1.5s, Band Offline ${metrics.estimatedBand.toFixed(1)}.`,
          resolutionNote: metrics.diagnosticAdviceVi,
        }),
      });
      if (res.ok) {
        setLoggedError(true);
        toast.success("Đã ghi vào Sổ lỗi K–S–A");
      }
    } catch {
      toast.error("Không thể ghi lỗi vào Sổ lỗi");
    }
  }

  const pacingLabel =
    metrics.pacingTier === "natural_band7"
      ? "Nhịp chuẩn Band 7+"
      : metrics.pacingTier === "too_slow"
        ? "Hơi chậm (<95 WPM)"
        : "Hơi nhanh (>165 WPM)";

  return (
    <div className="space-y-6">
      {/* 1. Offline Web Audio Fluency & Waveform Telemetry */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="free">Offline Web Audio · 0đ</Badge>
                <Badge variant="K">Lượt thu #{attemptNumber}</Badge>
                <Badge variant="neutral">
                  {storageKey.startsWith("http")
                    ? "Đã đồng bộ Vercel Blob Free"
                    : storageKey.startsWith("idb:")
                      ? "Lưu cục bộ IndexedDB (0đ)"
                      : "Chế độ mô phỏng / Transcript"}
                </Badge>
              </div>
              <CardTitle className="font-display text-xl font-semibold">
                Chỉ số Trôi chảy (WPM), Khoảng lặng &amp; Re-record
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loggedError}
                onClick={handleLogSpeakingError}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--ux-warn)]" />
                {loggedError ? "Đã ghi Sổ lỗi ✓" : "Ghi Sổ lỗi K–S–A"}
              </Button>
              <Button variant="primary" size="sm" onClick={onRerecordAttempt2}>
                <Repeat2 className="h-3.5 w-3.5" />
                Thu lại Bản {attemptNumber + 1} (Nâng Band)
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {improvementDelta && (
            <div className="rounded-xl border border-[var(--ux-mint)]/35 bg-[var(--ux-mint-soft)] p-3.5 text-xs text-[var(--ux-ink)]">
              <strong className="font-semibold text-[var(--ux-mint)]">
                So sánh Lượt 1 → Lượt {attemptNumber}:
              </strong>{" "}
              {improvementDelta.summaryVi}
            </div>
          )}

          {/* Audio Playback + Waveform Envelope */}
          {audioUrl && (
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3.5 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-ink)]">
                <Volume2 className="h-4 w-4 text-[var(--ux-accent)]" />
                Nghe lại bản thu #{attemptNumber}:
              </div>
              <audio controls src={audioUrl} className="h-9 flex-1" />
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ux-ink)]">
                Biểu đồ sóng âm (Waveform Envelope)
              </span>
              <span className="font-mono text-[11px] text-[var(--ux-ink-2)]">
                Tỷ lệ phát âm: {metrics.voicedRatioPct}%
              </span>
            </div>
            <div className="flex h-16 items-end gap-1 pt-2">
              {metrics.waveformBars.map((bar, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t-sm bg-[var(--ux-accent)]/80"
                  style={{ height: `${bar}%` }}
                />
              ))}
            </div>
          </div>

          {/* 4 Metric Tiles */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--ux-accent)]/35 bg-[var(--ux-accent-soft)] p-3.5">
              <p className="text-xs font-semibold text-[var(--ux-accent)]">
                Band Offline ước tính
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.estimatedBand.toFixed(1)}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-2)]">
                FC {metrics.criteria.fluencyScore} · LR{" "}
                {metrics.criteria.lexicalScore} · GRA{" "}
                {metrics.criteria.grammarScore} · Pron{" "}
                {metrics.criteria.pronunciationScore}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-3.5">
              <p className="text-xs text-[var(--ux-ink-2)]">Tốc độ nói (WPM)</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.wpm}
                <span className="ml-1 font-sans text-xs font-normal text-[var(--ux-ink-3)]">
                  WPM
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-2)]">
                {pacingLabel} ({metrics.wordCount} từ)
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-3.5">
              <p className="text-xs text-[var(--ux-ink-2)]">
                Khoảng lặng &ge; 1.5s
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.hesitationCount} lần
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Lâu nhất: {(metrics.longestPauseMs / 1000).toFixed(1)}s
              </p>
            </div>

            <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 p-3.5">
              <p className="text-xs text-[var(--ux-ink-2)]">
                Fillers / Discourse
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
                {metrics.fillersFound.length} /{" "}
                {metrics.discourseMarkersFound.length}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ux-ink-3)]">
                Từ đệm ngập ngừng / Từ nối hay
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 p-3.5 text-xs text-[var(--ux-ink)]">
            <strong className="font-semibold">Kết luận K–S–A:</strong>{" "}
            {metrics.diagnosticAdviceVi}
          </div>
        </CardContent>
      </Card>

      {/* 2. Optional Free BYOK AI Speaking Examiner (Gemini Audio / Groq Whisper+Llama) */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Badge variant="K" className="mb-1.5">
                <Sparkles className="h-3 w-3" />
                Tùy chọn AI Speaking Coach (Gemini Audio / Groq Whisper · 0đ)
              </Badge>
              <CardTitle className="font-display text-lg font-semibold">
                Chấm phát âm &amp; Chép lời tự động bằng API Key miễn phí
              </CardTitle>
            </div>

            {hasAnyKey ? (
              <Button
                variant="primary"
                size="sm"
                disabled={aiBusy}
                onClick={handleRunAiSpeakingCoach}
              >
                <Play className="h-3.5 w-3.5" />
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
              Bản ghi mặc định nằm 100% ở trình duyệt (IndexedDB). Chỉ khi bạn
              bấm nút chấm AI và đồng ý rõ ràng, audio/transcript mới được gửi
              sang Gemini hoặc Groq Whisper để tham khảo tự học.
            </p>
          </div>

          {hasAnyKey && !aiConsentActive && (
            <label
              htmlFor="speaking-ai-consent"
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface-2)]/50 p-3 text-xs"
            >
              <input
                id="speaking-ai-consent"
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
                Tôi đồng ý gửi bản ghi âm / transcript Speaking sang nhà cung cấp
                AI bên thứ ba theo{" "}
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

              {aiFeedback.transcript && (
                <div className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3">
                  <p className="font-semibold text-[var(--ux-ink)]">
                    Transcript ghi nhận từ AI:
                  </p>
                  <p className="mt-1 italic text-[var(--ux-ink-2)]">
                    &ldquo;{aiFeedback.transcript}&rdquo;
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["FC", aiFeedback.criteriaNotes.fcVi],
                    ["LR", aiFeedback.criteriaNotes.lrVi],
                    ["GRA", aiFeedback.criteriaNotes.graVi],
                    ["PRON", aiFeedback.criteriaNotes.pronVi],
                  ] as const
                ).map(([crit, text]) => (
                  <div
                    key={crit}
                    className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3"
                  >
                    <p className="font-semibold text-[var(--ux-ink)]">
                      {SPEAKING_CRITERION_LABELS_VI[crit]}
                    </p>
                    <p className="mt-1 text-[var(--ux-ink-2)]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Band 8.0 Spoken Model & 1-Click Phrase Saver to SRS */}
      <Card>
        <CardHeader>
          <KsaBadge dimension="K" label="Câu trả lời mẫu Band 8.0 & Cụm tự nhiên" />
          <CardTitle className="mt-1 font-display text-lg font-semibold">
            Tham khảo Band 8.0 &amp; Lưu cụm diễn đạt vào SRS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-xl border border-[var(--ux-mint)]/35 bg-[var(--ux-mint-soft)]/25 p-4 text-sm leading-relaxed text-[var(--ux-ink)]">
            {prompt.modelBand80En}
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {prompt.upgradePhrases.map((p, idx) => {
              const k = `phr-${idx}`;
              const saved = Boolean(savedPhrases[k]);
              return (
                <div
                  key={k}
                  className="flex flex-col justify-between gap-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-3.5 text-xs"
                >
                  <div className="space-y-1">
                    <p className="text-[var(--ux-ink-3)] line-through">
                      {p.basicEn}
                    </p>
                    <p className="font-mono font-semibold text-[var(--ux-accent)]">
                      {p.naturalEn}
                    </p>
                    <p className="text-[var(--ux-ink-2)]">{p.noteVi}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={saved ? "secondary" : "outline"}
                    disabled={saved}
                    onClick={() =>
                      handleSavePhraseToSrs(
                        k,
                        p.basicEn,
                        p.naturalEn,
                        p.noteVi
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
                        Lưu cụm vào SRS
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
