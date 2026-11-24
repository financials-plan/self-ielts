"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  Briefcase,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { useToast } from "@/components/lucian/ToastProvider";

const BAND_OPTIONS = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
const DAILY_GOALS = [15, 30, 45, 60];

interface OnboardingWizardProps {
  initialProfile: {
    targetTrack: "academic" | "general";
    currentBand: number | null;
    targetBand: number;
    examDate: number | null;
    dailyGoalMinutes: number;
  };
  userName: string;
}

export function OnboardingWizard({
  initialProfile,
  userName,
}: OnboardingWizardProps) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [track, setTrack] = useState<"academic" | "general">(
    initialProfile.targetTrack
  );
  const [currentBand, setCurrentBand] = useState<string>(
    initialProfile.currentBand ? String(initialProfile.currentBand) : ""
  );
  const [targetBand, setTargetBand] = useState<number>(
    initialProfile.targetBand || 7.0
  );
  const [examDateStr, setExamDateStr] = useState<string>(
    initialProfile.examDate
      ? new Date(initialProfile.examDate).toISOString().slice(0, 10)
      : ""
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(
    initialProfile.dailyGoalMinutes || 30
  );
  const [submitStatus, setSubmitStatus] = useState<MorphStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function completeOnboarding(redirectPath: "/dashboard" | "/settings") {
    setSubmitStatus("loading");
    setError(null);
    try {
      const parsedExamDate = examDateStr
        ? new Date(`${examDateStr}T00:00:00Z`).getTime()
        : null;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetTrack: track,
          currentBand: currentBand ? Number(currentBand) : null,
          targetBand,
          examDate: parsedExamDate,
          dailyGoalMinutes,
          onboardingCompleted: true,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Không thể lưu hồ sơ học tập.");
      }

      setSubmitStatus("done");
      toast.success(
        "Đã thiết lập hồ sơ KSA",
        `Lộ trình ${track === "academic" ? "Academic" : "General Training"} · Mục tiêu Band ${targetBand.toFixed(1)}`
      );
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setSubmitStatus("error");
      const msg =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu hồ sơ.";
      setError(msg);
      toast.error("Lưu thất bại", msg);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Badge variant="K">Thiết lập lộ trình cho {userName}</Badge>
        <h1 className="font-display text-2xl font-medium text-[var(--ux-ink)] sm:text-3xl">
          Khởi tạo Hồ sơ KSA của bạn
        </h1>
        <p className="text-sm text-[var(--ux-ink-2)]">
          Bước {step} / 3 — Cấu hình bảng quy đổi điểm, dạng đề Academic hay
          General Training và nhịp học mỗi ngày.
        </p>

        <div className="flex gap-2 pt-2">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx <= step ? "bg-[var(--ux-accent)]" : "bg-[var(--ux-surface-3)]"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpenCheck className="h-5 w-5 text-[var(--ux-accent)]" />
              Bước 1: Chọn hệ thi IELTS mục tiêu của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTrack("academic")}
                className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  track === "academic"
                    ? "border-[var(--ux-accent)] bg-[var(--ux-accent-soft)] ring-2 ring-[var(--ux-accent)]/20"
                    : "border-[var(--ux-line)] hover:bg-[var(--ux-surface-2)]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-4 w-4 text-[var(--ux-accent)]" />
                    IELTS Academic
                  </span>
                  {track === "academic" && (
                    <CheckCircle2 className="h-4 w-4 text-[var(--ux-accent)]" />
                  )}
                </div>
                <p className="text-xs leading-relaxed text-[var(--ux-ink-2)]">
                  Dành cho du học đại học/sau đại học hoặc đăng ký nghề nghiệp
                  chuyên môn. Reading gồm 3 bài học thuật; Writing Task 1 mô tả
                  biểu đồ, bản đồ, quy trình.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTrack("general")}
                className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  track === "general"
                    ? "border-[var(--ux-mint)] bg-[var(--ux-mint-soft)] ring-2 ring-[var(--ux-mint)]/20"
                    : "border-[var(--ux-line)] hover:bg-[var(--ux-surface-2)]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <Briefcase className="h-4 w-4 text-[var(--ux-mint)]" />
                    IELTS General Training
                  </span>
                  {track === "general" && (
                    <CheckCircle2 className="h-4 w-4 text-[var(--ux-mint)]" />
                  )}
                </div>
                <p className="text-xs leading-relaxed text-[var(--ux-ink-2)]">
                  Dành cho định cư, làm việc hoặc đào tạo nghề. Reading gồm
                  thông báo, tài liệu công sở và bài dài; Writing Task 1 viết thư
                  Formal / Semi-formal / Informal; thang điểm Reading riêng.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)}>Tiếp tục bước 2</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-[var(--ux-mint)]" />
              Bước 2: Mục tiêu Band điểm và nhịp tự học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Band hiện tại (tùy chọn)
                </label>
                <select
                  value={currentBand}
                  onChange={(e) => setCurrentBand(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-sm"
                >
                  <option value="">Chưa rõ / Mới bắt đầu</option>
                  {BAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      Band {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Band mục tiêu</label>
                <select
                  value={targetBand}
                  onChange={(e) => setTargetBand(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-sm"
                >
                  {BAND_OPTIONS.filter((b) => b >= 5.0).map((b) => (
                    <option key={b} value={b}>
                      Band {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Ngày dự kiến thi (tùy chọn)
                </label>
                <Input
                  type="date"
                  value={examDateStr}
                  onChange={(e) => setExamDateStr(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Thời lượng luyện tập mỗi ngày
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DAILY_GOALS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyGoalMinutes(mins)}
                      className={`h-10 rounded-lg border text-xs font-semibold cursor-pointer ${
                        dailyGoalMinutes === mins
                          ? "border-[var(--ux-accent)] bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                          : "border-[var(--ux-line-2)] bg-[var(--ux-surface)] hover:bg-[var(--ux-surface-2)]"
                      }`}
                    >
                      {mins}p
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <Button onClick={() => setStep(3)}>Tiếp tục bước 3</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="h-5 w-5 text-[var(--ux-warn)]" />
              Bước 3: Mô hình KSA và chế độ AI 0đ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 rounded-xl border border-[var(--ux-line)] p-3.5">
                <KsaBadge dimension="K" />
                <p className="text-xs text-[var(--ux-ink-2)]">
                  Kiến thức ngôn ngữ, Paraphrase, nối âm và tiêu chí Band.
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl border border-[var(--ux-line)] p-3.5">
                <KsaBadge dimension="S" />
                <p className="text-xs text-[var(--ux-ink-2)]">
                  Thao tác Guided, Focused Drill và Exam trên cả 4 kỹ năng.
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl border border-[var(--ux-line)] p-3.5">
                <KsaBadge dimension="A" />
                <p className="text-xs text-[var(--ux-ink-2)]">
                  Bản lĩnh bỏ câu lỡ nhịp, vượt sợ nói và sổ lỗi K-S-A.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--ux-mint)]/25 bg-[var(--ux-mint-soft)] p-4 text-sm">
              <p className="font-semibold text-[var(--ux-mint)]">
                Sẵn sàng học ngay ở mức 0đ mà không cần API Key
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ux-ink-2)]">
                Bạn có thể vào thẳng góc học tập để dùng đầy đủ công cụ Offline
                0đ, hoặc mở trang Cài đặt bất kỳ lúc nào để gắn khóa miễn phí từ
                Google Gemini / Groq cho phần chấm Writing và Speaking nâng cao.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-[var(--ux-danger)]/30 bg-[var(--ux-danger-soft)] px-3.5 py-2 text-sm text-[var(--ux-danger)]">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                disabled={submitStatus === "loading"}
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => completeOnboarding("/settings")}
                  disabled={submitStatus === "loading"}
                >
                  Lưu và gắn khóa AI miễn phí
                </Button>
                <MorphSubmitButton
                  status={submitStatus}
                  idleLabel="Hoàn tất thiết lập"
                  loadingLabel="Đang lưu..."
                  doneLabel="Đã thiết lập!"
                  onClick={() => completeOnboarding("/dashboard")}
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/dashboard"
                className="text-xs text-[var(--ux-ink-3)] underline hover:text-[var(--ux-ink)]"
              >
                Bỏ qua bước này, vào góc học tập sau
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
