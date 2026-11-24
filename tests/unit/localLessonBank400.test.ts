import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDbClient, type AppDatabase } from "@/db";
import { lessons } from "@/db/schema";
import { ensureListeningLessonsSeeded } from "@/lib/db/listeningService";
import { ensureReadingLessonsSeeded } from "@/lib/db/readingService";
import { ensureSpeakingLessonsSeeded } from "@/lib/db/speakingService";
import { ensureWritingLessonsSeeded } from "@/lib/db/writingService";
import { LISTENING_LESSONS_CATALOG } from "@/lib/listening/listeningCatalog";
import {
  scoreListeningAttempt,
  type ListeningAnswerInput,
} from "@/lib/listening/listeningEngine";
import { READING_LESSONS_CATALOG } from "@/lib/reading/readingCatalog";
import {
  scoreReadingAttempt,
  type ReadingAnswerInput,
} from "@/lib/reading/readingEngine";
import { SPEAKING_LESSONS_CATALOG } from "@/lib/speaking/speakingCatalog";
import { analyzeSpeakingFluencyOffline } from "@/lib/speaking/speakingEngine";
import { WRITING_LESSONS_CATALOG } from "@/lib/writing/writingCatalog";
import { WRITING_LOCAL_BANK } from "@/lib/writing/writingLocalBank";
import { analyzeWritingOffline } from "@/lib/writing/writingEngine";

let testDb: AppDatabase;
let closeClient: () => void;

beforeAll(async () => {
  const { client, db } = createDbClient(":memory:");
  testDb = db;
  closeClient = () => client.close();

  await client.executeMultiple(`
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
  `);
});

afterAll(() => {
  closeClient();
});

