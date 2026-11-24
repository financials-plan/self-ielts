"use client";

/* Inspired by Lucian UX/UI Prompt #411 (Terms Agreement) & vn-law-check (Luật 91/2025, NĐ 356/2025, Luật AI 134/2025) */
import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TermsConsentValues {
  termsAndPrivacy: boolean;
  ageConfirmed: boolean;
  aiTransferAccepted: boolean;
}

interface TermsConsentGroupProps {
  value: TermsConsentValues;
  onChange: (next: TermsConsentValues) => void;
  showError?: boolean;
}

function ConsentCheckboxRow({
  id,
  checked,
  onToggle,
  children,
}: {
  id: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-xs leading-relaxed transition-all",
        checked
          ? "border-[var(--ux-accent)]/50 bg-[var(--ux-accent-soft)]/50"
          : "border-[var(--ux-line)] bg-[var(--ux-surface)] hover:border-[var(--ux-line-2)]"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-all",
          checked
            ? "border-[var(--ux-accent)] bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
            : "border-[var(--ux-line-2)] bg-[var(--ux-surface)]"
        )}
        style={
          checked
            ? { animation: "ux-pop-check 0.25s var(--ux-spring)" }
            : undefined
        }
      >
        {checked && <Check className="h-3 w-3 stroke-[3]" />}
      </span>
      <span className="min-w-0 flex-1 text-[var(--ux-ink-2)]">{children}</span>
    </label>
  );
}

export function TermsConsentGroup({
  value,
  onChange,
  showError = false,
}: TermsConsentGroupProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <div
      className={cn(
        "space-y-2.5 rounded-xl border p-3.5 transition-colors",
        showError && (!value.termsAndPrivacy || !value.ageConfirmed)
          ? "border-[var(--ux-danger)] bg-[var(--ux-danger-soft)]/40"
          : "border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-ink)]">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--ux-mint)]" />
          Điều khoản &amp; Quyền riêng tư (Luật 91/2025)
        </span>
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--ux-accent)] hover:underline cursor-pointer"
        >
          Tóm tắt quyền
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              summaryOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {summaryOpen && (
        <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-2.5 text-[11px] leading-relaxed text-[var(--ux-ink-2)]">
          Dữ liệu cơ bản (Tên, Email, tiến độ KSA) chỉ dùng để vận hành tài
          khoản học tập của bạn. Không gắn quảng cáo/tracking. Bạn có quyền xuất
          dữ liệu JSON, rút đồng ý AI hoặc xóa tài khoản bất kỳ lúc nào trong
          Cài đặt.
        </div>
      )}

      {/* Checkbox 1 (Không tick sẵn) */}
      <ConsentCheckboxRow
        id="consent-terms-privacy"
        checked={value.termsAndPrivacy}
        onToggle={(checked) =>
          onChange({ ...value, termsAndPrivacy: checked })
        }
      >
        Tôi đã đọc và đồng ý với{" "}
        <Link
          href="/terms"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--ux-accent)] underline"
          onClick={(e) => e.stopPropagation()}
        >
          Điều khoản sử dụng
        </Link>{" "}
        và việc thu thập, xử lý dữ liệu cá nhân cơ bản theo{" "}
        <Link
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--ux-accent)] underline"
          onClick={(e) => e.stopPropagation()}
        >
          Chính sách bảo vệ dữ liệu cá nhân
        </Link>
        .
      </ConsentCheckboxRow>

      {/* Checkbox 2 (Xác nhận độ tuổi — Điều 24 Luật 91/2025) */}
      <ConsentCheckboxRow
        id="consent-age-confirm"
        checked={value.ageConfirmed}
        onToggle={(checked) => onChange({ ...value, ageConfirmed: checked })}
      >
        Tôi xác nhận đủ <strong>16 tuổi trở lên</strong>, hoặc đã có sự đồng ý
        của cha, mẹ / người giám hộ hợp pháp.
      </ConsentCheckboxRow>

      {/* Checkbox 3 (Tách riêng cho AI bên thứ ba — Khoản 4 Điều 6 NĐ 356/2025) */}
      <ConsentCheckboxRow
        id="consent-ai-transfer"
        checked={value.aiTransferAccepted}
        onToggle={(checked) =>
          onChange({ ...value, aiTransferAccepted: checked })
        }
      >
        Tôi đồng ý cho phép gửi dữ liệu nhạy cảm (bài làm, bản ghi giọng nói)
        tới nhà cung cấp AI bên thứ ba đặt ở nước ngoài (Google Gemini / Groq)
        khi tôi chủ động bật chế độ BYOK AI.{" "}
        <span className="text-[var(--ux-ink-3)]">
          (Không chọn vẫn học trọn vẹn chế độ Offline 0đ).
        </span>
      </ConsentCheckboxRow>
    </div>
  );
}
