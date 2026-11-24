import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import { user, userProfiles } from "@/db/schema";
import {
  listReadingLessonsWithUserStats,
  submitReadingAttempt,
} from "@/lib/db/readingService";
import { READING_LESSONS_CATALOG } from "@/lib/reading/readingCatalog";
import {
  classifyEvidenceOutcome,
  classifyPacingTier,
  scoreReadingAttempt,
  type ReadingAnswerInput,
} from "@/lib/reading/readingEngine";

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

describe("Reading Studio Engine, Catalog Integrity & DB Isolation", () => {
  it("classifies all 4 Evidence-Pinning Matrix cells accurately", () => {
    expect(classifyEvidenceOutcome(true, "b2", ["b2"])).toBe(
      "calibrated_mastery"
    );
    expect(classifyEvidenceOutcome(true, null, ["b2"])).toBe("lucky_guess");
    expect(classifyEvidenceOutcome(true, "a1", ["b2"])).toBe("lucky_guess");
    expect(classifyEvidenceOutcome(false, "b2", ["b2"])).toBe(
      "qualifier_trap"
    );
    expect(classifyEvidenceOutcome(false, "a1", ["b2"])).toBe(
      "misread_locator"
    );
  });

  it("grades summary completion with normalization, tracks Academic vs GT band divergence, and detects time sinks", () => {
    const acadLesson = READING_LESSONS_CATALOG.find(
      (l) => l.track === "academic"
    )!;
    const gtLesson = READING_LESSONS_CATALOG.find(
      (l) => l.track === "general"
    )!;

    // 6 out of 8 correct = 30/40 projected -> 7.0 Academic vs 6.0 General Training
    const buildAnswers = (
      lesson: typeof acadLesson,
      correctTarget: number
    ): Record<string, ReadingAnswerInput> => {
      const map: Record<string, ReadingAnswerInput> = {};
      lesson.questions.forEach((q, idx) => {
        const shouldBeCorrect = idx < correctTarget;
        map[q.id] = {
          answer: shouldBeCorrect
            ? q.type === "summary_completion"
              ? `  ${q.acceptedAnswers[0].toUpperCase()}. `
              : q.acceptedAnswers[0]
            : "WRONG_CHOICE",
          pinnedSentenceId: idx === 0 ? null : q.evidenceSentenceIds[0],
          timeSpentSec: idx === 2 ? 105 : 40,
          flagged: idx === 2,
        };
      });
      return map;
    };

    const acadEval = scoreReadingAttempt(acadLesson, {
      lessonId: acadLesson.id,
      mode: "drill",
      durationSec: 420,
      answers: buildAnswers(acadLesson, 6),
    });

    expect(acadEval.correctCount).toBe(6);
    expect(acadEval.scaledOutOf40).toBe(30);
    expect(acadEval.bandScore).toBe(7.0);
    expect(acadEval.generalEquivalentBand).toBe(6.0);
    expect(acadEval.matrixCounts.lucky_guess).toBe(1);
    expect(acadEval.matrixCounts.calibrated_mastery).toBe(5);
    expect(acadEval.matrixCounts.qualifier_trap).toBe(2);
    expect(acadEval.pacingSummary.timeSinkQuestions).toEqual([3]);
    expect(acadEval.pacingSummary.flaggedCount).toBe(1);
    expect(classifyPacingTier(105)).toBe("time_sink");

    const gtEval = scoreReadingAttempt(gtLesson, {
      lessonId: gtLesson.id,
      mode: "exam",
      durationSec: 400,
      answers: buildAnswers(gtLesson, 6),
    });
    expect(gtEval.scaledOutOf40).toBe(30);
    expect(gtEval.bandScore).toBe(6.0);
  });

  it("ensures all catalog lessons have valid unique sentence IDs and evidence links", () => {
    const acadCount = READING_LESSONS_CATALOG.filter(
      (l) => l.track === "academic"
    ).length;
    const gtCount = READING_LESSONS_CATALOG.filter(
      (l) => l.track === "general"
    ).length;

    expect(acadCount).toBeGreaterThanOrEqual(2);
    expect(gtCount).toBeGreaterThanOrEqual(2);

    for (const lesson of READING_LESSONS_CATALOG) {
      const sentenceIds = new Set<string>();
      for (const para of lesson.paragraphs) {
        for (const sentence of para.sentences) {
          expect(sentenceIds.has(sentence.id)).toBe(false);
          sentenceIds.add(sentence.id);
        }
      }
      for (const q of lesson.questions) {
        expect(q.evidenceSentenceIds.length).toBeGreaterThan(0);
        for (const evId of q.evidenceSentenceIds) {
          expect(sentenceIds.has(evId)).toBe(true);
        }
      }
    }
  });

  it("persists reading attempts, updates KSA + streak, and strictly isolates userA from userB", async () => {
    const nowMs = Date.UTC(2026, 10, 24, 15, 0, 0);
    await testDb.insert(user).values([
      {
        id: "read-u1",
        name: "Reader One",
        email: "reader1@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(nowMs),
        updatedAt: new Date(nowMs),
      },
      {
        id: "read-u2",
        name: "Reader Two",
        email: "reader2@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(nowMs),
        updatedAt: new Date(nowMs),
      },
    ]);

    const lesson = READING_LESSONS_CATALOG[0];
    const perfectAnswers: Record<string, ReadingAnswerInput> = {};
    for (const q of lesson.questions) {
      perfectAnswers[q.id] = {
        answer: q.acceptedAnswers[0],
        pinnedSentenceId: q.evidenceSentenceIds[0],
        timeSpentSec: 35,
        flagged: false,
      };
    }

    const res = await submitReadingAttempt(
      "read-u1",
      {
        lessonId: lesson.id,
        mode: "guided",
        confidenceBefore: 4,
        durationSec: 320,
        answers: perfectAnswers,
      },
      testDb,
      nowMs
    );

    expect(res.evaluation.correctCount).toBe(lesson.questions.length);
    expect(res.evaluation.bandScore).toBe(9.0);
    expect(res.profile.streakDays).toBe(1);
    expect(res.profile.sScore).toBeGreaterThan(0);

    const u1Lessons = await listReadingLessonsWithUserStats("read-u1", testDb);
    const u2Lessons = await listReadingLessonsWithUserStats("read-u2", testDb);

    const u1Target = u1Lessons.find((l) => l.id === lesson.id)!;
    const u2Target = u2Lessons.find((l) => l.id === lesson.id)!;

    expect(u1Target.attemptsCount).toBe(1);
    expect(u1Target.bestBandScore).toBe(9.0);
    expect(u2Target.attemptsCount).toBe(0);
    expect(u2Target.bestBandScore).toBeNull();

    const u2Profile = await testDb
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, "read-u2"));
    expect(u2Profile.length).toBe(0);
  });
});
