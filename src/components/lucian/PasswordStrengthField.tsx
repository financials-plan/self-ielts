"use client";

/* Inspired by Lucian UX/UI Prompt #036 · MIT License (c) 2026 Seokwoooo */
import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { evaluatePasswordStrength } from "@/lib/lucian/helpers";
import { cn } from "@/lib/utils";

interface PasswordStrengthFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

const LEVEL_COLORS: Record<string, string> = {
  empty: "var(--ux-line-2)",
  weak: "var(--ux-danger)",
  fair: "var(--ux-warn)",
  good: "var(--ux-accent-2)",
  strong: "var(--ux-mint)",
};

export function PasswordStrengthField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "new-password",
}: PasswordStrengthFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = evaluatePasswordStrength(value);
  const levelColor = LEVEL_COLORS[strength.level];

  const ruleItems = [
    { ok: strength.rules.minLength, text: "≥ 8 ký tự" },
    { ok: strength.rules.hasUpper, text: "Chữ hoa (A–Z)" },
    { ok: strength.rules.hasNumber, text: "Chữ số (0–9)" },
    { ok: strength.rules.hasSymbol, text: "Ký tự đặc biệt" },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-[var(--ux-ink)]">
          {label}
        </label>
        <span
          className="text-xs font-medium transition-colors"
          style={{ color: value ? levelColor : "var(--ux-ink-3)" }}
        >
          {strength.labelVi}
        </span>
      </div>

      <div
        className="flex h-10 items-center rounded-lg border bg-[var(--ux-surface)] pr-1.5 pl-3.5 transition-shadow duration-200"
        style={{
          borderColor: value ? levelColor : "var(--ux-line-2)",
          boxShadow: value
            ? `0 0 0 3px color-mix(in srgb, ${levelColor} 15%, transparent)`
            : undefined,
        }}
      >
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium tracking-wide text-[var(--ux-ink)] outline-none placeholder:text-[var(--ux-ink-3)]"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="grid h-8 w-8 place-items-center rounded-lg text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)] cursor-pointer"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* 4-segment strength bar */}
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => {
          const active = strength.score >= seg;
          return (
            <div
              key={seg}
              className="h-1.5 overflow-hidden rounded-full bg-[var(--ux-surface-3)]"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: active ? "100%" : "0%",
                  backgroundColor: levelColor,
                  transitionTimingFunction: "var(--ux-spring)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Interactive rule checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        {ruleItems.map((rule) => (
          <div
            key={rule.text}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              rule.ok ? "text-[var(--ux-mint)] font-medium" : "text-[var(--ux-ink-3)]"
            )}
          >
            <span
              className={cn(
                "grid h-4 w-4 place-items-center rounded-full border transition-all",
                rule.ok
                  ? "border-[var(--ux-mint)] bg-[var(--ux-mint)] text-[var(--ux-mint-ink)]"
                  : "border-[var(--ux-line-2)] bg-transparent"
              )}
              style={
                rule.ok ? { animation: "ux-pop-check 0.32s var(--ux-spring)" } : undefined
              }
            >
              {rule.ok && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </span>
            <span>{rule.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
