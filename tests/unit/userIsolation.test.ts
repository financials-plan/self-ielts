import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import { user, userAiConfigs, userProfiles } from "@/db/schema";
import { decryptSecret, encryptSecret, maskApiKey } from "@/lib/ai/crypto";
import {
  getOrCreateUserProfile,
  listSafeAiConfigs,
} from "@/lib/db/profileService";

const TEST_MASTER_KEY = crypto.randomBytes(32).toString("hex");

let testDb: AppDatabase;
let closeClient: () => void;

beforeAll(async () => {
  const { client, db } = createDbClient(":memory:");
  testDb = db;
  closeClient = () => client.close();

  await client.executeMultiple(`
    CREATE TABLE user (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'learner',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE user_profiles (
      user_id TEXT PRIMARY KEY NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      target_track TEXT NOT NULL DEFAULT 'academic',
      current_band REAL,
      target_band REAL NOT NULL DEFAULT 7.0,
      exam_date INTEGER,
      daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      k_score REAL NOT NULL DEFAULT 0,
      s_score REAL NOT NULL DEFAULT 0,
      a_score REAL NOT NULL DEFAULT 0,
      streak_days INTEGER NOT NULL DEFAULT 0,
      last_study_date TEXT,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE user_ai_configs (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      encrypted_key TEXT NOT NULL,
      iv TEXT NOT NULL,
      auth_tag TEXT NOT NULL,
      key_hint TEXT NOT NULL,
      base_url TEXT,
      preferred_model TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX user_ai_configs_user_provider_uq ON user_ai_configs(user_id, provider);
  `);
});

afterAll(() => {
  closeClient();
});

describe("Multi-user DB isolation for profiles and BYOK configs", () => {
  it("isolates userA and userB profiles and encrypted AI keys", async () => {
    const now = Date.now();
    await testDb.insert(user).values([
      {
        id: "user-a",
        name: "Learner A",
        email: "a@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
      {
        id: "user-b",
        name: "Learner B",
        email: "b@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    ]);

    const profileA = await getOrCreateUserProfile("user-a", testDb);
    const profileB = await getOrCreateUserProfile("user-b", testDb);
    expect(profileA.targetTrack).toBe("academic");
    expect(profileB.targetTrack).toBe("academic");

    await testDb
      .update(userProfiles)
      .set({ targetTrack: "general", targetBand: 7.5, onboardingCompleted: 1 })
      .where(eq(userProfiles.userId, "user-a"));

    const refreshedA = await getOrCreateUserProfile("user-a", testDb);
    const refreshedB = await getOrCreateUserProfile("user-b", testDb);
    expect(refreshedA.targetTrack).toBe("general");
    expect(refreshedA.targetBand).toBe(7.5);
    expect(refreshedB.targetTrack).toBe("academic");
    expect(refreshedB.targetBand).toBe(7.0);

    const keyA = "AIzaSyUserASecretGeminiKey9999";
    const encryptedA = encryptSecret(keyA, TEST_MASTER_KEY);
    await testDb.insert(userAiConfigs).values({
      id: "cfg-a",
      userId: "user-a",
      provider: "gemini",
      encryptedKey: encryptedA.encryptedKey,
      iv: encryptedA.iv,
      authTag: encryptedA.authTag,
      keyHint: maskApiKey(keyA),
      baseUrl: null,
      preferredModel: "gemini-2.5-flash",
      isActive: 1,
      createdAt: now,
      updatedAt: now,
    });

    const configsA = await listSafeAiConfigs("user-a", testDb);
    const configsB = await listSafeAiConfigs("user-b", testDb);

    expect(configsA).toHaveLength(1);
    expect(configsA[0].keyHint).toBe("AIza••••9999");
    expect("encryptedKey" in configsA[0]).toBe(false);
    expect(configsB).toHaveLength(0);

    // Ensure scoped deletion for user-b cannot remove user-a's config
    await testDb
      .delete(userAiConfigs)
      .where(
        and(
          eq(userAiConfigs.userId, "user-b"),
          eq(userAiConfigs.provider, "gemini")
        )
      );
    const configsAAfter = await listSafeAiConfigs("user-a", testDb);
    expect(configsAAfter).toHaveLength(1);

    // Verify stored key decrypts cleanly
    const rawRow = await testDb
      .select()
      .from(userAiConfigs)
      .where(eq(userAiConfigs.userId, "user-a"));
    expect(decryptSecret(rawRow[0], TEST_MASTER_KEY)).toBe(keyA);
  });
});
