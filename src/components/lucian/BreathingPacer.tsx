"use client";

/* Inspired by Lucian UX/UI Prompt #193 · MIT License (c) 2026 Seokwoooo */
import { useEffect, useState } from "react";
import { Pause, Play, Wind } from "lucide-react";

const PHASES = [
  { name: "Hít vào chậm", sec: 4, scale: 1.05, color: "var(--ux-accent)" },
  { name: "Giữ nhịp", sec: 2, scale: 1.05, color: "var(--ux-mint)" },
  { name: "Thở ra đều", sec: 4, scale: 0.72, color: "var(--ux-warn)" },
] as const;

export function BreathingPacer() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secLeft, setSecLeft] = useState<number>(PHASES[0].sec);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIdx((p) => {
          const next = (p + 1) % PHASES.length;
          if (next === 0) setCycles((c) => c + 1);
          setSecLeft(PHASES[next].sec);
          return next;
        });
        return 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) {
      setRunning(false);
      setPhaseIdx(0);
      setSecLeft(PHASES[0].sec);
    } else {
      setPhaseIdx(0);
      setSecLeft(PHASES[0].sec);
      setRunning(true);
    }
  }

  const currentPhase = PHASES[phaseIdx];

  return (
    <div
      id="breathing-pacer"
      className="flex flex-col justify-between rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-[var(--ux-ink)]">
            <Wind className="h-4 w-4 text-[var(--ux-warn)]" />
            Ổn định nhịp thở 4–2–4 giây
          </h3>
          <p className="mt-0.5 text-xs text-[var(--ux-ink-3)]">
            Giúp giữ bình tĩnh trước khi bấm nghe hoặc ghi âm Speaking
          </p>
        </div>
        <span className="rounded-full bg-[var(--ux-warn-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ux-warn)]">
          {cycles} chu kỳ
        </span>
      </div>

      <div className="my-4 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={running}
          aria-label={
            running
              ? "Dừng bài tập thở ổn định tâm lý"
              : "Bắt đầu bài tập thở 4-2-4 giây"
          }
          className="relative grid h-32 w-32 place-items-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ux-accent)]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-25"
            style={{
              backgroundColor: running
                ? currentPhase.color
                : "var(--ux-accent)",
              transform: `scale(${running ? currentPhase.scale : 0.84})`,
              transition: "transform 1.1s var(--ux-ease), background-color 0.4s",
            }}
          />
          <span
            className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-[var(--ux-line-2)] bg-[var(--ux-surface)] shadow-sm"
            style={{
              transform: `scale(${running ? (phaseIdx === 2 ? 0.9 : 1.04) : 1})`,
              transition: "transform 1.1s var(--ux-ease)",
            }}
          >
            {running ? (
              <>
                <span
                  className="font-mono text-2xl font-bold tabular-nums"
                  style={{ color: currentPhase.color }}
                >
                  {secLeft}s
                </span>
                <span className="text-[11px] font-semibold text-[var(--ux-ink-2)]">
                  {currentPhase.name}
                </span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 text-[var(--ux-accent)]" />
                <span className="mt-1 text-xs font-semibold text-[var(--ux-ink)]">
                  Bấm để thở
                </span>
              </>
            )}
          </span>
        </button>

        <p className="text-center text-xs text-[var(--ux-ink-2)]">
          {running
            ? "Bấm lại vòng tròn để dừng · Tập 3 chu kỳ trước khi bấm ghi âm hoặc nghe."
            : "Giúp giảm hoảng loạn khi lỡ 1 câu Listening và bớt ậm ờ khi vào phòng Speaking."}
        </p>
      </div>

      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface-2)] text-xs font-semibold text-[var(--ux-ink)] hover:bg-[var(--ux-surface-3)] cursor-pointer"
      >
        {running ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            Dừng nhịp thở
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" />
            Bắt đầu 30 giây bình tĩnh
          </>
        )}
      </button>
    </div>
  );
}
