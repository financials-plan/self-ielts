"use client";

/* Inspired by Lucian UX/UI Prompt #021 · MIT License (c) 2026 Seokwoooo */
import { useEffect, useState } from "react";

const THEME_KEY = "self_ielts_theme";
const THEME_EVENT = "self-ielts-theme-change";

export function applyAppTheme(nextDark: boolean) {
  document.documentElement.classList.toggle("dark", nextDark);
  document.documentElement.setAttribute(
    "data-theme",
    nextDark ? "dark" : "light"
  );
  try {
    window.localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextDark }));
}

export function DayNightSwitch() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => {
      setDark(
        document.documentElement.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark"
      );
    };
    sync();

    const onThemeEvent = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setDark(detail);
      else sync();
    };
    window.addEventListener(THEME_EVENT, onThemeEvent);
    return () => window.removeEventListener(THEME_EVENT, onThemeEvent);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
      title={dark ? "Chế độ Tối · Bấm để chuyển Sáng" : "Chế độ Sáng · Bấm để chuyển Tối"}
      onClick={() => {
        const next = !dark;
        setDark(next);
        applyAppTheme(next);
      }}
      className="relative inline-flex h-8 w-[62px] shrink-0 items-center overflow-hidden rounded-full p-1 transition-shadow duration-500 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ux-accent)]"
      style={{
        background: dark
          ? "linear-gradient(180deg, #141a3a, #232c5c)"
          : "linear-gradient(180deg, #5db7ff, #9ed8ff)",
        boxShadow: dark
          ? "inset 0 2px 6px rgba(0,0,0,.55), 0 6px 14px -8px rgba(20,24,70,.8)"
          : "inset 0 2px 6px rgba(0,30,80,.22), 0 6px 14px -8px rgba(40,110,200,.55)",
      }}
    >
      {/* Twinkling stars in night mode */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ opacity: dark ? 1 : 0 }}
      >
        <span
          className="absolute top-1.5 left-2.5 h-1 w-1 rounded-full bg-white"
          style={{ animation: "ux-twinkle 2.4s ease-in-out infinite" }}
        />
        <span
          className="absolute bottom-2 left-4 h-0.5 w-0.5 rounded-full bg-amber-100"
          style={{ animation: "ux-twinkle 1.9s 0.4s ease-in-out infinite" }}
        />
        <span
          className="absolute top-2.5 left-6 h-1 w-1 rounded-full bg-sky-100"
          style={{ animation: "ux-twinkle 2.8s 0.8s ease-in-out infinite" }}
        />
      </span>

      {/* Soft clouds in day mode */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 bottom-1 flex items-end gap-0.5 transition-all duration-500"
        style={{
          opacity: dark ? 0 : 0.9,
          transform: dark ? "translateY(8px)" : "translateY(0)",
        }}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
        <span className=" -ml-1 h-2 w-3 rounded-full bg-white/85" />
      </span>

      {/* Sun -> Cratered Moon Knob */}
      <span
        aria-hidden="true"
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500"
        style={{
          transform: dark ? "translateX(30px)" : "translateX(0px)",
          transitionTimingFunction: "var(--ux-spring)",
          background: dark
            ? "radial-gradient(circle at 35% 35%, #f5f3ea, #d5d0bf)"
            : "radial-gradient(circle at 35% 35%, #fff5a8, #ffb938)",
          boxShadow: dark
            ? "0 0 10px rgba(235,230,205,.45)"
            : "0 0 12px rgba(255,196,61,.75)",
        }}
      >
        {dark && (
          <>
            <span className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-stone-400/50" />
            <span className="absolute right-1.5 bottom-1.5 h-1 w-1 rounded-full bg-stone-400/60" />
          </>
        )}
      </span>
    </button>
  );
}
