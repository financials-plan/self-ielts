import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, type AppDatabase } from "@/db";
import { lessons, practiceAttempts, type UserProfile } from "@/db/schema";
import type { IeltsTrack } from "@/lib/ksa/bandCalculator";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import { seedSkillLessonsBatch } from "@/lib/db/seedHelper";
import { READING_LESSONS_CATALOG } from "@/lib/reading/readingCatalog";
import {
  scoreReadingAttempt,
  type ReadingAttemptEvaluation,
  type ReadingAttemptSubmission,
  type ReadingLessonContent,
  type ReadingQuestionType,
} from "@/lib/reading/readingEngine";

export interface ReadingLessonSummary {
  id: string;
  track: IeltsTrack;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  recommendedMinutes: number;
  questionCount: number;
  questionTypes: ReadingQuestionType[];
  ksaFocus: Array<"K" | "S" | "A">;
  attemptsCount: number;
  bestBandScore: number | null;
  lastCompletedAt: number | null;
  lastMode: string | null;
}

export interface ReadingAttemptSummary {
  id: string;
  mode: string;
  rawScore: number | null;
  bandScore: number | null;
  confidenceBefore: number | null;
  durationSec: number;
  completedAt: number;
  evaluation: ReadingAttemptEvaluation | null;
}

export async function ensureReadingLessonsSeeded(
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<void> {
  const rows = READING_LESSONS_CATALOG.map((item) => ({
    id: item.id,
    skill: "reading",
    track: item.track,
    partType: item.partType,
    title: item.title,
    difficultyBand: item.difficultyBand,
    contentJson: JSON.stringify(item),
    ksaTagsJson: JSON.stringify({
      ksaFocus: item.ksaFocus,
      questionTypes: Array.from(new Set(item.questions.map((q) => q.type))),
      questionCount: item.questions.length,
    }),
    createdAt: nowMs,
  }));

  await seedSkillLessonsBatch(database, "reading", rows);
}

export async function listReadingLessonsWithUserStats(
  userId: string,
  database: AppDatabase = db,
  trackFilter?: IeltsTrack
): Promise<ReadingLessonSummary[]> {
  await ensureReadingLessonsSeeded(database);

  const [lessonRows, userAttempts] = await Promise.all([
    database
      .select()
      .from(lessons)
      .where(
        trackFilter
          ? and(eq(lessons.skill, "reading"), eq(lessons.track, trackFilter))
          : eq(lessons.skill, "reading")
      ),
    database
      .select({
        lessonId: practiceAttempts.lessonId,
        bandScore: practiceAttempts.bandScore,
        completedAt: practiceAttempts.completedAt,
        mode: practiceAttempts.mode,
      })
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.skill, "reading")
        )
      )
      .orderBy(desc(practiceAttempts.completedAt)),
  ]);

  const attemptsByLesson = new Map<
    string,
    Array<{
      bandScore: number | null;
      completedAt: number;
      mode: string;
    }>
  >();

  for (const row of userAttempts) {
    const list = attemptsByLesson.get(row.lessonId) ?? [];
    list.push(row);
    attemptsByLesson.set(row.lessonId, list);
  }

  return lessonRows
    .map((row): ReadingLessonSummary | null => {
      try {
        const parsed = JSON.parse(row.contentJson) as ReadingLessonContent;
        const attempts = attemptsByLesson.get(row.id) ?? [];
        const bands = attempts
          .map((a) => a.bandScore)
          .filter((b): b is number => typeof b === "number");

        return {
          id: row.id,
          track: parsed.track === "general" ? "general" : "academic",
          partType: parsed.partType,
          title: parsed.title,
          subtitleVi: parsed.subtitleVi,
          difficultyBand: parsed.difficultyBand,
          recommendedMinutes: parsed.recommendedMinutes,
          questionCount: parsed.questions.length,
          questionTypes: Array.from(
            new Set(parsed.questions.map((q) => q.type))
          ),
          ksaFocus: parsed.ksaFocus,
          attemptsCount: attempts.length,
          bestBandScore: bands.length > 0 ? Math.max(...bands) : null,
          lastCompletedAt: attempts[0]?.completedAt ?? null,
          lastMode: attempts[0]?.mode ?? null,
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is ReadingLessonSummary => item !== null);
}

export async function getReadingLessonDetail(
  lessonId: string,
  userId: string,
  database: AppDatabase = db
): Promise<{
  lesson: ReadingLessonContent;
  recentAttempts: ReadingAttemptSummary[];
} | null> {
  await ensureReadingLessonsSeeded(database);

  const rows = await database
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.skill, "reading")))
    .limit(1);

  if (!rows[0]) {
    return null;
  }

  const lesson = JSON.parse(rows[0].contentJson) as ReadingLessonContent;

  const attemptRows = await database
    .select()
    .from(practiceAttempts)
    .where(
      and(
        eq(practiceAttempts.userId, userId),
        eq(practiceAttempts.lessonId, lessonId),
        eq(practiceAttempts.skill, "reading")
      )
    )
    .orderBy(desc(practiceAttempts.completedAt))
    .limit(8);

  const recentAttempts: ReadingAttemptSummary[] = attemptRows.map((a) => {
    let evaluation: ReadingAttemptEvaluation | null = null;
    if (a.telemetryJson) {
      try {
        evaluation = JSON.parse(a.telemetryJson) as ReadingAttemptEvaluation;
      } catch {
        evaluation = null;
      }
    }
    return {
      id: a.id,
      mode: a.mode,
      rawScore: a.rawScore,
      bandScore: a.bandScore,
      confidenceBefore: a.confidenceBefore,
      durationSec: a.durationSec,
      completedAt: a.completedAt,
      evaluation,
    };
  });

  return { lesson, recentAttempts };
}

export async function submitReadingAttempt(
  userId: string,
  submission: ReadingAttemptSubmission,
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<{
  attemptId: string;
  evaluation: ReadingAttemptEvaluation;
  profile: UserProfile;
}> {
  await ensureReadingLessonsSeeded(database, nowMs);

  const rows = await database
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, submission.lessonId), eq(lessons.skill, "reading")))
    .limit(1);

  if (!rows[0]) {
    throw new Error("READING_LESSON_NOT_FOUND");
  }

  const lesson = JSON.parse(rows[0].contentJson) as ReadingLessonContent;
  const evaluation = scoreReadingAttempt(lesson, submission);

  const attemptId = crypto.randomUUID();
  await database.insert(practiceAttempts).values({
    id: attemptId,
    userId,
    lessonId: lesson.id,
    skill: "reading",
    mode: submission.mode,
    rawScore: evaluation.correctCount,
    bandScore: evaluation.bandScore,
    confidenceBefore: submission.confidenceBefore ?? null,
    durationSec: evaluation.pacingSummary.durationSec,
    answersJson: JSON.stringify(submission.answers),
    telemetryJson: JSON.stringify(evaluation),
    completedAt: nowMs,
  });

  const profile = await touchStudyActivityAndRecomputeKsa(
    userId,
    database,
    nowMs
  );

  return {
    attemptId,
    evaluation,
    profile,
  };
}
