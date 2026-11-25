# Self-IELTS — Nền tảng Tự học IELTS KSA 4 Kỹ năng (Miễn phí 0đ)

Nền tảng luyện thi **IELTS Academic & General Training** theo khung **KSA (Knowledge – Skills – Attitudes)** với **435 bài học cục bộ offline** (`109` Reading, `109` Listening, `109` Writing, `108` Speaking), xác thực tài khoản Better Auth (lưu mật khẩu an toàn), SRS SM-2, Sổ lỗi sai KSA và hỗ trợ AI BYOK tùy chọn.

## Điểm nổi bật
- **Zero-Touch Auto-Schema & 435 bài học tự nạp**: Tự động khởi tạo toàn bộ 14 bảng SQLite / Turso (`user`, `session`, `account`, `lessons`, `practice_attempts`, `writing_drafts`, `speaking_recordings`, `knowledge_cards`, `error_logs`, `reflection_logs`, `user_consents`...) ở lần truy cập đầu tiên — không cần bước cài đặt DB thủ công.
- **100% Miễn phí (0đ, không cần thẻ tín dụng)**: Hoạt động hoàn chỉnh ở chế độ Offline (NLP cục bộ + Web Audio + IndexedDB + Web Speech API), tùy chọn gắn API key miễn phí (Gemini / Groq) tại `/settings`.
- **Triển khai 1-click lên Vercel Hobby + Turso Free**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffinancials-plan%2Fself-ielts&env=DATABASE_URL,DATABASE_AUTH_TOKEN,BETTER_AUTH_SECRET,BYOK_ENCRYPTION_KEY)

Xem hướng dẫn chi tiết từng bước tại [docs/FREE_DEPLOY.md](docs/FREE_DEPLOY.md).

## Chạy ở máy cá nhân (Local)

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` (hoặc đăng ký tài khoản ngay tại `/register`, mọi dữ liệu lưu bền vững vào `./data/ielts.db`).
