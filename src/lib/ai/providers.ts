export type AiProviderId = "gemini" | "groq" | "openai-compatible";

export interface AiProviderCatalogItem {
  id: AiProviderId;
  name: string;
  subtitle: string;
  freeTierBadge: string;
  signupUrl: string;
  defaultModel: string;
  suggestedModels: string[];
  supportsAudioMultimodal: boolean;
  requiresBaseUrl: boolean;
  defaultBaseUrl?: string;
  privacyNoteVi: string;
  setupStepsVi: string[];
}

export const AI_PROVIDERS: Record<AiProviderId, AiProviderCatalogItem> = {
  gemini: {
    id: "gemini",
    name: "Google AI Studio (Gemini Free)",
    subtitle: "Khuyên dùng • Chấm Writing + Audio Speaking trực tiếp",
    freeTierBadge: "0đ • Không cần thẻ tín dụng",
    signupUrl: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-2.5-flash",
    suggestedModels: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
    supportsAudioMultimodal: true,
    requiresBaseUrl: false,
    privacyNoteVi:
      "Lưu ý gói Free Tier của Google: dữ liệu prompt/audio có thể được Google xem xét để cải thiện mô hình. Không gửi thông tin cá nhân nhạy cảm.",
    setupStepsVi: [
      "Mở Google AI Studio bằng tài khoản Google thường (không cần thẻ).",
      "Chọn Create API key -> tạo khóa mới.",
      "Dán khóa vào bên dưới và bấm Kiểm thử kết nối.",
    ],
  },
  groq: {
    id: "groq",
    name: "Groq Cloud (Free Tier)",
    subtitle: "Siêu nhanh • Whisper v3 Turbo (8h/ngày) + Llama 3.3 70B",
    freeTierBadge: "0đ • Không cần thẻ tín dụng",
    signupUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    suggestedModels: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "whisper-large-v3-turbo",
    ],
    supportsAudioMultimodal: false,
    requiresBaseUrl: false,
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    privacyNoteVi:
      "Groq Free Tier giới hạn tốc độ theo phút/ngày (20 RPM, 2.000 lượt/ngày cho Whisper). Khi chạm giới hạn, app tự chuyển về chế độ Offline 0đ.",
    setupStepsVi: [
      "Đăng nhập console.groq.com bằng Google/GitHub (không cần thẻ).",
      "Vào API Keys -> Create API Key.",
      "Dán khóa bắt đầu bằng gsk_ vào bên dưới.",
    ],
  },
  "openai-compatible": {
    id: "openai-compatible",
    name: "OpenAI-Compatible (OpenRouter :free / Ollama)",
    subtitle: "Tùy chỉnh Base URL cho OpenRouter miễn phí hoặc Ollama cục bộ",
    freeTierBadge: "Tùy endpoint (0đ với :free / Ollama)",
    signupUrl: "https://openrouter.ai/keys",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    suggestedModels: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-3-27b-it:free",
      "llama3.2",
    ],
    supportsAudioMultimodal: false,
    requiresBaseUrl: true,
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    privacyNoteVi:
      "Chỉ chấp nhận HTTPS công khai hoặc http://localhost / http://127.0.0.1 (nếu bạn tự host Ollama trên máy).",
    setupStepsVi: [
      "Nhập Base URL (mặc định OpenRouter: https://openrouter.ai/api/v1).",
      "Chọn model miễn phí có hậu tố :free hoặc tên model Ollama của bạn.",
      "Dán API Key (với Ollama local có thể nhập ollama-local).",
    ],
  },
};

export function validateSafeBaseUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || !rawUrl.trim()) {
    return null;
  }
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Base URL không hợp lệ.");
  }

  const host = parsed.hostname.toLowerCase();
  const isLocalhost = host === "localhost" || host === "127.0.0.1";

  if (parsed.protocol === "https:") {
    // Block cloud metadata & private IPv4 ranges on https just in case
    if (
      host === "169.254.169.254" ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("127.") ||
      host === "0.0.0.0"
    ) {
      throw new Error("Base URL không được trỏ tới địa chỉ nội bộ.");
    }
    return parsed.toString().replace(/\/+$/, "");
  }

  if (parsed.protocol === "http:" && isLocalhost) {
    return parsed.toString().replace(/\/+$/, "");
  }

  throw new Error(
    "Base URL phải dùng HTTPS hoặc http://localhost / http://127.0.0.1."
  );
}

export interface ProviderTestResult {
  ok: boolean;
  statusCode: number;
  latencyMs: number;
  message: string;
}

export async function testProviderConnection(params: {
  provider: AiProviderId;
  apiKey: string;
  baseUrl?: string | null;
  model?: string;
}): Promise<ProviderTestResult> {
  const startedAt = Date.now();
  const key = params.apiKey.trim();

  try {
    let response: Response;

    if (params.provider === "gemini") {
      const url = new URL(
        "https://generativelanguage.googleapis.com/v1beta/models"
      );
      url.searchParams.set("key", key);
      response = await fetch(url.toString(), {
        method: "GET",
        signal: AbortSignal.timeout(10_000),
      });
    } else if (params.provider === "groq") {
      response = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(10_000),
      });
    } else {
      const safeBase =
        validateSafeBaseUrl(params.baseUrl) ?? "https://openrouter.ai/api/v1";
      response = await fetch(`${safeBase}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(10_000),
      });
    }

    const latencyMs = Date.now() - startedAt;

    if (response.ok) {
      return {
        ok: true,
        statusCode: response.status,
        latencyMs,
        message: `Kết nối thành công tới ${AI_PROVIDERS[params.provider].name} (${latencyMs}ms).`,
      };
    }

    if (response.status === 401 || response.status === 403 || response.status === 400) {
      return {
        ok: false,
        statusCode: response.status,
        latencyMs,
        message:
          "API Key không hợp lệ hoặc chưa được kích hoạt quyền truy cập model.",
      };
    }

    if (response.status === 429) {
      return {
        ok: false,
        statusCode: response.status,
        latencyMs,
        message:
          "Key hợp lệ nhưng đang chạm giới hạn tốc độ Free Tier (429). Bạn vẫn dùng được chế độ Offline 0đ.",
      };
    }

    return {
      ok: false,
      statusCode: response.status,
      latencyMs,
      message: `Nhà cung cấp phản hồi mã lỗi HTTP ${response.status}.`,
    };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return {
      ok: false,
      statusCode: 0,
      latencyMs,
      message: isTimeout
        ? "Hết thời gian chờ (10 giây) khi kết nối tới nhà cung cấp AI."
        : error instanceof Error
          ? error.message
          : "Không thể kết nối tới máy chủ AI.",
    };
  }
}
