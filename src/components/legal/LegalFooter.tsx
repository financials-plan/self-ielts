import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LEGAL_POLICY_VERSION } from "@/lib/legal/constants";

export function LegalFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[var(--ux-ink-3)]">
        <Link href="/terms" className="hover:text-[var(--ux-ink)] hover:underline">
          Điều khoản sử dụng
        </Link>
        <Link
          href="/privacy"
          className="hover:text-[var(--ux-ink)] hover:underline"
        >
          Chính sách BVDLCN
        </Link>
        <span className="font-mono text-[11px]">{LEGAL_POLICY_VERSION}</span>
      </div>
    );
  }

  return (
    <footer className="border-t border-[var(--ux-line)] bg-[var(--ux-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-4 py-6 text-xs text-[var(--ux-ink-2)] sm:flex-row sm:items-center sm:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-[var(--ux-ink)]">
            <ShieldCheck className="h-4 w-4 text-[var(--ux-mint)]" />
            <span>
              Self-IELTS — Không dùng cookie quảng cáo hay theo dõi bên thứ ba
            </span>
          </div>
          <p className="text-[var(--ux-ink-3)]">
            Tham chiếu theo Luật BVDLCN 91/2025/QH15, NĐ 356/2025/NĐ-CP và Luật
            AI 134/2025/QH15 (Phiên bản {LEGAL_POLICY_VERSION})
          </p>
        </div>

        <nav
          aria-label="Liên kết pháp lý"
          className="flex flex-wrap items-center gap-5 font-medium"
        >
          <Link
            href="/terms"
            className="text-[var(--ux-ink-2)] hover:text-[var(--ux-accent)] hover:underline"
          >
            Điều khoản sử dụng
          </Link>
          <Link
            href="/privacy"
            className="text-[var(--ux-ink-2)] hover:text-[var(--ux-accent)] hover:underline"
          >
            Chính sách bảo vệ dữ liệu cá nhân
          </Link>
          <Link
            href="/settings#privacy-rights"
            className="text-[var(--ux-ink-2)] hover:text-[var(--ux-accent)] hover:underline"
          >
            Quyền dữ liệu của tôi
          </Link>
        </nav>
      </div>
    </footer>
  );
}