describe("400+ Offline Local Lesson Bank (Zero External API)", () => {
  it("contains more than 100 lessons per skill and 420+ newly added lessons (435 total)", () => {
    expect(READING_LESSONS_CATALOG.length).toBe(109);
    expect(LISTENING_LESSONS_CATALOG.length).toBe(109);
    expect(WRITING_LESSONS_CATALOG.length).toBe(109);
    expect(SPEAKING_LESSONS_CATALOG.length).toBe(108);

    const total =
      READING_LESSONS_CATALOG.length +
      LISTENING_LESSONS_CATALOG.length +
      WRITING_LESSONS_CATALOG.length +
      SPEAKING_LESSONS_CATALOG.length;
    expect(total).toBe(435);
  });

  it("enforces globally unique IDs and titles across all 435 lessons", () => {
    const allIds = new Set<string>();
    const allTitles = new Set<string>();

    const allItems = [
      ...READING_LESSONS_CATALOG.map((x) => ({ skill: "reading", ...x })),
      ...LISTENING_LESSONS_CATALOG.map((x) => ({ skill: "listening", ...x })),
      ...WRITING_LESSONS_CATALOG.map((x) => ({ skill: "writing", ...x })),
      ...SPEAKING_LESSONS_CATALOG.map((x) => ({ skill: "speaking", ...x })),
    ];

    for (const item of allItems) {
      expect(allIds.has(item.id)).toBe(false);
      allIds.add(item.id);
      const titleKey = `${item.skill}:${item.title}`;
      expect(allTitles.has(titleKey)).toBe(false);
      allTitles.add(titleKey);
    }
  });

  it("verifies structural & offline engine grading compatibility across Reading, Listening, Writing, and Speaking bank items", () => {
    // 1. Reading: check bank lesson grades to 9.0 with perfect pinned evidence
    const acadSample = READING_LESSONS_CATALOG.find((l) =>
      l.id.startsWith("acad-bank-")
    )!;
    const gtSample = READING_LESSONS_CATALOG.find((l) =>
      l.id.startsWith("gt-bank-")
    )!;
    for (const sample of [acadSample, gtSample]) {
      const answers: Record<string, ReadingAnswerInput> = {};
      for (const q of sample.questions) {
        answers[q.id] = {
          answer: q.acceptedAnswers[0],
          pinnedSentenceId: q.evidenceSentenceIds[0],
          timeSpentSec: 30,
          flagged: false,
        };
      }
      const ev = scoreReadingAttempt(sample, {
        lessonId: sample.id,
        mode: "drill",
        durationSec: 180,
        answers,
      });
      expect(ev.correctCount).toBe(sample.questions.length);
      expect(ev.bandScore).toBe(9.0);
    }

    // 2. Listening: check Part 2 map & Part 4 lecture bank lessons grade to 9.0
    const listMapSample = LISTENING_LESSONS_CATALOG.find((l) =>
      l.id.startsWith("list-bank-p2-")
    )!;
    expect(listMapSample.mapLayout).toBeDefined();
    const listAnswers: Record<string, ListeningAnswerInput> = {};
    for (const q of listMapSample.questions) {
      listAnswers[q.id] = {
        answer: q.acceptedAnswers[0],
        reanchored: false,
      };
    }
    const listEval = scoreListeningAttempt(listMapSample, {
      lessonId: listMapSample.id,
      mode: "guided",
      durationSec: 120,
      preGateCompleted: true,
      posPredictionsMatched: 6,
      reanchorCount: 0,
      dictationCompletedCount: 2,
      answers: listAnswers,
    });
    expect(listEval.correctCount).toBe(listMapSample.questions.length);
    expect(listEval.bandScore).toBe(9.0);

    // 3. Writing: check Academic T1 Overview (0 numbers), GT Formal (0 contractions), Task 2 >= 250w
    const at1Bank = WRITING_LESSONS_CATALOG.filter((l) =>
      l.id.startsWith("writ-bank-at1-")
    );
    const gtFormalBank = WRITING_LESSONS_CATALOG.filter(
      (l) => l.id.startsWith("writ-bank-gt1-") && l.letterTone === "formal"
    );
    const t2Bank = WRITING_LESSONS_CATALOG.filter((l) =>
      l.id.startsWith("writ-bank-t2-")
    );

    expect(at1Bank).toHaveLength(35);
    expect(gtFormalBank.length).toBeGreaterThanOrEqual(14);
    expect(t2Bank).toHaveLength(35);

    const at1Metrics = analyzeWritingOffline(
      at1Bank[0],
      at1Bank[0].modelComparison.band80.essayEn,
      { thesisOrOverview: "a", bodyOne: "b", bodyTwo: "c", bodyThreeOrConclusion: "" },
      ["audit-word-150", "audit-overview-no-data"]
    );
    expect(at1Metrics.meetsWordMinimum).toBe(true);
    expect(at1Metrics.hasOverviewSignal).toBe(true);
    expect(at1Metrics.overviewContainsNumbers).toBe(false);

    const gtMetrics = analyzeWritingOffline(
      gtFormalBank[0],
      gtFormalBank[0].modelComparison.band80.essayEn,
      { thesisOrOverview: "a", bodyOne: "b", bodyTwo: "c", bodyThreeOrConclusion: "" },
      ["audit-word-150", "audit-all-3-bullets", "audit-tone-consistency"]
    );
    expect(gtMetrics.meetsWordMinimum).toBe(true);
    expect(gtMetrics.contractionsFound).toHaveLength(0);

    const t2Metrics = analyzeWritingOffline(
      t2Bank[0],
      t2Bank[0].modelComparison.band80.essayEn,
      { thesisOrOverview: "a", bodyOne: "b", bodyTwo: "c", bodyThreeOrConclusion: "d" },
      ["audit-t2-word-250", "audit-t2-both-views", "audit-t2-4paras"]
    );
    expect(t2Metrics.meetsWordMinimum).toBe(true);
    expect(t2Metrics.wordCount).toBeGreaterThanOrEqual(250);

    for (const w of WRITING_LOCAL_BANK) {
      const c65 = w.modelComparison.band65.essayEn.trim().split(/\s+/).length;
      const c80 = w.modelComparison.band80.essayEn.trim().split(/\s+/).length;
      expect(c65).toBeGreaterThanOrEqual(w.minWords);
      expect(c80).toBeGreaterThanOrEqual(w.minWords);
    }

    // 4. Speaking: check offline fluency works cleanly with bank models
    const speakP2Sample = SPEAKING_LESSONS_CATALOG.find((l) =>
      l.id.startsWith("speak-bank-p2-")
    )!;
    const speakMetrics = analyzeSpeakingFluencyOffline({
      durationMs: 45_000,
      rmsSamples: Array.from({ length: 120 }, () => 0.16),
      sampleIntervalMs: 100,
      transcript: speakP2Sample.prompts[0].modelBand80En,
      partNumber: 2,
    });
    expect(speakMetrics.estimatedBand).toBeGreaterThanOrEqual(6.5);
  });

  it("seeds all 435 lessons into SQLite in batches and remains idempotent on re-run", async () => {
    const now = 1_760_000_000_000;
    await ensureReadingLessonsSeeded(testDb, now);
    await ensureListeningLessonsSeeded(testDb, now);
    await ensureWritingLessonsSeeded(testDb, now);
    await ensureSpeakingLessonsSeeded(testDb, now);

    // Re-run should hit cache/onConflictDoNothing and keep exact 435 count
    await ensureReadingLessonsSeeded(testDb, now + 1000);
    await ensureListeningLessonsSeeded(testDb, now + 1000);
    await ensureWritingLessonsSeeded(testDb, now + 1000);
    await ensureSpeakingLessonsSeeded(testDb, now + 1000);

    const counts = await testDb
      .select({
        skill: lessons.skill,
        total: sql<number>`count(*)`,
      })
      .from(lessons)
      .groupBy(lessons.skill);

    const countMap = new Map(counts.map((c) => [c.skill, Number(c.total)]));
    expect(countMap.get("reading")).toBe(109);
    expect(countMap.get("listening")).toBe(109);
    expect(countMap.get("writing")).toBe(109);
    expect(countMap.get("speaking")).toBe(108);
  });
});
