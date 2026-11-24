"use client";

/* Inspired by Lucian UX/UI Prompt #039 · MIT License (c) 2026 Seokwoooo */
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface PillTabOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface SlidingPillTabsProps<T extends string> {
  options: PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export function SlidingPillTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  disabled = false,
  className,
}: SlidingPillTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
    ready: boolean;
  }>({ left: 4, width: 0, ready: false });

  const updatePill = useCallback(() => {
    const activeEl = tabRefs.current[value];
    if (!activeEl) return;
    setPillStyle({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
      ready: true,
    });
  }, [value]);

  useEffect(() => {
    updatePill();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updatePill());
    ro.observe(container);
    return () => ro.disconnect();
  }, [updatePill, options]);

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    let targetIdx: number | null = null;
    if (e.key === "ArrowRight") targetIdx = (idx + 1) % options.length;
    else if (e.key === "ArrowLeft")
      targetIdx = (idx - 1 + options.length) % options.length;
    else if (e.key === "Home") targetIdx = 0;
    else if (e.key === "End") targetIdx = options.length - 1;

    if (targetIdx !== null) {
      e.preventDefault();
      const next = options[targetIdx];
      onChange(next.value);
      tabRefs.current[next.value]?.focus();
    }
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center rounded-full border border-[var(--ux-line)] bg-[var(--ux-surface-2)] p-1",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[var(--ux-accent)] shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--ux-accent)_45%,transparent)]"
        style={{
          left: 0,
          width: pillStyle.width || undefined,
          transform: `translateX(${pillStyle.left}px)`,
          opacity: pillStyle.ready ? 1 : 0,
          transition:
            "transform 0.45s var(--ux-spring), width 0.45s var(--ux-spring), opacity 0.2s",
        }}
      />

      {options.map((opt, idx) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              tabRefs.current[opt.value] = el;
            }}
            type="button"
            role="tab"
            disabled={disabled}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors duration-300 cursor-pointer disabled:opacity-60",
              size === "sm" ? "h-7 px-3 text-xs" : "h-9 px-4 text-xs sm:text-sm",
              selected
                ? "text-[var(--ux-accent-ink)]"
                : "text-[var(--ux-ink-2)] hover:text-[var(--ux-ink)]"
            )}
          >
            <span>{opt.label}</span>
            {opt.badge && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  selected
                    ? "bg-white/20 text-[var(--ux-accent-ink)]"
                    : "bg-[var(--ux-surface)] text-[var(--ux-ink-3)]"
                )}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
