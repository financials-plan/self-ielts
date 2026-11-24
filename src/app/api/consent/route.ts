import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import {
  getUserConsentState,
  recordUserConsents,
} from "@/lib/db/consentService";
import { LEGAL_POLICY_VERSION } from "@/lib/legal/constants";
import { recordConsentsSchema } from "@/lib/validation/consent";

export async function GET() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const state = await getUserConsentState(authResult.session.user.id);
  return NextResponse.json({
    ...state,
    currentPolicyVersion: LEGAL_POLICY_VERSION,
  });
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

  const parsed = recordConsentsSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu xác nhận đồng ý không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent") || null;

  const { aiConfigsCleared } = await recordUserConsents({
    userId: authResult.session.user.id,
    items: parsed.data.consents,
    ipAddress,
    userAgent,
  });

  const state = await getUserConsentState(authResult.session.user.id);
  return NextResponse.json({
    ...state,
    aiConfigsCleared,
    currentPolicyVersion: LEGAL_POLICY_VERSION,
  });
}
