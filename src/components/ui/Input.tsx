import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3.5 text-sm text-[var(--ux-ink)] placeholder:text-[var(--ux-ink-3)] focus:border-[var(--ux-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ux-accent-soft)] disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
