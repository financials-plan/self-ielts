"use client";

import { KsaActivityRings } from "@/components/lucian/KsaActivityRings";
import { OverlappingSkillRadar } from "@/components/lucian/OverlappingSkillRadar";
import { StudyContributionGrid } from "@/components/lucian/StudyContributionGrid";
import { BreathingPacer } from "@/components/lucian/BreathingPacer";

interface KsaDashboardVisualsProps {
  kScore: number;
  sScore: number;
  aScore: number;
  dailyGoalMinutes: number;
  streakDays: number;
  lastStudyDate: string | null;
  currentBand: number | null;
  targetBand: number;
  track: "academic" | "general";
  anchorDateIso: string;
  activeDates?: Record<string, number>;
}

export function KsaDashboardVisuals(props: KsaDashboardVisualsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <KsaActivityRings
          kScore={props.kScore}
          sScore={props.sScore}
          aScore={props.aScore}
          dailyGoalMinutes={props.dailyGoalMinutes}
          streakDays={props.streakDays}
        />
        <OverlappingSkillRadar
          currentBand={props.currentBand}
          targetBand={props.targetBand}
          kScore={props.kScore}
          sScore={props.sScore}
          aScore={props.aScore}
          track={props.track}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StudyContributionGrid
          streakDays={props.streakDays}
          lastStudyDate={props.lastStudyDate}
          anchorDateIso={props.anchorDateIso}
          activeDates={props.activeDates}
        />
        <BreathingPacer />
      </div>
    </div>
  );
}
