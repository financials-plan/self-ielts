"use client";

/* Inspired by Lucian UX/UI Prompt #050 · MIT License (c) 2026 Seokwoooo */
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SpotlightTiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightTiltCard({
  children,
  className,
}: SpotlightTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height - 0.5) * -2).toFixed(2);
    const ry = ((x / rect.width - 0.5) * 2).toFixed(2);

    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
  }

  function handlePointerLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "ux-spotlight-card rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] hover:border-[var(--ux-line-2)]",
        className
      )}
    >
      {children}
    </div>
  );
}
