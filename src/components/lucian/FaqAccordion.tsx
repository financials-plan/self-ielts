"use client";

/* Inspired by Lucian UX/UI Prompt #044 · MIT License (c) 2026 Seokwoooo */
import { useRef, useState } from "react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      triggerRefs.current[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      triggerRefs.current[(idx - 1 + items.length) % items.length]?.focus();
    }
  }

  return (
    <div className="divide-y divide-[var(--ux-line)] border-y border-[var(--ux-line)]">
      {items.map((item, idx) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="transition-colors">
            <button
              ref={(el) => {
                triggerRefs.current[idx] = el;
              }}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer"
            >
              <span className="text-sm font-semibold text-[var(--ux-ink)] sm:text-base">
                {item.question}
              </span>
              {/* Plus-to-Minus animated stroke */}
              <span
                aria-hidden="true"
                className="relative flex h-5 w-5 shrink-0 items-center justify-center text-[var(--ux-accent)]"
              >
                <span className="h-0.5 w-3.5 rounded-full bg-current" />
                <span
                  className="absolute h-3.5 w-0.5 rounded-full bg-current transition-transform duration-300"
                  style={{
                    transform: isOpen
                      ? "rotate(90deg) scaleY(0)"
                      : "rotate(0deg) scaleY(1)",
                    transitionTimingFunction: "var(--ux-spring)",
                  }}
                />
              </span>
            </button>

            <div
              id={`faq-panel-${item.id}`}
              className="grid transition-[grid-template-rows,opacity] duration-300"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
                transitionTimingFunction: "var(--ux-ease)",
              }}
            >
              <div className="overflow-hidden">
                <p className="pb-4 pr-8 text-sm leading-relaxed text-[var(--ux-ink-2)]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
