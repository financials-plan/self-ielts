# Self-IELTS — Nền tảng Tự học IELTS KSA 4 Kỹ năng (Miễn phí 0đ)

> **Bản chạy trực tiếp (Production 0đ):** [https://self-ielts.vercel.app](https://self-ielts.vercel.app)  
> **Mã nguồn GitHub:** [https://github.com/financials-plan/self-ielts](https://github.com/financials-plan/self-ielts)

**Self-IELTS** là nền tảng luyện thi **IELTS Academic & General Training** thiết kế theo khung năng lực **KSA (Knowledge – Skills – Attitudes)**, hoạt động trọn vẹn ở chế độ **Offline-first (không phụ thuộc API trả phí)** với **435 bài học có sẵn** trên cả 4 kỹ năng, hệ thống xác thực tài khoản **Better Auth**, ôn tập ngắt quãng **SRS SM-2**, **Sổ lỗi sai KSA**, và tùy chọn gắn API key AI cá nhân (**BYOK**).

---

## 1. Kho 435 bài học cục bộ & 4 Studio luyện tập

Toàn bộ ngân hàng đề được đóng gói trực tiếp trong mã nguồn và tự động nạp vào cơ sở dữ liệu ngay từ lần khởi chạy đầu tiên (không cần tải thêm hay gọi API bên thứ ba):

| Kỹ năng | Số lượng | Đường dẫn | Tính năng chính |
|---|---:|---|---|
| **Reading Studio** | **109 bài** | `/reading` | Đủ cả **Academic** & **General Training**; bố cục chia đôi (split-pane) đoạn văn – câu hỏi; tô sáng dẫn chứng; giải thích chi tiết các dạng *True/False/Not Given*, *Yes/No/Not Given*, *Matching Headings*, *Summary Completion*, *MCQ*; tìm kiếm, lọc theo Band & phân trang. |
| **Listening Studio** | **109 bài** | `/listening` | Bao phủ **Part 1 – Part 4**; phát âm đa giọng và chỉnh tốc độ qua **Web Speech API**; trực quan **SVG Map Labelling** cho Part 2; đồng bộ transcript, chép chính tả (*Dictation*) và lưu clip âm thanh. |
| **Writing Studio** | **109 bài** | `/writing` | Đủ **Academic Task 1**, **General Training Letter** và **Task 2 Essay (>= 250 từ)**; lập dàn ý theo cấu trúc đoạn; phân tích từ vựng & từ nối offline; checklist tự rà soát theo rubric 4 tiêu chí; bài mẫu đối chiếu; chấm điểm AI BYOK tùy chọn. |
| **Speaking Studio** | **108 bài** | `/speaking` | Bao phủ **Part 1**, **Part 2 Cue Card** (bộ đếm chuẩn bị 1 phút / nói 2 phút) và **Part 3**; ghi âm bằng **MediaRecorder** lưu trực tiếp trên **IndexedDB** trình duyệt (hỗ trợ đồng bộ Vercel Private Blob tùy chọn); thống kê tốc độ nói & từ đệm offline; nhận xét AI BYOK tùy chọn. |

---

## 2. Hệ sinh thái KSA & Quyền dữ liệu người học

- **Hồ sơ năng lực K – S – A (`/onboarding`, `/dashboard`)**: Định hướng mục tiêu Band, theo dõi cân bằng 3 trục *Knowledge – Skills – Attitudes* và chuỗi ngày học liên tục.
- **Knowledge Vault (`/vault`)**: Kho thẻ ghi nhớ ứng dụng thuật toán **SRS SM-2** kết hợp phát âm lại để củng cố từ vựng & cấu trúc câu.
- **Sổ lỗi sai KSA (`/errors`)**: Phân loại và theo dõi lỗi lặp lại theo từng kỹ năng và chiều K / S / A.
- **Nhập đề tùy biến (`/import`)**: Cho phép nhập thêm bộ đề JSON chuẩn hóa vào kho bài học cá nhân.
- **Bảo mật, tài khoản & tuân thủ pháp lý (`/login`, `/register`, `/settings`, `/terms`, `/privacy`)**:
  - Đăng ký & đăng nhập bằng email/mật khẩu qua **Better Auth** (hỗ trợ trình quản lý mật khẩu trình duyệt tự lưu & tự điền), hỗ trợ tùy chọn Google OAuth.
  - Khóa AI **BYOK** (Gemini / Groq) mã hóa bằng **AES-256-GCM** trước khi lưu.
  - Hỗ trợ xuất toàn bộ dữ liệu cá nhân dạng JSON (`/api/account/export`) và xóa vĩnh viễn tài khoản + dữ liệu liên quan (`/api/account/delete`) theo **Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15**, **Nghị định 356/2025/NĐ-CP** và **Luật Trí tuệ nhân tạo 134/2025/QH15**.

---

## 3. Kiến trúc lưu trữ bền vững 3 chế độ (0đ)

Hệ thống sử dụng **Zero-Touch Auto-Schema** (`src/lib/db/autoMigrate.ts`) tự động khởi tạo 14 bảng và nạp 435 bài học ngay ở request đầu tiên, tự chọn lớp lưu trữ phù hợp theo môi trường:

1. **Máy cá nhân (Local Dev)**: Dùng tệp SQLite cục bộ `./data/ielts.db` qua `@libsql/client`.
2. **Vercel Hobby + Vercel Private Blob (Mặc định trên Cloud 0đ)**: Khi chạy trên Vercel có gắn **Private Blob Store** (`BLOB_READ_WRITE_TOKEN` hoặc `BLOB_STORE_ID`), mô-đun `src/lib/db/vercelBlobSqlite.ts` nén gzip cơ sở dữ liệu (`/tmp/ielts.db` <-> `_system/ielts-db-v1.sqlite.gz`) và đồng bộ tự động qua ETag sau mọi thay đổi dữ liệu người dùng (tài khoản, mật khẩu băm, phiên đăng nhập, tiến độ, bài viết, flashcard, lỗi sai) — lưu trữ bền vững giữa các lần serverless cold start mà **không cần cấu hình dịch vụ database trả phí**.
3. **Turso / libSQL ngoài (Tùy chọn mở rộng)**: Khi cấu hình `DATABASE_URL="libsql://..."` và `DATABASE_AUTH_TOKEN`, ứng dụng tự chuyển sang kết nối trực tiếp tới Turso thay cho Blob SQLite.

---

## 4. Công nghệ sử dụng

- **Framework & UI**: Next.js 15 (App Router), React 19, TypeScript 5.8, Tailwind CSS v4 (`4.2.2`), Lucide React
- **Cơ sở dữ liệu & Lưu trữ**: Drizzle ORM, `@libsql/client`, `@vercel/blob` (Private Blob SQLite sync + audio Speaking)
- **Xác thực & Validation**: Better Auth `1.3.x`, Zod `3.25.x`
- **Kiểm thử**: Vitest

---

## 5. Cài đặt & chạy ở máy cá nhân (Local)

Yêu cầu **Node.js >= 20**.

```bash
npm install
npm run dev
```

Nếu muốn tùy chỉnh biến môi trường, sao chép `.env.example` thành `.env` (mặc định không cấu hình vẫn tự chạy với `./data/ielts.db` ở `http://localhost:3000`).

### Các lệnh kiểm tra & build

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy server phát triển tại `http://localhost:3000` |
| `npm run build` | Build bản production Next.js |
| `npm run start` | Khởi chạy bản production sau khi build |
| `npm run typecheck` | Kiểm tra kiểu TypeScript (`tsc --noEmit`) |
| `npm run lint` | Kiểm tra ESLint (`next lint`) |
| `npm run test:unit` | Chạy bộ test đơn vị bằng Vitest (`vitest run`) |
| `npm run db:push` | Đẩy schema Drizzle vào database |
| `npm run db:generate` | Sinh migration Drizzle |

---

## 6. Triển khai miễn phí (0đ) lên Vercel Hobby

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffinancials-plan%2Fself-ielts&env=BETTER_AUTH_SECRET,BYOK_ENCRYPTION_KEY)

1. Import repository `financials-plan/self-ielts` vào **Vercel Hobby (Free)**.
2. Trong tab **Storage** của project trên Vercel, tạo một **Vercel Blob** store ở chế độ **Private** (miễn phí `1 GB` trên gói Hobby) để tự động gắn `BLOB_READ_WRITE_TOKEN` cho việc lưu tài khoản, mật khẩu, tiến độ học và ghi âm Speaking.
3. Khai báo `BETTER_AUTH_SECRET` và `BYOK_ENCRYPTION_KEY` trong **Environment Variables**, rồi Deploy.

Xem hướng dẫn chi tiết từng bước (bao gồm tùy chọn kết nối Turso Free Tier) tại [docs/FREE_DEPLOY.md](docs/FREE_DEPLOY.md).
