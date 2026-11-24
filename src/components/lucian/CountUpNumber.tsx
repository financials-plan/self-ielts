"use client";

/* Inspired by Lucian UX/UI Prompt (Animated Counter) · MIT License (c) 2026 Seokwoooo */
import { useEffect, useRef, useState } from "react";
import { computeCountUpValue } from "@/lib/lucian/helpers";
import { cn } from "@/lib/utils";

interface CountUpNumberProps {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
}

export function CountUpNumber({
  value,
  decimals = 0,
  durationMs = 900,
  className,
}: CountUpNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(value);
  const [display, setDisplay] = useState<number>(value);

  targetRef.current = value;

  useEffect(() => {
    if (hasAnimatedRef.current) {
      setDisplay(value);
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      prefersReduced ||
      value === 0 ||
      typeof IntersectionObserver === "undefined"
    ) {
      hasAnimatedRef.current = true;
      setDisplay(value);
      return;
    }

    const el = spanRef.current;
    if (!el) return;

    const startAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      const startTime = performance.now();
      setDisplay(0);

      const tick = (now: number) => {
        const currentTarget = targetRef.current;
        const elapsed = now - startTime;
        const nextVal = computeCountUpValue(
          currentTarget,
          elapsed,
          durationMs,
          decimals
        );
        setDisplay(nextVal);
        if (elapsed < durationMs) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(currentTarget);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          startAnimation();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value, decimals, durationMs]);

  return (
    <span
      ref={spanRef}
      aria-label={value.toFixed(decimals)}
      className={cn("tabular-nums", className)}
    >
      {display.toFixed(decimals)}
    </span>
  );
}
