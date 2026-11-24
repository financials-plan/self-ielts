import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import {
  errorLogs,
  knowledgeCards,
  reflectionLogs,
  user,
  userProfiles,
} from "@/db/schema";
import {
  getDashboardKsaSnapshot,
  touchStudyActivityAndRecomputeKsa,
} from "@/lib/db/ksaService";
import {
  buildBottleneckMatrix,
  computeKsaScores,
  evaluateConfidenceCalibration,
} from "@/lib/ksa/ksaScoring";

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
    CREATE TABLE lessons (
      id TEXT PRIMARY KEY NOT NULL,
      skill TEXT NOT NULL,
      track TEXT NOT NULL DEFAULT 'shared',
      part_type TEXT NOT NULL,
      title TEXT NOT NULL,
      difficulty_band TEXT NOT NULL DEFAULT '6.5',
      content_json TEXT NOT NULL,
      ksa_tags_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE practice_attempts (
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
    );
    CREATE TABLE error_logs (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      attempt_id TEXT,
      skill TEXT NOT NULL,
      ksa_dimension TEXT NOT NULL,
      error_code TEXT NOT NULL,
      context_snippet TEXT NOT NULL,
      resolution_note TEXT,
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE knowledge_cards (
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
    );
    CREATE TABLE reflection_logs (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      attempt_id TEXT,
      pre_intention TEXT,
      what_went_well TEXT,
      next_adjustment TEXT,
      energy_level INTEGER,
      created_at INTEGER NOT NULL
    );
  `);
});

afterAll(() => {
  closeClient();
});

describe("KSA Scoring, Bottleneck Matrix, Calibration & DB Isolation", () => {
  it("computes bounded KSA scores and detects primary bottleneck accurately", () => {
    const zero = computeKsaScores({
      cards: [],
      errors: [],
      reflections: [],
      attempts: [],
      streakDays: 0,
    });
    expect(zero).toEqual({ kScore: 0, sScore: 0, aScore: 0 });

    const { matrix, primaryBottleneck } = buildBottleneckMatrix([
      {
        skill: "reading",
        ksaDimension: "S",
        errorCode: "R_TFNG_LOGIC",
        resolved: 0,
      },
      {
        skill: "reading",
        ksaDimension: "S",
        errorCode: "R_TFNG_LOGIC",
        resolved: 0,
      },
      {
        skill: "listening",
        ksaDimension: "K",
        errorCode: "L_CONNECTED_SPEECH",
        resolved: 1,
      },
    ]);

    expect(matrix.reading.S.unresolved).toBe(2);
    expect(matrix.listening.K.unresolved).toBe(0);
    expect(primaryBottleneck?.skill).toBe("reading");
    expect(primaryBottleneck?.dimension).toBe("S");
    expect(primaryBottleneck?.topErrorCode).toBe("R_TFNG_LOGIC");
  });

  it("evaluates confidence calibration (overconfident, underconfident, well_calibrated)", () => {
    expect(
      evaluateConfidenceCalibration([
        { confidenceBefore: 5, bandScore: 6.0 },
      ]).status
    ).toBe("insufficient_data");

    expect(
      evaluateConfidenceCalibration([
        { confidenceBefore: 5, bandScore: 5.0 },
        { confidenceBefore: 5, bandScore: 5.5 },
      ]).status
    ).toBe("overconfident");

    expect(
      evaluateConfidenceCalibration([
        { confidenceBefore: 2, bandScore: 7.5 },
        { confidenceBefore: 2, bandScore: 8.0 },
      ]).status
    ).toBe("underconfident");

    expect(
      evaluateConfidenceCalibration([
        { confidenceBefore: 4, bandScore: 7.0 },
        { confidenceBefore: 4, bandScore: 7.5 },
      ]).status
    ).toBe("well_calibrated");
  });

  it("recomputes KSA + streak in SQLite and strictly isolates userA from userB", async () => {
    const day1Ms = Date.UTC(2026, 10, 23, 10, 0, 0);
    const day2Ms = Date.UTC(2026, 10, 24, 10, 0, 0);

    await testDb.insert(user).values([
      {
        id: "ksa-u1",
        name: "KSA User 1",
        email: "ksa1@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(day1Ms),
        updatedAt: new Date(day1Ms),
      },
      {
        id: "ksa-u2",
        name: "KSA User 2",
        email: "ksa2@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(day1Ms),
        updatedAt: new Date(day1Ms),
      },
    ]);

    await testDb.insert(knowledgeCards).values({
      id: crypto.randomUUID(),
      userId: "ksa-u1",
      skill: "reading",
      cardType: "paraphrase",
      front: "reluctant",
      back: "unwilling",
      intervalDays: 6,
      easeFactor: 2.5,
      repetitions: 2,
      nextReviewAt: day2Ms - 1000,
      createdAt: day1Ms,
    });

    await testDb.insert(errorLogs).values({
      id: crypto.randomUUID(),
      userId: "ksa-u1",
      skill: "listening",
      ksaDimension: "A",
      errorCode: "L_LOST_TRACK_PANIC",
      contextSnippet: "Missed Q12 and panicked on Q13",
      resolved: 0,
      createdAt: day1Ms,
    });

    await testDb.insert(reflectionLogs).values({
      id: crypto.randomUUID(),
      userId: "ksa-u1",
      preIntention: "Stay calm",
      whatWentWell: "Finished scanning",
      nextAdjustment: "Pin evidence first",
      energyLevel: 4,
      createdAt: day2Ms,
    });

    const p1Day1 = await touchStudyActivityAndRecomputeKsa(
      "ksa-u1",
      testDb,
      day1Ms
    );
    expect(p1Day1.streakDays).toBe(1);
    expect(p1Day1.kScore).toBeGreaterThan(0);

    const p1Day2 = await touchStudyActivityAndRecomputeKsa(
      "ksa-u1",
      testDb,
      day2Ms
    );
    expect(p1Day2.streakDays).toBe(2);
    expect(p1Day2.aScore).toBeGreaterThan(0);

    const snap1 = await getDashboardKsaSnapshot("ksa-u1", testDb, day2Ms);
    const snap2 = await getDashboardKsaSnapshot("ksa-u2", testDb, day2Ms);

    expect(snap1.totalCardsCount).toBe(1);
    expect(snap1.dueCardsCount).toBe(1);
    expect(snap1.unresolvedErrorsCount).toBe(1);
    expect(snap1.primaryBottleneck?.skill).toBe("listening");

    expect(snap2.totalCardsCount).toBe(0);
    expect(snap2.totalErrorsCount).toBe(0);
    expect(snap2.profile.streakDays).toBe(0);

    const u2Rows = await testDb
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, "ksa-u2"));
    expect(u2Rows[0].kScore).toBe(0);
  });
});
