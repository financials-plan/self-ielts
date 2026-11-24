import Link from "next/link";
import { BookOpen, Headphones, Mic, PenTool, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ExaminerSpecimenDemo } from "@/components/landing/ExaminerSpecimenDemo";
import { LandingInteractiveSections } from "@/components/landing/LandingInteractiveSections";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { getServerSession } from "@/lib/auth/session";

const KSA_PILLARS = [
  {
    code: "K",
    label: "Knowledge — Kiến thức nền",
    topBar: "border-t-[var(--ux-accent)]",
    codeColor: "text-[var(--ux-accent)]",
    desc: "Nắm chắc nối âm (Connected Speech), 5 kỹ thuật Paraphrase, cấu trúc trả lời tự nhiên và bộ tiêu chí chấm điểm của giám khảo cho cả Academic lẫn General Training.",
  },
  {
    code: "S",
    label: "Skills — Kỹ năng làm bài",
    topBar: "border-t-[var(--ux-mint)]",
    codeColor: "text-[var(--ux-mint)]",
    desc: "Luyện tập theo 3 nấc (Guided, Focused Drill và Exam Simulation): dự đoán trước khi nghe, ghim câu bằng chứng khi đọc, dàn ý 4 chặng khi viết và ghi chú 60 giây khi nói.",
  },
  {
    code: "A",
    label: "Attitudes — Tâm lý & Kỷ luật",
    topBar: "border-t-[var(--ux-warn)]",
    codeColor: "text-[var(--ux-warn)]",
    desc: "Rèn phản xạ bỏ qua câu lỡ nhịp (Let-go & Re-anchor), giữ tốc độ đều, tránh tra từ điển thụ động và ghi chép sổ lỗi sai để không lặp lại lỗi cũ.",
  },
];

const SKILL_STUDIOS = [
  {
    icon: Headphones,
    name: "Listening",
    subtitle: "Chung định dạng cho Academic và General Training",
    detail:
      "Khóa bước dự đoán loại từ trước khi nghe, nút Re-anchor kéo lại sự tập trung khi lỡ một câu, soi bẫy gây nhiễu theo mốc thời gian và thẻ âm thanh 0 byte.",
  },
  {
    icon: BookOpen,
    name: "Reading",
    subtitle: "Tách riêng bài đọc và thang điểm Academic / GT",
    detail:
      "Màn hình chia đôi chuẩn thi máy tính, bắt buộc ghim bằng chứng câu gốc khi trả lời, cầu nối Paraphrase lưu thẳng vào SRS và công cụ tách câu True / False / Not Given.",
  },
  {
    icon: PenTool,
    name: "Writing",
    subtitle: "Academic Task 1, GT Letter và Essay Task 2",
    detail:
      "Thực hành theo 4 chặng: bóc đề, lập dàn ý, tự kiểm tra lỗi lặp từ bằng NLP offline ngay trên máy và đối chiếu sửa bài Draft 2 khi cần.",
  },
  {
    icon: Mic,
    name: "Speaking",
    subtitle: "Part 1, Part 2 Cue Card và Part 3 thảo luận",
    detail:
      "Tập nhại ngữ điệu (Shadowing), bảng nháp từ khóa 60 giây có gợi ý cứu trợ khi bí ý, đo tốc độ nói và khoảng lặng trên trình duyệt trước khi gửi chấm âm thanh.",
  },
];

