"use client";

/* Inspired by Lucian UX/UI Prompt (Copy to Clipboard Confirm) · MIT License (c) 2026 Seokwoooo */
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/lucian/ToastProvider";
import { cn } from "@/lib/utils";

interface CopyChipButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyChipButton({
  text,
  label = "Sao chép",
  copiedLabel = "Đã sao chép",
  className,
}: CopyChipButtonProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(
        "Không sao chép được",
        "Trình duyệt chặn quyền clipboard."
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors cursor-pointer",
        copied
          ? "border-[var(--ux-mint)]/40 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]"
          : "border-[var(--ux-line-2)] bg-[var(--ux-surface)] text-[var(--ux-ink-2)] hover:border-[var(--ux-accent)]/40 hover:text-[var(--ux-ink)]",
        className
      )}
    >
      {copied ? (
        <Check
          className="h-3.5 w-3.5 stroke-[2.5]"
          style={{ animation: "ux-pop-check 0.25s var(--ux-spring)" }}
        />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
