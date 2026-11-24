"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import {
  calculateCriteriaBand,
  calculateOverallBand,
  rawToListeningBand,
  rawToReadingBand,
  type IeltsTrack,
} from "@/lib/ksa/bandCalculator";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CountUpNumber } from "@/components/lucian/CountUpNumber";
import { InkTooltip } from "@/components/lucian/InkTooltip";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";

const HALF_BANDS = [
  4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0,
];

const CRITERION_FULL_NAMES: Record<string, string> = {
  "TA / TR": "Task Achievement / Task Response",
  CC: "Coherence & Cohesion",
  LR: "Lexical Resource",
  GRA: "Grammatical Range & Accuracy",
  FC: "Fluency & Coherence",
  Pron: "Pronunciation",
};

export function BandCalculatorWidget({
  defaultTrack,
}: {
  defaultTrack: IeltsTrack;
}) {
  const [track, setTrack] = useState<IeltsTrack>(defaultTrack);
  const [listeningCorrect, setListeningCorrect] = useState(30);
  const [readingCorrect, setReadingCorrect] = useState(30);
  const [writingCriteria, setWritingCriteria] = useState<
    [number, number, number, number]
  >([6.5, 6.5, 6.0, 6.5]);
  const [speakingCriteria, setSpeakingCriteria] = useState<
    [number, number, number, number]
  >([6.5, 6.5, 6.0, 6.5]);

  const lBand = rawToListeningBand(listeningCorrect);
  const rBand = rawToReadingBand(readingCorrect, track);
  const rAcademicContrast = rawToReadingBand(readingCorrect, "academic");
  const rGeneralContrast = rawToReadingBand(readingCorrect, "general");
  const wBand = calculateCriteriaBand(writingCriteria);
  const sBand = calculateCriteriaBand(speakingCriteria);
  const overall = calculateOverallBand({
    listening: lBand,
    reading: rBand,
    writing: wBand,
    speaking: sBand,
  });

  const WRITING_LABELS = ["TA / TR", "CC", "LR", "GRA"];
  const SPEAKING_LABELS = ["FC", "LR", "GRA", "Pron"];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <Badge variant="K" className="mb-1.5">
              <Calculator className="h-3 w-3" />
              Bảng quy đổi Academic &amp; GT
            </Badge>
            <CardTitle className="font-display text-xl font-medium">
              Tính điểm Band IELTS (0–40 câu và 4 tiêu chí)
            </CardTitle>
          </div>

          <SlidingPillTabs
            size="sm"
            ariaLabel="Chọn hệ quy đổi Reading"
            value={track}
            onChange={setTrack}
            options={[
              { value: "academic", label: "Academic" },
              { value: "general", label: "General Training" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Listening + Reading Raw Scores */}
          <div className="space-y-4 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Listening ({listeningCorrect}/40 câu đúng)</span>
                <span className="font-mono text-sm text-[var(--ux-accent)]">
                  Band {lBand.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={listeningCorrect}
                onChange={(e) => setListeningCorrect(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-[var(--ux-accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>
                  Reading {track === "academic" ? "Academic" : "General"} (
                  {readingCorrect}/40 câu đúng)
                </span>
                <span className="font-mono text-sm text-[var(--ux-mint)]">
                  Band {rBand.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={readingCorrect}
                onChange={(e) => setReadingCorrect(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-[var(--ux-mint)]"
              />
              <p className="text-[11px] text-[var(--text-secondary)]">
                Đối chiếu cùng {readingCorrect}/40 câu: Academic ={" "}
                <strong className="font-mono">
                  {rAcademicContrast.toFixed(1)}
                </strong>{" "}
                · General Training ={" "}
                <strong className="font-mono">
                  {rGeneralContrast.toFixed(1)}
                </strong>
              </p>
            </div>
          </div>

          {/* Writing & Speaking Criteria */}
          <div className="space-y-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 p-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Writing (4 tiêu chí)</span>
                <span className="font-mono text-sm text-[var(--ux-accent)]">
                  Band {wBand.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {WRITING_LABELS.map((lbl, idx) => (
                  <label key={lbl} className="space-y-0.5 text-[10px]">
                    <InkTooltip
                      label={CRITERION_FULL_NAMES[lbl] ?? lbl}
                      className="w-fit"
                    >
                      <span className="block cursor-help text-[var(--ux-ink-2)] underline decoration-dotted underline-offset-2">
                        {lbl}
                      </span>
                    </InkTooltip>
                    <select
                      value={writingCriteria[idx]}
                      onChange={(e) => {
                        const next: [number, number, number, number] = [
                          ...writingCriteria,
                        ] as [number, number, number, number];
                        next[idx] = Number(e.target.value);
                        setWritingCriteria(next);
                      }}
                      className="h-8 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 font-mono text-xs"
                    >
                      {HALF_BANDS.map((b) => (
                        <option key={b} value={b}>
                          {b.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Speaking (4 tiêu chí)</span>
                <span className="font-mono text-sm text-[var(--ux-warn)]">
                  Band {sBand.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {SPEAKING_LABELS.map((lbl, idx) => (
                  <label key={lbl} className="space-y-0.5 text-[10px]">
                    <InkTooltip
                      label={CRITERION_FULL_NAMES[lbl] ?? lbl}
                      className="w-fit"
                    >
                      <span className="block cursor-help text-[var(--ux-ink-2)] underline decoration-dotted underline-offset-2">
                        {lbl}
                      </span>
                    </InkTooltip>
                    <select
                      value={speakingCriteria[idx]}
                      onChange={(e) => {
                        const next: [number, number, number, number] = [
                          ...speakingCriteria,
                        ] as [number, number, number, number];
                        next[idx] = Number(e.target.value);
                        setSpeakingCriteria(next);
                      }}
                      className="h-8 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 font-mono text-xs"
                    >
                      {HALF_BANDS.map((b) => (
                        <option key={b} value={b}>
                          {b.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ux-accent)]/30 bg-[var(--ux-accent-soft)]/50 px-5 py-3.5">
          <div className="text-xs text-[var(--ux-ink-2)]">
            Quy tắc làm tròn IELTS chính thức: trung bình cộng 4 kỹ năng (.25
            làm tròn lên .5, .75 làm tròn lên 1.0)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-[var(--ux-ink)]">
              Overall Band
            </span>
            <span className="font-mono text-2xl font-semibold text-[var(--ux-accent)]">
              <CountUpNumber value={overall} decimals={1} durationMs={500} />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
