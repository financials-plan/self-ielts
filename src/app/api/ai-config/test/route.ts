import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userAiConfigs } from "@/db/schema";
import { decryptSecret } from "@/lib/ai/crypto";
import { testProviderConnection } from "@/lib/ai/providers";
import { requireApiSession } from "@/lib/auth/session";
import { testAiConfigSchema } from "@/lib/validation/profile";

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

  const parsed = testAiConfigSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu kiểm thử không hợp lệ." },
      { status: 400 }
    );
  }

  const { mode, provider, baseUrl, preferredModel } = parsed.data;
  let apiKey = "";
  let resolvedBaseUrl = baseUrl || null;

  if (mode === "ephemeral") {
    const headerKey = request.headers.get("x-byok-key")?.trim();
    if (!headerKey) {
      return NextResponse.json(
        { error: "Thiếu header x-byok-key để kiểm thử chế độ Phiên trình duyệt." },
        { status: 400 }
      );
    }
    apiKey = headerKey;
  } else {
    const rows = await db
      .select()
      .from(userAiConfigs)
      .where(
        and(
          eq(userAiConfigs.userId, authResult.session.user.id),
          eq(userAiConfigs.provider, provider)
        )
      )
      .limit(1);

    const saved = rows[0];
    if (!saved) {
      return NextResponse.json(
        { error: "Bạn chưa lưu API Key cho nhà cung cấp này." },
        { status: 404 }
      );
    }

    apiKey = decryptSecret({
      encryptedKey: saved.encryptedKey,
      iv: saved.iv,
      authTag: saved.authTag,
    });
    resolvedBaseUrl = resolvedBaseUrl ?? saved.baseUrl;
  }

  const result = await testProviderConnection({
    provider,
    apiKey,
    baseUrl: resolvedBaseUrl,
    model: preferredModel,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
