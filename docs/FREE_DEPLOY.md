# Hướng dẫn Deploy Self-IELTS 100% Miễn phí (0đ — Không cần thẻ tín dụng)

Tài liệu này hướng dẫn đưa **Self-IELTS** lên Cloud hoàn toàn miễn phí (`0đ/tháng`, không yêu cầu thẻ tín dụng) bằng bộ hạ tầng:

- **Hosting & Serverless API**: Vercel Hobby Free
- **Database SQLite trên Cloud**: Turso Free Tier (`libsql://`)
- **Lưu trữ file ghi âm Speaking (tùy chọn)**: Vercel Blob Hobby Free (hoặc để trống để lưu 100% cục bộ bằng IndexedDB trên trình duyệt của người học)
- **AI Tutor BYOK (tùy chọn)**: Google Gemini Free Tier / Groq Free Tier (người dùng tự nhập key trong `/settings`, hoặc dùng hoàn toàn offline không cần AI key)

---

## 1. Chuẩn bị Database miễn phí trên Turso

1. Cài đặt CLI hoặc đăng nhập tại Turso Dashboard (gói Free Starter không cần thẻ tín dụng).
2. Tạo database mới (ví dụ `self-ielts`):
   ```bash
   turso db create self-ielts
   turso db show self-ielts --url
   turso db tokens create self-ielts
   ```
3. Lưu lại:
   - `DATABASE_URL`: chuỗi `libsql://self-ielts-...turso.io`
   - `DATABASE_AUTH_TOKEN`: token vừa tạo

### Khởi tạo bảng tự động (Zero-Touch Schema)
Hệ thống đã tích hợp `ensureSchemaInitialized()` — ngay khi kết nối `DATABASE_URL` + `DATABASE_AUTH_TOKEN` và mở trang web (hoặc đăng ký tài khoản đầu tiên), toàn bộ 14 bảng dữ liệu và 435 bài học sẽ tự động được tạo và nạp.

*(Tùy chọn đẩy schema trước từ máy cá nhân bằng Drizzle Kit):*

```bash
# PowerShell
$env:DATABASE_URL="libsql://self-ielts-xxxx.turso.io"
$env:DATABASE_AUTH_TOKEN="eyJ..."
npm run db:push
```

> **Chạy Local 0đ (không cần Turso):** Khi phát triển ở máy cá nhân, giữ nguyên `DATABASE_URL="file:./data/ielts.db"` trong `.env` (không cần `DATABASE_AUTH_TOKEN`) và chạy `npm run db:push`.

---

## 2. Tạo các khóa bảo mật bắt buộc

Tạo 2 chuỗi random 32-byte (hex hoặc base64url) cho Better Auth và mã hóa AES-256-GCM khóa AI BYOK:

```powershell
node -e "console.log('BETTER_AUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('BYOK_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
```

---

## 3. Deploy lên Vercel Hobby Free

1. Mở hoặc import repository [financials-plan/self-ielts](https://github.com/financials-plan/self-ielts) trên **Vercel Hobby (Free)** (`https://vercel.com/new/import?s=https://github.com/financials-plan/self-ielts`).
2. Đăng nhập Vercel bằng GitHub (không cần thẻ tín dụng).
3. Trong phần **Environment Variables** của Project Settings, cấu hình đúng theo `.env.example` (lưu ý `BETTER_AUTH_URL` tự nhận domain `.vercel.app` qua `VERCEL_PROJECT_PRODUCTION_URL` nếu chưa đặt thủ công):

| Biến môi trường | Bắt buộc | Giá trị mẫu / Ghi chú |
|---|---|---|
| `DATABASE_URL` | Có | `libsql://self-ielts-xxxx.turso.io` (hoặc `file:./data/ielts.db` ở local) |
| `DATABASE_AUTH_TOKEN` | Khi dùng Turso | Token từ `turso db tokens create` |
| `BETTER_AUTH_SECRET` | Có | Chuỗi bí mật >= 32 ký tự |
| `BETTER_AUTH_URL` | Có | URL production, ví dụ `https://self-ielts.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Có | Trùng với `BETTER_AUTH_URL` |
| `BYOK_ENCRYPTION_KEY` | Khuyến nghị | Khóa 32-byte mã hóa AES-256-GCM nếu người dùng chọn lưu key trên DB |
| `GOOGLE_CLIENT_ID` | Tùy chọn | Chỉ điền nếu muốn bật nút đăng nhập Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Tùy chọn | Secret tương ứng của Google OAuth |
| `BLOB_READ_WRITE_TOKEN` | Tùy chọn | Token từ Vercel Storage → Blob (Hobby Free) để đồng bộ file Opus Speaking; bỏ trống app vẫn lưu cục bộ qua IndexedDB |

4. Build command giữ mặc định của Next.js:
   - Install: `npm install`
   - Build: `npm run build`

---

## 4. Kiểm tra sau khi Deploy

1. Mở `/register` để tạo tài khoản đầu tiên và xác nhận mục đồng thuận dữ liệu / AI theo **Luật 91/2025/QH15** & **Luật AI 134/2025/QH15**.
2. Kiểm tra đủ 4 Studio: `/reading`, `/listening`, `/writing`, `/speaking`.
3. Kiểm tra `/vault` (SRS SM-2 + phát âm lại), `/errors` (Sổ lỗi sai), `/import` (Nhập bộ đề JSON chuẩn hóa).
4. Vào `/settings` để cấu hình AI BYOK miễn phí (Gemini / Groq) nếu muốn chấm Task Writing hoặc Speaking Transcript + Audio.
