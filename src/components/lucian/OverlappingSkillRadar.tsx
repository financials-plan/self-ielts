"use client";

/* Inspired by Lucian UX/UI Prompt #154 · MIT License (c) 2026 Seokwoooo */
import { useMemo, useState } from "react";
import { computeRadarPolygon } from "@/lib/lucian/helpers";
import { cn } from "@/lib/utils";

interface OverlappingSkillRadarProps {
  currentBand: number | null;
  targetBand: number;
  kScore: number;
  sScore: number;
  aScore: number;
  track: "academic" | "general";
}

const AXES = ["Listening", "Reading", "Writing", "Speaking", "KSA Balance"];

export function OverlappingSkillRadar({
  currentBand,
  targetBand,
  kScore,
  sScore,
  aScore,
  track,
}: OverlappingSkillRadarProps) {
  const [frontSeries, setFrontSeries] = useState<"current" | "target">(
    "current"
  );

  const baseline = currentBand ?? 5.5;
  const ksaAvgRatio = ((kScore + sScore + aScore) / 300) * 9;
  const ksaDisplayBand =
    kScore + sScore + aScore > 0
      ? Math.max(4.5, Math.min(9, Number((baseline * 0.6 + ksaAvgRatio * 0.4).toFixed(1))))
      : baseline;

  const currentValues = useMemo(
    () => [
      baseline,
      track === "academic" ? Math.max(4.5, baseline - 0.5) : baseline,
      Math.max(4.5, baseline - 0.5),
      baseline,
      ksaDisplayBand,
    ],
    [baseline, track, ksaDisplayBand]
  );

  const targetValues = useMemo(
    () => [targetBand, targetBand, targetBand, targetBand, targetBand],
    [targetBand]
  );

  const cx = 130;
  const cy = 122;
  const radius = 84;

  const currentPoly = computeRadarPolygon(currentValues, 9, cx, cy, radius);
  const targetPoly = computeRadarPolygon(targetValues, 9, cx, cy, radius);

  const axisCoords = AXES.map((label, idx) => {
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / AXES.length;
    const x2 = cx + Math.cos(angle) * radius;
    const y2 = cy + Math.sin(angle) * radius;
    const lx = cx + Math.cos(angle) * (radius + 20);
    const ly = cy + Math.sin(angle) * (radius + 16);
    return { label, x2, y2, lx, ly };
  });

  const gap = Math.max(0, targetBand - baseline).toFixed(1);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[var(--ux-ink)]">
            Hiện tại và Mục tiêu ({track === "academic" ? "Academic" : "GT"})
          </h3>
          <p className="mt-0.5 text-xs text-[var(--ux-ink-3)]">
            Chọn lớp bên dưới để đặt đường hiện tại hoặc mục tiêu lên trên
          </p>
        </div>
        <span className="rounded-full bg-[var(--ux-accent-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ux-accent)]">
          +{gap} Band
        </span>
      </div>

      <div className="my-2 flex justify-center">
        <svg
          viewBox="0 0 260 245"
          className="h-56 w-full max-w-[270px]"
          role="img"
          aria-label="Radar chồng lớp 4 kỹ năng IELTS và KSA"
        >
          {[3, 6, 9].map((ringBand) => {
            const guide = computeRadarPolygon(
              [ringBand, ringBand, ringBand, ringBand, ringBand],
              9,
              cx,
              cy,
              radius
            );
            return (
              <polygon
                key={ringBand}
                points={guide.pointsAttr}
                fill="none"
                stroke="var(--ux-line)"
                strokeWidth="1"
              />
            );
          })}

          {axisCoords.map((ax) => (
            <g key={ax.label}>
              <line
                x1={cx}
                y1={cy}
                x2={ax.x2}
                y2={ax.y2}
                stroke="var(--ux-line)"
                strokeWidth="1"
              />
              <text
                x={ax.lx}
                y={ax.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--ux-ink-2)"
                fontSize="10"
                fontWeight="600"
              >
                {ax.label}
              </text>
            </g>
          ))}

          {/* Render back series first, selected front series on top */}
          {frontSeries === "current" ? (
            <>
              <polygon
                points={targetPoly.pointsAttr}
                fill="color-mix(in srgb, var(--ux-mint) 14%, transparent)"
                stroke="var(--ux-mint)"
                strokeWidth="1.75"
                strokeDasharray="4 3"
              />
              <polygon
                points={currentPoly.pointsAttr}
                fill="color-mix(in srgb, var(--ux-accent) 26%, transparent)"
                stroke="var(--ux-accent)"
                strokeWidth="2.2"
              />
            </>
          ) : (
            <>
              <polygon
                points={currentPoly.pointsAttr}
                fill="color-mix(in srgb, var(--ux-accent) 14%, transparent)"
                stroke="var(--ux-accent)"
                strokeWidth="1.75"
              />
              <polygon
                points={targetPoly.pointsAttr}
                fill="color-mix(in srgb, var(--ux-mint) 26%, transparent)"
                stroke="var(--ux-mint)"
                strokeWidth="2.2"
              />
            </>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFrontSeries("current")}
          className={cn(
            "flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer",
            frontSeries === "current"
              ? "border-[var(--ux-accent)] bg-[var(--ux-accent-soft)] text-[var(--ux-ink)]"
              : "border-[var(--ux-line)] text-[var(--ux-ink-2)]"
          )}
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--ux-accent)]" />
            {currentBand ? "Hiện tại" : "Nền mặc định"}
          </span>
          <span className="font-mono">{baseline.toFixed(1)}</span>
        </button>

        <button
          type="button"
          onClick={() => setFrontSeries("target")}
          className={cn(
            "flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer",
            frontSeries === "target"
              ? "border-[var(--ux-mint)] bg-[var(--ux-mint-soft)] text-[var(--ux-ink)]"
              : "border-[var(--ux-line)] text-[var(--ux-ink-2)]"
          )}
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--ux-mint)]" />
            Mục tiêu
          </span>
          <span className="font-mono">{targetBand.toFixed(1)}</span>
        </button>
      </div>
    </div>
  );
}
