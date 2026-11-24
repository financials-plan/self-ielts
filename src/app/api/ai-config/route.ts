import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userAiConfigs } from "@/db/schema";
import { encryptSecret, maskApiKey } from "@/lib/ai/crypto";
import { validateSafeBaseUrl } from "@/lib/ai/providers";
import { requireApiSession } from "@/lib/auth/session";
import {
  hasActiveAiConsent,
  recordUserConsents,
} from "@/lib/db/consentService";
import { listSafeAiConfigs } from "@/lib/db/profileService";
import {
  deleteAiConfigSchema,
  saveAiConfigSchema,
} from "@/lib/validation/profile";

export async function GET() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const configs = await listSafeAiConfigs(authResult.session.user.id);
  return NextResponse.json({ configs });
}

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

  const parsed = saveAiConfigSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Cấu hình API Key không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  const { provider, apiKey, baseUrl, preferredModel, aiConsentAccepted } =
    parsed.data;

  const alreadyConsented = await hasActiveAiConsent(userId);
  if (!alreadyConsented) {
    if (aiConsentAccepted !== true) {
      return NextResponse.json(
        {
          error:
            "Bạn cần tick đồng ý chuyển dữ liệu nhạy cảm sang nhà cung cấp AI bên thứ ba trước khi lưu khóa BYOK.",
        },
        { status: 403 }
      );
    }

    await recordUserConsents({
      userId,
      items: [{ consentType: "ai_third_party_transfer", accepted: true }],
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: request.headers.get("user-agent") || null,
    });
  }

  const safeBaseUrl = validateSafeBaseUrl(baseUrl);
  const encrypted = encryptSecret(apiKey);
  const keyHint = maskApiKey(apiKey);
  const now = Date.now();

  await db
    .insert(userAiConfigs)
    .values({
      id: crypto.randomUUID(),
      userId,
      provider,
      encryptedKey: encrypted.encryptedKey,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyHint,
      baseUrl: safeBaseUrl,
      preferredModel,
      isActive: 1,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userAiConfigs.userId, userAiConfigs.provider],
      set: {
        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyHint,
        baseUrl: safeBaseUrl,
        preferredModel,
        isActive: 1,
        updatedAt: now,
      },
    });

  const configs = await listSafeAiConfigs(userId);
  return NextResponse.json({
    configs,
    message: "Đã mã hóa AES-256-GCM và lưu cấu hình AI an toàn.",
  });
}

export async function DELETE(request: Request) {
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

  const parsed = deleteAiConfigSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provider cần xóa không hợp lệ." },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  await db
    .delete(userAiConfigs)
    .where(
      and(
        eq(userAiConfigs.userId, userId),
        eq(userAiConfigs.provider, parsed.data.provider)
      )
    );

  const configs = await listSafeAiConfigs(userId);
  return NextResponse.json({ configs });
}
