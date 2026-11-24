import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  errorLogs,
  knowledgeCards,
  practiceAttempts,
  reflectionLogs,
  speakingRecordings,
  user,
  writingDrafts,
} from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { getUserConsentState } from "@/lib/db/consentService";
import {
  getOrCreateUserProfile,
  listSafeAiConfigs,
} from "@/lib/db/profileService";
import { LEGAL_POLICY_VERSION } from "@/lib/legal/constants";

export async function GET() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const userId = authResult.session.user.id;

  const [
    userRows,
    profile,
    safeAiConfigs,
    consentState,
    attempts,
    drafts,
    recordings,
    errors,
    cards,
    reflections,
  ] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
    getOrCreateUserProfile(userId),
    listSafeAiConfigs(userId),
    getUserConsentState(userId),
    db
      .select()
      .from(practiceAttempts)
      .where(eq(practiceAttempts.userId, userId)),
    db.select().from(writingDrafts).where(eq(writingDrafts.userId, userId)),
    db
      .select()
      .from(speakingRecordings)
      .where(eq(speakingRecordings.userId, userId)),
    db.select().from(errorLogs).where(eq(errorLogs.userId, userId)),
    db.select().from(knowledgeCards).where(eq(knowledgeCards.userId, userId)),
    db.select().from(reflectionLogs).where(eq(reflectionLogs.userId, userId)),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    policyVersion: LEGAL_POLICY_VERSION,
    legalBasis: "Điều 4 khoản 1 Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15",
    account: userRows[0] ?? null,
    profile,
    aiConfigs: safeAiConfigs,
    consents: consentState,
    ksaData: {
      practiceAttempts: attempts,
      writingDrafts: drafts,
      speakingRecordings: recordings,
      errorLogs: errors,
      knowledgeCards: cards,
      reflectionLogs: reflections,
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="self-ielts-my-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
