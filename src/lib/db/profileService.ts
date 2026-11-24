import { eq } from "drizzle-orm";
import { db, type AppDatabase } from "@/db";
import { userAiConfigs, userProfiles, type UserProfile } from "@/db/schema";
import type { AiProviderId } from "@/lib/ai/providers";

export interface SafeAiConfigSummary {
  id: string;
  provider: AiProviderId;
  keyHint: string;
  baseUrl: string | null;
  preferredModel: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export async function getOrCreateUserProfile(
  userId: string,
  database: AppDatabase = db
): Promise<UserProfile> {
  const existing = await database
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const now = Date.now();
  await database
    .insert(userProfiles)
    .values({
      userId,
      targetTrack: "academic",
      targetBand: 7.0,
      dailyGoalMinutes: 30,
      onboardingCompleted: 0,
      kScore: 0,
      sScore: 0,
      aScore: 0,
      streakDays: 0,
      updatedAt: now,
    })
    .onConflictDoNothing();

  const created = await database
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!created[0]) {
    throw new Error("Không thể khởi tạo hồ sơ người học.");
  }

  return created[0];
}

export async function listSafeAiConfigs(
  userId: string,
  database: AppDatabase = db
): Promise<SafeAiConfigSummary[]> {
  const rows = await database
    .select({
      id: userAiConfigs.id,
      provider: userAiConfigs.provider,
      keyHint: userAiConfigs.keyHint,
      baseUrl: userAiConfigs.baseUrl,
      preferredModel: userAiConfigs.preferredModel,
      isActive: userAiConfigs.isActive,
      createdAt: userAiConfigs.createdAt,
      updatedAt: userAiConfigs.updatedAt,
    })
    .from(userAiConfigs)
    .where(eq(userAiConfigs.userId, userId));

  return rows.map((row) => ({
    ...row,
    provider: row.provider as AiProviderId,
    isActive: row.isActive === 1,
  }));
}
