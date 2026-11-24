import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import { user, userAiConfigs, userConsents, userProfiles } from "@/db/schema";
import { encryptSecret, maskApiKey } from "@/lib/ai/crypto";
import {
  getUserConsentState,
  hasActiveAiConsent,
  recordUserConsents,
} from "@/lib/db/consentService";
import {
  CONSENT_PURPOSES,
  LEGAL_POLICY_VERSION,
} from "@/lib/legal/constants";
import { recordConsentsSchema } from "@/lib/validation/consent";

let testDb: AppDatabase;
let closeClient: () => void;

beforeAll(async () => {
  const { client, db } = createDbClient(":memory:");
  testDb = db;
  closeClient = () => client.close();

  await client.executeMultiple(`
    PRAGMA foreign_keys = ON;
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
    CREATE TABLE user_consents (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      consent_type TEXT NOT NULL,
      policy_version TEXT NOT NULL,
      accepted INTEGER NOT NULL,
      purpose_text TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL
    );
  `);
});

afterAll(() => {
  closeClient();
});

describe("Vietnamese Legal Compliance & Consent Audit (vn-law-check)", () => {
  it("keeps legal copy compliant with Luật 91/2025 & NĐ 356/2025 (never NĐ 13/2023 or passive consent)", () => {
    const termsSrc = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/terms/page.tsx"),
      "utf8"
    );
    const privacySrc = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/privacy/page.tsx"),
      "utf8"
    );

    const combined = `${termsSrc}\n${privacySrc}\n${Object.values(CONSENT_PURPOSES).join("\n")}`;
    expect(combined).not.toContain("13/2023");
    expect(combined).not.toContain("tiếp tục sử dụng là đồng ý");
    expect(combined).not.toContain("tiếp tục sử dụng website, bạn được xem là đã đồng ý");
    expect(termsSrc).toContain("91/2025/QH15");
    expect(termsSrc).toContain("134/2025/QH15");
    expect(privacySrc).toContain("356/2025/NĐ-CP");
  });

  it("validates consent payloads strictly", () => {
    expect(
      recordConsentsSchema.safeParse({
        consents: [{ consentType: "terms_and_privacy", accepted: true }],
      }).success
    ).toBe(true);

    expect(
      recordConsentsSchema.safeParse({
        consents: [{ consentType: "unknown_type", accepted: true }],
      }).success
    ).toBe(false);
  });

  it("records append-only consent audit, deletes BYOK keys on AI withdrawal, and cascades on user delete", async () => {
    const now = Date.now();
    await testDb.insert(user).values([
      {
        id: "legal-u1",
        name: "Legal User 1",
        email: "legal1@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
      {
        id: "legal-u2",
        name: "Legal User 2",
        email: "legal2@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    ]);

    await testDb.insert(userProfiles).values({
      userId: "legal-u1",
      targetTrack: "academic",
      targetBand: 7.5,
      dailyGoalMinutes: 30,
      onboardingCompleted: 1,
      kScore: 0,
      sScore: 0,
      aScore: 0,
      streakDays: 0,
      updatedAt: now,
    });

    await recordUserConsents({
      userId: "legal-u1",
      items: [
        { consentType: "terms_and_privacy", accepted: true },
        { consentType: "age_guardian_confirm", accepted: true },
        { consentType: "ai_third_party_transfer", accepted: true },
      ],
      ipAddress: "127.0.0.1",
      userAgent: "Vitest",
      database: testDb,
    });

    expect(await hasActiveAiConsent("legal-u1", testDb)).toBe(true);

    const enc1 = encryptSecret("AIzaTest12345678", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    const enc2 = encryptSecret("AIzaOther87654321", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    await testDb.insert(userAiConfigs).values([
      {
        id: "ai-u1",
        userId: "legal-u1",
        provider: "gemini",
        encryptedKey: enc1.encryptedKey,
        iv: enc1.iv,
        authTag: enc1.authTag,
        keyHint: maskApiKey("AIzaTest12345678"),
        baseUrl: null,
        preferredModel: "gemini-2.5-flash",
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ai-u2",
        userId: "legal-u2",
        provider: "gemini",
        encryptedKey: enc2.encryptedKey,
        iv: enc2.iv,
        authTag: enc2.authTag,
        keyHint: maskApiKey("AIzaOther87654321"),
        baseUrl: null,
        preferredModel: "gemini-2.5-flash",
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Withdraw AI consent for u1
    const withdrawRes = await recordUserConsents({
      userId: "legal-u1",
      items: [{ consentType: "ai_third_party_transfer", accepted: false }],
      database: testDb,
    });

    expect(withdrawRes.aiConfigsCleared).toBe(true);
    expect(await hasActiveAiConsent("legal-u1", testDb)).toBe(false);

    const state = await getUserConsentState("legal-u1", testDb);
    expect(state.history).toHaveLength(4); // Append-only preserved
    expect(state.latest.terms_and_privacy?.policyVersion).toBe(
      LEGAL_POLICY_VERSION
    );

    // u1 AI keys gone, u2 AI keys untouched
    const u1Keys = await testDb
      .select()
      .from(userAiConfigs)
      .where(eq(userAiConfigs.userId, "legal-u1"));
    const u2Keys = await testDb
      .select()
      .from(userAiConfigs)
      .where(eq(userAiConfigs.userId, "legal-u2"));
    expect(u1Keys).toHaveLength(0);
    expect(u2Keys).toHaveLength(1);

    // Delete u1 cascades consents & profile
    await testDb.delete(user).where(eq(user.id, "legal-u1"));
    const u1ConsentsAfterDelete = await testDb
      .select()
      .from(userConsents)
      .where(eq(userConsents.userId, "legal-u1"));
    expect(u1ConsentsAfterDelete).toHaveLength(0);
  });
});
