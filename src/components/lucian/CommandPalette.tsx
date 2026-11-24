"use client";

/* Inspired by Lucian UX/UI Prompt #046 + #471 · MIT License (c) 2026 Seokwoooo */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Compass,
  FileJson,
  Headphones,
  LayoutDashboard,
  Layers,
  Mic,
  PenTool,
  Search,
  Settings,
  SunMoon,
  Wind,
} from "lucide-react";
import { applyAppTheme } from "./DayNightSwitch";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  keywords: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface CommandPaletteProps {
  track: "academic" | "general";
  onSwitchTrack: (next: "academic" | "general") => void;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <>
      {before}
      <mark className="rounded bg-[var(--ux-accent-soft)] px-0.5 font-bold text-[var(--ux-accent)]">
        {match}
      </mark>
      {after}
    </>
  );
}

export function CommandPalette({ track, onSwitchTrack }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "nav-dashboard",
        label: "Mở trang Tổng quan KSA",
        keywords: "dashboard tong quan ksa radar",
        group: "Điều hướng",
        icon: LayoutDashboard,
        action: () => router.push("/dashboard"),
      },
      {
        id: "nav-listening",
        label: "Listening Studio (Nghe)",
        keywords: "listening nghe distractor dictation",
        group: "4 Kỹ năng",
        icon: Headphones,
        action: () => router.push("/listening"),
      },
      {
        id: "nav-reading",
        label: "Reading Studio (Đọc · Acad / GT)",
        keywords: "reading doc evidence paraphrase tfng",
        group: "4 Kỹ năng",
        icon: BookOpen,
        action: () => router.push("/reading"),
      },
      {
        id: "nav-writing",
        label: "Writing 4-Stage Studio (Viết)",
        keywords: "writing viet outline task1 task2 letter",
        group: "4 Kỹ năng",
        icon: PenTool,
        action: () => router.push("/writing"),
      },
      {
        id: "nav-speaking",
        label: "Speaking Coach & Shadowing (Nói)",
        keywords: "speaking noi shadowing cue card audio",
        group: "4 Kỹ năng",
        icon: Mic,
        action: () => router.push("/speaking"),
      },
      {
        id: "nav-vault",
        label: "Knowledge Vault · Kho ôn SRS",
        keywords: "vault srs flashcards vocab paraphrase",
        group: "Hệ sinh thái KSA",
        icon: Layers,
        action: () => router.push("/vault"),
      },
      {
        id: "nav-errors",
        label: "Sổ lỗi sai K–S–A",
        keywords: "error journal loi sai phan tich",
        group: "Hệ sinh thái KSA",
        icon: AlertTriangle,
        action: () => router.push("/errors"),
      },
      {
        id: "nav-import",
        label: "Nhập bộ đề JSON chuẩn hóa",
        keywords: "import nhap de json lesson pack",
        group: "Hệ sinh thái KSA",
        icon: FileJson,
        action: () => router.push("/import"),
      },
      {
        id: "nav-settings",
        label: "Cài đặt Hồ sơ & AI Miễn phí (BYOK 0đ)",
        keywords: "settings cai dat ai byok gemini groq key",
        group: "Hệ sinh thái KSA",
        icon: Settings,
        action: () => router.push("/settings"),
      },
      {
        id: "nav-onboarding",
        label: "Chạy lại Onboarding KSA",
        keywords: "onboarding thiet lap muc tieu band",
        group: "Hành động nhanh",
        icon: Compass,
        action: () => router.push("/onboarding"),
      },
      {
        id: "act-breathe",
        label: "Luyện thở hạ hồi hộp trước khi thi (4–2–4s)",
        keywords: "attitude tho binh tinh speaking listening pacer",
        group: "Hành động nhanh",
        icon: Wind,
        action: () => router.push("/dashboard#breathing-pacer"),
      },
      {
        id: "act-track",
        label:
          track === "academic"
            ? "Chuyển hệ thi sang General Training"
            : "Chuyển hệ thi sang IELTS Academic",
        keywords: "track academic general training chuyen he",
        group: "Hành động nhanh",
        icon: BookOpen,
        action: () =>
          onSwitchTrack(track === "academic" ? "general" : "academic"),
      },
      {
        id: "act-theme",
        label: "Đổi giao diện Sáng / Tối",
        keywords: "theme dark light sang toi",
        group: "Hành động nhanh",
        icon: SunMoon,
        action: () => {
          const isDark = document.documentElement.classList.contains("dark");
          applyAppTheme(!isDark);
        },
      },
    ],
    [router, track, onSwitchTrack]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);

  useEffect(() => {
    function onGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  function runCommand(item: CommandItem) {
    setOpen(false);
    item.action();
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIdx];
      if (target) runCommand(target);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở bảng lệnh nhanh (Ctrl+K)"
        className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink-2)] shadow-xs transition-all hover:border-[var(--ux-accent)]/50 hover:text-[var(--ux-ink)] cursor-pointer"
      >
        <Search className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
        <span className="hidden sm:inline">Tìm nhanh kỹ năng...</span>
        <kbd className="rounded bg-[var(--ux-surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ux-ink-3)]">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bảng lệnh nhanh KSA"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] shadow-[0_24px_48px_-16px_var(--ux-shadow-strong)]"
            style={{ animation: "ux-toast-in 0.24s var(--ux-spring) both" }}
          >
            <div className="flex items-center gap-2.5 border-b border-[var(--ux-line)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--ux-accent)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Gõ tên kỹ năng, cài đặt hoặc hành động (VD: reading, byok, thở)..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ux-ink)] outline-none placeholder:text-[var(--ux-ink-3)]"
              />
              <kbd className="rounded border border-[var(--ux-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ux-ink-3)]">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-[var(--ux-ink-3)]">
                  Không tìm thấy lệnh phù hợp với &ldquo;{query}&rdquo;.
                </p>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => runCommand(item)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer",
                        active
                          ? "bg-[var(--ux-accent-soft)] text-[var(--ux-ink)]"
                          : "text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)]"
                      )}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active
                              ? "text-[var(--ux-accent)]"
                              : "text-[var(--ux-ink-3)]"
                          )}
                        />
                        <span className="truncate font-medium">
                          <HighlightMatch text={item.label} query={query} />
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-[var(--ux-ink-3)]">
                        {item.group}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
