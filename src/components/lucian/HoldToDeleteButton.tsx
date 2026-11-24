"use client";

/* Inspired by Lucian UX/UI Prompt #003 · MIT License (c) 2026 Seokwoooo */
import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldToDeleteButtonProps {
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  holdMs?: number;
  label?: string;
  ariaLabel?: string;
}

export function HoldToDeleteButton({
  onConfirm,
  disabled = false,
  holdMs = 1000,
  label = "Giữ để xóa",
  ariaLabel = "Giữ 1 giây để xác nhận xóa",
}: HoldToDeleteButtonProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const firedRef = useRef(false);

  function stopHold() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setHolding(false);
    setProgress(0);
    firedRef.current = false;
  }

  function startHold() {
    if (disabled || holding) return;
    firedRef.current = false;
    setHolding(true);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(100, (elapsed / holdMs) * 100);
      setProgress(pct);
      if (pct >= 100 && !firedRef.current) {
        firedRef.current = true;
        stopHold();
        void onConfirm();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      title="Nhấn và giữ 1 giây để xóa (tránh bấm nhầm)"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          startHold();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") {
          stopHold();
        }
      }}
      className={cn(
        "relative inline-flex h-8 select-none items-center gap-1.5 overflow-hidden rounded-lg border px-3 text-xs font-medium cursor-pointer disabled:opacity-50",
        holding
          ? "border-[var(--ux-danger)] text-[var(--ux-danger)] scale-[0.97]"
          : "border-[var(--ux-line-2)] bg-[var(--ux-surface)] text-[var(--ux-ink-2)] hover:border-[var(--ux-danger)]/50 hover:text-[var(--ux-danger)]"
      )}
      style={{ transition: "transform 0.2s var(--ux-spring), border-color 0.2s" }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 bg-[var(--ux-danger-soft)]"
        style={{ width: `${progress}%` }}
      />
      <Trash2 className="relative z-10 h-3.5 w-3.5" />
      <span className="relative z-10">
        {holding ? "Đang xác nhận..." : label}
      </span>
    </button>
  );
}
