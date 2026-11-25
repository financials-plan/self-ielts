import { sql } from "drizzle-orm";
import { db, resolveRuntimeDb, type AppDatabase } from "@/db";
import {
  isVercelBlobSqliteEnabled,
  syncSqliteFromBlobIfNeeded,
  withSuppressedBlobFlush,
} from "@/lib/db/vercelBlobSqlite";

const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    role TEXT NOT NULL DEFAULT 'learner',
    created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
    updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
  )`,
  `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY NOT NULL,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
    updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS session_user_id_idx ON session (user_id)`,
  `CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    password TEXT,
    created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
    updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS account_user_id_idx ON account (user_id)`,
  `CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY NOT NULL,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
    updated_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
  )`,
  `CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification (identifier)`,
  `CREATE TABLE IF NOT EXISTS user_profiles (
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
  )`,
  `CREATE TABLE IF NOT EXISTS user_ai_configs (
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
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS user_ai_configs_user_provider_uq ON user_ai_configs (user_id, provider)`,
  `CREATE INDEX IF NOT EXISTS user_ai_configs_user_id_idx ON user_ai_configs (user_id)`,
  `CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY NOT NULL,
    skill TEXT NOT NULL,
    track TEXT NOT NULL DEFAULT 'shared',
    part_type TEXT NOT NULL,
    title TEXT NOT NULL,
    difficulty_band TEXT NOT NULL DEFAULT '6.5',
    content_json TEXT NOT NULL,
    ksa_tags_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS lessons_skill_track_idx ON lessons (skill, track)`,
  `CREATE TABLE IF NOT EXISTS practice_attempts (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'guided',
    raw_score REAL,
    band_score REAL,
    confidence_before INTEGER,
    duration_sec INTEGER NOT NULL DEFAULT 0,
    answers_json TEXT NOT NULL,
    telemetry_json TEXT,
    completed_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS attempts_user_skill_idx ON practice_attempts (user_id, skill)`,
  `CREATE INDEX IF NOT EXISTS attempts_user_completed_idx ON practice_attempts (user_id, completed_at)`,
  `CREATE TABLE IF NOT EXISTS writing_drafts (
    id TEXT PRIMARY KEY NOT NULL,
    attempt_id TEXT NOT NULL REFERENCES practice_attempts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    outline_json TEXT,
    essay_text TEXT NOT NULL,
    self_audit_json TEXT,
    offline_metrics_json TEXT,
    ai_feedback_json TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS writing_drafts_attempt_idx ON writing_drafts (attempt_id)`,
  `CREATE INDEX IF NOT EXISTS writing_drafts_user_created_idx ON writing_drafts (user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS speaking_recordings (
    id TEXT PRIMARY KEY NOT NULL,
    attempt_id TEXT NOT NULL REFERENCES practice_attempts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    part_number INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    storage_key TEXT NOT NULL,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    anxiety_before INTEGER,
    transcript TEXT,
    fluency_metrics_json TEXT,
    ai_feedback_json TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS speaking_recordings_user_created_idx ON speaking_recordings (user_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS speaking_recordings_attempt_idx ON speaking_recordings (attempt_id)`,
  `CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    attempt_id TEXT REFERENCES practice_attempts(id) ON DELETE SET NULL,
    skill TEXT NOT NULL,
    ksa_dimension TEXT NOT NULL,
    error_code TEXT NOT NULL,
    context_snippet TEXT NOT NULL,
    resolution_note TEXT,
    resolved INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS error_logs_user_skill_dim_idx ON error_logs (user_id, skill, ksa_dimension)`,
  `CREATE TABLE IF NOT EXISTS knowledge_cards (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    card_type TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    audio_clip_ref TEXT,
    interval_days INTEGER NOT NULL DEFAULT 1,
    ease_factor REAL NOT NULL DEFAULT 2.5,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS knowledge_cards_user_review_idx ON knowledge_cards (user_id, next_review_at)`,
  `CREATE INDEX IF NOT EXISTS knowledge_cards_user_skill_idx ON knowledge_cards (user_id, skill)`,
  `CREATE TABLE IF NOT EXISTS reflection_logs (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    attempt_id TEXT REFERENCES practice_attempts(id) ON DELETE SET NULL,
    pre_intention TEXT,
    what_went_well TEXT,
    next_adjustment TEXT,
    energy_level INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS reflection_logs_user_created_idx ON reflection_logs (user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS user_consents (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    accepted INTEGER NOT NULL,
    purpose_text TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS user_consents_user_type_created_idx ON user_consents (user_id, consent_type, created_at)`,
];

const initializedDbs = new WeakSet<object>();

export async function ensureSchemaInitialized(
  database: AppDatabase = db
): Promise<void> {
  if (database === db && isVercelBlobSqliteEnabled()) {
    await syncSqliteFromBlobIfNeeded();
  }

  const targetDb = database === db ? resolveRuntimeDb() : database;
  const cacheKey = targetDb as unknown as object;

  if (initializedDbs.has(cacheKey)) {
    return;
  }

  await withSuppressedBlobFlush(async () => {
    for (const stmt of SCHEMA_STATEMENTS) {
      await targetDb.run(sql.raw(stmt));
    }
  });

  initializedDbs.add(cacheKey);
}
