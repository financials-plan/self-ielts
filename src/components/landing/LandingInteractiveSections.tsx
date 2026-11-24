"use client";

import { useState } from "react";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { FaqAccordion, type FaqItem } from "@/components/lucian/FaqAccordion";

const TRACK_DETAILS = {
  academic: {
    badge: "IELTS Academic",
    audience:
      "Phù hợp với hồ sơ du học đại học, sau đại học hoặc đăng ký chứng chỉ chuyên môn.",
    reading:
      "Gồm 3 bài đọc học thuật dài trích từ tạp chí và sách nghiên cứu. Quy đổi chuẩn: đạt 30/40 câu đúng tương ứng Band 7.0.",
    writing:
      "Task 1 yêu cầu mô tả biểu đồ (Line, Bar, Pie, Table), Bản đồ hoặc Quy trình — bắt buộc có câu Overview.",
    listeningSpeaking:
      "Listening (4 phần) và Speaking (Part 1, 2, 3) dùng chung định dạng và tiêu chí chấm với General Training.",
  },
  general: {
    badge: "IELTS General Training",
    audience:
      "Phù hợp với hồ sơ định cư, làm việc quốc tế hoặc các chương trình đào tạo nghề.",
    reading:
      "Gồm 3 phần thực tế: thông báo, tài liệu công sở và 1 bài đọc dài. Quy đổi chuẩn: đạt 34/40 câu đúng tương ứng Band 7.0.",
    writing:
      "Task 1 yêu cầu viết thư (Formal, Semi-formal hoặc Informal) và phải trả lời đủ cả 3 gạch đầu dòng của đề.",
    listeningSpeaking:
      "Listening (4 phần) và Speaking (Part 1, 2, 3) thi chung đề chuẩn quốc tế với IELTS Academic.",
  },
} as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "ksa-diff",
    question:
      "Học theo khung KSA khác gì với các trang luyện đề IELTS thông thường?",
    answer:
      "Trang luyện đề truyền thống chỉ trả điểm thô (ví dụ 6.0) khiến bạn lặp lại cùng một lỗi. Self-IELTS bóc tách từng câu sai theo gốc rễ: thiếu Kiến thức (K - nối âm, paraphrase), vỡ Kỹ năng (S - dính bẫy distractor, thiếu overview), hay lỗi Tâm lý/Thái độ (A - hoảng khi lỡ 1 câu, đoán mò không ghim bằng chứng) để gợi ý đúng bài Drill sửa tận gốc.",
  },
  {
    id: "zero-cost",
    question: "Nền tảng có thực sự miễn phí 100% và không cần thẻ tín dụng không?",
    answer:
      "Có. Toàn bộ hạ tầng web (Vercel Hobby), cơ sở dữ liệu (Turso Starter), lưu bản ghi Speaking (Vercel Blob Free + IndexedDB nháp trên máy), phân tích Writing NLP offline và đo tốc độ/khoảng lặng Speaking đều vận hành ở mức 0đ mà không yêu cầu gắn thẻ thanh toán.",
  },
  {
    id: "byok-privacy",
    question: "Nếu không có API Key AI tôi có học được cả 4 kỹ năng không?",
    answer:
      "Hoàn toàn được. Không cần API Key bạn vẫn dùng trọn vẹn trình phát Listening 3 chế độ, Reading Evidence-Pinning & Paraphrase Bridge, Writing 4 chặng kèm NLP đếm lặp từ/câu phức + bài mẫu Band 8.0, và Speaking đo WPM + khoảng lặng >1.5s bằng Web Audio API. Khi muốn AI chấm sâu 4 tiêu chí, chỉ cần gắn khóa miễn phí từ Google AI Studio (Gemini Free) hoặc Groq Free.",
  },
  {
    id: "ephemeral-vs-sync",
    question: "API Key của tôi được bảo vệ thế nào trên nền tảng đa người dùng?",
    answer:
      "Mặc định hệ thống khuyến nghị Chế độ Phiên trình duyệt (Ephemeral): khóa chỉ lưu trong sessionStorage của trình duyệt và không bao giờ lưu xuống CSDL. Nếu muốn đồng bộ nhiều thiết bị, khóa được mã hóa AES-256-GCM phía máy chủ trước khi ghi vào bảng user_ai_configs.",
  },
  {
    id: "acad-gt-switch",
    question: "Tôi có thể chuyển đổi giữa Academic và General Training không?",
    answer:
      "Có. Thanh chuyển hệ thi (Sliding Pill Switch) nằm ngay trên đầu trang ứng dụng, cho phép bạn đổi giữa Academic và General Training bất cứ lúc nào — tự động cập nhật giao diện Reading, dạng bài Writing Task 1 và bảng quy đổi điểm tương ứng.",
  },
];

export function LandingInteractiveSections() {
  const [selectedTrack, setSelectedTrack] = useState<"academic" | "general">(
    "academic"
  );
  const info = TRACK_DETAILS[selectedTrack];

  return (
    <div className="space-y-20">
      {/* Track Comparison powered by Lucian #039 Sliding Pill Tabs */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
              Tách biệt đúng chuẩn Academic và General Training
            </h2>
            <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
              Chuyển giữa hai hệ thi để xem bảng quy đổi Band và dạng bài Task 1
              tự động thích ứng cho tài khoản của bạn.
            </p>
          </div>
          <SlidingPillTabs
            ariaLabel="So sánh hệ IELTS Academic và General Training"
            value={selectedTrack}
            onChange={setSelectedTrack}
            options={[
              { value: "academic", label: "IELTS Academic" },
              { value: "general", label: "General Training" },
            ]}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ux-line)] bg-[var(--ux-surface-2)]/50 px-6 py-4">
            <h3 className="font-display text-xl font-semibold text-[var(--ux-ink)]">
              {info.badge}
            </h3>
            <p className="text-sm text-[var(--ux-ink-2)]">{info.audience}</p>
          </div>

          <div className="grid divide-y divide-[var(--ux-line)] md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="space-y-2 p-6">
              <p className="text-xs font-semibold text-[var(--ux-accent)]">
                Reading (Đọc hiểu)
              </p>
              <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
                {info.reading}
              </p>
            </div>
            <div className="space-y-2 p-6">
              <p className="text-xs font-semibold text-[var(--ux-mint)]">
                Writing Task 1
              </p>
              <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
                {info.writing}
              </p>
            </div>
            <div className="space-y-2 p-6">
              <p className="text-xs font-semibold text-[var(--ux-warn)]">
                Listening và Speaking
              </p>
              <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
                {info.listeningSpeaking}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ in asymmetric 12-col editorial layout */}
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-4">
          <h2 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
            Câu hỏi thường gặp
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
            Giải đáp nhanh về phương pháp KSA, quyền riêng tư API Key và cam
            kết sử dụng miễn phí lâu dài.
          </p>
        </div>
        <div className="lg:col-span-8">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </div>
  );
}
