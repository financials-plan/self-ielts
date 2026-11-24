"use client";

/* Inspired by Lucian UX/UI Prompt #052 · MIT License (c) 2026 Seokwoooo */
import { RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface FlipFlashcardProps {
  skillLabel: string;
  cardTypeLabel: string;
  front: string;
  back: string;
  flipped: boolean;
  onToggleFlip: () => void;
}

export function FlipFlashcard({
  skillLabel,
  cardTypeLabel,
  front,
  back,
  flipped,
  onToggleFlip,
}: FlipFlashcardProps) {
  return (
    <div style={{ perspective: "1200px" }} className="w-full">
      <button
        type="button"
        onClick={onToggleFlip}
        aria-pressed={flipped}
        aria-label={
          flipped
            ? "Đang xem mặt sau đáp án, bấm để lật về mặt trước"
            : "Đang xem mặt trước câu hỏi, bấm hoặc nhấn Space để lật xem đáp án"
        }
        className="relative block min-h-[220px] w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ux-accent)]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.55s var(--ux-spring)",
        }}
      >
        {/* Front Face */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className={cn(
            "absolute inset-0 flex flex-col justify-between rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-5 shadow-[0_14px_28px_-22px_var(--ux-shadow)] sm:p-6"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="K">{skillLabel}</Badge>
              <Badge variant="neutral">{cardTypeLabel}</Badge>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ux-ink-3)]">
              <RotateCw className="h-3.5 w-3.5" />
              Nhấn Space hoặc bấm thẻ để lật
            </span>
          </div>

          <p className="my-4 font-display text-lg leading-relaxed font-semibold tracking-tight text-[var(--ux-ink)] sm:text-xl">
            {front}
          </p>

          <p className="text-xs text-[var(--ux-ink-3)]">
            Tự nhớ lại câu trả lời trước khi lật mặt sau
          </p>
        </div>

        {/* Back Face */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 flex flex-col justify-between rounded-xl border border-[var(--ux-mint)]/40 bg-[var(--ux-surface)] p-5 shadow-[0_14px_28px_-22px_var(--ux-shadow)] sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="S">Đáp án &amp; Ghi nhớ</Badge>
              <Badge variant="neutral">{skillLabel}</Badge>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ux-mint)]">
              <RotateCw className="h-3.5 w-3.5" />
              Chọn mức 1–4 bên dưới để lên lịch ôn
            </span>
          </div>

          <p className="my-4 text-sm leading-relaxed text-[var(--ux-ink)] sm:text-base">
            {back}
          </p>

          <p className="text-xs text-[var(--ux-ink-3)]">
            Chọn 1 (Lại) – 4 (Dễ) để SM-2 lên lịch ôn lại đúng lúc sắp quên
          </p>
        </div>
      </button>
    </div>
  );
}
