import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import { lessons, speakingRecordings, user, userProfiles } from "@/db/schema";
import {
  getSpeakingLessonDetail,
  importLessonPack,
  listSpeakingLessonsWithUserStats,
  submitSpeakingRecording,
} from "@/lib/db/speakingService";
import { SPEAKING_LESSONS_CATALOG } from "@/lib/speaking/speakingCatalog";
import {
  analyzeSpeakingFluencyOffline,
  compareSpeakingRecordings,
} from "@/lib/speaking/speakingEngine";

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
    CREATE TABLE speaking_recordings (
      id TEXT PRIMARY KEY NOT NULL,
      attempt_id TEXT NOT NULL REFERENCES practice_attempts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      part_number INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL DEFAULT 1,
      storage_key TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL,
      anxiety_before INTEGER,
      transcript TEXT,
      fluency_metrics_json TEXT,
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

describe("Speaking Studio Offline Fluency Engine & Parts 1–3 Catalog", () => {
  it("contains complete original lessons for Part 1, Part 2, and Part 3", () => {
    expect(SPEAKING_LESSONS_CATALOG.length).toBeGreaterThanOrEqual(108);
    expect(new Set(SPEAKING_LESSONS_CATALOG.map((l) => l.partNumber))).toEqual(
      new Set([1, 2, 3])
    );
    for (const lesson of SPEAKING_LESSONS_CATALOG) {
      expect(lesson.shadowingLines.length).toBeGreaterThanOrEqual(2);
      expect(lesson.prompts.length).toBeGreaterThanOrEqual(1);
      for (const prompt of lesson.prompts) {
        expect(prompt.rescuePromptsVi.length).toBeGreaterThanOrEqual(2);
        expect(prompt.upgradePhrases.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("detects >= 1.5s silence hesitation runs, fillers, discourse markers, and calculates WPM/Band", () => {
    // 100ms per sample: 20 voiced -> 18 silent (1800ms = 1 hesitation) -> 20 voiced -> 16 silent (1600ms = 2nd hesitation) -> 26 voiced
    const rmsSamples = [
      ...Array.from({ length: 20 }, () => 0.14),
      ...Array.from({ length: 18 }, () => 0.005),
      ...Array.from({ length: 20 }, () => 0.16),
      ...Array.from({ length: 16 }, () => 0.008),
      ...Array.from({ length: 26 }, () => 0.15),
    ];

    const transcript =
      "Actually, to be honest, my daily routine has changed a lot recently because I commute early and uh um try to focus better.";

    const metrics = analyzeSpeakingFluencyOffline({
      durationMs: 10000,
      rmsSamples,
      sampleIntervalMs: 100,
      transcript,
      partNumber: 1,
    });

    expect(metrics.hesitationCount).toBe(2);
    expect(metrics.longestPauseMs).toBe(1800);
    expect(metrics.fillersFound).toContain("uh");
    expect(metrics.fillersFound).toContain("um");
    expect(metrics.discourseMarkersFound).toContain("actually");
    expect(metrics.discourseMarkersFound).toContain("to be honest");
    expect(metrics.wordCount).toBeGreaterThanOrEqual(20);
    expect(metrics.wpm).toBeGreaterThan(100);
    expect(metrics.waveformBars).toHaveLength(32);
    expect(metrics.estimatedBand).toBeGreaterThanOrEqual(4.5);
    expect(metrics.estimatedBand).toBeLessThanOrEqual(8.5);
    expect(metrics.recommendedErrorCodes).toContain("S_SPEAKING_ANXIETY");

    // Part 2 under-developed response triggers S_VOCAB_FREEZE
    const freezeMetrics = analyzeSpeakingFluencyOffline({
      durationMs: 45_000,
      rmsSamples: Array.from({ length: 40 }, () => 0.1),
      sampleIntervalMs: 100,
      transcript: "I learned cooking at home and it was good.",
      partNumber: 2,
    });
    expect(freezeMetrics.recommendedErrorCodes).toContain("S_VOCAB_FREEZE");
  });

  it("computes Attempt 1 -> Attempt 2 improvement delta accurately", () => {
    const attempt1 = analyzeSpeakingFluencyOffline({
      durationMs: 30000,
      rmsSamples: [
        ...Array.from({ length: 30 }, () => 0.12),
        ...Array.from({ length: 20 }, () => 0.005),
        ...Array.from({ length: 30 }, () => 0.12),
      ],
      sampleIntervalMs: 100,
      transcript: "I think uh my hometown is quite busy and nice.",
      partNumber: 1,
    });

    const attempt2 = analyzeSpeakingFluencyOffline({
      durationMs: 30000,
      rmsSamples: Array.from({ length: 80 }, () => 0.18),
      sampleIntervalMs: 100,
      transcript:
        "Actually, broadly speaking, my hometown has transformed remarkably over the past decade, primarily because rapid transit connected the outer districts while preserving quiet riverside parks for local residents.",
      partNumber: 1,
    });

    const delta = compareSpeakingRecordings(attempt1, attempt2, 4, 2);
    expect(delta.wpmDelta).toBeGreaterThan(0);
    expect(delta.hesitationReduced).toBe(1);
    expect(delta.anxietyDelta).toBe(2);
    expect(delta.bandDelta).toBeGreaterThan(0);
    expect(delta.summaryVi).toContain("Tiến bộ rõ rệt");
  });
});

describe("Speaking Recordings Re-record Loop, Anxiety Isolation & JSON Lesson Importer", () => {
  const userA = "speak_user_a";
  const userB = "speak_user_b";
  const now = 1_760_000_000_000;

  beforeAll(async () => {
    await testDb.insert(user).values([
      {
        id: userA,
        name: "Learner A",
        email: "speak_a@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
      {
        id: userB,
        name: "Admin B",
        email: "speak_admin@example.com",
        emailVerified: false,
        role: "admin",
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    ]);

    await testDb.insert(userProfiles).values([
      { userId: userA, updatedAt: now },
      { userId: userB, updatedAt: now },
    ]);
  });

  it("records Attempt 1 and Re-record Attempt 2 on the same attemptId and isolates anxietyHistory by user", async () => {
    const first = await submitSpeakingRecording(
      userA,
      {
        lessonId: "speak-p2-cuecard-skill",
        partNumber: 2,
        mode: "cue_drill",
        storageKey: "idb:rec-1",
        sizeBytes: 42_000,
        durationMs: 25_000,
        anxietyBefore: 5,
        confidenceBefore: 2,
        transcript:
          "Uh I want to talk about learning touch typing which was uh difficult at first.",
        rmsSamples: [
          ...Array.from({ length: 20 }, () => 0.14),
          ...Array.from({ length: 17 }, () => 0.005),
          ...Array.from({ length: 20 }, () => 0.14),
        ],
        sampleIntervalMs: 100,
      },
      testDb,
      now + 1000
    );

    expect(first.attemptNumber).toBe(1);
    expect(first.improvementDelta).toBeNull();
    expect(first.fluencyMetrics.hesitationCount).toBe(1);

    const second = await submitSpeakingRecording(
      userA,
      {
        lessonId: "speak-p2-cuecard-skill",
        attemptId: first.attemptId,
        partNumber: 2,
        mode: "cue_drill",
        storageKey: "idb:rec-2",
        sizeBytes: 51_000,
        durationMs: 25_000,
        anxietyBefore: 2,
        confidenceBefore: 4,
        transcript:
          "To be honest, mastering touch typing felt intimidating at first; however, practicing fifteen minutes every morning turned a tedious chore into an effortless daily habit that doubled my productivity.",
        rmsSamples: Array.from({ length: 60 }, () => 0.17),
        sampleIntervalMs: 100,
      },
      testDb,
      now + 5000
    );

    expect(second.attemptId).toBe(first.attemptId);
    expect(second.attemptNumber).toBe(2);
    expect(second.improvementDelta).not.toBeNull();
    expect(second.improvementDelta?.hesitationReduced).toBe(1);
    expect(second.improvementDelta?.anxietyDelta).toBe(3);

    const recsInDb = await testDb
      .select()
      .from(speakingRecordings)
      .where(eq(speakingRecordings.attemptId, first.attemptId));
    expect(recsInDb).toHaveLength(2);

    const detailA = await getSpeakingLessonDetail(
      "speak-p2-cuecard-skill",
      userA,
      testDb
    );
    expect(detailA?.recentAttempts).toHaveLength(1);
    expect(detailA?.recentAttempts[0]?.recordings).toHaveLength(2);

    const listA = await listSpeakingLessonsWithUserStats(userA, testDb);
    const listB = await listSpeakingLessonsWithUserStats(userB, testDb);
    expect(listA.anxietyHistory).toHaveLength(2);
    expect(listB.anxietyHistory).toHaveLength(0);
  });

  it("blocks non-admin learners from overwriting built-in prefixes while permitting custom-* packs and admin overrides", async () => {
    await expect(
      importLessonPack(
        {
          userRole: "learner",
          pack: {
            id: "speak-p1-daily-rhythm",
            skill: "speaking",
            track: "shared",
            partType: "Part 1 Custom",
            title: "Attempted Overwrite",
            difficultyBand: "7.0",
            contentJson: { prompts: [] },
          },
        },
        testDb,
        now + 9000
      )
    ).rejects.toThrow("FORBIDDEN_BUILTIN_OVERWRITE");

    const customImported = await importLessonPack(
      {
        userRole: "learner",
        pack: {
          id: "custom-speak-city-noise",
          skill: "speaking",
          track: "shared",
          partType: "Part 1 Custom",
          title: "Urban Acoustics & Quiet Parks",
          difficultyBand: "7.0",
          contentJson: {
            partNumber: 1,
            subtitleVi: "Đề tự nhập về tiếng ồn đô thị",
            shadowingLines: [],
            prompts: [],
          },
        },
      },
      testDb,
      now + 10_000
    );

    expect(customImported.href).toBe("/speaking/custom-speak-city-noise");

    const stored = await testDb
      .select()
      .from(lessons)
      .where(eq(lessons.id, "custom-speak-city-noise"));
    expect(stored).toHaveLength(1);
    expect(stored[0]?.title).toBe("Urban Acoustics & Quiet Parks");

    const adminUpdate = await importLessonPack(
      {
        userRole: "admin",
        pack: {
          id: "speak-custom-admin-override",
          skill: "speaking",
          track: "shared",
          partType: "Part 3 Admin",
          title: "Admin Curated Prompt",
          difficultyBand: "8.0",
          contentJson: { partNumber: 3, prompts: [] },
        },
      },
      testDb,
      now + 11_000
    );
    expect(adminUpdate.id).toBe("speak-custom-admin-override");
  });
});
