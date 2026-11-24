"use client";

/* Inspired by Lucian UX/UI Prompt (Tooltip) · MIT License (c) 2026 Seokwoooo */
import { useId } from "react";
import { cn } from "@/lib/utils";

interface InkTooltipProps {
  label: React.ReactNode;
  children: React.ReactElement | React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

export function InkTooltip({
  label,
  children,
  side = "top",
  className,
}: InkTooltipProps) {
  const tooltipId = useId();

  return (
    <span className={cn("group relative inline-flex", className)}>
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.currentTarget.blur();
          }
        }}
        className="inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ux-accent)]"
      >
        {children}
      </span>

      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-40 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-md border border-[var(--ux-line-2)] bg-[var(--ux-ink)] px-2.5 py-1.5 text-[11px] leading-snug font-normal text-[var(--ux-page)] opacity-0 shadow-sm transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
          side === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5"
        )}
      >
        {label}
      </span>
    </span>
  );
}
