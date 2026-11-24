"use client";

/* Inspired by Lucian UX/UI Prompt #151 · MIT License (c) 2026 Seokwoooo */
import { useMemo, useState } from "react";
import { buildContributionDays } from "@/lib/lucian/helpers";
import { cn } from "@/lib/utils";

interface StudyContributionGridProps {
  streakDays: number;
  lastStudyDate: string | null;
  anchorDateIso: string;
  activeDates?: Record<string, number>;
}

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[var(--ux-surface-3)]",
  1: "bg-[var(--ux-mint)]/30",
  2: "bg-[var(--ux-mint)]/55",
  3: "bg-[var(--ux-mint)]/80",
  4: "bg-[var(--ux-mint)]",
};

export function StudyContributionGrid({
  streakDays,
  lastStudyDate,
  anchorDateIso,
  activeDates,
}: StudyContributionGridProps) {
  const days = useMemo(
    () =>
      buildContributionDays(
        84,
        streakDays,
        lastStudyDate,
        activeDates,
        anchorDateIso
      ),
    [streakDays, lastStudyDate, activeDates, anchorDateIso]
  );

  const [selectedIdx, setSelectedIdx] = useState(days.length - 1);
  const selectedDay = days[selectedIdx] ?? days[days.length - 1];

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[var(--ux-ink)]">
            Nhịp học 12 tuần gần đây
          </h3>
          <p className="mt-0.5 text-xs text-[var(--ux-ink-3)]">
            Kéo thanh trượt hoặc bấm từng ô để xem số phiên theo ngày
          </p>
        </div>
        <span className="rounded-full bg-[var(--ux-mint-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ux-mint)]">
          Chuỗi {streakDays} ngày
        </span>
      </div>

      <div className="my-4 overflow-x-auto pb-1">
        <div
          className="grid grid-flow-col grid-rows-7 gap-1.5"
          role="grid"
          aria-label="Lưới tần suất học 84 ngày"
        >
          {days.map((day, idx) => {
            const active = idx === selectedIdx;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                title={`${day.date}: ${day.count} phiên`}
                aria-label={`${day.date}: ${day.count} phiên`}
                className={cn(
                  "h-3.5 w-3.5 rounded-[4px] transition-transform cursor-pointer",
                  LEVEL_CLASSES[day.level],
                  active &&
                    "scale-125 ring-2 ring-[var(--ux-ink)] ring-offset-1 ring-offset-[var(--ux-surface)]"
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={days.length - 1}
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          aria-label="Kéo để xem từng ngày trong 84 ngày gần nhất"
          className="h-1.5 w-full cursor-pointer accent-[var(--ux-mint)]"
        />
        <div className="flex items-center justify-between text-xs text-[var(--ux-ink-2)]">
          <span className="font-mono font-medium">{selectedDay.date}</span>
          <span>
            {selectedDay.count > 0
              ? `${selectedDay.count} phiên KSA hoàn thành`
              : "Chưa có phiên học"}
          </span>
        </div>
      </div>
    </div>
  );
}
