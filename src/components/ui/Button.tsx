import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ux-accent)] text-[var(--ux-accent-ink)] hover:brightness-110",
  secondary:
    "bg-[var(--ux-surface-2)] text-[var(--ux-ink)] hover:bg-[var(--ux-surface-3)]",
  outline:
    "border border-[var(--ux-line-2)] bg-[var(--ux-surface)] text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]",
  ghost:
    "text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]",
  danger:
    "bg-[var(--ux-danger)] text-[var(--ux-danger-ink)] hover:brightness-110",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-5 text-sm rounded-lg gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ux-accent)]",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
