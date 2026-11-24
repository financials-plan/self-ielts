"use client";

/* Inspired by Lucian UX/UI Prompt (Skeleton Shimmer) · MIT License (c) 2026 Seokwoooo */
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("ux-skeleton rounded-lg bg-[var(--ux-surface-2)]", className)}
    />
  );
}
