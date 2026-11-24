import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db, type AppDatabase } from "@/db";
import { userAiConfigs, userConsents, type UserConsent } from "@/db/schema";
import {
  CONSENT_PURPOSES,
  CONSENT_TYPES,
  LEGAL_POLICY_VERSION,
  type ConsentType,
} from "@/lib/legal/constants";

export interface LatestConsentSnapshot {
  accepted: boolean;
  policyVersion: string;
  createdAt: number;
}

export interface UserConsentState {
  latest: Record<ConsentType, LatestConsentSnapshot | null>;
  history: UserConsent[];
}

export async function recordUserConsents(params: {
  userId: string;
  items: Array<{
    consentType: ConsentType;
    accepted: boolean;
    policyVersion?: string;
  }>;
  ipAddress?: string | null;
  userAgent?: string | null;
  database?: AppDatabase;
}): Promise<{ aiConfigsCleared: boolean }> {
  const database = params.database ?? db;
  const now = Date.now();
  let aiConfigsCleared = false;

  const rowsToInsert = params.items.map((item, idx) => ({
    id: crypto.randomUUID(),
    userId: params.userId,
    consentType: item.consentType,
    policyVersion: item.policyVersion || LEGAL_POLICY_VERSION,
    accepted: item.accepted ? 1 : 0,
    purposeText: CONSENT_PURPOSES[item.consentType],
    ipAddress: params.ipAddress ? params.ipAddress.slice(0, 120) : null,
    userAgent: params.userAgent ? params.userAgent.slice(0, 300) : null,
    createdAt: now + idx,
  }));

  await database.insert(userConsents).values(rowsToInsert);

  const withdrewAi = params.items.some(
    (item) =>
      item.consentType === "ai_third_party_transfer" && !item.accepted
  );

  if (withdrewAi) {
    await database
      .delete(userAiConfigs)
      .where(eq(userAiConfigs.userId, params.userId));
    aiConfigsCleared = true;
  }

  return { aiConfigsCleared };
}

export async function getUserConsentState(
  userId: string,
  database: AppDatabase = db
): Promise<UserConsentState> {
  const history = await database
    .select()
    .from(userConsents)
    .where(eq(userConsents.userId, userId))
    .orderBy(desc(userConsents.createdAt))
    .limit(50);

  const latest: Record<ConsentType, LatestConsentSnapshot | null> = {
    terms_and_privacy: null,
    age_guardian_confirm: null,
    ai_third_party_transfer: null,
  };

  for (const row of history) {
    const type = row.consentType as ConsentType;
    if (CONSENT_TYPES.includes(type) && latest[type] === null) {
      latest[type] = {
        accepted: row.accepted === 1,
        policyVersion: row.policyVersion,
        createdAt: row.createdAt,
      };
    }
  }

  return { latest, history };
}

export async function hasActiveAiConsent(
  userId: string,
  database: AppDatabase = db
): Promise<boolean> {
  const state = await getUserConsentState(userId, database);
  return Boolean(state.latest.ai_third_party_transfer?.accepted);
}
