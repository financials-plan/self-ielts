"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PasswordStrengthField } from "@/components/lucian/PasswordStrengthField";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import {
  TermsConsentGroup,
  type TermsConsentValues,
} from "@/components/lucian/TermsConsentGroup";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { useToast } from "@/components/lucian/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consents, setConsents] = useState<TermsConsentValues>({
    termsAndPrivacy: false,
    ageConfirmed: false,
    aiTransferAccepted: false,
  });
  const [consentErrorHighlighted, setConsentErrorHighlighted] = useState(false);
  const [status, setStatus] = useState<MorphStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const canSubmit = consents.termsAndPrivacy && consents.ageConfirmed;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConsentErrorHighlighted(false);

    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!consents.termsAndPrivacy || !consents.ageConfirmed) {
      setConsentErrorHighlighted(true);
      setError(
        "Vui lòng tick chấp nhận Điều khoản sử dụng, Chính sách BVDLCN và xác nhận độ tuổi (≥ 16 hoặc có sự đồng ý của người giám hộ)."
      );
      return;
    }

    setStatus("loading");
    const { error: authError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (authError) {
      setStatus("error");
      setError(
        authError.message ||
          "Không thể đăng ký tài khoản. Vui lòng kiểm tra lại email."
      );
      return;
    }

    // Record verifiable consent audit evidence (Khoản 1, 2 Điều 6 NĐ 356/2025)
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consents: [
            {
              consentType: "terms_and_privacy",
              accepted: consents.termsAndPrivacy,
            },
            {
              consentType: "age_guardian_confirm",
              accepted: consents.ageConfirmed,
            },
            {
              consentType: "ai_third_party_transfer",
              accepted: consents.aiTransferAccepted,
            },
          ],
        }),
      });
    } catch {
      // Do not block onboarding navigation if audit call experienced transient failure
    }

    setStatus("done");
    toast.success(
      "Tạo tài khoản thành công",
      "Đã ghi nhận xác nhận điều khoản & quyền riêng tư của bạn."
    );
    router.push("/onboarding");
    router.refresh();
  }

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
            Không cần thẻ thanh toán. Dữ liệu học tập thuộc{" "}
            <span className="font-bold text-[var(--ux-accent)]">
              quyền kiểm soát của bạn
            </span>
            .
          </p>
          <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
            Mỗi tài khoản có hồ sơ K–S–A, lịch ôn giãn cách SM-2 và cài đặt API
            Key BYOK độc lập. Bạn có thể xuất hoặc xóa toàn bộ dữ liệu bất kỳ
            lúc nào trong phần Cài đặt.
          </p>
        </div>

        <p className="text-xs text-[var(--ux-ink-3)]">
          Minh bạch theo Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 và Luật Trí
          tuệ nhân tạo 134/2025/QH15.
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:col-span-7">
        <div className="w-full max-w-lg space-y-5">
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
                Tạo tài khoản học Self-IELTS
              </h1>
              <p className="text-sm text-[var(--ux-ink-2)]">
                Lưu tiến độ cá nhân, hồ sơ K–S–A và bài luyện 4 kỹ năng độc lập
                theo tài khoản của bạn.
              </p>
            </div>

            <form method="post" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="text-sm font-medium">
                  Tên hiển thị
                </label>
                <Input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ví dụ: Minh Anh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="hocvien@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <PasswordStrengthField
                id="reg-password"
                name="password"
                label="Mật khẩu"
                value={password}
                onChange={(val) => {
                  setPassword(val);
                  if (status === "error") setStatus("idle");
                }}
              />

              <div className="space-y-1.5">
                <label htmlFor="reg-confirm" className="text-sm font-medium">
                  Nhập lại mật khẩu
                </label>
                <Input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <TermsConsentGroup
                value={consents}
                onChange={(next) => {
                  setConsents(next);
                  if (next.termsAndPrivacy && next.ageConfirmed) {
                    setConsentErrorHighlighted(false);
                  }
                }}
                showError={consentErrorHighlighted}
              />

              {error && (
                <p className="rounded-lg border border-[var(--ux-danger)]/30 bg-[var(--ux-danger-soft)] px-3.5 py-2 text-sm text-[var(--ux-danger)]">
                  {error}
                </p>
              )}

              <MorphSubmitButton
                type="submit"
                status={status}
                disabled={!canSubmit}
                idleLabel="Đăng ký và thiết lập lộ trình"
                loadingLabel="Đang tạo tài khoản..."
                doneLabel="Đã tạo tài khoản!"
                icon={<UserPlus className="h-4 w-4" />}
                className={
                  canSubmit
                    ? "w-full"
                    : "w-full bg-[var(--ux-surface-3)] text-[var(--ux-ink-3)] shadow-none opacity-60"
                }
              />
            </form>

            <p className="mt-5 text-center text-sm text-[var(--ux-ink-2)]">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--ux-accent)] hover:underline"
              >
                Đăng nhập
              </Link>
            </p>

            <LegalFooter compact />
          </div>
        </div>
      </main>
    </div>
  );
}
