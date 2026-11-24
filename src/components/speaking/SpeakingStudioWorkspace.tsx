"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Headphones,
  HeartPulse,
  LifeBuoy,
  Mic,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";
import type { SafeAiConfigSummary } from "@/lib/db/profileService";
import type { SpeakingAttemptDetail } from "@/lib/db/speakingService";
import {
  speakListeningSegment,
  stopSpeechPlayback,
} from "@/lib/listening/speechPlayer";
import {
  pickSupportedAudioMime,
  saveAudioBlobLocal,
} from "@/lib/speaking/browserAudioStore";
import {
  type SpeakingCuePrompt,
  type SpeakingFluencyMetrics,
  type SpeakingImprovementDelta,
  type SpeakingLessonContent,
  type SpeakingMode,
} from "@/lib/speaking/speakingEngine";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { useToast } from "@/components/lucian/ToastProvider";
import { SpeakingFeedbackPanel } from "./SpeakingFeedbackPanel";
import { cn } from "@/lib/utils";

interface SpeakingStudioWorkspaceProps {
  lesson: SpeakingLessonContent;
  initialMode: SpeakingMode;
  recentAttempts: SpeakingAttemptDetail[];
  savedAiConfigs: SafeAiConfigSummary[];
  initialAiConsentActive: boolean;
}

interface SubmittedRecordingState {
  attemptId: string;
  recordingId: string;
  attemptNumber: number;
  storageKey: string;
  transcript: string;
  metrics: SpeakingFluencyMetrics;
  improvementDelta: SpeakingImprovementDelta | null;
}

