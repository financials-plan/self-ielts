import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons, userAiConfigs } from "@/db/schema";
import { decryptSecret } from "@/lib/ai/crypto";
import { evaluateWritingWithByok } from "@/lib/ai/writingEvaluator";
import { requireApiSession } from "@/lib/auth/session";
import {
  hasActiveAiConsent,
  recordUserConsents,
} from "@/lib/db/consentService";
import {
  attachAiFeedbackToDraft,
  ensureWritingLessonsSeeded,
} from "@/lib/db/writingService";
import { requestAiWritingFeedbackSchema } from "@/lib/validation/writing";
import type { WritingLessonContent } from "@/lib/writing/writingEngine";

export async function POST(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Payload JSON không hợp lệ." },
      { status: 400 }
    );
  }

  const parsed = requestAiWritingFeedbackSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu yêu cầu chấm AI không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  const data = parsed.data;

  // Luật BVDLCN 91/2025: Bắt buộc xác nhận đồng ý trước khi gửi dữ liệu ra AI bên thứ ba
  const consentActive = await hasActiveAiConsent(userId);
  if (!consentActive) {
    if (!data.inlineAiConsentConfirmed) {
      return NextResponse.json(
        {
          error:
            "Cần xác nhận đồng ý gửi nội dung bài viết sang AI bên thứ ba (Luật BVDLCN 91/2025/QH15). Hoặc bạn vẫn xem đầy đủ phân tích NLP Offline 0đ.",
          requiresAiConsent: true,
        },
        { status: 403 }
      );
    }

    const fwdIp = request.headers.get("x-forwarded-for");
    const ipAddress = fwdIp ? fwdIp.split(",")[0]?.trim() : null;
    const userAgent = request.headers.get("user-agent");
    await recordUserConsents({
      userId,
      items: [{ consentType: "ai_third_party_transfer", accepted: true }],
      ipAddress,
      userAgent,
    });
  }

  await ensureWritingLessonsSeeded();
  const lessonRows = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, data.lessonId), eq(lessons.skill, "writing")))
    .limit(1);

  if (!lessonRows[0]) {
    return NextResponse.json(
      { error: "Không tìm thấy đề bài Writing." },
      { status: 404 }
    );
  }
  const lesson = JSON.parse(lessonRows[0].contentJson) as WritingLessonContent;

  let resolvedApiKey = "";
  let resolvedBaseUrl: string | null = null;
  let resolvedModel = data.preferredModel;

  if (data.storageMode === "ephemeral") {
    if (!data.ephemeralApiKey) {
      return NextResponse.json(
        { error: "Thiếu API Key phiên trình duyệt." },
        { status: 400 }
      );
    }
    resolvedApiKey = data.ephemeralApiKey;
    resolvedBaseUrl = data.ephemeralBaseUrl ?? null;
  } else {
    const savedRows = await db
      .select()
      .from(userAiConfigs)
      .where(
        and(
          eq(userAiConfigs.userId, userId),
          eq(userAiConfigs.provider, data.provider),
          eq(userAiConfigs.isActive, 1)
        )
      )
      .limit(1);

    if (!savedRows[0]) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy API Key đồng bộ cho nhà cung cấp này. Hãy thêm ở phần Cài đặt & AI.",
        },
        { status: 404 }
      );
    }

    resolvedApiKey = decryptSecret({
      encryptedKey: savedRows[0].encryptedKey,
      iv: savedRows[0].iv,
      authTag: savedRows[0].authTag,
    });
    resolvedBaseUrl = savedRows[0].baseUrl;
    resolvedModel = resolvedModel || savedRows[0].preferredModel;
  }

  try {
    const feedback = await evaluateWritingWithByok({
      provider: data.provider,
      apiKey: resolvedApiKey,
      baseUrl: resolvedBaseUrl,
      model: resolvedModel,
      lesson,
      essayText: data.essayText,
    });

    if (data.draftId) {
      await attachAiFeedbackToDraft(userId, data.draftId, feedback);
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "AI_RATE_LIMITED") {
      return NextResponse.json(
        {
          error:
            "Nhà cung cấp AI miễn phí đang chạm giới hạn tốc độ (429). Bạn vẫn có toàn bộ kết quả NLP Offline 0đ và bài mẫu 8.0 bên dưới.",
        },
        { status: 429 }
      );
    }
    if (msg.startsWith("AI_UPSTREAM_")) {
      return NextResponse.json(
        {
          error:
            "Nhà cung cấp AI từ chối yêu cầu hoặc model không khả dụng. Hãy kiểm tra lại API Key trong Cài đặt.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Không thể phân tích phản hồi AI lúc này. Hệ thống đã giữ nguyên kết quả NLP Offline 0đ cho bạn.",
      },
      { status: 502 }
    );
  }
}
