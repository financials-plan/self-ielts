"use client";

/* Inspired by Lucian UX/UI Prompt #438 · MIT License (c) 2026 Seokwoooo */
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MorphStatus = "idle" | "loading" | "done" | "error";

interface MorphSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: MorphStatus;
  idleLabel: string;
  loadingLabel?: string;
  doneLabel?: string;
  errorLabel?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "outline";
}

export function MorphSubmitButton({
  status,
  idleLabel,
  loadingLabel = "Đang xử lý...",
  doneLabel = "Hoàn tất",
  errorLabel = "Thử lại",
  icon,
  variant = "primary",
  className,
  disabled,
  type = "button",
  ...props
}: MorphSubmitButtonProps) {
  const isBusy = status === "loading";
  const isDone = status === "done";
  const isError = status === "error";

  return (
    <button
      type={type}
      disabled={disabled || isBusy}
      className={cn(
        "relative inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold cursor-pointer active:scale-[0.98] disabled:opacity-55 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ux-accent)]",
        isDone
          ? "bg-[var(--ux-mint)] text-[var(--ux-mint-ink)]"
          : isError
            ? "bg-[var(--ux-danger)] text-[var(--ux-danger-ink)]"
            : variant === "outline"
              ? "border border-[var(--ux-line-2)] bg-[var(--ux-surface)] text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
              : "bg-[var(--ux-accent)] text-[var(--ux-accent-ink)] hover:brightness-110",
        className
      )}
      style={{
        transition:
          "background-color 0.35s var(--ux-ease), transform 0.35s var(--ux-spring), padding 0.35s var(--ux-spring)",
      }}
      {...props}
    >
      {isBusy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : isDone ? (
        <>
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4.5 10.5L8.2 14.2L15.8 6.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              style={{ animation: "ux-draw-check 0.35s var(--ux-ease) forwards" }}
            />
          </svg>
          <span>{doneLabel}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{isError ? errorLabel : idleLabel}</span>
        </>
      )}
    </button>
  );
}
