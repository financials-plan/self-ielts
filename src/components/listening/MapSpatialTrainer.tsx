"use client";

import { Compass } from "lucide-react";
import type { ListeningMapLayout } from "@/lib/listening/listeningEngine";
import { Badge } from "@/components/ui/Badge";

interface MapSpatialTrainerProps {
  layout: ListeningMapLayout;
  activeSegmentId: string | null;
  selectedZone: string;
  showPathTrail: boolean;
  onSelectZone?: (zoneCode: string) => void;
}

export function MapSpatialTrainer({
  layout,
  activeSegmentId,
  selectedZone,
  showPathTrail,
  onSelectZone,
}: MapSpatialTrainerProps) {
  const activeStepIdx = activeSegmentId
    ? layout.walkPathSteps.findIndex((s) => s.segmentId === activeSegmentId)
    : -1;

  const visibleSteps = showPathTrail
    ? activeStepIdx >= 0
      ? layout.walkPathSteps.slice(0, activeStepIdx + 1)
      : layout.walkPathSteps
    : [];

  const pathPoints = visibleSteps.map((s) => `${s.x},${s.y}`).join(" ");
  const currentStep =
    activeStepIdx >= 0 ? layout.walkPathSteps[activeStepIdx] : null;

  return (
    <div className="space-y-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-ink)]">
          <Compass className="h-4 w-4 text-[var(--ux-mint)]" />
          Bản đồ tương tác (Bấm vào chữ cái A–F để điền đáp án)
        </span>
        <Badge variant="neutral">N: Hướng Bắc ↑</Badge>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto w-full select-none"
          role="img"
          aria-label="Sơ đồ bản đồ bài nghe Part 2"
        >
          {/* Compass indicator */}
          <g transform="translate(476, 34)">
            <circle
              r="18"
              fill="var(--ux-surface)"
              stroke="var(--ux-line-2)"
              strokeWidth="1.2"
            />
            <text
              textAnchor="middle"
              dy="4"
              fontSize="11"
              fontWeight="700"
              fill="var(--ux-accent)"
            >
              N ↑
            </text>
          </g>

          {/* Roads */}
          {layout.roads.map((road, idx) => (
            <g key={idx}>
              <line
                x1={road.x1}
                y1={road.y1}
                x2={road.x2}
                y2={road.y2}
                stroke="var(--ux-surface-3)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <line
                x1={road.x1}
                y1={road.y1}
                x2={road.x2}
                y2={road.y2}
                stroke="var(--ux-line-2)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              {road.name && (
                <text
                  x={(road.x1 + road.x2) / 2}
                  y={(road.y1 + road.y2) / 2 - 11}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--ux-ink-3)"
                >
                  {road.name}
                </text>
              )}
            </g>
          ))}

          {/* Fixed Landmarks */}
          {layout.landmarks.map((lm) => (
            <g key={lm.id}>
              <rect
                x={lm.x}
                y={lm.y}
                width={lm.w}
                height={lm.h}
                rx="8"
                fill="var(--ux-surface)"
                stroke="var(--ux-line-2)"
                strokeWidth="1.4"
              />
              <text
                x={lm.x + lm.w / 2}
                y={lm.y + lm.h / 2 + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="var(--ux-ink-2)"
              >
                {lm.label}
              </text>
            </g>
          ))}

          {/* Synchronized Walk Path Trail (Guided & Review modes) */}
          {visibleSteps.length > 1 && (
            <polyline
              points={pathPoints}
              fill="none"
              stroke="var(--ux-mint)"
              strokeWidth="2.8"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Start Node (You Are Here) */}
          <g transform={`translate(${layout.startNode.x}, ${layout.startNode.y})`}>
            <circle r="7" fill="var(--ux-warn)" />
            <text
              y="18"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill="var(--ux-ink)"
            >
              {layout.startNode.label}
            </text>
          </g>

          {/* Clickable Candidate Zones A–F */}
          {layout.candidateZones.map((zone) => {
            const isSelected = selectedZone === zone.code;
            return (
              <g
                key={zone.code}
                transform={`translate(${zone.x}, ${zone.y})`}
                onClick={() => onSelectZone?.(zone.code)}
                style={{ cursor: onSelectZone ? "pointer" : "default" }}
              >
                <circle
                  r="19"
                  fill={isSelected ? "var(--ux-accent)" : "var(--ux-surface)"}
                  stroke={
                    isSelected ? "var(--ux-accent)" : "var(--ux-line-2)"
                  }
                  strokeWidth={isSelected ? "2.4" : "1.5"}
                />
                <text
                  textAnchor="middle"
                  dy="4.5"
                  fontSize="13"
                  fontWeight="700"
                  fill={isSelected ? "var(--ux-accent-ink)" : "var(--ux-ink)"}
                >
                  {zone.code}
                </text>
              </g>
            );
          })}

          {/* Active audio waypoint pulse */}
          {showPathTrail && currentStep && (
            <circle
              cx={currentStep.x}
              cy={currentStep.y}
              r="11"
              fill="none"
              stroke="var(--ux-mint)"
              strokeWidth="2.5"
            />
          )}
        </svg>
      </div>

      {showPathTrail && currentStep && (
        <p className="rounded-lg border border-[var(--ux-mint)]/30 bg-[var(--ux-mint-soft)] px-3 py-2 text-xs text-[var(--ux-ink)]">
          <strong className="font-semibold text-[var(--ux-mint)]">
            Chỉ dẫn theo mạch nghe:
          </strong>{" "}
          {currentStep.hintVi}
        </p>
      )}
    </div>
  );
}
