"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  FileJson,
  Headphones,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Mic,
  PenTool,
  Settings,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { CommandPalette } from "@/components/lucian/CommandPalette";
import { useToast } from "@/components/lucian/ToastProvider";

interface AppShellProps {
  user: {
    name: string;
    email: string;
  };
  initialTrack: "academic" | "general";
  children: React.ReactNode;
}

const NAV_GROUPS = [
  {
    label: "Học tập hàng ngày",
    items: [{ href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard }],
  },
  {
    label: "4 Kỹ năng IELTS",
    items: [
      { href: "/listening", label: "Listening", icon: Headphones },
      { href: "/reading", label: "Reading", icon: BookOpen },
      { href: "/writing", label: "Writing", icon: PenTool },
      { href: "/speaking", label: "Speaking", icon: Mic },
    ],
  },
  {
    label: "Kho kiến thức & Hồ sơ",
    items: [
      { href: "/vault", label: "Kho thẻ SRS", icon: Layers },
      { href: "/errors", label: "Sổ lỗi sai", icon: AlertTriangle },
      { href: "/import", label: "Nhập đề JSON", icon: FileJson },
      { href: "/settings", label: "Cài đặt & AI", icon: Settings },
    ],
  },
];

export function AppShell({ user, initialTrack, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [track, setTrack] = useState<"academic" | "general">(initialTrack);
  const [switchingTrack, setSwitchingTrack] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleTrackChange = useCallback(
    async (nextTrack: "academic" | "general") => {
      if (nextTrack === track || switchingTrack) return;
      const prev = track;
      setTrack(nextTrack);
      setSwitchingTrack(true);
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetTrack: nextTrack }),
        });
        if (!res.ok) {
          setTrack(prev);
          toast.error("Không thể chuyển hệ thi", "Vui lòng thử lại sau.");
        } else {
          toast.success(
            nextTrack === "academic"
              ? "Đã chuyển sang IELTS Academic"
              : "Đã chuyển sang IELTS General Training",
            "Bảng quy đổi Band và gợi ý bài học đã được cập nhật."
          );
          router.refresh();
        }
      } catch {
        setTrack(prev);
        toast.error("Lỗi kết nối", "Không thể cập nhật hệ thi.");
      } finally {
        setSwitchingTrack(false);
      }
    },
    [track, switchingTrack, toast, router]
  );

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
    setSigningOut(false);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2"
          onClick={() => setMobileOpen(false)}
        >
          <svg
            viewBox="0 0 32 32"
            className="h-8 w-8 shrink-0"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="7" fill="var(--ux-accent)" />
            <path
              d="M9 10.5h14M9 16h9M9 21.5h12"
              stroke="var(--ux-accent-ink)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="22.5" cy="16" r="2.2" fill="var(--ux-mint)" />
          </svg>
          <div>
            <p className="font-display text-base font-semibold leading-tight text-[var(--ux-ink)]">
              Self-IELTS
            </p>
            <p className="text-[11px] text-[var(--ux-ink-3)]">
              Tự học theo khung KSA
            </p>
          </div>
        </Link>

        <nav className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-2.5 text-xs font-medium text-[var(--ux-ink-3)]">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "rounded-r-lg border-l-2 border-[var(--ux-accent)] bg-[var(--ux-accent-soft)] font-semibold text-[var(--ux-accent)]"
                        : "rounded-lg text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="space-y-3 border-t border-[var(--ux-line)] pt-4">
        <div className="px-2">
          <p className="truncate text-sm font-semibold text-[var(--ux-ink)]">
            {user.name}
          </p>
          <p className="truncate text-xs text-[var(--ux-ink-3)]">
            {user.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </Button>
        <div className="flex items-center justify-center gap-4 px-1 text-[11px] text-[var(--ux-ink-3)]">
          <Link
            href="/terms"
            className="hover:text-[var(--ux-accent)] hover:underline"
          >
            Điều khoản
          </Link>
          <Link
            href="/privacy"
            className="hover:text-[var(--ux-accent)] hover:underline"
          >
            Bảo mật dữ liệu
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--ux-page)] text-[var(--ux-ink)]">
      <aside className="hidden w-60 shrink-0 border-r border-[var(--ux-line)] bg-[var(--ux-surface)] lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-68 bg-[var(--ux-surface)] shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3.5 right-3.5 rounded-lg p-1.5 text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)]"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--ux-line)] bg-[var(--ux-surface)]/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[var(--ux-line)] p-2 text-[var(--ux-ink-2)] lg:hidden"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="h-4 w-4" />
            </button>

            <SlidingPillTabs
              size="sm"
              ariaLabel="Chuyển đổi hệ IELTS Academic và General Training"
              value={track}
              disabled={switchingTrack}
              onChange={handleTrackChange}
              options={[
                { value: "academic", label: "Academic" },
                { value: "general", label: "General Training" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <CommandPalette track={track} onSwitchTrack={handleTrackChange} />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
