"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookHeart, Sparkles } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { reflectionLogs } from "@/db/schema";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { useToast } from "@/components/lucian/ToastProvider";

type ReflectionRow = InferSelectModel<typeof reflectionLogs>;

export function ReflectionCheckinWidget({
  initialReflections,
}: {
  initialReflections: ReflectionRow[];
}) {
  const router = useRouter();
  const toast = useToast();

  const [reflections, setReflections] =
    useState<ReflectionRow[]>(initialReflections);
  const [preIntention, setPreIntention] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [nextAdjustment, setNextAdjustment] = useState("");
  const [energyLevel, setEnergyLevel] = useState(4);
  const [status, setStatus] = useState<MorphStatus>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preIntention: preIntention.trim() || undefined,
          whatWentWell: whatWentWell.trim(),
          nextAdjustment: nextAdjustment.trim(),
          energyLevel,
        }),
      });
      const data = (await res.json()) as {
        reflection?: ReflectionRow;
        error?: string;
      };
      if (!res.ok || !data.reflection) {
        throw new Error(data.error || "Không thể lưu nhật ký phản tư.");
      }

      setReflections((prev) => [data.reflection!, ...prev].slice(0, 5));
      setPreIntention("");
      setWhatWentWell("");
      setNextAdjustment("");
      setStatus("done");
      toast.success(
        "Đã lưu Nhật ký Phản tư (A)",
        "Điểm Attitudes và chuỗi học đã được cập nhật."
      );
      setTimeout(() => setStatus("idle"), 1600);
      router.refresh();
    } catch (err) {
      setStatus("error");
      toast.error(
        "Lưu phản tư thất bại",
        err instanceof Error ? err.message : "Vui lòng kiểm tra lại."
      );
    }
  }

  return (
    <Card id="reflection-checkin">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Badge variant="A" className="mb-1.5">
              <BookHeart className="h-3 w-3" />
              A: Phản tư 60 giây
            </Badge>
            <CardTitle className="font-display text-xl font-medium">
              Nhật ký Phản tư Phiên học
            </CardTitle>
          </div>
          <span className="text-xs text-[var(--ux-ink-3)]">
            {reflections.length} ghi chép gần đây
          </span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold">
              Chủ đích trước giờ học (Pre-Session Intention)
            </label>
            <Input
              placeholder="Ví dụ: Giữ bình tĩnh bỏ qua câu lỡ nhịp ở Listening"
              value={preIntention}
              onChange={(e) => setPreIntention(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">
              1 điều bạn làm tốt hôm nay
            </label>
            <Input
              required
              placeholder="Ví dụ: Đọc xong đề Listening trước khi audio chạy, không hoảng"
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">
              1 hành động điều chỉnh cho phiên kế tiếp
            </label>
            <Input
              required
              placeholder="Ví dụ: Dành thêm 2 phút kiểm tra số nhiều/số ít ở Task 1"
              value={nextAdjustment}
              onChange={(e) => setNextAdjustment(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">
              Mức năng lượng / Tinh thần ({energyLevel}/5)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setEnergyLevel(lv)}
                  className={`h-8 rounded-lg border text-xs font-semibold cursor-pointer ${
                    energyLevel === lv
                      ? "border-[var(--ux-warn)] bg-[var(--ksa-a-soft)] text-[var(--ux-warn)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          <MorphSubmitButton
            type="submit"
            status={status}
            idleLabel="Lưu Nhật ký Phản tư"
            loadingLabel="Đang lưu..."
            doneLabel="Đã ghi nhận!"
            icon={<Sparkles className="h-4 w-4" />}
          />
        </form>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-[var(--ux-ink-2)]">
            Ghi chép gần đây
          </p>
          {reflections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] p-4 text-xs text-[var(--text-secondary)]">
              Chưa có nhật ký phản tư nào. Chỉ 60 giây ghi nhận mỗi ngày giúp
              nâng cao trục Attitudes [A] và duy trì chuỗi học.
            </div>
          ) : (
            <div className="space-y-2.5">
              {reflections.map((r) => (
                <div
                  key={r.id}
                  className="space-y-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)]/40 p-3 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                    <span className="font-mono">
                      {new Date(r.createdAt).toISOString().slice(0, 10)}
                    </span>
                    <span>Năng lượng: {r.energyLevel ?? 3}/5</span>
                  </div>
                  {r.preIntention && (
                    <p className="text-[var(--text-secondary)]">
                      <strong>Chủ đích:</strong> {r.preIntention}
                    </p>
                  )}
                  <p>
                    <strong className="text-[var(--ux-mint)]">Làm tốt:</strong>{" "}
                    {r.whatWentWell}
                  </p>
                  <p>
                    <strong className="text-[var(--ux-warn)]">Điều chỉnh:</strong>{" "}
                    {r.nextAdjustment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