function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SpeakingStudioWorkspace({
  lesson,
  initialMode,
  recentAttempts,
  savedAiConfigs,
  initialAiConsentActive,
}: SpeakingStudioWorkspaceProps) {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<SpeakingMode>(initialMode);
  const [promptIdx, setPromptIdx] = useState(0);
  const activePrompt: SpeakingCuePrompt =
    lesson.prompts[promptIdx] ?? lesson.prompts[0];

  const [playingLineId, setPlayingLineId] = useState<string | null>(null);
  const [anxietyBefore, setAnxietyBefore] = useState<number>(3);
  const [scratchpad, setScratchpad] = useState("");
  const [prepRunning, setPrepRunning] = useState(false);
  const [prepRemaining, setPrepRemaining] = useState<number>(
    activePrompt.prepSeconds
  );
  const [showRescue, setShowRescue] = useState(false);

  // Recorder & Web Audio RMS telemetry
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsedMs, setRecordElapsedMs] = useState(0);
  const [liveRmsPct, setLiveRmsPct] = useState(0);
  const [manualTranscript, setManualTranscript] = useState("");
  const [micUnavailableNote, setMicUnavailableNote] = useState<string | null>(
    null
  );

  const [activeAttemptId, setActiveAttemptId] = useState<string | undefined>(
    undefined
  );
  const [nextAttemptNumber, setNextAttemptNumber] = useState(1);
  const [submitStatus, setSubmitStatus] = useState<MorphStatus>("idle");
  const [submitted, setSubmitted] = useState<SubmittedRecordingState | null>(
    null
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rmsSamplesRef = useRef<number[]>([]);
  const sampleTimerRef = useRef<number | null>(null);
  const recordStartRef = useRef<number>(0);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrepRemaining(activePrompt.prepSeconds);
    setPrepRunning(false);
  }, [activePrompt]);

  useEffect(() => {
    if (!prepRunning) return;
    const t = window.setInterval(() => {
      setPrepRemaining((p) => {
        if (p <= 1) {
          setPrepRunning(false);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [prepRunning]);

  const cleanupCaptureResources = () => {
    if (sampleTimerRef.current !== null) {
      window.clearInterval(sampleTimerRef.current);
      sampleTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopSpeechPlayback();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      cleanupCaptureResources();
    };
  }, []);

  async function finalizeRecordingAndSubmit(
    blob: Blob | null,
    durationMs: number,
    rmsSamples: number[]
  ) {
    setSubmitStatus("loading");
    let storageKey = `transcript-only:${Date.now()}`;
    let sizeBytes = 0;

    if (blob && blob.size > 0) {
      sizeBytes = blob.size;
      const localKey = `idb:speak-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await saveAudioBlobLocal(localKey, blob);
      storageKey = localKey;

      // Optional Vercel Blob Free upload if BLOB_READ_WRITE_TOKEN is active
      try {
        const fd = new FormData();
        fd.append(
          "file",
          new File([blob], "speaking.webm", {
            type: blob.type || "audio/webm",
          })
        );
        const blobRes = await fetch("/api/speaking/blob", {
          method: "POST",
          body: fd,
        });
        if (blobRes.ok) {
          const blobJson = (await blobRes.json()) as {
            uploaded?: boolean;
            url?: string;
          };
          if (blobJson.uploaded && blobJson.url) {
            storageKey = blobJson.url;
          }
        }
      } catch {
        // Keep local IndexedDB key silently on offline/unconfigured environments
      }
    }

    try {
      const res = await fetch("/api/speaking/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          attemptId: activeAttemptId,
          partNumber: lesson.partNumber,
          mode,
          storageKey,
          sizeBytes,
          durationMs: Math.max(1000, Math.round(durationMs)),
          anxietyBefore,
          confidenceBefore: Math.max(1, 6 - anxietyBefore),
          transcript: manualTranscript.trim() || undefined,
          rmsSamples: rmsSamples.slice(0, 6000),
          sampleIntervalMs: 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitStatus("error");
        toast.error(data.error || "Không thể lưu kết quả Speaking.");
        return;
      }

      setSubmitStatus("done");
      setSubmitted({
        attemptId: data.attemptId,
        recordingId: data.recordingId,
        attemptNumber: data.attemptNumber,
        storageKey,
        transcript: manualTranscript.trim(),
        metrics: data.fluencyMetrics as SpeakingFluencyMetrics,
        improvementDelta:
          (data.improvementDelta as SpeakingImprovementDelta | null) ?? null,
      });
      toast.success(
        `Đã phân tích Lượt #${data.attemptNumber} (${data.fluencyMetrics.wpm} WPM)`,
        `Band Speaking ước tính: ${data.fluencyMetrics.estimatedBand.toFixed(1)}`
      );
      router.refresh();
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch {
      setSubmitStatus("error");
      toast.error("Lỗi kết nối khi phân tích bài nói.");
    }
  }

  async function handleStartMicRecording() {
    if (isRecording || submitted) return;
    setMicUnavailableNote(null);

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMicUnavailableNote(
        "Trình duyệt hiện tại không hỗ trợ thu âm trực tiếp. Hãy gõ câu trả lời vào khung Transcript bên dưới để vẫn chấm WPM và nhận phản hồi đầy đủ."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedAudioMime();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 24000,
      });

      chunksRef.current = [];
      rmsSamplesRef.current = [];
      recordStartRef.current = Date.now();
      setRecordElapsedMs(0);

      // Web Audio AnalyserNode for offline RMS + >1.5s silence detector
      const AudioCtx = window.AudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const timeData = new Float32Array(analyser.fftSize);

        sampleTimerRef.current = window.setInterval(() => {
          analyser.getFloatTimeDomainData(timeData);
          let sumSq = 0;
          for (let i = 0; i < timeData.length; i++) {
            sumSq += timeData[i] * timeData[i];
          }
          const rms = Math.sqrt(sumSq / timeData.length);
          rmsSamplesRef.current.push(Number(rms.toFixed(4)));
          setLiveRmsPct(Math.min(100, Math.round(rms * 420)));
          setRecordElapsedMs(Date.now() - recordStartRef.current);
        }, 100);
      } else {
        sampleTimerRef.current = window.setInterval(() => {
          rmsSamplesRef.current.push(0.05);
          setRecordElapsedMs(Date.now() - recordStartRef.current);
        }, 100);
      }

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        const elapsed = Math.max(1200, Date.now() - recordStartRef.current);
        const finalBlob = new Blob(chunksRef.current, { type: mimeType });
        const samplesCopy = [...rmsSamplesRef.current];
        cleanupCaptureResources();
        setIsRecording(false);
        setLiveRmsPct(0);
        void finalizeRecordingAndSubmit(finalBlob, elapsed, samplesCopy);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
    } catch {
      cleanupCaptureResources();
      setMicUnavailableNote(
        "Không truy cập được Micro (hoặc chưa cấp quyền). Bạn vẫn có thể gõ câu trả lời vào ô Transcript bên dưới để luyện tập và chấm điểm."
      );
    }
  }

  function handleStopMicRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }

  async function handleSubmitTranscriptFallback() {
    const words = manualTranscript.trim().split(/\s+/).filter(Boolean).length;
    if (words < 5) {
      toast.info("Hãy nhập ít nhất 5 từ tiếng Anh để phân tích Speaking.");
      return;
    }
    const simulatedDurationMs = Math.max(4000, Math.round((words / 125) * 60_000));
    const frameCount = Math.max(10, Math.round(simulatedDurationMs / 100));
    const samples = Array.from({ length: frameCount }, (_, i) =>
      i % 9 === 0 ? 0.01 : 0.06
    );
    await finalizeRecordingAndSubmit(null, simulatedDurationMs, samples);
  }

  function handleRerecordAttempt2() {
    if (!submitted) return;
    setActiveAttemptId(submitted.attemptId);
    setNextAttemptNumber(submitted.attemptNumber + 1);
    setSubmitted(null);
    setSubmitStatus("idle");
    setRecordElapsedMs(0);
    setMode("cue_drill");
    toast.info(
      `Sẵn sàng Thu lại Bản ${submitted.attemptNumber + 1}`,
      "Thử áp dụng 1 cụm nâng Band và nói trôi chảy không dừng quá 1.5 giây."
    );
  }

  function handleResetNew() {
    setActiveAttemptId(undefined);
    setNextAttemptNumber(1);
    setSubmitted(null);
    setSubmitStatus("idle");
    setManualTranscript("");
    setScratchpad("");
    setRecordElapsedMs(0);
  }

  const speakSecProgress = Math.min(
    100,
    Math.round((recordElapsedMs / 1000 / activePrompt.speakSeconds) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/speaking"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ux-line-2)] px-2.5 text-xs font-medium text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Thư viện Speaking
            </Link>
            <Badge variant="K">{lesson.partType}</Badge>
            {nextAttemptNumber >= 2 && (
              <Badge variant="S">Đang thu lại Bản {nextAttemptNumber}</Badge>
            )}
          </div>

          <SlidingPillTabs
            size="sm"
            ariaLabel="Chọn chế độ luyện Speaking"
            disabled={isRecording}
            value={mode}
            onChange={setMode}
            options={[
              { value: "shadowing", label: "Shadowing Lab (K)" },
              { value: "cue_drill", label: "Nháp 60s & Tập nói (S)" },
              { value: "mock_exam", label: "Mock Examiner (A)" },
            ]}
          />
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[var(--ux-line)] pt-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-xl font-semibold text-[var(--ux-ink)] sm:text-2xl">
              {lesson.title}
            </h1>
            <p className="text-xs text-[var(--ux-ink-2)]">{lesson.subtitleVi}</p>
          </div>

          {/* Anxiety Tracker Selector (A) */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 px-3 py-2 text-xs">
            <HeartPulse className="h-3.5 w-3.5 text-[var(--ux-warn)]" />
            <span className="font-medium text-[var(--ux-ink-2)]">
              Độ hồi hộp (1–5):
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  disabled={isRecording || Boolean(submitted)}
                  onClick={() => setAnxietyBefore(lvl)}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-md font-mono text-xs font-semibold cursor-pointer",
                    anxietyBefore === lvl
                      ? "bg-[var(--ux-warn)] text-[var(--ux-warn-ink)]"
                      : "bg-[var(--ux-surface)] text-[var(--ux-ink-2)]"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mode 1: SHADOWING LAB (K) */}
      {mode === "shadowing" && (
        <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <KsaBadge dimension="K" label="Shadowing Lab · Trọng âm & Ngắt cụm (/)" />
              <h2 className="mt-1.5 font-display text-lg font-semibold text-[var(--ux-ink)]">
                Nghe và nhại theo từng câu mẫu (0.85x → 1.0x)
              </h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMode("cue_drill")}
            >
              Chuyển sang Tập nói Cue Card →
            </Button>
          </div>

          <div className="space-y-3">
            {lesson.shadowingLines.map((line) => {
              const isPlaying = playingLineId === line.id;
              return (
                <div
                  key={line.id}
                  className="space-y-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--ux-ink)]">
                        {line.speaker}
                      </span>
                      <Badge variant="neutral">{line.accent}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (isPlaying) {
                            stopSpeechPlayback();
                            setPlayingLineId(null);
                          } else {
                            setPlayingLineId(line.id);
                            speakListeningSegment(
                              { text: line.rawText, accent: line.accent },
                              0.85,
                              () => setPlayingLineId(null)
                            );
                          }
                        }}
                      >
                        <Headphones className="h-3.5 w-3.5" />
                        {isPlaying ? "Dừng" : "0.85x"}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setPlayingLineId(line.id);
                          speakListeningSegment(
                            { text: line.rawText, accent: line.accent },
                            1.0,
                            () => setPlayingLineId(null)
                          );
                        }}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        1.0x
                      </Button>
                    </div>
                  </div>

                  <p className="font-mono text-sm leading-relaxed font-medium text-[var(--ux-ink)]">
                    {line.stressMarkedText}
                  </p>
                  <p className="text-[11px] text-[var(--ux-ink-2)]">
                    <strong className="text-[var(--ux-accent)]">Mẹo phát âm:</strong>{" "}
                    {line.ipaChunkNoteVi}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2 & 3: 60s Scratchpad + Rescue Prompt + Opus Recorder */}
      {mode !== "shadowing" && (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left: Prompt + 60s Keyword Scratchpad + Rescue Prompt */}
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-6">
            {lesson.prompts.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {lesson.prompts.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isRecording}
                    onClick={() => setPromptIdx(idx)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer",
                      idx === promptIdx
                        ? "border-[var(--ux-accent)] bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                        : "border-[var(--ux-line)] bg-[var(--ux-surface-2)] text-[var(--ux-ink-2)]"
                    )}
                  >
                    Câu #{idx + 1}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="S">Khung ý: {activePrompt.frameworkTag}</Badge>
                <span className="font-mono text-[11px] text-[var(--ux-ink-3)]">
                  Chuẩn bị {activePrompt.prepSeconds}s · Nói{" "}
                  {activePrompt.speakSeconds}s
                </span>
              </div>
              <p className="text-sm leading-relaxed font-semibold text-[var(--ux-ink)]">
                {activePrompt.promptEn}
              </p>
              {activePrompt.bulletPointsEn && (
                <ul className="list-inside list-disc space-y-1 text-xs text-[var(--ux-ink-2)]">
                  {activePrompt.bulletPointsEn.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* 60s Keyword Scratchpad */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ux-ink)]">
                  <Clock className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
                  Bảng nháp từ khóa ({prepRemaining}s chuẩn bị)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (prepRunning) {
                      setPrepRunning(false);
                    } else {
                      if (prepRemaining === 0) {
                        setPrepRemaining(activePrompt.prepSeconds);
                      }
                      setPrepRunning(true);
                    }
                  }}
                >
                  {prepRunning ? "Tạm dừng đếm" : "Bấm giờ chuẩn bị"}
                </Button>
              </div>
              <textarea
                rows={4}
                placeholder="Chỉ ghi TỪ KHÓA (không viết cả câu): VD: bike chain snapped -> retired mechanic Mr Tan -> alignment tricky -> calm confidence..."
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
                className="w-full rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-3 text-xs focus:border-[var(--ux-accent)] focus:outline-none"
              />
            </div>

            {/* Rescue Prompt Drawer (A) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowRescue((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ux-warn)]/45 bg-[var(--ux-warn-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--ux-warn)] hover:brightness-95 cursor-pointer"
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                {showRescue
                  ? "Ẩn Rescue Prompt"
                  : "Bí từ / Đứng hình? Mở Rescue Prompt (A)"}
              </button>

              {showRescue && (
                <div className="space-y-1.5 rounded-xl border border-[var(--ux-warn)]/35 bg-[var(--ux-warn-soft)]/50 p-3 text-xs text-[var(--ux-ink)]">
                  {activePrompt.rescuePromptsVi.map((rp) => (
                    <p key={rp}>• {rp}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Opus 24kbps Mic Recorder + 3-Zone Pacing Bar + Fallback Transcript */}
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <KsaBadge
                  dimension="S"
                  label="Opus 24kbps Recorder · Phân tích WPM"
                />
                <span className="font-mono text-sm font-semibold text-[var(--ux-ink)]">
                  {formatClock(recordElapsedMs / 1000)} /{" "}
                  {formatClock(activePrompt.speakSeconds)}
                </span>
              </div>

              {/* 3-Zone Pacing Bar */}
              <div className="space-y-1">
                <div className="grid grid-cols-3 gap-1 text-[10px] font-medium text-[var(--ux-ink-3)]">
                  <span>Vùng 1: Bối cảnh</span>
                  <span className="text-center">Vùng 2: Ý chính &amp; Ví dụ</span>
                  <span className="text-right">Vùng 3: Cảm nhận / Kết</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--ux-surface-3)]">
                  <div
                    className={cn(
                      "h-full transition-all",
                      speakSecProgress < 25
                        ? "bg-[var(--ux-accent)]"
                        : speakSecProgress < 75
                          ? "bg-[var(--ux-mint)]"
                          : "bg-[var(--ux-warn)]"
                    )}
                    style={{ width: `${speakSecProgress}%` }}
                  />
                </div>
              </div>

              {/* Live RMS Meter + Mic Controls */}
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/45 p-5">
                <div className="flex h-3 w-full max-w-xs overflow-hidden rounded-full bg-[var(--ux-surface-3)]">
                  <div
                    className="h-full bg-[var(--ux-mint)] transition-all duration-100"
                    style={{ width: `${liveRmsPct}%` }}
                  />
                </div>

                {!isRecording ? (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={Boolean(submitted) || submitStatus === "loading"}
                    onClick={handleStartMicRecording}
                  >
                    <Mic className="h-4 w-4" />
                    {submitted
                      ? `Đã thu xong Lượt #${submitted.attemptNumber}`
                      : `Bắt đầu Thu âm (Lượt #${nextAttemptNumber})`}
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={handleStopMicRecording}
                  >
                    <Square className="h-4 w-4" />
                    Dừng thu &amp; Phân tích ngay
                  </Button>
                )}

                {micUnavailableNote && (
                  <p className="text-center text-xs text-[var(--ux-warn)]">
                    {micUnavailableNote}
                  </p>
                )}
              </div>

              {/* Optional / Fallback Transcript Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ux-ink)]">
                  Transcript câu nói (Tùy chọn khi dùng Mic · Bắt buộc nếu chấm
                  không Mic)
                </label>
                <textarea
                  rows={4}
                  disabled={Boolean(submitted)}
                  placeholder="Có thể gõ nháp hoặc dán lời nói tiếng Anh vào đây để bộ phân tích tính chính xác WPM, Fillers (um/uh) và gửi AI..."
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  className="w-full rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-3 text-xs focus:border-[var(--ux-accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-[var(--ux-line)] pt-4">
              {!submitted ? (
                <MorphSubmitButton
                  variant="outline"
                  className="w-full"
                  status={submitStatus}
                  disabled={
                    isRecording || manualTranscript.trim().split(/\s+/).length < 5
                  }
                  idleLabel="Chấm bằng Transcript (Không cần Micro)"
                  loadingLabel="Đang phân tích WPM & K–S–A..."
                  doneLabel="Đã phân tích xong!"
                  icon={<Play className="h-4 w-4" />}
                  onClick={handleSubmitTranscriptFallback}
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetNew}
                >
                  <RotateCcw className="h-4 w-4" />
                  Bắt đầu bài luyện mới hoàn toàn
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post-Submission Telemetry & AI Coach */}
      {submitted && (
        <div ref={reportRef}>
          <SpeakingFeedbackPanel
            lesson={lesson}
            prompt={activePrompt}
            recordingId={submitted.recordingId}
            attemptNumber={submitted.attemptNumber}
            storageKey={submitted.storageKey}
            transcript={submitted.transcript}
            metrics={submitted.metrics}
            improvementDelta={submitted.improvementDelta}
            savedAiConfigs={savedAiConfigs}
            initialAiConsentActive={initialAiConsentActive}
            onRerecordAttempt2={handleRerecordAttempt2}
          />
        </div>
      )}

      {/* Past Attempts */}
      {recentAttempts.length > 0 && (
        <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-[var(--ux-ink)]">
            Lịch sử các lượt thu Speaking gần đây
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentAttempts.slice(0, 6).map((att) => (
              <div
                key={att.id}
                className="space-y-1 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[var(--ux-accent)]">
                    Band {att.bandScore?.toFixed(1) ?? "—"}
                  </span>
                  <Badge variant="neutral">
                    {att.recordings.length} lần thu · {att.mode}
                  </Badge>
                </div>
                <p className="font-mono text-[11px] text-[var(--ux-ink-2)]">
                  {att.recordings[0]?.fluencyMetrics?.wpm ?? 0} WPM ·{" "}
                  {att.recordings[0]?.fluencyMetrics?.hesitationCount ?? 0} lần
                  ngập ngừng &ge;1.5s
                </p>
                <p className="text-[11px] text-[var(--ux-ink-3)]">
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
