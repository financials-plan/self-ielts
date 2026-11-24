import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import { user, userProfiles } from "@/db/schema";
import {
  getWritingLessonDetail,
  listWritingLessonsWithUserStats,
  submitWritingDraft,
} from "@/lib/db/writingService";
import { WRITING_LESSONS_CATALOG } from "@/lib/writing/writingCatalog";
import {
  analyzeWritingOffline,
  compareWritingDrafts,
} from "@/lib/writing/writingEngine";

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
    CREATE TABLE writing_drafts (
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

describe("Writing 4-Stage Studio, Offline NLP & Draft 2 Rewrite Loop", () => {
  it("detects missing Overview / numbers-in-Overview on Academic T1 and contractions on GT Formal Letter", () => {
    const acadT1 = WRITING_LESSONS_CATALOG.find(
      (l) => l.taskType === "academic_task1"
    )!;
    const formalGt = WRITING_LESSONS_CATALOG.find(
      (l) => l.taskType === "gt_task1_letter" && l.letterTone === "formal"
    )!;

    // Academic T1 with number inside Overview
    const badOverview = analyzeWritingOffline(
      acadT1,
      "The chart compares bus powertrains.\n\nOverall, diesel fell from 78% to 16% while electric buses climbed.\n\nIn 2015 diesel led the fleet.",
      { thesisOrOverview: "x", bodyOne: "y", bodyTwo: "z", bodyThreeOrConclusion: "" },
      ["audit-word-150"]
    );
    expect(badOverview.hasOverviewSignal).toBe(true);
    expect(badOverview.overviewContainsNumbers).toBe(true);
    expect(badOverview.recommendedErrorCodes).toContain(
      "W_NO_OVERVIEW_OR_BULLET"
    );

    // Formal GT letter containing contractions
    const badFormal = analyzeWritingOffline(
      formalGt,
      "Dear Sir or Madam,\n\nI'm writing because I can't use the library after work and commuters don't have enough time.\n\nYours faithfully,\nAn",
      {
        thesisOrOverview: "Concern",
        bodyOne: "Study rooms",
        bodyTwo: "",
        bodyThreeOrConclusion: "Extend hours",
      },
      ["audit-gt-words"]
    );
    expect(badFormal.contractionsFound).toContain("i'm");
    expect(badFormal.contractionsFound).toContain("can't");
    expect(badFormal.contractionsFound).toContain("don't");
    expect(badFormal.recommendedErrorCodes).toContain("W_RUBRIC_GAP");
    expect(badFormal.recommendedErrorCodes).toContain("W_NO_OVERVIEW_OR_BULLET");
  });

  it("rewards Draft 1 to Draft 2 improvements via compareWritingDrafts", () => {
    const task2 = WRITING_LESSONS_CATALOG.find(
      (l) => l.taskType === "task2_essay"
    )!;
    const draft1Metrics = analyzeWritingOffline(
      task2,
      "Remote work grows fast. Cities lose shoppers. Towns gain workers. People work hard.",
      { thesisOrOverview: "a", bodyOne: "b", bodyTwo: "c", bodyThreeOrConclusion: "d" },
      ["audit-t2-word-250", "audit-t2-both-views", "audit-t2-4paras"]
    );
    const draft2Metrics = analyzeWritingOffline(
      task2,
      task2.modelComparison.band80.essayEn,
      { thesisOrOverview: "a", bodyOne: "b", bodyTwo: "c", bodyThreeOrConclusion: "d" },
      task2.selfAuditChecklist.map((c) => c.id)
    );

    const delta = compareWritingDrafts(draft1Metrics, draft2Metrics);
    expect(delta.wordCountDelta).toBeGreaterThan(100);
    expect(delta.complexSentenceDelta).toBeGreaterThan(0);
    expect(delta.bandDelta).toBeGreaterThan(0);
  });

  it("persists Draft 1 and Draft 2 on the same attemptId and strictly isolates userA from userB", async () => {
    const dayMs = Date.UTC(2026, 10, 24, 17, 0, 0);
    await testDb.insert(user).values([
      {
        id: "writ-u1",
        name: "Writer One",
        email: "writer1@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(dayMs),
        updatedAt: new Date(dayMs),
      },
      {
        id: "writ-u2",
        name: "Writer Two",
        email: "writer2@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(dayMs),
        updatedAt: new Date(dayMs),
      },
    ]);

    const task2 = WRITING_LESSONS_CATALOG.find(
      (l) => l.taskType === "task2_essay"
    )!;
    const outline = {
      thesisOrOverview: "Balanced hybrid model benefits regions",
      bodyOne: "Regional towns gain purchasing power",
      bodyTwo: "City centres still need collaboration days",
      bodyThreeOrConclusion: "Hybrid work preserves both",
    };

    const draft1 = await submitWritingDraft(
      "writ-u1",
      {
        lessonId: task2.id,
        mode: "guided",
        confidenceBefore: 3,
        durationSec: 400,
        outline,
        essayText: task2.modelComparison.band65.essayEn,
        selfAuditCheckedIds: ["audit-t2-word-250", "audit-t2-both-views", "audit-t2-4paras"],
      },
      testDb,
      dayMs
    );

    expect(draft1.version).toBe(1);
    expect(draft1.draftDelta).toBeNull();
    expect(draft1.profile.streakDays).toBe(1);

    const draft2 = await submitWritingDraft(
      "writ-u1",
      {
        lessonId: task2.id,
        attemptId: draft1.attemptId,
        mode: "guided",
        durationSec: 250,
        outline,
        essayText: task2.modelComparison.band80.essayEn,
        selfAuditCheckedIds: task2.selfAuditChecklist.map((c) => c.id),
      },
      testDb,
      dayMs + 60_000
    );

    expect(draft2.attemptId).toBe(draft1.attemptId);
    expect(draft2.version).toBe(2);
    expect(draft2.draftDelta).not.toBeNull();
    expect(draft2.draftDelta!.bandDelta).toBeGreaterThanOrEqual(0);

    const u1Lessons = await listWritingLessonsWithUserStats("writ-u1", testDb);
    const u2Lessons = await listWritingLessonsWithUserStats("writ-u2", testDb);
    expect(u1Lessons.find((l) => l.id === task2.id)?.draft2Count).toBe(1);
    expect(u2Lessons.find((l) => l.id === task2.id)?.attemptsCount).toBe(0);

    const detailU2 = await getWritingLessonDetail(task2.id, "writ-u2", testDb);
    expect(detailU2?.recentAttempts.length).toBe(0);

    const u2Profiles = await testDb
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, "writ-u2"));
    expect(u2Profiles.length).toBe(0);
  });
});