export default async function LandingPage() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-[var(--ux-page)] text-[var(--ux-ink)]">
      <header className="sticky top-0 z-30 border-b border-[var(--ux-line)] bg-[var(--ux-surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 32 32"
              className="h-8 w-8 shrink-0"
              aria-hidden="true"
            >
              <rect
                width="32"
                height="32"
                rx="7"
                fill="var(--ux-accent)"
              />
              <path
                d="M9 10.5h14M9 16h9M9 21.5h12"
                stroke="var(--ux-accent-ink)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="22.5" cy="16" r="2.2" fill="var(--ux-mint)" />
            </svg>
            <span className="font-display text-xl font-semibold tracking-tight text-[var(--ux-ink)]">
              Self-IELTS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center rounded-lg bg-[var(--ux-accent)] px-4 text-sm font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
              >
                Vào góc học tập
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium text-[var(--ux-ink-2)] hover:bg-[var(--ux-surface-2)] hover:text-[var(--ux-ink)]"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center rounded-lg bg-[var(--ux-accent)] px-4 text-sm font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
                >
                  Bắt đầu học
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero: Left-aligned editorial thesis + live IELTS KSA Examiner Specimen */}
        <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-6">
            <h1 className="font-display text-[2.2rem] leading-[1.16] font-semibold text-[var(--ux-ink)] sm:text-[3rem]">
              Biết chính xác vì sao bạn{" "}
              <span className="font-extrabold text-[var(--ux-accent)]">
                mất điểm IELTS
              </span>
              , trước khi làm thêm đề mới.
            </h1>

            <p className="max-w-[54ch] text-base leading-relaxed text-[var(--ux-ink-2)] sm:text-lg">
              Self-IELTS giúp người tự học Listening, Reading, Writing và
              Speaking phân loại từng lỗi sai theo ba gốc rễ: Kiến thức nền (K),
              Kỹ năng làm bài (S) và Tâm lý phòng thi (A) — từ đó luyện đúng chỗ
              đang vướng thay vì cày đề theo cảm tính.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={session ? "/dashboard" : "/register"}
                className="inline-flex h-11 items-center rounded-lg bg-[var(--ux-accent)] px-6 text-sm font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
              >
                {session ? "Vào góc học tập" : "Tạo tài khoản miễn phí"}
              </Link>
              <Link
                href={session ? "/settings" : "/login"}
                className="inline-flex h-11 items-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-5 text-sm font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
              >
                {session ? "Cài đặt AI miễn phí" : "Đã có tài khoản"}
              </Link>
            </div>

            <p className="max-w-[52ch] text-xs leading-relaxed text-[var(--ux-ink-3)]">
              Hỗ trợ cả IELTS Academic và General Training. Học trọn vẹn ở mức
              chi phí 0đ trên trình duyệt, không yêu cầu thẻ thanh toán.
            </p>
          </div>

          <div className="lg:col-span-6">
            <ExaminerSpecimenDemo />
          </div>
        </section>

        {/* Section 2: 3-Column Ruled KSA Diagnostic Ledger */}
        <section className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
              Một câu trả lời sai có thể đến từ ba nguyên nhân hoàn toàn khác nhau
            </h2>
            <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
              Nếu chỉ đếm số câu đúng, bạn rất dễ lặp lại cùng một lỗi qua
              hàng chục bộ đề. Khung KSA tách rõ từng lớp nguyên nhân để sửa tận
              gốc.
            </p>
          </div>

          <div className="grid divide-y divide-[var(--ux-line)] rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {KSA_PILLARS.map((pillar) => (
              <div
                key={pillar.code}
                className={`border-t-2 p-6 ${pillar.topBar}`}
              >
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`font-display text-2xl font-semibold ${pillar.codeColor}`}
                  >
                    {pillar.code}
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--ux-ink)]">
                    {pillar.label.replace(/^[KSA]\s+—\s+/, "")}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ux-ink-2)]">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: 4 Skill Workspaces */}
        <section className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
              Bốn không gian luyện tập chuyên biệt cho từng kỹ năng
            </h2>
            <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
              Hướng dẫn tư duy và phản hồi bằng Tiếng Việt; bài nghe, bài đọc,
              đề bài và tiêu chí Band giữ nguyên Tiếng Anh chuẩn IELTS.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SKILL_STUDIOS.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.name}
                  className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[var(--ux-ink)]">
                        {skill.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--ux-ink-3)]">
                        {skill.subtitle}
                      </p>
                    </div>
                    <Icon
                      className="h-5 w-5 shrink-0 text-[var(--ux-accent)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ux-ink-2)]">
                    {skill.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <LandingInteractiveSections />

        {/* Section 5: Offline-First + Optional Free BYOK */}
        <section className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)]">
          <div className="grid divide-y divide-[var(--ux-line)] md:grid-cols-12 md:divide-x md:divide-y-0">
            <div className="space-y-3 p-6 sm:p-8 md:col-span-7">
              <h2 className="font-display text-2xl font-semibold text-[var(--ux-ink)]">
                Học đủ không cần khóa API — gắn khóa miễn phí khi muốn AI chấm
                sâu hơn
              </h2>
              <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
                Trình phát Listening, lưới ghim bằng chứng Reading, kho thẻ SRS
                SM-2, sổ lỗi sai và bộ đếm tốc độ Speaking đều chạy trực tiếp
                với chi phí 0đ. Khi muốn nhận xét chi tiết 4 tiêu chí Writing và
                Speaking, bạn có thể gắn API Key miễn phí từ Google AI Studio
                hoặc Groq.
              </p>
            </div>

            <div className="space-y-4 bg-[var(--ux-surface-2)]/50 p-6 sm:p-8 md:col-span-5">
              <div className="flex items-start gap-2.5 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ux-mint)]" />
                <div>
                  <p className="font-semibold text-[var(--ux-ink)]">
                    Lưu tạm trên tab trình duyệt (Mặc định)
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--ux-ink-2)]">
                    Khóa chỉ giữ trong sessionStorage của trình duyệt và tự xóa
                    khi đóng tab, không ghi xuống máy chủ.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t border-[var(--ux-line)] pt-4 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
                <div>
                  <p className="font-semibold text-[var(--ux-ink)]">
                    Đồng bộ mã hóa AES-256-GCM
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--ux-ink-2)]">
                    Nếu bật đồng bộ nhiều thiết bị sau khi đồng ý rõ ràng, khóa
                    được mã hóa AES-256-GCM trước khi lưu vào cơ sở dữ liệu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
