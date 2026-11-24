import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import { user, userProfiles } from "@/db/schema";
import {
  listListeningLessonsWithUserStats,
  submitListeningAttempt,
} from "@/lib/db/listeningService";
import { LISTENING_LESSONS_CATALOG } from "@/lib/listening/listeningCatalog";
import {
  evaluateDictationAttempt,
  formatAudioClipRef,
  parseAudioClipRef,
  scoreListeningAttempt,
  type ListeningAnswerInput,
} from "@/lib/listening/listeningEngine";

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

describe("Listening Studio Engine, Dictation Suffix Detector & DB Isolation", () => {
  it("detects dropped -s and -ed suffixes accurately in Dictation Lab", () => {
    const exact = evaluateDictationAttempt(
      "heated showers and personal lockers",
      "heated showers and personal lockers"
    );
    expect(exact.accuracyPct).toBe(100);
    expect(exact.recommendedErrorCode).toBeNull();

    const droppedS = evaluateDictationAttempt(
      "heated showers and personal lockers",
      "heated shower and personal locker"
    );
    expect(droppedS.missingSCnt).toBe(2);
    expect(droppedS.recommendedErrorCode).toBe("L_SPELLING_OR_SUFFIX");

    const droppedEd = evaluateDictationAttempt(
      "the gas is compressed underground",
      "the gas is compress underground"
    );
    expect(droppedEd.missingEdCnt).toBe(1);
    expect(droppedEd.recommendedErrorCode).toBe("L_SPELLING_OR_SUFFIX");
  });

  it("round-trips 0-byte audio clip refs and validates Parts 1-4 catalog integrity", () => {
    const ref = formatAudioClipRef("list-p1-riverside-sports", "seg-5", 72, 94);
    expect(ref.length).toBeLessThan(100);
    expect(parseAudioClipRef(ref)).toEqual({
      lessonId: "list-p1-riverside-sports",
      segmentId: "seg-5",
      startSec: 72,
      endSec: 94,
    });
    expect(parseAudioClipRef("invalid-ref")).toBeNull();

    expect(LISTENING_LESSONS_CATALOG.length).toBeGreaterThanOrEqual(109);
    expect(new Set(LISTENING_LESSONS_CATALOG.map((l) => l.partNumber))).toEqual(
      new Set([1, 2, 3, 4])
    );

    for (const lesson of LISTENING_LESSONS_CATALOG) {
      const segIds = new Set(lesson.segments.map((s) => s.id));
      for (const q of lesson.questions) {
        expect(segIds.has(q.evidenceSegmentId)).toBe(true);
        if (q.distractorSegmentId) {
          expect(segIds.has(q.distractorSegmentId)).toBe(true);
        }
      }
      for (const drill of lesson.dictationDrills) {
        expect(segIds.has(drill.segmentId)).toBe(true);
      }
      if (lesson.mapLayout) {
        expect(lesson.mapLayout.candidateZones.length).toBeGreaterThanOrEqual(4);
        for (const step of lesson.mapLayout.walkPathSteps) {
          expect(segIds.has(step.segmentId)).toBe(true);
        }
      }
    }
  });

  it("grades answers, catches suffix near-misses, and computes Listening band", () => {
    const p1 = LISTENING_LESSONS_CATALOG[0];
    const answers: Record<string, ListeningAnswerInput> = {};
    p1.questions.forEach((q, idx) => {
      if (idx === 2) {
        // 'lockers' -> typed 'locker' (dropped -s!)
        answers[q.id] = { answer: "locker", reanchored: false };
      } else {
        answers[q.id] = { answer: q.acceptedAnswers[0], reanchored: idx === 5 };
      }
    });

    const evalRes = scoreListeningAttempt(p1, {
      lessonId: p1.id,
      mode: "drill",
      durationSec: 180,
      preGateCompleted: true,
      posPredictionsMatched: 5,
      reanchorCount: 1,
      dictationCompletedCount: 1,
      answers,
    });

    expect(evalRes.correctCount).toBe(5);
    expect(evalRes.suffixNearMissCount).toBe(1);
    expect(evalRes.questions[2].suffixWarning).toBe("missing_s");
    expect(evalRes.questions[2].recommendedErrorCode).toBe(
      "L_SPELLING_OR_SUFFIX"
    );
    expect(evalRes.scaledOutOf40).toBe(33);
    expect(evalRes.bandScore).toBe(7.5);
  });

  it("persists listening attempts, updates KSA + streak, and isolates userA from userB", async () => {
    const nowMs = Date.UTC(2026, 10, 24, 16, 0, 0);
    await testDb.insert(user).values([
      {
        id: "list-u1",
        name: "Listener One",
        email: "listener1@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(nowMs),
        updatedAt: new Date(nowMs),
      },
      {
        id: "list-u2",
        name: "Listener Two",
        email: "listener2@example.com",
        emailVerified: false,
        role: "learner",
        createdAt: new Date(nowMs),
        updatedAt: new Date(nowMs),
      },
    ]);

    const part2 = LISTENING_LESSONS_CATALOG[1];
    const answers: Record<string, ListeningAnswerInput> = {};
    for (const q of part2.questions) {
      answers[q.id] = { answer: q.acceptedAnswers[0], reanchored: false };
    }

    const res = await submitListeningAttempt(
      "list-u1",
      {
        lessonId: part2.id,
        mode: "exam",
        confidenceBefore: 4,
        durationSec: 120,
        preGateCompleted: true,
        posPredictionsMatched: 6,
        reanchorCount: 0,
        dictationCompletedCount: 0,
        answers,
      },
      testDb,
      nowMs
    );

    expect(res.evaluation.correctCount).toBe(6);
    expect(res.evaluation.bandScore).toBe(9.0);
    expect(res.profile.streakDays).toBe(1);
    expect(res.profile.sScore).toBeGreaterThan(0);

    const u1Lessons = await listListeningLessonsWithUserStats("list-u1", testDb);
    const u2Lessons = await listListeningLessonsWithUserStats("list-u2", testDb);

    expect(u1Lessons.find((l) => l.id === part2.id)?.attemptsCount).toBe(1);
    expect(u2Lessons.find((l) => l.id === part2.id)?.attemptsCount).toBe(0);

    const u2Profile = await testDb
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, "list-u2"));
    expect(u2Profile.length).toBe(0);
  });
});
