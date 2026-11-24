import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Globe,
  Lock,
  Scale,
  Server,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_POLICY_VERSION,
  STATUTORY_DEADLINES_ND356,
} from "@/lib/legal/constants";

const DATA_INVENTORY = [
  {
    category: "Dữ liệu cơ bản",
    data: "Tên hiển thị, địa chỉ Email, ảnh đại diện (nếu có)",
    source: "Form đăng ký (/register) hoặc cập nhật tại (/settings)",
    purpose:
      "Khởi tạo định danh tài khoản, xác thực phiên đăng nhập, khôi phục truy cập và cô lập hoàn toàn không gian học tập của từng học viên.",
    retention: "Lưu giữ trong suốt thời gian tài khoản hoạt động; xóa vĩnh viễn ngay khi bạn thực hiện lệnh Xóa tài khoản.",
    storage: "CSDL SQLite cục bộ hoặc Turso Cloud (bảng user)",
    thirdParty: "Không chia sẻ cho bên quảng cáo hay môi giới dữ liệu.",
  },
  {
    category: "Dữ liệu nhạy cảm (Điểm k K1 Đ4 NĐ 356)",
    data: "Mật khẩu đăng nhập (dưới dạng chuỗi băm mật mã một chiều)",
    source: "Form đăng ký (/register) & Đổi mật khẩu (/settings)",
    purpose:
      "Xác thực danh tính khi đăng nhập. Hệ thống tuyệt đối không lưu trữ, không thể giải mã và không bao giờ nhìn thấy mật khẩu gốc của bạn.",
    retention: "Tồn tại gắn liền với tài khoản; tự động hủy khi đổi mật khẩu mới hoặc xóa tài khoản.",
    storage: "Bảng account (quản lý bởi thư viện Better Auth)",
    thirdParty: "Không",
  },
  {
    category: "Dữ liệu cơ bản (Hồ sơ học thuật)",
    data: "Hệ thi (Academic / General Training), Band mục tiêu, ngày dự thi, lịch sử làm bài (Reading/Listening), nhật ký lỗi sai (Error Logs), thẻ kiến thức (KSA)",
    source: "Quá trình Onboarding & Các phiên luyện tập trên ứng dụng",
    purpose:
      "Tính toán điểm Band quy đổi, dựng biểu đồ Radar phân tích năng lực KSA (Knowledge - Skill - Attitude) và cá nhân hóa lộ trình ôn tập.",
    retention: "Lưu giữ để duy trì tiến độ học tập; cho phép xuất bản sao (JSON) hoặc xóa sạch từng phần/toàn bộ bất kỳ lúc nào.",
    storage: "Bảng user_profiles, practice_attempts, error_logs, knowledge_cards",
    thirdParty: "Không",
  },
  {
    category: "Dữ liệu nhạy cảm (Đ4 NĐ 356/2025)",
    data: "Khóa API cá nhân (BYOK - Gemini/Groq), nội dung bài luận Writing, bản ghi âm giọng nói Speaking & bản gỡ băng (Transcript)",
    source: "Cài đặt (/settings), Writing Studio & Speaking Studio",
    purpose:
      "Mã hóa chuẩn AES-256-GCM (nếu bật đồng bộ) để dùng xuyên thiết bị; gửi tới mô hình AI để chấm điểm và phản hồi chỉ khi bạn chủ động bấm nút yêu cầu.",
    retention:
      "Chế độ Ephemeral: Xóa ngay khi đóng tab. Chế độ Đồng bộ: Xóa ngay lập tức khi bạn tắt đồng bộ, rút sự đồng ý hoặc xóa bài luyện tập.",
    storage: "sessionStorage trình duyệt (tạm thời) hoặc bảng user_ai_configs & Vercel Blob Free (nếu chọn đồng bộ)",
    thirdParty:
      "Chỉ truyền trực tiếp tới nhà cung cấp AI (Google Gemini, Groq hoặc Custom Endpoint) do chính bạn cấu hình và đã xác nhận đồng ý.",
  },
  {
    category: "Dữ liệu kỹ thuật & Bằng chứng pháp lý",
    data: "Lịch sử xác nhận đồng ý (Consent Logs), phiên bản chính sách đã chấp thuận, địa chỉ IP, chuỗi User-Agent và dấu thời gian (Timestamp)",
    source: "Tự động ghi nhận tại thời điểm bạn tick ô đồng ý trên Form đăng ký hoặc Cài đặt quyền dữ liệu",
    purpose:
      "Thực hiện nghĩa vụ chứng minh sự đồng ý tự nguyện, rõ ràng và có thể kiểm chứng của Chủ thể dữ liệu theo Khoản 1, Khoản 2 Điều 6 Nghị định 356/2025/NĐ-CP.",
    retention: "Lưu giữ tối thiểu 05 năm hoặc theo thời hiệu giải quyết khiếu nại pháp luật về bảo vệ dữ liệu cá nhân.",
    storage: "Bảng user_consents",
    thirdParty: "Không (chỉ cung cấp cho cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp bằng văn bản).",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--ux-page)] text-[var(--ux-ink)]">
      <header className="sticky top-0 z-30 border-b border-[var(--ux-line)] bg-[var(--ux-surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ux-ink-2)] hover:text-[var(--ux-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/terms"
              className="text-xs font-semibold text-[var(--ux-accent)] hover:underline"
            >
              Điều khoản sử dụng
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        {/* Tiêu đề & Metadata */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="S">
              <ShieldCheck className="h-3 w-3" />
              Luật 91/2025/QH15 &amp; NĐ 356/2025/NĐ-CP
            </Badge>
            <Badge variant="neutral">Phiên bản {LEGAL_POLICY_VERSION}</Badge>
          </div>
          <h1 className="font-display text-3xl font-medium text-[var(--ux-ink)] sm:text-4xl">
            Chính sách Bảo vệ Dữ liệu Cá nhân
          </h1>
          <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
            Văn bản này thông báo chi tiết về cách thức <strong>Self-IELTS</strong>{" "}
            thu thập, phân loại, mã hóa, lưu trữ, chuyển giao và bảo vệ dữ liệu
            cá nhân của bạn tuân thủ{" "}
            <strong>Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15</strong> và{" "}
            <strong>Nghị định số 356/2025/NĐ-CP</strong> (có hiệu lực thi hành
            từ ngày 01/01/2026).
          </p>
        </div>

        <article className="space-y-8 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-6 text-sm leading-relaxed text-[var(--ux-ink-2)] sm:p-8">
          {/* Mục 1 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Scale className="h-4 w-4 text-[var(--ux-accent)]" />
              1. Phạm vi áp dụng &amp; Vai trò các bên (Điều 2, Điều 3 Luật 91/2025/QH15)
            </h2>
            <p>
              Chính sách này áp dụng đối với toàn bộ người dùng truy cập, đăng ký
              tài khoản và sử dụng các tính năng luyện thi trên nền tảng web{" "}
              <strong>Self-IELTS</strong>. Trong phạm vi hoạt động của hệ thống:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-1">
              <li>
                <strong>Chủ thể dữ liệu:</strong> Là cá nhân học viên đăng ký và
                sử dụng dịch vụ tự học trên Self-IELTS.
              </li>
              <li>
                <strong>Bên Kiểm soát và xử lý dữ liệu cá nhân:</strong> Đội
                ngũ vận hành nền tảng Self-IELTS — quyết định mục đích, phương
                tiện xử lý dữ liệu học tập cốt lõi và trực tiếp thực hiện các
                biện pháp bảo vệ kỹ thuật.
              </li>
              <li>
                <strong>Bên Thứ ba (Chỉ kích hoạt theo cấu hình BYOK của bạn):</strong>{" "}
                Các nhà cung cấp mô hình ngôn ngữ lớn (Google AI Studio / Gemini,
                Groq Cloud hoặc API Endpoint tùy chỉnh) chỉ nhận dữ liệu bài làm
                khi bạn tự nhập khóa API cá nhân và chủ động bấm gửi yêu cầu chấm
                điểm.
              </li>
            </ul>
          </section>

          {/* Mục 2 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Database className="h-4 w-4 text-[var(--ux-accent)]" />
              2. Bảng kê chi tiết dữ liệu thu thập &amp; Phân loại (Điều 4 NĐ 356/2025)
            </h2>
            <p>
              Tuân thủ nguyên tắc <em>tối thiểu hóa dữ liệu</em>, Self-IELTS chỉ
              thu thập những trường thông tin thật sự cần thiết để vận hành công
              cụ học tập. Căn cứ Điều 4 Nghị định 356/2025/NĐ-CP, các thông tin
              như <strong>mật khẩu xác thực, khóa API cá nhân (BYOK) và dữ liệu
              ghi âm giọng nói Speaking</strong> được phân loại là{" "}
              <strong className="text-[var(--ux-ink)]">
                Dữ liệu cá nhân nhạy cảm
              </strong>{" "}
              và luôn yêu cầu sự đồng ý tách biệt, rõ ràng trước khi xử lý:
            </p>

            <div className="overflow-x-auto rounded-xl border border-[var(--ux-line)]">
              <table className="w-full min-w-[780px] border-collapse text-left text-xs">
                <thead className="bg-[var(--ux-surface-2)] text-[var(--ux-ink)]">
                  <tr>
                    <th className="p-3 font-semibold">Phân loại pháp lý</th>
                    <th className="p-3 font-semibold">Loại dữ liệu &amp; Nguồn</th>
                    <th className="p-3 font-semibold">Mục đích xử lý</th>
                    <th className="p-3 font-semibold">Thời hạn lưu trữ</th>
                    <th className="p-3 font-semibold">Hạ tầng &amp; Bên thứ ba</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ux-line)]">
                  {DATA_INVENTORY.map((row) => (
                    <tr key={row.data} className="align-top">
                      <td className="p-3 font-medium text-[var(--ux-ink)]">
                        {row.category}
                      </td>
                      <td className="space-y-1 p-3">
                        <p className="font-medium text-[var(--ux-ink)]">
                          {row.data}
                        </p>
                        <p className="text-[11px] text-[var(--ux-ink-3)]">
                          Nguồn: {row.source}
                        </p>
                      </td>
                      <td className="p-3">{row.purpose}</td>
                      <td className="p-3">{row.retention}</td>
                      <td className="space-y-1 p-3">
                        <p>{row.storage}</p>
                        <p className="text-[11px] text-[var(--ux-mint)]">
                          Bên thứ ba: {row.thirdParty}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mục 3 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Lock className="h-4 w-4 text-[var(--ux-mint)]" />
              3. Biện pháp bảo mật kỹ thuật &amp; Kiến trúc BYOK (Điều 25 Luật 91/2025)
            </h2>
            <p>
              Chúng tôi áp dụng các biện pháp bảo vệ kỹ thuật ngay từ khâu thiết
              kế (Privacy by Design) nhằm ngăn chặn truy cập trái phép, rò rỉ
              hoặc lạm dụng dữ liệu:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-1">
              <li>
                <strong>Cô lập dữ liệu theo từng người dùng (Tenant Isolation):</strong>{" "}
                Mọi truy vấn đọc/ghi bài làm, thẻ KSA và nhật ký lỗi đều ràng
                buộc chặt chẽ với <code>userId</code> của phiên đăng nhập hiện
                tại.
              </li>
              <li>
                <strong>Mã hóa khóa API chuẩn AES-256-GCM:</strong> Nếu bạn chọn
                đồng bộ khóa API AI lên đám mây để dùng trên nhiều thiết bị, khóa
                được mã hóa đối xứng bằng thuật toán{" "}
                <code>AES-256-GCM</code> với vector khởi tạo (IV) ngẫu nhiên
                riêng biệt trước khi ghi vào CSDL.
              </li>
              <li>
                <strong>Chế độ Không lưu trữ (Ephemeral BYOK):</strong> Mặc định,
                khóa API chỉ nằm trong <code>sessionStorage</code> của tab trình
                duyệt hiện tại, không bao giờ gửi về CSDL máy chủ và tự động hủy
                ngay khi bạn đóng tab.
              </li>
              <li>
                <strong>Hàm băm mật khẩu một chiều:</strong> Mật khẩu được xử lý
                qua thư viện xác thực tiêu chuẩn (Better Auth), chống tấn công dò
                mã (brute-force) và bảo vệ cookie phiên bằng cờ{" "}
                <code>HttpOnly</code>, <code>Secure</code>,{" "}
                <code>SameSite</code>.
              </li>
            </ul>
          </section>

          {/* Mục 4 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Server className="h-4 w-4 text-[var(--ux-accent)]" />
              4. Cookie &amp; Bộ nhớ cục bộ trên trình duyệt
            </h2>
            <p>
              <strong>Self-IELTS</strong> cam kết{" "}
              <strong className="text-[var(--ux-mint)]">
                KHÔNG sử dụng Google Analytics, Meta Pixel, TikTok Pixel, công cụ
                định danh thiết bị (Fingerprinting) hay bất kỳ cookie theo dõi
                hành vi / quảng cáo nào
              </strong>
              . Trình duyệt của bạn chỉ lưu trữ 03 khóa kỹ thuật thiết yếu sau:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-1">
              <li>
                <strong>Cookie phiên xác thực</strong> (
                <code>better-auth.session_token</code>): Cookie thiết yếu duy trì
                trạng thái đăng nhập an toàn giữa các lần tải trang.
              </li>
              <li>
                <strong>Khóa giao diện</strong> (<code>localStorage</code>:{" "}
                <code>self_ielts_theme</code>): Lưu lựa chọn chế độ Sáng (Light)
                hoặc Tối (Dark) trên thiết bị của bạn.
              </li>
              <li>
                <strong>Khóa AI tạm thời</strong> (<code>sessionStorage</code>:{" "}
                <code>self_ielts_ephemeral_byok_v1</code>): Lưu khóa API trong
                bộ nhớ tạm của tab khi bật chế độ Ephemeral; tự xóa sạch khi đóng
                tab.
              </li>
            </ul>
          </section>

          {/* Mục 5 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <Globe className="h-4 w-4 text-[var(--ux-warn)]" />
              5. Chuyển dữ liệu cá nhân xuyên biên giới (Điều 20 Luật 91/2025/QH15)
            </h2>
            <p>
              Hoạt động chuyển dữ liệu cá nhân ra ngoài lãnh thổ nước Cộng hòa
              xã hội chủ nghĩa Việt Nam có thể phát sinh trong hai trường hợp:
            </p>
            <ol className="list-inside list-decimal space-y-1.5 pl-1">
              <li>
                <strong>Hạ tầng lưu trữ đám mây (Cloud Hosting):</strong> Khi
                triển khai trên các dịch vụ đám mây quốc tế (Vercel, Turso
                Cloud), dữ liệu tài khoản và tiến độ học tập được lưu trữ trên
                cụm máy chủ đặt tại nước ngoài với kết nối mã hóa TLS 1.3.
              </li>
              <li>
                <strong>Kết nối mô hình AI theo cấu hình BYOK:</strong> Khi bạn
                chủ động cấp quyền và bấm gửi bài làm (Writing/Speaking), nội
                dung bài làm được truyền trực tiếp tới máy chủ API của Google
                (Gemini) hoặc Groq tại nước ngoài để xử lý phản hồi.
              </li>
            </ol>
            <p>
              <strong>Tuân thủ hồ sơ pháp lý:</strong> Khi vận hành phục vụ công
              chúng trên hạ tầng xuyên biên giới, Bên Kiểm soát dữ liệu thực hiện
              lập và nộp <em>Hồ sơ đánh giá tác động chuyển dữ liệu cá nhân xuyên
              biên giới</em> tới cơ quan chuyên trách bảo vệ dữ liệu cá nhân
              trong thời hạn <strong>60 ngày</strong> kể từ ngày đầu tiên chuyển
              dữ liệu theo khoản 2 Điều 20 Luật 91/2025/QH15 và Điều 18 Nghị
              định 356/2025/NĐ-CP (trừ trường hợp thuộc diện miễn trừ hợp pháp).
            </p>
          </section>

          {/* Mục 6 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ux-ink)]">
              <UserCheck className="h-4 w-4 text-[var(--ux-accent)]" />
              6. Quyền của Chủ thể dữ liệu &amp; Thời hạn giải quyết (Điều 4 Luật 91/2025)
            </h2>
            <p>
              Theo Điều 4 Luật 91/2025/QH15 và Điều 5 Nghị định 356/2025/NĐ-CP,
              bạn có đầy đủ các quyền: (1) Được biết; (2) Đồng ý; (3) Truy cập,
              xem và chỉnh sửa; (4) Rút lại sự đồng ý; (5) Xóa dữ liệu; (6) Hạn
              chế xử lý dữ liệu; (7) Cung cấp bản sao dữ liệu; (8) Phản đối xử
              lý dữ liệu; và (9) Khiếu nại, tố cáo, khởi kiện.
            </p>
            <p>
              Bạn có thể thực thi tự động ngay lập tức các quyền xem, tải bản
              sao (Export JSON), rút đồng ý hoặc xóa vĩnh viễn tài khoản tại mục{" "}
              <Link
                href="/settings#privacy-rights"
                className="font-semibold text-[var(--ux-accent)] hover:underline"
              >
                Cài đặt → Quyền dữ liệu của tôi
              </Link>
              , hoặc gửi yêu cầu tới email{" "}
              <code className="rounded bg-[var(--ux-surface-2)] px-1.5 py-0.5 text-[var(--ux-ink)]">
                {LEGAL_CONTACT_EMAIL}
              </code>{" "}
              để được xử lý theo thời hạn luật định dưới đây:
            </p>

            <div className="overflow-x-auto rounded-xl border border-[var(--ux-line)]">
              <table className="w-full min-w-[540px] border-collapse text-left text-xs">
                <thead className="bg-[var(--ux-surface-2)] text-[var(--ux-ink)]">
                  <tr>
                    <th className="p-3 font-semibold">Loại yêu cầu của bạn</th>
                    <th className="p-3 font-semibold">Thời hạn luật định</th>
                    <th className="p-3 font-semibold">
                      Quy định gia hạn &amp; Căn cứ pháp lý
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ux-line)]">
                  {STATUTORY_DEADLINES_ND356.map((d) => (
                    <tr key={d.action}>
                      <td className="p-3 font-medium text-[var(--ux-ink)]">
                        {d.action}
                      </td>
                      <td className="p-3 font-semibold text-[var(--ux-mint)]">
                        {d.standardDays}
                      </td>
                      <td className="p-3">
                        {d.extendedNote} ({d.legalBasis})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mục 7 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[var(--ux-ink)]">
              7. Cơ chế rút lại sự đồng ý &amp; Hậu quả pháp lý (Điều 10 Luật 91/2025/QH15)
            </h2>
            <p>
              Sự đồng ý của bạn đối với việc xử lý dữ liệu nhạy cảm và kết nối
              AI bên thứ ba hoàn toàn tự nguyện và có thể rút lại bất kỳ lúc nào
              mà không làm ảnh hưởng đến tính hợp pháp của việc xử lý trước thời
              điểm rút:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-1">
              <li>
                <strong>Cách thức thực hiện:</strong> Truy cập{" "}
                <Link
                  href="/settings#privacy-rights"
                  className="font-semibold text-[var(--ux-accent)] hover:underline"
                >
                  Cài đặt → Quyền dữ liệu của tôi
                </Link>{" "}
                và nhấn nút <em>Rút lại đồng ý AI</em>, hoặc gửi thông báo qua
                email <code>{LEGAL_CONTACT_EMAIL}</code>.
              </li>
              <li>
                <strong>Hậu quả kỹ thuật tức thì:</strong> Ngay khi xác nhận rút
                đồng ý, hệ thống lập tức hủy bỏ (xóa cứng) toàn bộ khóa API BYOK
                đã mã hóa khỏi cơ sở dữ liệu và khóa mọi luồng gửi dữ liệu sang
                bên thứ ba. Bạn vẫn giữ nguyên toàn bộ lịch sử học tập và tiếp
                tục sử dụng tài khoản bình thường ở{" "}
                <strong>chế độ tự học Offline 0đ</strong>.
              </li>
            </ul>
          </section>

          {/* Mục 8 */}
          <section className="space-y-2 border-t border-[var(--ux-line)] pt-6">
            <h2 className="text-base font-bold text-[var(--ux-ink)]">
              8. Cập nhật Chính sách &amp; Đầu mối tiếp nhận yêu cầu
            </h2>
            <p>
              Khi có thay đổi về mục đích xử lý dữ liệu, danh sách bên thứ ba
              hoặc quy định pháp luật liên quan, chúng tôi sẽ cập nhật số hiệu
              phiên bản chính sách và thông báo công khai trên hệ thống trước khi
              áp dụng. Mọi thắc mắc, yêu cầu thực thi quyền chủ thể dữ liệu hoặc
              phản ánh sự cố an toàn thông tin vui lòng liên hệ trực tiếp qua
              địa chỉ:{" "}
              <a
                href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                className="font-semibold text-[var(--ux-accent)] hover:underline"
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