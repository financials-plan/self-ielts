export const LEGAL_POLICY_VERSION = "v1.0-2026-11-24";

export const LEGAL_EFFECTIVE_DATE = "24/11/2026";

export const LEGAL_CONTACT_EMAIL = "privacy@self-ielts.local";

export const CONSENT_TYPES = [
  "terms_and_privacy",
  "age_guardian_confirm",
  "ai_third_party_transfer",
] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

export const CONSENT_LABELS_VI: Record<ConsentType, string> = {
  terms_and_privacy: "Điều khoản sử dụng & Dữ liệu tài khoản cơ bản",
  age_guardian_confirm: "Xác nhận độ tuổi (≥ 16 tuổi hoặc đồng ý của người giám hộ)",
  ai_third_party_transfer:
    "Chuyển dữ liệu nhạy cảm sang nhà cung cấp AI bên thứ ba (BYOK)",
};

export const CONSENT_PURPOSES: Record<ConsentType, string> = {
  terms_and_privacy:
    "Đồng ý với Điều khoản sử dụng và việc thu thập, xử lý dữ liệu cá nhân cơ bản (tên hiển thị, email, mục tiêu Band, lịch sử luyện tập KSA) để tạo và vận hành tài khoản tự học IELTS theo Luật 91/2025/QH15.",
  age_guardian_confirm:
    "Xác nhận người dùng từ đủ 16 tuổi trở lên, hoặc đã có sự đồng ý rõ ràng của cha, mẹ hoặc người giám hộ hợp pháp theo Điều 24 Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15.",
  ai_third_party_transfer:
    "Đồng ý riêng cho phép xử lý dữ liệu cá nhân nhạy cảm (bài viết, bản ghi giọng nói, khóa API BYOK mã hóa) và chuyển dữ liệu sang nhà cung cấp AI bên thứ ba đặt ở nước ngoài (Google Gemini / Groq / endpoint người dùng cấu hình) theo khoản 4 Điều 6 NĐ 356/2025/NĐ-CP và Điều 20 Luật 91/2025/QH15.",
};

export interface StatutoryDeadline {
  action: string;
  standardDays: string;
  extendedNote: string;
  legalBasis: string;
}

export const STATUTORY_DEADLINES_ND356: StatutoryDeadline[] = [
  {
    action: "Phản hồi & hướng dẫn thủ tục tiếp nhận yêu cầu",
    standardDays: "2 ngày làm việc",
    extendedNote: "Áp dụng cho mọi loại yêu cầu của chủ thể dữ liệu",
    legalBasis: "Điều 5 khoản 1 NĐ 356/2025/NĐ-CP",
  },
  {
    action: "Xem, chỉnh sửa hoặc cung cấp bản sao dữ liệu cá nhân",
    standardDays: "10 ngày (15 ngày nếu cần bên thứ ba)",
    extendedNote: "Gia hạn tối đa 1 lần không quá 10 ngày khi phức tạp",
    legalBasis: "Điều 5 khoản 3 NĐ 356/2025/NĐ-CP",
  },
  {
    action: "Rút lại sự đồng ý, hạn chế hoặc phản đối xử lý dữ liệu",
    standardDays: "15 ngày (20 ngày nếu qua bên thứ ba)",
    extendedNote: "Gia hạn tối đa 1 lần không quá 15 ngày (app xử lý ngay)",
    legalBasis: "Điều 5 khoản 2 NĐ 356/2025/NĐ-CP",
  },
  {
    action: "Xóa vĩnh viễn dữ liệu cá nhân & tài khoản",
    standardDays: "20 ngày (30 ngày nếu qua bên thứ ba)",
    extendedNote: "Gia hạn tối đa 1 lần không quá 20 ngày (app xóa tức thì)",
    legalBasis: "Điều 5 khoản 4 NĐ 356/2025/NĐ-CP",
  },
];
