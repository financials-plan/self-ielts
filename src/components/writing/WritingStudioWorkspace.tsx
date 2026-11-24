"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Lightbulb,
  PenTool,
  RotateCcw,
} from "lucide-react";
import type { SafeAiConfigSummary } from "@/lib/db/profileService";
import type { WritingAttemptDetail } from "@/lib/db/writingService";
import {
  analyzeWritingOffline,
  countWords,
  WRITING_TASK_LABELS_VI,
  type WritingDraftDelta,
  type WritingLessonContent,
  type WritingMode,
  type WritingOfflineMetrics,
  type WritingOutlineInput,
} from "@/lib/writing/writingEngine";
import { Badge, KsaBadge, TrackBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { useToast } from "@/components/lucian/ToastProvider";
import {
  AcademicDataChart,
  WritingFeedbackAndModels,
} from "./WritingFeedbackAndModels";
import { cn } from "@/lib/utils";

type WritingStage = "deconstruct" | "outline" | "draft" | "audit";

interface WritingStudioWorkspaceProps {
  lesson: WritingLessonContent;
  initialMode: WritingMode;
  recentAttempts: WritingAttemptDetail[];
  savedAiConfigs: SafeAiConfigSummary[];
  initialAiConsentActive: boolean;
}

interface SubmittedDraftState {
  attemptId: string;
  draftId: string;
  version: number;
  essayText: string;
  metrics: WritingOfflineMetrics;
  draftDelta: WritingDraftDelta | null;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function WritingStudioWorkspace({
  lesson,
  initialMode,
  recentAttempts,
  savedAiConfigs,
  initialAiConsentActive,
}: WritingStudioWorkspaceProps) {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<WritingMode>(initialMode);
  const [stage, setStage] = useState<WritingStage>("deconstruct");
  const [showIdeaSpark, setShowIdeaSpark] = useState(
    initialMode === "guided"
  );
  const [confidenceBefore, setConfidenceBefore] = useState<number>(3);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [outline, setOutline] = useState<WritingOutlineInput>({
    thesisOrOverview: "",
    bodyOne: "",
    bodyTwo: "",
    bodyThreeOrConclusion: "",
  });
  const [essayText, setEssayText] = useState("");
  const [selfAuditIds, setSelfAuditIds] = useState<string[]>([]);

  const [activeAttemptId, setActiveAttemptId] = useState<string | undefined>(
    undefined
  );
  const [editingVersion, setEditingVersion] = useState<number>(1);
  const [submitStatus, setSubmitStatus] = useState<MorphStatus>("idle");
  const [submitted, setSubmitted] = useState<SubmittedDraftState | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) return;
    const t = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(t);
  }, [submitted]);

  const liveWordCount = useMemo(() => countWords(essayText), [essayText]);
  const liveParagraphCount = useMemo(() => {
    const t = essayText.trim();
    if (!t) return 0;
    return t.split(/\n\s*\n+/).filter(Boolean).length;
  }, [essayText]);

  const livePreviewMetrics = useMemo(
    () => analyzeWritingOffline(lesson, essayText, outline, selfAuditIds),
    [lesson, essayText, outline, selfAuditIds]
  );

  const outlineLabels = useMemo(() => {
    if (lesson.taskType === "academic_task1") {
      return {
        f1: "Overview (2 xu hướng chính — KHÔNG số liệu)",
        p1: "Ví dụ: Overall, diesel buses dropped sharply while battery electric became dominant...",
        f2: "Body 1 (Nhóm xu hướng 1 + số liệu minh họa)",
        p2: "Ghi năm mốc, % mở đầu và điểm đổi hướng chính...",
        f3: "Body 2 (So sánh đối chiếu nhóm còn lại)",
        p3: "Ghi so sánh tỉ lệ, mức đỉnh Hybrid năm 2020...",
        f4: "Từ nối & Cấu trúc dự kiến dùng",
        p4: "In contrast, fourfold, accounting for, ceded dominance...",
      };
    }
    if (lesson.taskType === "gt_task1_letter") {
      return {
        f1: `Lời chào & Văn phong (${lesson.letterTone === "formal" ? "Formal · Không viết tắt" : "Informal · Thân mật"})`,
        p1:
          lesson.letterTone === "formal"
            ? "Dear Sir or Madam, + I am writing to express concern regarding..."
            : "Hi Alex, + What brilliant news! ...",
        f2: `Bullet 1: ${lesson.threeBullets?.[0] ?? "Ý 1"}`,
        p2: "Ý chính & chi tiết cho gạch đầu dòng 1...",
        f3: `Bullet 2: ${lesson.threeBullets?.[1] ?? "Ý 2"}`,
        p3: "Ý chính & chi tiết cho gạch đầu dòng 2...",
        f4: `Bullet 3: ${lesson.threeBullets?.[2] ?? "Ý 3"}`,
        p4: "Ý chính & câu kết thư phù hợp văn phong...",
      };
    }
    return {
      f1: "Introduction & Thesis Statement (Paraphrase + Lập trường)",
      p1: "Nêu hiện tượng và ý kiến cá nhân rõ ràng...",
      f2: "Body 1 (PEEL: Point → Explain → Example → Link)",
      p2: "Luận điểm ủng hộ vế 1 + cơ chế kinh tế/xã hội...",
      f3: "Body 2 (PEEL: Phân tích vế 2 / Phản biện)",
      p3: "Luận điểm vế 2 + dẫn chứng thực tế...",
      f4: "Conclusion (Chốt lại 2 vế + lập trường)",
      p4: "In conclusion, although..., I maintain that...",
    };
  }, [lesson]);

  function toggleAuditItem(id: string) {
    if (submitted) return;
    setSelfAuditIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmitDraft() {
    if (submitStatus === "loading" || submitted) return;
    if (selfAuditIds.length < 3) {
      toast.info(
        "Chưa hoàn thành Self-Audit (A)",
        "Hãy kiểm tra và tick ít nhất 3 mục trong Chặng 4 trước khi nộp."
      );
      return;
    }

    setSubmitStatus("loading");
    try {
      const res = await fetch("/api/writing/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          attemptId: activeAttemptId,
          mode,
          confidenceBefore,
          durationSec: Math.max(1, elapsedSec),
          outline,
          essayText,
          selfAuditCheckedIds: selfAuditIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitStatus("error");
        toast.error(data.error || "Không thể nộp bài Writing.");
        return;
      }

      setSubmitStatus("done");
      setSubmitted({
        attemptId: data.attemptId,
        draftId: data.draftId,
        version: data.version,
        essayText,
        metrics: data.metrics as WritingOfflineMetrics,
        draftDelta: (data.draftDelta as WritingDraftDelta | null) ?? null,
      });
      toast.success(
        `Đã lưu Bản nháp v${data.version} (${data.metrics.wordCount} từ)`,
        `Ước tính NLP Offline: Band ${data.metrics.estimatedBand.toFixed(1)}`
      );
      router.refresh();
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch {
      setSubmitStatus("error");
      toast.error("Lỗi kết nối khi lưu bản nháp.");
    }
  }

  function handleStartDraft2() {
    if (!submitted) return;
    setActiveAttemptId(submitted.attemptId);
    setEditingVersion(submitted.version + 1);
    setSubmitted(null);
    setSubmitStatus("idle");
    setSelfAuditIds([]);
    setStage("draft");
    toast.info(
      `Bắt đầu viết Draft ${submitted.version + 1}`,
      "Bài viết cũ được giữ sẵn để bạn sửa trực tiếp các câu lặp từ hoặc nâng cấp Collocation."
    );
  }

  function handleResetNewAttempt() {
    setActiveAttemptId(undefined);
    setEditingVersion(1);
    setSubmitted(null);
    setSubmitStatus("idle");
    setEssayText("");
    setOutline({
      thesisOrOverview: "",
      bodyOne: "",
      bodyTwo: "",
      bodyThreeOrConclusion: "",
    });
    setSelfAuditIds([]);
    setElapsedSec(0);
    setStage("deconstruct");
  }

  const remainingSec = Math.max(0, lesson.recommendedMinutes * 60 - elapsedSec);

  return (
    <div className="space-y-6">
      {/* Header & Stage Stepper */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/writing"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ux-line-2)] px-2.5 text-xs font-medium text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Thư viện Writing
            </Link>
            {lesson.track === "shared" ? (
              <Badge variant="neutral">Chung Academic &amp; GT</Badge>
            ) : (
              <TrackBadge track={lesson.track} />
            )}
            <Badge variant="K">
              {WRITING_TASK_LABELS_VI[lesson.taskType]}
            </Badge>
            {editingVersion >= 2 && (
              <Badge variant="S">Đang sửa Draft {editingVersion}</Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold",
                mode === "exam" && remainingSec <= 180
                  ? "border-[var(--ux-danger)]/40 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]"
                  : "border-[var(--ux-line)] bg-[var(--ux-surface-2)] text-[var(--ux-ink)]"
              )}
            >
              <Clock className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
              {mode === "exam"
                ? `Còn ${formatClock(remainingSec)}`
                : `Đã viết ${formatClock(elapsedSec)}`}
            </div>

            <SlidingPillTabs
              size="sm"
              ariaLabel="Chọn chế độ luyện Writing"
              disabled={Boolean(submitted)}
              value={mode}
              onChange={(next) => {
                setMode(next);
                setShowIdeaSpark(next === "guided");
              }}
              options={[
                { value: "guided", label: "Guided" },
                { value: "drill", label: "Drill" },
                { value: "exam", label: "Exam Timer" },
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
              Tự tin trước khi viết (A):
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  disabled={Boolean(submitted)}
                  onClick={() => setConfidenceBefore(lvl)}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-md font-mono text-xs font-semibold cursor-pointer",
                    confidenceBefore === lvl
                      ? "bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                      : "bg-[var(--ux-surface)] text-[var(--ux-ink-2)]"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4-Stage Navigation Bar */}
        <div className="overflow-x-auto pt-1">
          <SlidingPillTabs
            size="sm"
            ariaLabel="4 Chặng viết bài Writing"
            value={stage}
            onChange={setStage}
            options={[
              { value: "deconstruct", label: "1. Bóc đề" },
              { value: "outline", label: "2. Lập dàn ý" },
              {
                value: "draft",
                label: "3. Viết nháp",
                badge: `${liveWordCount}/${lesson.minWords}`,
              },
              {
                value: "audit",
                label: "4. Tự rà lỗi",
                badge: `${selfAuditIds.length}/${lesson.selfAuditChecklist.length}`,
              },
            ]}
          />
        </div>
      </div>

      {/* Stage 1: DECONSTRUCT */}
      {stage === "deconstruct" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-7 sm:p-6">
            <Badge variant="K">Đề bài IELTS gốc (English)</Badge>
            <p className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-4 text-sm leading-relaxed font-medium text-[var(--ux-ink)]">
              {lesson.promptEn}
            </p>
            {lesson.visualDataSpec && (
              <AcademicDataChart spec={lesson.visualDataSpec} />
            )}
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-5 sm:p-6">
            <div className="space-y-4">
              <KsaBadge dimension="S" label="Chặng 1 · Bóc đề chuẩn tiêu chí" />
              <p className="text-xs leading-relaxed text-[var(--ux-ink)]">
                {lesson.deconstructPrompts.taskTypeTargetVi}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--ux-ink)]">
                  3 yêu cầu sống còn của dạng bài này:
                </p>
                <ul className="space-y-2 text-xs text-[var(--ux-ink-2)]">
                  {lesson.deconstructPrompts.keyRequirementsVi.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-2.5"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ux-mint)]" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => setStage("outline")}
            >
              Sang Chặng 2: Lập dàn ý &amp; Idea Spark
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Stage 2: OUTLINE + IDEA SPARK */}
      {stage === "outline" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-7 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-[var(--ux-ink)]">
                Chặng 2 · Khung Dàn ý (Outline)
              </h2>
              <Badge variant="S">Tránh bí ý khi gõ bài</Badge>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--ux-ink)]">
                  {outlineLabels.f1}
                </label>
                <textarea
                  rows={2}
                  disabled={Boolean(submitted)}
                  placeholder={outlineLabels.p1}
                  value={outline.thesisOrOverview}
                  onChange={(e) =>
                    setOutline((o) => ({ ...o, thesisOrOverview: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-2.5 text-xs focus:border-[var(--ux-accent)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--ux-ink)]">
                  {outlineLabels.f2}
                </label>
                <textarea
                  rows={2}
                  disabled={Boolean(submitted)}
                  placeholder={outlineLabels.p2}
                  value={outline.bodyOne}
                  onChange={(e) =>
                    setOutline((o) => ({ ...o, bodyOne: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-2.5 text-xs focus:border-[var(--ux-accent)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--ux-ink)]">
                  {outlineLabels.f3}
                </label>
                <textarea
                  rows={2}
                  disabled={Boolean(submitted)}
                  placeholder={outlineLabels.p3}
                  value={outline.bodyTwo}
                  onChange={(e) =>
                    setOutline((o) => ({ ...o, bodyTwo: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-2.5 text-xs focus:border-[var(--ux-accent)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--ux-ink)]">
                  {outlineLabels.f4}
                </label>
                <textarea
                  rows={2}
                  disabled={Boolean(submitted)}
                  placeholder={outlineLabels.p4}
                  value={outline.bodyThreeOrConclusion}
                  onChange={(e) =>
                    setOutline((o) => ({
                      ...o,
                      bodyThreeOrConclusion: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-2.5 text-xs focus:border-[var(--ux-accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStage("deconstruct")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Xem lại đề
              </Button>
              <Button variant="primary" onClick={() => setStage("draft")}>
                Sang Chặng 3: Viết nháp
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Idea Spark Prompts (Questions Only, Never Writes For You) */}
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-5 sm:p-6">
            <div className="flex items-center justify-between">
              <KsaBadge dimension="K" label="Idea Spark · Khơi gợi tư duy" />
              <button
                type="button"
                onClick={() => setShowIdeaSpark((s) => !s)}
                className="text-xs font-medium text-[var(--ux-accent)] hover:underline cursor-pointer"
              >
                {showIdeaSpark ? "Thu gọn" : "Mở câu hỏi gợi ý"}
              </button>
            </div>
            <p className="text-xs text-[var(--ux-ink-2)]">
              Self-IELTS chỉ đặt câu hỏi gợi mở để giữ nguyên chủ quyền tư duy
              của bạn, không viết hộ đoạn văn.
            </p>

            {showIdeaSpark && (
              <div className="space-y-2.5">
                {lesson.deconstructPrompts.ideaSparkQuestionsVi.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-lg border border-[var(--ux-accent)]/25 bg-[var(--ux-accent-soft)]/50 p-3 text-xs text-[var(--ux-ink)]"
                  >
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ux-accent)]" />
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            )}

            {lesson.visualDataSpec && (
              <AcademicDataChart spec={lesson.visualDataSpec} />
            )}
          </div>
        </div>
      )}

      {/* Stage 3: TIMED DRAFT EDITOR */}
      {stage === "draft" && (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Pinned Reference Pane */}
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-5">
            <Badge variant="neutral">Đề bài &amp; Dàn ý tham chiếu</Badge>
            <p className="text-xs leading-relaxed text-[var(--ux-ink)]">
              {lesson.promptEn}
            </p>

            {lesson.visualDataSpec && (
              <AcademicDataChart spec={lesson.visualDataSpec} />
            )}

            <div className="space-y-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3.5 text-xs">
              <p className="font-semibold text-[var(--ux-ink)]">
                Tóm tắt dàn ý bạn đã ghi:
              </p>
              <p className="text-[var(--ux-ink-2)]">
                • {outline.thesisOrOverview || "(Chưa ghi mở bài / Overview)"}
              </p>
              <p className="text-[var(--ux-ink-2)]">
                • {outline.bodyOne || "(Chưa ghi Body 1 / Bullet 1)"}
              </p>
              <p className="text-[var(--ux-ink-2)]">
                • {outline.bodyTwo || "(Chưa ghi Body 2 / Bullet 2)"}
              </p>
              <p className="text-[var(--ux-ink-2)]">
                • {outline.bodyThreeOrConclusion || "(Chưa ghi Kết / Bullet 3)"}
              </p>
            </div>
          </div>

          {/* Main Distraction-Free Editor */}
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-ink)]">
                <PenTool className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
                Khung soạn thảo (Phân tách đoạn bằng Enter 2 lần)
              </span>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span
                  className={cn(
                    "font-semibold",
                    liveWordCount >= lesson.minWords
                      ? "text-[var(--ux-mint)]"
                      : "text-[var(--ux-warn)]"
                  )}
                >
                  {liveWordCount} / {lesson.minWords} từ
                </span>
                <span className="text-[var(--ux-ink-3)]">
                  {liveParagraphCount} đoạn
                </span>
              </div>
            </div>

            <textarea
              rows={16}
              disabled={Boolean(submitted)}
              placeholder="Write your IELTS response here in English..."
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              className="w-full rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-4 text-sm leading-relaxed text-[var(--ux-ink)] focus:border-[var(--ux-accent)] focus:outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStage("outline")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Quay lại Dàn ý
              </Button>
              <Button
                variant="primary"
                disabled={essayText.trim().length < 20}
                onClick={() => setStage("audit")}
              >
                Sang Chặng 4: Tự rà lỗi (Self-Audit)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 4: MANDATORY SELF-AUDIT GATE (A) */}
      {stage === "audit" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-6">
            <KsaBadge
              dimension="A"
              label="Chặng 4 · Tự rà lỗi bắt buộc trước khi nộp"
            />
            <h2 className="font-display text-lg font-semibold text-[var(--ux-ink)]">
              Checklist rà lỗi kỷ luật (Tick tối thiểu 3/
              {lesson.selfAuditChecklist.length} mục)
            </h2>

            <div className="space-y-2.5">
              {lesson.selfAuditChecklist.map((item) => {
                const checked = selfAuditIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition-colors",
                      checked
                        ? "border-[var(--ux-mint)]/50 bg-[var(--ux-mint-soft)]/50"
                        : "border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={Boolean(submitted)}
                      onChange={() => toggleAuditItem(item.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border",
                        checked
                          ? "border-[var(--ux-mint)] bg-[var(--ux-mint)] text-[var(--ux-mint-ink)]"
                          : "border-[var(--ux-line-2)] bg-[var(--ux-surface)]"
                      )}
                    >
                      {checked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-[var(--ux-ink)]">
                        {item.labelVi}
                      </p>
                      <KsaBadge dimension={item.ksaDimension} />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 lg:col-span-6">
            <div className="space-y-3">
              <Badge variant="free">Xem nhanh kiểm tra Offline 0đ</Badge>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3">
                  <p className="text-[var(--ux-ink-2)]">Số từ hiện tại</p>
                  <p className="mt-0.5 font-mono text-lg font-semibold text-[var(--ux-ink)]">
                    {livePreviewMetrics.wordCount} / {lesson.minWords}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3">
                  <p className="text-[var(--ux-ink-2)]">Từ lặp (&ge;4 lần)</p>
                  <p className="mt-0.5 font-mono text-lg font-semibold text-[var(--ux-ink)]">
                    {livePreviewMetrics.repeatedWords.length} nhóm
                  </p>
                </div>
              </div>

              {livePreviewMetrics.taskSpecificWarningsVi.length > 0 && (
                <div className="rounded-xl border border-[var(--ux-warn)]/40 bg-[var(--ux-warn-soft)] p-3 text-xs text-[var(--ux-ink)]">
                  <p className="font-semibold text-[var(--ux-warn)]">
                    Gợi ý sửa nhanh trước khi nộp:
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    {livePreviewMetrics.taskSpecificWarningsVi.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2.5 border-t border-[var(--ux-line)] pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={Boolean(submitted)}
                onClick={() => setStage("draft")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Quay lại sửa bài viết
              </Button>

              {!submitted ? (
                <MorphSubmitButton
                  className="w-full"
                  status={submitStatus}
                  disabled={
                    selfAuditIds.length < 3 || essayText.trim().length < 20
                  }
                  idleLabel={`Nộp Bản nháp v${editingVersion} & Phân tích K–S–A`}
                  loadingLabel="Đang phân tích NLP & lưu bản nháp..."
                  doneLabel="Đã lưu & Phân tích xong!"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={handleSubmitDraft}
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetNewAttempt}
                >
                  <RotateCcw className="h-4 w-4" />
                  Bắt đầu bài viết mới hoàn toàn
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post-Submit Reports, BYOK AI Diff & Band 6.5 vs 8.0 Models */}
      {submitted && (
        <div ref={feedbackRef}>
          <WritingFeedbackAndModels
            lesson={lesson}
            draftId={submitted.draftId}
            version={submitted.version}
            essayText={submitted.essayText}
            metrics={submitted.metrics}
            draftDelta={submitted.draftDelta}
            savedAiConfigs={savedAiConfigs}
            initialAiConsentActive={initialAiConsentActive}
            onStartDraft2={handleStartDraft2}
          />
        </div>
      )}

      {/* Past Attempts & Draft Versions */}
      {recentAttempts.length > 0 && (
        <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-[var(--ux-ink)]">
            Lịch sử bài viết &amp; các phiên bản Draft 1 / Draft 2
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentAttempts.slice(0, 6).map((att) => (
              <div
                key={att.id}
                className="space-y-1.5 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[var(--ux-accent)]">
                    Band {att.bandScore?.toFixed(1) ?? "—"}
                  </span>
                  <Badge variant="neutral">
                    {att.drafts.length} phiên bản · {att.mode.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[11px] text-[var(--ux-ink-2)]">
                  Bản mới nhất:{" "}
                  {att.drafts[0]?.offlineMetrics?.wordCount ?? 0} từ ·{" "}
                  {formatClock(att.durationSec)}
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
