import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons, userAiConfigs } from "@/db/schema";
import { decryptSecret } from "@/lib/ai/crypto";
import { evaluateSpeakingWithByok } from "@/lib/ai/speakingEvaluator";
import { requireApiSession } from "@/lib/auth/session";
import {
  hasActiveAiConsent,
  recordUserConsents,
} from "@/lib/db/consentService";
import {
  attachAiFeedbackToSpeakingRecording,
  ensureSpeakingLessonsSeeded,
} from "@/lib/db/speakingService";
import type { SpeakingLessonContent } from "@/lib/speaking/speakingEngine";
import { requestAiSpeakingFeedbackSchema } from "@/lib/validation/speaking";

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

  const parsed = requestAiSpeakingFeedbackSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu chấm Speaking AI chưa hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  const data = parsed.data;

  // Luật BVDLCN 91/2025: Bắt buộc đồng ý trước khi gửi giọng nói/transcript ra bên thứ ba
  const consentActive = await hasActiveAiConsent(userId);
  if (!consentActive) {
    if (!data.inlineAiConsentConfirmed) {
      return NextResponse.json(
        {
          error:
            "Cần xác nhận đồng ý gửi dữ liệu giọng nói / transcript sang AI bên thứ ba (Luật BVDLCN 91/2025/QH15).",
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

  await ensureSpeakingLessonsSeeded();
  const lessonRows = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, data.lessonId), eq(lessons.skill, "speaking")))
    .limit(1);

  if (!lessonRows[0]) {
    return NextResponse.json(
      { error: "Không tìm thấy bài Speaking." },
      { status: 404 }
    );
  }
  const lesson = JSON.parse(lessonRows[0].contentJson) as SpeakingLessonContent;

  let resolvedKey = "";
  let resolvedBaseUrl: string | null = null;
  let resolvedModel = data.preferredModel;

  if (data.storageMode === "ephemeral") {
    if (!data.ephemeralApiKey) {
      return NextResponse.json(
        { error: "Thiếu API Key phiên trình duyệt." },
        { status: 400 }
      );
    }
    resolvedKey = data.ephemeralApiKey;
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
        { error: "Không tìm thấy khóa BYOK đã lưu cho nhà cung cấp này." },
        { status: 404 }
      );
    }
    resolvedKey = decryptSecret({
      encryptedKey: savedRows[0].encryptedKey,
      iv: savedRows[0].iv,
      authTag: savedRows[0].authTag,
    });
    resolvedBaseUrl = savedRows[0].baseUrl;
    resolvedModel = resolvedModel || savedRows[0].preferredModel;
  }

  try {
    const feedback = await evaluateSpeakingWithByok({
      provider: data.provider,
      apiKey: resolvedKey,
      baseUrl: resolvedBaseUrl,
      model: resolvedModel,
      lesson,
      transcript: data.transcript,
      audioBase64: data.audioBase64,
      audioMimeType: data.audioMimeType,
    });

    if (data.recordingId) {
      await attachAiFeedbackToSpeakingRecording(
        userId,
        data.recordingId,
        feedback.transcript,
        feedback
      );
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "MISSING_TRANSCRIPT_FOR_TEXT_PROVIDER") {
      return NextResponse.json(
        {
          error:
            "Nhà cung cấp này cần transcript văn bản (hoặc chọn Gemini / Groq Whisper để đọc trực tiếp từ âm thanh).",
        },
        { status: 400 }
      );
    }
    if (msg === "AI_RATE_LIMITED") {
      return NextResponse.json(
        {
          error:
            "Nhà cung cấp AI miễn phí đang chạm giới hạn tốc độ (429). Kết quả phân tích WPM & khoảng lặng Offline 0đ vẫn giữ nguyên.",
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Không thể phân tích AI lúc này. Bạn vẫn xem đầy đủ WPM, khoảng lặng >1.5s và bài mẫu 8.0 Offline.",
      },
      { status: 502 }
    );
  }
}
