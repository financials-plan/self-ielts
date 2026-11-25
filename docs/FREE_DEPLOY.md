# Hướng dẫn Deploy Self-IELTS 100% Miễn phí (0đ — Không cần thẻ tín dụng)

Tài liệu này hướng dẫn đưa **Self-IELTS** lên Cloud hoàn toàn miễn phí (`0đ/tháng`, không yêu cầu thẻ tín dụng) với hai phương án lưu trữ dữ liệu bền vững:

- **Hosting & Serverless API**: Vercel Hobby Free (`sin1` / khu vực bất kỳ)
- **Database bền vững (chọn 1 trong 2 cách 0đ)**:
  - **Cách 1 (Khuyến nghị, 100% nội bộ Vercel)**: **Vercel Blob Private Store** (miễn phí trên Hobby) kết hợp cơ chế tự đồng bộ SQLite qua gzip + ETag trong `src/lib/db/vercelBlobSqlite.ts` — lưu bền vững tài khoản, mật khẩu băm, phiên đăng nhập, toàn bộ 435 bài học và lịch sử luyện tập mà **không cần tạo tài khoản database bên ngoài**.
  - **Cách 2 (Tùy chọn mở rộng)**: **Turso Free Tier** (`DATABASE_URL="libsql://..."`).
- **AI Tutor BYOK (tùy chọn)**: Google Gemini Free Tier / Groq Free Tier (người dùng tự nhập key trong `/settings`, hoặc dùng hoàn toàn offline không cần AI key).

---

## 1. Tạo các khóa bảo mật bắt buộc

Tạo 2 chuỗi ngẫu nhiên 32-byte cho Better Auth và khóa mã hóa AES-256-GCM dành cho AI BYOK:

```powershell
node -e "console.log('BETTER_AUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('BYOK_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
```

---

## 2. Chọn phương án lưu trữ (0đ)

### Cách 1: Vercel Private Blob (Khuyến nghị — Không cần dịch vụ ngoài)

1. Mở project trên **Vercel Dashboard → Storage → Create Database → Blob**.
2. Chọn **Access: Private** (khuyến nghị đặt Region gần Việt Nam như Singapore `sin1`) và **Connect** vào project.
3. Vercel sẽ tự gắn `BLOB_READ_WRITE_TOKEN` (và/hoặc `BLOB_STORE_ID`) vào môi trường `Production`, `Preview`, `Development`.
4. Không cần đặt `DATABASE_URL` hay `DATABASE_AUTH_TOKEN` — ở runtime Vercel, `src/lib/db/vercelBlobSqlite.ts` tự nén và đồng bộ `/tmp/ielts.db` <-> `_system/ielts-db-v1.sqlite.gz` trong Private Blob, đồng thời Route `/api/speaking/blob` cũng lưu file ghi âm vào cùng kho Private Blob này.

### Cách 2: Turso Free Tier (Nếu muốn dùng libSQL trực tiếp)

1. Cài CLI hoặc đăng nhập Turso Dashboard (gói Free Starter không cần thẻ tín dụng):
   ```bash
   turso db create self-ielts
   turso db show self-ielts --url
   turso db tokens create self-ielts
   ```
2. Đặt `DATABASE_URL` (`libsql://...`) và `DATABASE_AUTH_TOKEN` trong Environment Variables trên Vercel. Hệ thống sẽ tự ưu tiên kết nối Turso thay vì Private Blob SQLite.

> **Chạy Local 0đ:** Ở máy cá nhân, giữ nguyên `DATABASE_URL="file:./data/ielts.db"` (hoặc bỏ trống `.env`) — `ensureSchemaInitialized()` sẽ tự tạo đủ 14 bảng và nạp sẵn 435 bài học ngay ở lần chạy đầu tiên.

---

## 3. Deploy lên Vercel Hobby Free

1. Import repository [financials-plan/self-ielts](https://github.com/financials-plan/self-ielts) trên **Vercel Hobby (Free)**.
2. Trong **Settings → Environment Variables**, kiểm tra các biến sau (lưu ý `BETTER_AUTH_URL` tự nhận domain `.vercel.app` qua `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` nếu không đặt cứng):

| Biến môi trường | Bắt buộc | Giá trị mẫu / Ghi chú |
|---|---|---|
| `BETTER_AUTH_SECRET` | **Có** | Chuỗi 64 hex tạo ở bước 1 |
| `BYOK_ENCRYPTION_KEY` | **Khuyến nghị** | Chuỗi 32-byte base64 hoặc 64 hex tạo ở bước 1 |
| `BLOB_READ_WRITE_TOKEN` | **Có (Cách 1)** | Tự động tạo khi gắn Vercel Private Blob Store; cũng dùng cho sync audio Speaking |
| `DATABASE_URL` | Khi dùng Cách 2 | `libsql://self-ielts-xxxx.turso.io` (để trống nếu dùng Cách 1 trên Vercel) |
| `DATABASE_AUTH_TOKEN` | Khi dùng Cách 2 | Token từ `turso db tokens create` |
| `BETTER_AUTH_URL` | Tùy chọn | Ví dụ `https://self-ielts.vercel.app` (tự nhận diện nếu bỏ trống) |
| `NEXT_PUBLIC_APP_URL` | Tùy chọn | Trùng domain production (client tự fallback `window.location.origin` nếu bỏ trống) |
| `GOOGLE_CLIENT_ID` | Tùy chọn | Chỉ điền nếu muốn bật nút đăng nhập Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Tùy chọn | Secret tương ứng của Google OAuth |

3. Build settings giữ chuẩn Next.js (`npm install`, `npm run build`). Lưu ý `next.config.ts` đã cấu hình `outputFileTracingIncludes` để đóng gói đầy đủ native `@libsql/*` cho serverless Linux.

---

## 4. Kiểm tra sau khi Deploy

1. Mở `/register` để tạo tài khoản đầu tiên và xác nhận đồng thuận dữ liệu / AI theo **Luật 91/2025/QH15**, **Nghị định 356/2025/NĐ-CP** và **Luật AI 134/2025/QH15**.
2. Kiểm tra đủ 4 Studio: `/reading` (`109` bài), `/listening` (`109` bài), `/writing` (`109` bài), `/speaking` (`108` bài).
3. Kiểm tra `/vault` (SRS SM-2 + phát âm lại), `/errors` (Sổ lỗi sai KSA), `/import` (Nhập bộ đề JSON chuẩn hóa).
4. Vào `/settings` để thử lưu AI BYOK miễn phí (Gemini / Groq) hoặc kiểm tra tính năng xuất JSON (`/api/account/export`) và xóa tài khoản (`/api/account/delete`).
