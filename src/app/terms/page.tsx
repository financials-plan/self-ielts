import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  BookOpen,
  Cpu,
  FileText,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_POLICY_VERSION,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Self-IELTS",
  description:
    "Quy định về điều kiện sử dụng dịch vụ, tuyên bố độc lập kỳ thi, quy tắc sử dụng AI/BYOK, bản quyền và giới hạn trách nhiệm trên nền tảng Self-IELTS.",
};

const SECTIONS = [
  { id: "acceptance", label: "1. Chấp thuận điều khoản & Phạm vi áp dụng" },
  { id: "scope", label: "2. Mô tả dịch vụ & Tuyên bố độc lập với IELTS" },
  { id: "eligibility", label: "3. Điều kiện đăng ký & Quản lý tài khoản" },
  { id: "ai-byok", label: "4. Quy tắc sử dụng AI & Chế độ BYOK" },
  { id: "ip-rights", label: "5. Quyền sở hữu trí tuệ & Học liệu" },
  { id: "prohibited", label: "6. Các hành vi bị nghiêm cấm" },
  { id: "suspension", label: "7. Tạm ngừng & Chấm dứt quyền truy cập" },
  { id: "disclaimer", label: "8. Tuyên bố miễn trừ & Giới hạn trách nhiệm" },
  { id: "changes-law", label: "9. Sửa đổi điều khoản, Luật áp dụng & Liên hệ" },
] as const;

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-[var(--ux-page)] text-[var(--ux-ink)]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[var(--ux-line)] bg-[var(--ux-surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ux-ink-2)] transition-colors hover:text-[var(--ux-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="text-xs font-semibold text-[var(--ux-accent)] hover:underline"
            >
              Chính sách BVDLCN
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        {/* Document Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="K">
              <FileText className="h-3 w-3" />
              Điều khoản sử dụng
            </Badge>
            <Badge variant="neutral">Phiên bản {LEGAL_POLICY_VERSION}</Badge>
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--ux-ink)] sm:text-4xl">
            Điều khoản sử dụng nền tảng Self-IELTS
          </h1>
          <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
            Hiệu lực áp dụng: <strong>24/11/2026</strong> — Quy định quyền,
            nghĩa vụ và quy tắc vận hành giữa đơn vị phát triển{" "}
            <strong>Self-IELTS</strong> và người sử dụng dịch vụ (đối chiếu
            theo Bộ luật Dân sự 2015, Luật Sở hữu trí tuệ, Luật Bảo vệ dữ liệu
            cá nhân 91/2025/QH15 và Luật Trí tuệ nhân tạo 134/2025/QH15).
          </p>
        </div>

        {/* Table of Contents */}
        <nav
          aria-label="Mục lục điều khoản sử dụng"
          className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 sm:p-5"
        >
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--ux-ink-2)]">
            Mục lục điều khoản
          </p>
          <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-block text-[var(--ux-ink-2)] transition-colors hover:text-[var(--ux-accent)] hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Terms Content */}
        <article className="space-y-8 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-6 text-sm leading-relaxed text-[var(--ux-ink-2)] sm:p-8">
          {/* 1. Acceptance */}
          <section id="acceptance" className="scroll-mt-24 space-y-2.5">
            <h2 className="text-base font-bold text-[var(--ux-ink)]">
              1. Chấp thuận điều khoản &amp; Phạm vi áp dụng
            </h2>
            <p>
              Văn bản Điều khoản sử dụng này (sau đây gọi tắt là{" "}
              <strong>“Điều khoản”</strong>) cấu thành thỏa thuận pháp lý có
              tính ràng buộc giữa bạn (<strong>“Người dùng”</strong> hoặc{" "}
              <strong>“Người học”</strong>) và đơn vị vận hành nền tảng{" "}
              <strong>Self-IELTS</strong>.
            </p>
            <p>
              Bằng việc tạo tài khoản, xác nhận đồng ý trên biểu mẫu đăng ký
              hoặc sử dụng bất kỳ công cụ luyện tập nào của Self-IELTS, bạn xác
              nhận đã đọc, hiểu đầy đủ và đồng ý tuân thủ toàn bộ quy định tại
              Điều khoản này. Nếu bạn không đồng ý với bất kỳ nội dung nào, vui
              lòng ngừng truy cập và chấm dứt sử dụng dịch vụ.
            </p>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 2. Scope & Independence */}
          <section id="scope" className="scroll-mt-24 space-y-2.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <BookOpen className="h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
              2. Mô tả dịch vụ &amp; Tuyên bố độc lập với kỳ thi IELTS
            </h2>
            <p>
              <strong>Self-IELTS</strong> là nền tảng công nghệ giáo dục hỗ trợ
              tự học 4 kỹ năng tiếng Anh (<em>Listening, Reading, Writing,
              Speaking</em>) cho cả hai phân hệ{" "}
              <strong>IELTS Academic</strong> và{" "}
              <strong>IELTS General Training</strong> dựa trên khung sư phạm{" "}
              <strong>KSA (Knowledge – Skills – Attitudes)</strong> với bộ
              công cụ tự học cốt lõi cung cấp miễn phí (0đ).
            </p>
            <ul className="list-outside list-disc space-y-1.5 pl-5">
              <li>
                <strong>Tuyên bố độc lập:</strong> Self-IELTS hoạt động hoàn
                toàn độc lập, <strong>không phải</strong> là đơn vị tổ chức thi,
                trung tâm khảo thí ủy quyền, đại diện tuyển sinh hay đối tác
                liên kết chính thức với{" "}
                <strong>Hội đồng Anh (British Council)</strong>,{" "}
                <strong>IDP Education</strong> hoặc{" "}
                <strong>Cambridge University Press &amp; Assessment</strong>.
                Nhãn hiệu IELTS® thuộc quyền sở hữu của các tổ chức đồng sở hữu
                nêu trên.
              </li>
              <li>
                <strong>Giá trị tham khảo của điểm số:</strong> Mọi thang điểm
                ước lượng (Band Score), chỉ số năng lực KSA và nhận xét trên
                nền tảng chỉ phục vụ mục đích tự đánh giá và định hướng ôn
                luyện; không có giá trị thay thế chứng chỉ quốc tế và không bảo
                đảm kết quả điểm số tại kỳ thi thật.
              </li>
              <li>
                <strong>Thay đổi tính năng:</strong> Self-IELTS có quyền nâng
                cấp, điều chỉnh, tạm dừng hoặc ngừng cung cấp một phần tính năng
                kỹ thuật để tối ưu chất lượng vận hành mà không làm phát sinh
                nghĩa vụ bồi thường đối với các dịch vụ miễn phí.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 3. Account & Eligibility */}
          <section id="eligibility" className="scroll-mt-24 space-y-2.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <UserCheck className="h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
              3. Điều kiện đăng ký &amp; Quản lý tài khoản
            </h2>
            <ul className="list-outside list-disc space-y-1.5 pl-5">
              <li>
                <strong>Độ tuổi và năng lực hành vi:</strong> Người dùng phải từ{" "}
                <strong>đủ 16 tuổi trở lên</strong> để tự thiết lập và quản lý
                tài khoản. Trường hợp người học dưới 16 tuổi, việc đăng ký và
                sử dụng nền tảng phải có sự đồng ý và giám sát trực tiếp của cha,
                mẹ hoặc người giám hộ hợp pháp.
              </li>
              <li>
                <strong>An toàn thông tin đăng nhập:</strong> Bạn có nghĩa vụ
                bảo mật mật khẩu, mã phiên đăng nhập và chịu hoàn toàn trách
                nhiệm đối với mọi hoạt động phát sinh dưới tài khoản của mình.
              </li>
              <li>
                <strong>Sử dụng cá nhân:</strong> Tài khoản trên Self-IELTS chỉ
                cấp quyền sử dụng cho cá nhân người đăng ký. Nghiêm cấm hành vi
                cho mượn, chia sẻ chung một tài khoản cho nhiều người cùng khai
                thác thương mại hoặc giảng dạy tập trung trái phép.
              </li>
              <li>
                <strong>Chủ động lưu trữ bản sao:</strong> Đối với các dữ liệu
                luyện tập được lưu trực tiếp trên bộ nhớ trình duyệt của thiết bị
                cá nhân (chế độ Offline), người dùng tự chịu trách nhiệm sao lưu
                định kỳ thông qua công cụ xuất dữ liệu của hệ thống trước khi
                xóa bộ nhớ trình duyệt hoặc đổi thiết bị.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 4. AI & BYOK */}
          <section id="ai-byok" className="scroll-mt-24 space-y-2.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Cpu className="h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
              4. Quy tắc sử dụng AI &amp; Chế độ BYOK (Luật AI 134/2025/QH15)
            </h2>
            <ul className="list-outside list-disc space-y-2 pl-5">
              <li>
                <strong>Minh bạch tương tác và nội dung AI:</strong> Mọi tính
                năng chấm chữa bài viết (Writing), đánh giá phát âm (Speaking)
                hoặc sinh bài mẫu gợi ý thông qua mô hình trí tuệ nhân tạo
                (Google Gemini, Groq hoặc endpoint tương thích chuẩn OpenAI)
                đều được gắn nhãn nhận diện rõ ràng là{" "}
                <strong>“Trợ lý AI / Nội dung do AI tạo”</strong> trên giao
                diện theo đúng quy định tại Điều 11 Luật Trí tuệ nhân tạo
                134/2025/QH15 và Điều 18 Nghị định 142/2026/NĐ-CP.
              </li>
              <li>
                <strong>Tính chất tham khảo học thuật:</strong> Phản hồi từ AI
                có thể tồn tại sai sót ngữ cảnh hoặc độ lệch so với giám khảo
                con người. Người học cần chủ động đối chiếu tiêu chí chấm điểm
                chính thức và không sao chép nguyên văn nội dung AI tạo ra để
                nộp làm bài thi hoặc sản phẩm học thuật chính thức của bản
                thân.
              </li>
              <li>
                <strong>Quyền chọn không dùng AI:</strong> Chế độ kết nối AI
                hoàn toàn không bắt buộc. Người dùng có thể từ chối sử dụng AI
                mà vẫn khai thác đầy đủ bộ công cụ tự học Offline 0đ trên nền
                tảng.
              </li>
              <li>
                <strong>Trách nhiệm trong chế độ BYOK (Bring Your Own Key):</strong>{" "}
                Khi tự nguyện cấu hình khóa API cá nhân (API Key) của nhà cung
                cấp bên thứ ba, bạn tự chịu trách nhiệm bảo quản khóa API, tuân
                thủ điều khoản dịch vụ, giới hạn lưu lượng (Rate Limit / Free
                Tier) và tự thanh toán mọi chi phí phát sinh (nếu vượt hạn mức
                miễn phí) trực tiếp với nhà cung cấp đó.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 5. IP Rights */}
          <section id="ip-rights" className="scroll-mt-24 space-y-2.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
              5. Quyền sở hữu trí tuệ &amp; Học liệu
            </h2>
            <ul className="list-outside list-disc space-y-1.5 pl-5">
              <li>
                <strong>Nội dung của người học:</strong> Bạn giữ toàn bộ quyền
                sở hữu trí tuệ đối với các bản nháp bài viết (Writing drafts),
                ghi chú phản tư KSA và bản ghi âm giọng nói (Speaking
                recordings) do chính bạn tạo ra trong quá trình học tập.
              </li>
              <li>
                <strong>Tài sản của Self-IELTS:</strong> Mã nguồn phần mềm,
                thiết kế giao diện, cấu trúc sư phạm KSA, bộ câu hỏi luyện tập
                biên soạn riêng và nhãn hiệu Self-IELTS thuộc quyền sở hữu của
                đơn vị phát triển. Nghiêm cấm sao chép, trích xuất hàng loạt,
                dịch ngược mã nguồn hoặc thương mại hóa lại bất kỳ thành phần
                nào của nền tảng khi chưa được cho phép bằng văn bản.
              </li>
              <li>
                <strong>Cam kết bản quyền học liệu nhập vào:</strong> Khi sử
                dụng công cụ nhập đề bài hoặc tài liệu cá nhân để tự luyện tập,
                bạn cam kết không tải lên, lưu trữ công khai hoặc phát tán trái
                phép sách, giáo trình, bộ đề thi có bản quyền của bên thứ ba
                (như Cambridge, British Council, IDP hoặc các nhà xuất bản
                khác).
              </li>
            </ul>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 6. Prohibited Conduct */}
          <section id="prohibited" className="scroll-mt-24 space-y-2.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Ban className="h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
              6. Các hành vi bị nghiêm cấm
            </h2>
            <p>
              Người dùng cam kết không sử dụng nền tảng Self-IELTS để thực hiện
              bất kỳ hành vi nào sau đây:
            </p>
            <ul className="list-outside list-disc space-y-1.5 pl-5">
              <li>
                Tấn công từ chối dịch vụ (DoS/DDoS), dò quét lỗ hổng bảo mật,
                can thiệp trái phép vào hệ thống xác thực hoặc truy cập dữ liệu
                của người dùng khác.
              </li>
              <li>
                Gửi mã độc, kịch bản tự động (bot, crawler, scraper) hoặc tạo
                lưu lượng giả mạo nhằm khai thác cạn kiệt tài nguyên hạ tầng
                miễn phí của hệ thống.
              </li>
              <li>
                Lợi dụng các biểu mẫu nhập liệu hoặc kết nối API để phát tán nội
                dung vi phạm pháp luật Việt Nam, nội dung thù ghét, bạo lực,
                đồi trụy hoặc xâm phạm quyền, lợi ích hợp pháp của tổ chức, cá
                nhân khác.
              </li>
              <li>
                Mạo danh đơn vị vận hành Self-IELTS hoặc tổ chức khảo thí IELTS
                chính thức để thu phí hoặc lừa đảo người học.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 7. Suspension & Termination */}
          <section id="suspension" className="scroll-mt-24 space-y-2.5">
            <h2 className="text-base font-bold text-[var(--ux-ink)]">
              7. Tạm ngừng &amp; Chấm dứt quyền truy cập
            </h2>
            <ul className="list-outside list-disc space-y-1.5 pl-5">
              <li>
                <strong>Từ phía người dùng:</strong> Bạn có quyền ngừng sử dụng
                dịch vụ và tự xóa tài khoản bất kỳ lúc nào thông qua phần cài
                đặt trên nền tảng.
              </li>
              <li>
                <strong>Từ phía Self-IELTS:</strong> Chúng tôi có quyền tạm
                khóa, giới hạn tính năng hoặc chấm dứt vĩnh viễn quyền truy cập
                của tài khoản/địa chỉ IP vi phạm mà không cần báo trước nếu phát
                hiện hành vi thuộc Mục 6 hoặc hành vi gây rủi ro nghiêm trọng
                cho an toàn hệ thống.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 8. Disclaimer & Liability */}
          <section id="disclaimer" className="scroll-mt-24 space-y-2.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--ux-warn)]" />
              8. Tuyên bố miễn trừ &amp; Giới hạn trách nhiệm
            </h2>
            <p>
              Nền tảng được cung cấp trên cơ sở{" "}
              <strong>“nguyên trạng” (as-is)</strong> và{" "}
              <strong>“theo khả năng sẵn có” (as-available)</strong>. Trong
              phạm vi tối đa được pháp luật cho phép, Self-IELTS không chịu
              trách nhiệm bồi thường đối với:
            </p>
            <ul className="list-outside list-disc space-y-1.5 pl-5">
              <li>
                Kết quả thi IELTS thực tế của người học hoặc các quyết định học
                tập, du học, định cư dựa trên điểm số ước lượng của hệ thống.
              </li>
              <li>
                Nội dung phản hồi, độ chính xác, sự gián đoạn dịch vụ hoặc chi
                phí phát sinh từ các nhà cung cấp mô hình AI bên thứ ba mà người
                dùng tự kết nối qua chế độ BYOK.
              </li>
              <li>
                Sự gián đoạn truy cập tạm thời do bảo trì kỹ thuật, lỗi đường
                truyền internet, sự cố hạ tầng đám mây hoặc các sự kiện bất khả
                kháng theo quy định của Bộ luật Dân sự.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--ux-line)]" />

          {/* 9. Amendments, Governing Law & Contact */}
          <section id="changes-law" className="scroll-mt-24 space-y-2.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Scale className="h-4 w-4 shrink-0 text-[var(--ux-accent)]" />
              9. Sửa đổi điều khoản, Luật áp dụng &amp; Liên hệ
            </h2>
            <p>
              <strong>Sửa đổi điều khoản:</strong> Self-IELTS có thể cập nhật
              Điều khoản sử dụng này để phù hợp với sự phát triển của sản phẩm
              và quy định pháp luật hiện hành. Phiên bản cập nhật sẽ được đăng
              tải công khai kèm số hiệu phiên bản mới; đối với các thay đổi
              trọng yếu về quyền và nghĩa vụ, hệ thống sẽ yêu cầu bạn xác nhận
              đồng ý trước khi tiếp tục sử dụng.
            </p>
            <p>
              <strong>Luật áp dụng &amp; Giải quyết tranh chấp:</strong> Điều
              khoản này được điều chỉnh bởi pháp luật nước Cộng hòa Xã hội Chủ
              nghĩa Việt Nam. Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết
              thông qua thương lượng thiện chí trong vòng 30 ngày; trường hợp
              không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa
              án có thẩm quyền tại Việt Nam.
            </p>
            <p>
              <strong>Thông tin liên hệ:</strong> Mọi câu hỏi, phản ánh kỹ
              thuật hoặc thông báo vi phạm bản quyền liên quan đến Điều khoản sử
              dụng vui lòng gửi về email:{" "}
              <a
                href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                className="font-mono text-xs font-semibold text-[var(--ux-accent)] hover:underline"
              >
                {LEGAL_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}