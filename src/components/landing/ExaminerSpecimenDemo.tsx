"use client";

import { useState, type CSSProperties } from "react";
import { CopyChipButton } from "@/components/lucian/CopyChipButton";
import { InkTooltip } from "@/components/lucian/InkTooltip";
import { cn } from "@/lib/utils";

type KsaLens = "K" | "S" | "A";

const LENS_TABS: Array<{
  id: KsaLens;
  label: string;
  shortTitle: string;
  accentColor: string;
  softBg: string;
  summaryTitle: string;
  diagnosis: string;
  actionTip: string;
}> = [
  {
    id: "K",
    label: "K: Kiến thức",
    shortTitle: "Cầu nối Paraphrase",
    accentColor: "var(--ux-accent)",
    softBg: "var(--ux-accent-soft)",
    summaryTitle: "reluctant to adopt ↔ unwilling to immediately install",
    diagnosis:
      "Người học thường chỉ tìm từ khóa 'solar microgrids' hoặc 'install' mà bỏ qua cụm phủ định ngầm 'reluctant to adopt' — vốn trái nghĩa với 'immediately installed'.",
    actionTip:
      "Ghi cặp paraphrase này vào Knowledge Vault (SRS) để gặp lại sau 1 ngày, 6 ngày và 15 ngày.",
  },
  {
    id: "S",
    label: "S: Kỹ năng",
    shortTitle: "Tách 3 mảnh T/F/NG",
    accentColor: "var(--ux-mint)",
    softBg: "var(--ux-mint-soft)",
    summaryTitle: "Chủ thể + Quan hệ + Từ giới hạn ('All' / 'immediately')",
    diagnosis:
      "Đoạn văn xác nhận dự án chỉ thử nghiệm sớm rồi bị chần chừ mở rộng do chi phí bảo trì. Vì vậy câu khẳng định 'tất cả hội đồng lập tức lắp đặt' mâu thuẫn trực tiếp với bài đọc -> FALSE.",
    actionTip:
      "Ghim đúng câu bằng chứng trước khi chọn đáp án thay vì đọc dịch cả đoạn dài.",
  },
  {
    id: "A",
    label: "A: Tâm lý",
    shortTitle: "Bẫy đọc lướt khi vội",
    accentColor: "var(--ux-warn)",
    softBg: "var(--ux-warn-soft)",
    summaryTitle: "Khớp từ vựng 2019 rồi vội kết luận hoặc chọn NOT GIVEN",
    diagnosis:
      "Khi đồng hồ đếm ngược gây áp lực, mắt dễ dừng ở cụm 'proved reliable during early pilots in 2019' và chọn nhầm TRUE, hoặc nghi ngờ sang NOT GIVEN.",
    actionTip:
      "Khoanh từ giới hạn 'all' và 'immediately', đối chiếu trong 15 giây rồi đi tiếp.",
  },
];

