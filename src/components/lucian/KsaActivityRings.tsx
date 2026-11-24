"use client";

/* Inspired by Lucian UX/UI Prompt #099 · MIT License (c) 2026 Seokwoooo */
import { useMemo, useState } from "react";
import { computeRingDash } from "@/lib/lucian/helpers";
import { cn } from "@/lib/utils";

interface KsaActivityRingsProps {
  kScore: number;
  sScore: number;
  aScore: number;
  dailyGoalMinutes: number;
  streakDays: number;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function KsaActivityRings({
  kScore,
  sScore,
  aScore,
  dailyGoalMinutes,
  streakDays,
}: KsaActivityRingsProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(6); // 6 = Hôm nay
  const [focusedRing, setFocusedRing] = useState<"K" | "S" | "A" | null>(null);

  const weekData = useMemo(() => {
    return WEEKDAYS.map((label, idx) => {
      if (idx === 6) {
        return {
          label: "Hôm nay",
          k: Math.round(kScore),
          s: Math.round(sScore),
          a: Math.round(aScore),
        };
      }
      const daysBack = 6 - idx;
      const inStreak = streakDays > daysBack;
      const factor = inStreak ? Math.max(0.55, 1 - daysBack * 0.08) : 0;
      return {
        label,
        k: Math.round(kScore * factor),
        s: Math.round(sScore * factor),
        a: Math.round(aScore * factor),
      };
    });
  }, [kScore, sScore, aScore, streakDays]);

  const current = weekData[selectedDayIdx] ?? weekData[6];

  const rings = [
    {
      key: "K" as const,
      title: "K · Knowledge",
      subtitle: "Từ vựng, Paraphrase & Ngữ âm",
      value: current.k,
      radius: 66,
      color: "var(--ux-accent)",
    },
    {
      key: "S" as const,
      title: "S · Skills",
      subtitle: "Thao tác làm bài L/R/W/S",
      value: current.s,
      radius: 49,
      color: "var(--ux-mint)",
    },
    {
      key: "A" as const,
      title: "A · Attitudes",
      subtitle: `Nhịp ${dailyGoalMinutes}p/ngày & Phản tư`,
      value: current.a,
      radius: 32,
      color: "var(--ux-warn)",
    },
  ];

  function handleDayKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setSelectedDayIdx((idx + 1) % WEEKDAYS.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSelectedDayIdx((idx - 1 + WEEKDAYS.length) % WEEKDAYS.length);
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[var(--ux-ink)]">
            Cân bằng Knowledge, Skills và Attitudes
          </h3>
          <p className="mt-0.5 text-xs text-[var(--ux-ink-3)]">
            Di chuột qua từng mục để soi mức độ cân đối hiện tại
          </p>
        </div>
        <span className="rounded-full bg-[var(--ux-surface-2)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ux-ink-2)]">
          {current.label}
        </span>
      </div>

      <div className="my-4 flex flex-col items-center gap-5 sm:flex-row">
        <svg
          viewBox="0 0 176 176"
          className="h-44 w-44 shrink-0"
          role="img"
          aria-label="Biểu đồ vòng năng lực K, S, A"
        >
          {rings.map((ring) => {
            const metrics = computeRingDash(ring.value, ring.radius);
            const dimmed = focusedRing !== null && focusedRing !== ring.key;
            return (
              <g
                key={ring.key}
                transform="rotate(-90 88 88)"
                style={{
                  opacity: dimmed ? 0.28 : 1,
                  transition: "opacity 0.25s var(--ux-ease)",
                }}
              >
                <circle
                  cx="88"
                  cy="88"
                  r={ring.radius}
                  fill="none"
                  stroke="var(--ux-surface-3)"
                  strokeWidth="12"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={ring.radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={metrics.circumference}
                  strokeDashoffset={metrics.primaryOffset}
                  style={{
                    transition: "stroke-dashoffset 0.6s var(--ux-spring)",
                  }}
                />
                {metrics.hasLap && (
                  <circle
                    cx="88"
                    cy="88"
                    r={ring.radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={metrics.circumference}
                    strokeDashoffset={metrics.lapOffset}
                    style={{ filter: "brightness(1.2)" }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="w-full space-y-2.5">
          {rings.map((ring) => (
            <button
              key={ring.key}
              type="button"
              onMouseEnter={() => setFocusedRing(ring.key)}
              onMouseLeave={() => setFocusedRing(null)}
              onFocus={() => setFocusedRing(ring.key)}
              onBlur={() => setFocusedRing(null)}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/60 px-3 py-2 text-left transition-colors hover:border-[var(--ux-line-2)] cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ring.color }}
                  />
                  <span className="text-xs font-semibold text-[var(--ux-ink)]">
                    {ring.title}
                  </span>
                </div>
                <p className="truncate pl-4 text-[11px] text-[var(--ux-ink-2)]">
                  {ring.subtitle}
                </p>
              </div>
              <span
                className="font-mono text-sm font-bold tabular-nums"
                style={{ color: ring.color }}
              >
                {ring.value}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-1 rounded-xl bg-[var(--ux-surface-2)] p-1"
        role="group"
        aria-label="Chọn ngày trong tuần"
      >
        {WEEKDAYS.map((day, idx) => {
          const active = idx === selectedDayIdx;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              onKeyDown={(e) => handleDayKeyDown(e, idx)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer",
                active
                  ? "bg-[var(--ux-surface)] text-[var(--ux-ink)] shadow-xs"
                  : "text-[var(--ux-ink-3)] hover:text-[var(--ux-ink)]"
              )}
            >
              {idx === 6 ? "Nay" : day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
