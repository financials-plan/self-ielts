import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ==========================================
// 1. Better Auth Core Tables
// ==========================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  role: text("role").notNull().default("learner"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)]
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (table) => [index("account_user_id_idx").on(table.userId)]
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
      sql`(cast(unixepoch('subsecond') * 1000 as integer))`
    ),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(
      sql`(cast(unixepoch('subsecond') * 1000 as integer))`
    ),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ==========================================
// 2. Learner Profile & BYOK AI Configs
// ==========================================

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  targetTrack: text("target_track").notNull().default("academic"), // 'academic' | 'general'
  currentBand: real("current_band"),
  targetBand: real("target_band").notNull().default(7.0),
  examDate: integer("exam_date"), // Unix epoch ms
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(30),
  onboardingCompleted: integer("onboarding_completed").notNull().default(0),
  kScore: real("k_score").notNull().default(0),
  sScore: real("s_score").notNull().default(0),
  aScore: real("a_score").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastStudyDate: text("last_study_date"),
  updatedAt: integer("updated_at").notNull(),
});

export const userAiConfigs = sqliteTable(
  "user_ai_configs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // 'gemini' | 'groq' | 'openai-compatible'
    encryptedKey: text("encrypted_key").notNull(),
    iv: text("iv").notNull(),
    authTag: text("auth_tag").notNull(),
    keyHint: text("key_hint").notNull(),
    baseUrl: text("base_url"),
    preferredModel: text("preferred_model").notNull(),
    isActive: integer("is_active").notNull().default(1),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("user_ai_configs_user_provider_uq").on(
      table.userId,
      table.provider
    ),
    index("user_ai_configs_user_id_idx").on(table.userId),
  ]
);

// ==========================================
// 3. KSA Learning & Practice Tables (Phases 2-6)
// ==========================================

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    skill: text("skill").notNull(), // 'listening' | 'reading' | 'writing' | 'speaking'
    track: text("track").notNull().default("shared"), // 'shared' | 'academic' | 'general'
    partType: text("part_type").notNull(),
    title: text("title").notNull(),
    difficultyBand: text("difficulty_band").notNull().default("6.5"),
    contentJson: text("content_json").notNull(),
    ksaTagsJson: text("ksa_tags_json").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("lessons_skill_track_idx").on(table.skill, table.track)]
);

export const practiceAttempts = sqliteTable(
  "practice_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    skill: text("skill").notNull(),
    mode: text("mode").notNull().default("guided"), // 'guided' | 'drill' | 'exam'
    rawScore: real("raw_score"),
    bandScore: real("band_score"),
    confidenceBefore: integer("confidence_before"),
    durationSec: integer("duration_sec").notNull().default(0),
    answersJson: text("answers_json").notNull(),
    telemetryJson: text("telemetry_json"),
    completedAt: integer("completed_at").notNull(),
  },
  (table) => [
    index("attempts_user_skill_idx").on(table.userId, table.skill),
    index("attempts_user_completed_idx").on(table.userId, table.completedAt),
  ]
);

export const writingDrafts = sqliteTable(
  "writing_drafts",
  {
    id: text("id").primaryKey(),
    attemptId: text("attempt_id")
      .notNull()
      .references(() => practiceAttempts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    outlineJson: text("outline_json"),
    essayText: text("essay_text").notNull(),
    selfAuditJson: text("self_audit_json"),
    offlineMetricsJson: text("offline_metrics_json"),
    aiFeedbackJson: text("ai_feedback_json"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("writing_drafts_attempt_idx").on(table.attemptId),
    index("writing_drafts_user_created_idx").on(table.userId, table.createdAt),
  ]
);

export const speakingRecordings = sqliteTable(
  "speaking_recordings",
  {
    id: text("id").primaryKey(),
    attemptId: text("attempt_id")
      .notNull()
      .references(() => practiceAttempts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    partNumber: integer("part_number").notNull(),
    attemptNumber: integer("attempt_number").notNull().default(1),
    storageKey: text("storage_key").notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    durationMs: integer("duration_ms").notNull().default(0),
    anxietyBefore: integer("anxiety_before"),
    transcript: text("transcript"),
    fluencyMetricsJson: text("fluency_metrics_json"),
    aiFeedbackJson: text("ai_feedback_json"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("speaking_recordings_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
    index("speaking_recordings_attempt_idx").on(table.attemptId),
  ]
);

export const errorLogs = sqliteTable(
  "error_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    attemptId: text("attempt_id").references(() => practiceAttempts.id, {
      onDelete: "set null",
    }),
    skill: text("skill").notNull(),
    ksaDimension: text("ksa_dimension").notNull(), // 'K' | 'S' | 'A'
    errorCode: text("error_code").notNull(),
    contextSnippet: text("context_snippet").notNull(),
    resolutionNote: text("resolution_note"),
    resolved: integer("resolved").notNull().default(0),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("error_logs_user_skill_dim_idx").on(
      table.userId,
      table.skill,
      table.ksaDimension
    ),
  ]
);

export const knowledgeCards = sqliteTable(
  "knowledge_cards",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    skill: text("skill").notNull(),
    cardType: text("card_type").notNull(), // 'vocab' | 'paraphrase' | 'audio_clip' | 'collocation' | 'phrase'
    front: text("front").notNull(),
    back: text("back").notNull(),
    audioClipRef: text("audio_clip_ref"),
    intervalDays: integer("interval_days").notNull().default(1),
    easeFactor: real("ease_factor").notNull().default(2.5),
    repetitions: integer("repetitions").notNull().default(0),
    nextReviewAt: integer("next_review_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("knowledge_cards_user_review_idx").on(
      table.userId,
      table.nextReviewAt
    ),
    index("knowledge_cards_user_skill_idx").on(table.userId, table.skill),
  ]
);

export const reflectionLogs = sqliteTable(
  "reflection_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    attemptId: text("attempt_id").references(() => practiceAttempts.id, {
      onDelete: "set null",
    }),
    preIntention: text("pre_intention"),
    whatWentWell: text("what_went_well"),
    nextAdjustment: text("next_adjustment"),
    energyLevel: integer("energy_level"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("reflection_logs_user_created_idx").on(table.userId, table.createdAt),
  ]
);

// ==========================================
// 4. Legal Consent Audit Trail (Luật 91/2025 & NĐ 356/2025)
// ==========================================

export const userConsents = sqliteTable(
  "user_consents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    consentType: text("consent_type").notNull(), // 'terms_and_privacy' | 'age_guardian_confirm' | 'ai_third_party_transfer'
    policyVersion: text("policy_version").notNull(),
    accepted: integer("accepted").notNull(), // 1 = accepted, 0 = withdrawn/declined
    purposeText: text("purpose_text").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("user_consents_user_type_created_idx").on(
      table.userId,
      table.consentType,
      table.createdAt
    ),
  ]
);

export type UserProfile = typeof userProfiles.$inferSelect;
export type UserAiConfig = typeof userAiConfigs.$inferSelect;
export type UserConsent = typeof userConsents.$inferSelect;
export type KnowledgeCard = typeof knowledgeCards.$inferSelect;
export type ErrorLog = typeof errorLogs.$inferSelect;
export type ReflectionLog = typeof reflectionLogs.$inferSelect;
