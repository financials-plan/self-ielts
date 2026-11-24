import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "K" | "S" | "A" | "academic" | "general" | "free";

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  neutral:
    "bg-[var(--ux-surface-2)] text-[var(--ux-ink-2)] border-[var(--ux-line)]",
  K: "bg-[var(--ksa-k-soft)] text-[var(--ksa-k)] border-[var(--ksa-k)]/25",
  S: "bg-[var(--ksa-s-soft)] text-[var(--ksa-s)] border-[var(--ksa-s)]/25",
  A: "bg-[var(--ksa-a-soft)] text-[var(--ksa-a)] border-[var(--ksa-a)]/25",
  academic:
    "bg-[var(--ux-accent-soft)] text-[var(--ux-accent)] border-[var(--ux-accent)]/25",
  general:
    "bg-[var(--ux-mint-soft)] text-[var(--ux-mint)] border-[var(--ux-mint)]/25",
  free: "bg-[var(--ux-mint-soft)] text-[var(--ux-mint)] border-[var(--ux-mint)]/25",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        BADGE_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}

export function KsaBadge({
  dimension,
  label,
}: {
  dimension: "K" | "S" | "A";
  label?: string;
}) {
  const defaults = {
    K: "K: Knowledge",
    S: "S: Skills",
    A: "A: Attitudes",
  };
  return <Badge variant={dimension}>{label ?? defaults[dimension]}</Badge>;
}

export function TrackBadge({ track }: { track: "academic" | "general" }) {
  return (
    <Badge variant={track}>
      {track === "academic" ? "IELTS Academic" : "General Training"}
    </Badge>
  );
}
