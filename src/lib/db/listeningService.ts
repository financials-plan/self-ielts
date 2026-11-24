import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, type AppDatabase } from "@/db";
import { lessons, practiceAttempts, type UserProfile } from "@/db/schema";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import { seedSkillLessonsBatch } from "@/lib/db/seedHelper";
import { LISTENING_LESSONS_CATALOG } from "@/lib/listening/listeningCatalog";
import {
  scoreListeningAttempt,
  type ListeningAttemptEvaluation,
  type ListeningAttemptSubmission,
  type ListeningLessonContent,
  type ListeningQuestionType,
} from "@/lib/listening/listeningEngine";

export interface ListeningLessonSummary {
  id: string;
  partNumber: 1 | 2 | 3 | 4;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  durationSec: number;
  questionCount: number;
  questionTypes: ListeningQuestionType[];
  ksaFocus: Array<"K" | "S" | "A">;
  hasMap: boolean;
  dictationCount: number;
  attemptsCount: number;
  bestBandScore: number | null;
  lastCompletedAt: number | null;
  lastMode: string | null;
}

export interface ListeningAttemptSummary {
  id: string;
  mode: string;
  rawScore: number | null;
  bandScore: number | null;
  confidenceBefore: number | null;
  durationSec: number;
  completedAt: number;
  evaluation: ListeningAttemptEvaluation | null;
}

export async function ensureListeningLessonsSeeded(
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<void> {
  const rows = LISTENING_LESSONS_CATALOG.map((item) => ({
    id: item.id,
    skill: "listening",
    track: "shared",
    partType: item.partType,
    title: item.title,
    difficultyBand: item.difficultyBand,
    contentJson: JSON.stringify(item),
    ksaTagsJson: JSON.stringify({
      partNumber: item.partNumber,
      ksaFocus: item.ksaFocus,
      questionTypes: Array.from(new Set(item.questions.map((q) => q.type))),
      questionCount: item.questions.length,
    }),
    createdAt: nowMs,
  }));

  await seedSkillLessonsBatch(database, "listening", rows);
}

export async function listListeningLessonsWithUserStats(
  userId: string,
  database: AppDatabase = db,
  partFilter?: 1 | 2 | 3 | 4
): Promise<ListeningLessonSummary[]> {
  await ensureListeningLessonsSeeded(database);

  const [lessonRows, userAttempts] = await Promise.all([
    database
      .select()
      .from(lessons)
      .where(eq(lessons.skill, "listening")),
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
          eq(practiceAttempts.skill, "listening")
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
    .map((row): ListeningLessonSummary | null => {
      try {
        const parsed = JSON.parse(row.contentJson) as ListeningLessonContent;
        if (partFilter && parsed.partNumber !== partFilter) return null;
        const attempts = attemptsByLesson.get(row.id) ?? [];
        const bands = attempts
          .map((a) => a.bandScore)
          .filter((b): b is number => typeof b === "number");

        return {
          id: row.id,
          partNumber: parsed.partNumber,
          partType: parsed.partType,
          title: parsed.title,
          subtitleVi: parsed.subtitleVi,
          difficultyBand: parsed.difficultyBand,
          durationSec: parsed.durationSec,
          questionCount: parsed.questions.length,
          questionTypes: Array.from(new Set(parsed.questions.map((q) => q.type))),
          ksaFocus: parsed.ksaFocus,
          hasMap: Boolean(parsed.mapLayout),
          dictationCount: parsed.dictationDrills.length,
          attemptsCount: attempts.length,
          bestBandScore: bands.length > 0 ? Math.max(...bands) : null,
          lastCompletedAt: attempts[0]?.completedAt ?? null,
          lastMode: attempts[0]?.mode ?? null,
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is ListeningLessonSummary => item !== null)
    .sort((a, b) => a.partNumber - b.partNumber);
}

export async function getListeningLessonDetail(
  lessonId: string,
  userId: string,
  database: AppDatabase = db
): Promise<{
  lesson: ListeningLessonContent;
  recentAttempts: ListeningAttemptSummary[];
} | null> {
  await ensureListeningLessonsSeeded(database);

  const rows = await database
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.skill, "listening")))
    .limit(1);

  if (!rows[0]) return null;

  const lesson = JSON.parse(rows[0].contentJson) as ListeningLessonContent;

  const attemptRows = await database
    .select()
    .from(practiceAttempts)
    .where(
      and(
        eq(practiceAttempts.userId, userId),
        eq(practiceAttempts.lessonId, lessonId),
        eq(practiceAttempts.skill, "listening")
      )
    )
    .orderBy(desc(practiceAttempts.completedAt))
    .limit(8);

  const recentAttempts: ListeningAttemptSummary[] = attemptRows.map((a) => {
    let evaluation: ListeningAttemptEvaluation | null = null;
    if (a.telemetryJson) {
      try {
        evaluation = JSON.parse(a.telemetryJson) as ListeningAttemptEvaluation;
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

export async function submitListeningAttempt(
  userId: string,
  submission: ListeningAttemptSubmission,
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<{
  attemptId: string;
  evaluation: ListeningAttemptEvaluation;
  profile: UserProfile;
}> {
  await ensureListeningLessonsSeeded(database, nowMs);

  const rows = await database
    .select()
    .from(lessons)
    .where(
      and(eq(lessons.id, submission.lessonId), eq(lessons.skill, "listening"))
    )
    .limit(1);

  if (!rows[0]) {
    throw new Error("LISTENING_LESSON_NOT_FOUND");
  }

  const lesson = JSON.parse(rows[0].contentJson) as ListeningLessonContent;
  const evaluation = scoreListeningAttempt(lesson, submission);

  const attemptId = crypto.randomUUID();
  await database.insert(practiceAttempts).values({
    id: attemptId,
    userId,
    lessonId: lesson.id,
    skill: "listening",
    mode: submission.mode,
    rawScore: evaluation.correctCount,
    bandScore: evaluation.bandScore,
    confidenceBefore: submission.confidenceBefore ?? null,
    durationSec: Math.max(1, Math.round(submission.durationSec)),
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
