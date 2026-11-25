"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LegalFooter } from "@/components/legal/LegalFooter";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const safeNext =
      nextUrl && nextUrl.startsWith("/") && !nextUrl.startsWith("//")
        ? nextUrl
        : "/dashboard";

    const { error: authError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message || "Email hoặc mật khẩu chưa chính xác. Vui lòng thử lại."
      );
      setLoading(false);
      return;
    }

    router.push(safeNext);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ux-ink-2)] hover:text-[var(--ux-ink)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Về trang chủ
        </Link>
        <ThemeToggle />
      </div>

      <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-6 sm:p-7">
        <div className="mb-5 space-y-1.5">
          <h1 className="font-display text-2xl font-semibold text-[var(--ux-ink)]">
            Đăng nhập vào Self-IELTS
          </h1>
          <p className="text-sm text-[var(--ux-ink-2)]">
            Tiếp tục lộ trình Listening, Reading, Writing và Speaking theo khung
            KSA của riêng bạn.
          </p>
        </div>

        <form method="post" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="hocvien@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-sm font-medium">
              Mật khẩu
            </label>
            <Input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-[var(--ux-danger)]/30 bg-[var(--ux-danger-soft)] px-3.5 py-2 text-sm text-[var(--ux-danger)]">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--ux-ink-2)]">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--ux-accent)] hover:underline"
          >
            Tạo tài khoản miễn phí
          </Link>
        </p>

        <LegalFooter compact />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--ux-page)] lg:grid lg:grid-cols-12">
      <aside className="hidden border-r border-[var(--ux-line)] bg-[var(--ux-surface-2)]/70 p-10 lg:col-span-5 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
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
          <span className="font-display text-xl font-semibold text-[var(--ux-ink)]">
            Self-IELTS
          </span>
        </Link>

        <div className="max-w-sm space-y-4">
          <p className="font-display text-3xl leading-snug font-semibold text-[var(--ux-ink)]">
            Luyện IELTS hiệu quả bắt đầu từ việc nhìn rõ{" "}
            <span className="font-bold text-[var(--ux-accent)]">
              điểm nghẽn
            </span>{" "}
            của chính mình.
          </p>
          <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
            Kho thẻ SRS, sổ lỗi sai theo gốc rễ K–S–A và mục tiêu Academic /
            General Training của bạn được đồng bộ tách biệt theo từng tài khoản.
          </p>
        </div>

        <p className="text-xs text-[var(--ux-ink-3)]">
          Miễn phí sử dụng, không gắn quảng cáo hay cookie theo dõi bên thứ ba.
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:col-span-7">
        <Suspense
          fallback={
            <div className="text-sm text-[var(--ux-ink-2)]">Đang tải...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