export function ExaminerSpecimenDemo() {
  const [lens, setLens] = useState<KsaLens>("S");
  const activeLens = LENS_TABS.find((t) => t.id === lens) ?? LENS_TABS[1];

  return (
    <div
      className="overflow-hidden rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] shadow-[0_22px_48px_-30px_var(--ux-shadow-strong)]"
      aria-label="Minh họa cách Self-IELTS bóc tách một câu Reading theo khung KSA"
    >
      {/* Document top index strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ux-line)] bg-[var(--ux-surface-2)]/70 px-4 py-2.5 text-xs">
        <span className="font-medium text-[var(--ux-ink)]">
          Mẫu phân tích KSA — Reading Passage 2
        </span>
        <span className="font-mono text-[11px] text-[var(--ux-ink-3)]">
          Q14 / TRUE · FALSE · NOT GIVEN
        </span>
      </div>

      {/* Lens selector */}
      <div className="border-b border-[var(--ux-line)] px-4 pt-3">
        <div
          role="tablist"
          aria-label="Chọn góc nhìn phân tích KSA"
          className="flex flex-wrap gap-1"
        >
          {LENS_TABS.map((tab) => {
            const selected = tab.id === lens;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setLens(tab.id)}
                style={selected ? { color: tab.accentColor } : undefined}
                className={cn(
                  "relative -mb-px rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer",
                  selected
                    ? "border border-b-[var(--ux-surface)] border-[var(--ux-line-2)] bg-[var(--ux-surface)] shadow-xs"
                    : "bg-transparent text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)]/70 hover:text-[var(--ux-ink)]"
                )}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: tab.accentColor }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Passage & Question specimen */}
      <div className="space-y-4 p-5 sm:p-6">
        <blockquote className="rounded-lg border-l-2 border-[var(--ux-accent)] bg-[var(--ux-surface-2)]/60 px-4 py-3 text-[15px] leading-[1.75] text-[var(--ux-ink)]">
          &ldquo;Although solar microgrids{" "}
          <span
            data-active={lens === "A" ? "true" : "false"}
            style={{ "--ink-color": "var(--ux-warn-soft)" } as CSSProperties}
            className={cn(
              "ux-ink-mark px-1 py-0.5 decoration-2 underline-offset-4",
              lens === "A" && "underline decoration-[var(--ux-warn)]"
            )}
          >
            proved reliable during early pilots in 2019
          </span>
          , municipal authorities{" "}
          <span
            data-active={lens === "K" || lens === "S" ? "true" : "false"}
            style={
              {
                "--ink-color":
                  lens === "K" ? "var(--ux-accent-soft)" : "var(--ux-mint-soft)",
              } as CSSProperties
            }
            className={cn(
              "ux-ink-mark px-1 py-0.5 decoration-2 underline-offset-4",
              lens === "K" && "underline decoration-[var(--ux-accent)]",
              lens === "S" && "underline decoration-[var(--ux-mint)]"
            )}
          >
            remained reluctant to adopt the system
          </span>{" "}
          across suburban districts due to high upfront maintenance costs.&rdquo;
        </blockquote>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/55 px-3.5 py-2.5 text-xs">
          <p className="font-medium text-[var(--ux-ink)]">
            <span className="font-mono text-[var(--ux-ink-3)]">Q14.</span> All
            local councils immediately installed solar microgrids after the 2019
            trials.
          </p>
          <InkTooltip label="Bài đọc nói chính quyền vẫn chần chừ, nên 'All… immediately installed' mâu thuẫn trực tiếp.">
            <span className="cursor-help rounded border border-[var(--ux-danger)]/30 bg-[var(--ux-danger-soft)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--ux-danger)]">
              FALSE
            </span>
          </InkTooltip>
        </div>

        {/* Active examiner margin note */}
        <div
          className="space-y-1.5 rounded-lg border-l-4 p-3.5 text-xs leading-relaxed transition-colors"
          style={{
            borderLeftColor: activeLens.accentColor,
            backgroundColor: activeLens.softBg,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="font-semibold"
              style={{ color: activeLens.accentColor }}
            >
              {activeLens.shortTitle}
            </span>
            <span className="font-mono text-[11px] text-[var(--ux-ink-2)]">
              {activeLens.summaryTitle}
            </span>
          </div>
          <p className="text-[var(--ux-ink)]">{activeLens.diagnosis}</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[var(--ux-ink-2)]">
              <strong className="text-[var(--ux-ink)]">Hướng xử lý:</strong>{" "}
              {activeLens.actionTip}
            </p>
            {lens === "K" && (
              <CopyChipButton
                text="reluctant to adopt ↔ unwilling to immediately install"
                label="Sao chép cặp paraphrase"
              />
            )}
          </div>
        </div>
      </div>

      {/* Track calibration footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 px-4 py-2.5 text-[11px] text-[var(--ux-ink-2)]">
        <span>Bảng quy đổi Reading tách riêng từng hệ thi:</span>
        <span className="font-mono text-[var(--ux-ink)]">
          30/40 = 7.0 (Academic) / 34/40 = 7.0 (General)
        </span>
      </div>
    </div>
  );
}
