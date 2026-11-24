import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, type AppDatabase } from "@/db";
import {
  lessons,
  practiceAttempts,
  writingDrafts,
  type UserProfile,
} from "@/db/schema";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import { seedSkillLessonsBatch } from "@/lib/db/seedHelper";
import type { IeltsTrack } from "@/lib/ksa/bandCalculator";
import { WRITING_LESSONS_CATALOG } from "@/lib/writing/writingCatalog";
import {
  analyzeWritingOffline,
  compareWritingDrafts,
  type AiWritingFeedback,
  type WritingDraftDelta,
  type WritingLessonContent,
  type WritingMode,
  type WritingOfflineMetrics,
  type WritingOutlineInput,
  type WritingTaskType,
} from "@/lib/writing/writingEngine";

export interface WritingLessonSummary {
  id: string;
  track: IeltsTrack | "shared";
  taskType: WritingTaskType;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  recommendedMinutes: number;
  minWords: number;
  ksaFocus: Array<"K" | "S" | "A">;
  attemptsCount: number;
  draft2Count: number;
  bestBandScore: number | null;
  lastCompletedAt: number | null;
}

export interface WritingDraftRecord {
  id: string;
  attemptId: string;
  version: number;
  outline: WritingOutlineInput | null;
  essayText: string;
  selfAuditCheckedIds: string[];
  offlineMetrics: WritingOfflineMetrics | null;
  aiFeedback: AiWritingFeedback | null;
  createdAt: number;
}

export interface WritingAttemptDetail {
  id: string;
  mode: string;
  bandScore: number | null;
  durationSec: number;
  completedAt: number;
  drafts: WritingDraftRecord[];
}

export async function ensureWritingLessonsSeeded(
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<void> {
  const rows = WRITING_LESSONS_CATALOG.map((item) => ({
    id: item.id,
    skill: "writing",
    track: item.track,
    partType: item.partType,
    title: item.title,
    difficultyBand: item.difficultyBand,
    contentJson: JSON.stringify(item),
    ksaTagsJson: JSON.stringify({
      taskType: item.taskType,
      ksaFocus: item.ksaFocus,
      minWords: item.minWords,
    }),
    createdAt: nowMs,
  }));

  await seedSkillLessonsBatch(database, "writing", rows);
}

export async function listWritingLessonsWithUserStats(
  userId: string,
  database: AppDatabase = db,
  trackFilter?: IeltsTrack
): Promise<WritingLessonSummary[]> {
  await ensureWritingLessonsSeeded(database);

  const [lessonRows, userAttempts, userDrafts] = await Promise.all([
    database.select().from(lessons).where(eq(lessons.skill, "writing")),
    database
      .select({
        id: practiceAttempts.id,
        lessonId: practiceAttempts.lessonId,
        bandScore: practiceAttempts.bandScore,
        completedAt: practiceAttempts.completedAt,
      })
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.skill, "writing")
        )
      )
      .orderBy(desc(practiceAttempts.completedAt)),
    database
      .select({
        attemptId: writingDrafts.attemptId,
        version: writingDrafts.version,
      })
      .from(writingDrafts)
      .where(eq(writingDrafts.userId, userId)),
  ]);

  const attemptsByLesson = new Map<
    string,
    Array<{
      id: string;
      bandScore: number | null;
      completedAt: number;
    }>
  >();
  for (const a of userAttempts) {
    const list = attemptsByLesson.get(a.lessonId) ?? [];
    list.push(a);
    attemptsByLesson.set(a.lessonId, list);
  }

  const draft2AttemptIds = new Set(
    userDrafts.filter((d) => d.version >= 2).map((d) => d.attemptId)
  );

  return lessonRows
    .map((row): WritingLessonSummary | null => {
      try {
        const parsed = JSON.parse(row.contentJson) as WritingLessonContent;
        if (
          trackFilter &&
          parsed.track !== "shared" &&
          parsed.track !== trackFilter
        ) {
          return null;
        }
        const attempts = attemptsByLesson.get(row.id) ?? [];
        const bands = attempts
          .map((a) => a.bandScore)
          .filter((b): b is number => typeof b === "number");
        const draft2Count = attempts.filter((a) =>
          draft2AttemptIds.has(a.id)
        ).length;

        return {
          id: row.id,
          track: parsed.track,
          taskType: parsed.taskType,
          partType: parsed.partType,
          title: parsed.title,
          subtitleVi: parsed.subtitleVi,
          difficultyBand: parsed.difficultyBand,
          recommendedMinutes: parsed.recommendedMinutes,
          minWords: parsed.minWords,
          ksaFocus: parsed.ksaFocus,
          attemptsCount: attempts.length,
          draft2Count,
          bestBandScore: bands.length > 0 ? Math.max(...bands) : null,
          lastCompletedAt: attempts[0]?.completedAt ?? null,
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is WritingLessonSummary => item !== null);
}

export async function getWritingLessonDetail(
  lessonId: string,
  userId: string,
  database: AppDatabase = db
): Promise<{
  lesson: WritingLessonContent;
  recentAttempts: WritingAttemptDetail[];
} | null> {
  await ensureWritingLessonsSeeded(database);

  const rows = await database
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.skill, "writing")))
    .limit(1);

  if (!rows[0]) return null;
  const lesson = JSON.parse(rows[0].contentJson) as WritingLessonContent;

  const [attemptRows, draftRows] = await Promise.all([
    database
      .select()
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.lessonId, lessonId),
          eq(practiceAttempts.skill, "writing")
        )
      )
      .orderBy(desc(practiceAttempts.completedAt))
      .limit(8),
    database
      .select()
      .from(writingDrafts)
      .where(eq(writingDrafts.userId, userId))
      .orderBy(desc(writingDrafts.version), desc(writingDrafts.createdAt)),
  ]);

  const draftsByAttempt = new Map<string, WritingDraftRecord[]>();
  for (const d of draftRows) {
    const parseJson = <T,>(raw: string | null): T | null => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };
    const list = draftsByAttempt.get(d.attemptId) ?? [];
    list.push({
      id: d.id,
      attemptId: d.attemptId,
      version: d.version,
      outline: parseJson<WritingOutlineInput>(d.outlineJson),
      essayText: d.essayText,
      selfAuditCheckedIds: parseJson<string[]>(d.selfAuditJson) ?? [],
      offlineMetrics: parseJson<WritingOfflineMetrics>(d.offlineMetricsJson),
      aiFeedback: parseJson<AiWritingFeedback>(d.aiFeedbackJson),
      createdAt: d.createdAt,
    });
    draftsByAttempt.set(d.attemptId, list);
  }

  const recentAttempts: WritingAttemptDetail[] = attemptRows.map((a) => ({
    id: a.id,
    mode: a.mode,
    bandScore: a.bandScore,
    durationSec: a.durationSec,
    completedAt: a.completedAt,
    drafts: draftsByAttempt.get(a.id) ?? [],
  }));

  return { lesson, recentAttempts };
}

export async function submitWritingDraft(
  userId: string,
  input: {
    lessonId: string;
    attemptId?: string;
    mode: WritingMode;
    confidenceBefore?: number | null;
    durationSec: number;
    outline: WritingOutlineInput;
    essayText: string;
    selfAuditCheckedIds: string[];
  },
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<{
  attemptId: string;
  draftId: string;
  version: number;
  metrics: WritingOfflineMetrics;
  draftDelta: WritingDraftDelta | null;
  profile: UserProfile;
}> {
  await ensureWritingLessonsSeeded(database, nowMs);

  const lessonRows = await database
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, input.lessonId), eq(lessons.skill, "writing")))
    .limit(1);

  if (!lessonRows[0]) {
    throw new Error("WRITING_LESSON_NOT_FOUND");
  }

  const lesson = JSON.parse(lessonRows[0].contentJson) as WritingLessonContent;
  const metrics = analyzeWritingOffline(
    lesson,
    input.essayText,
    input.outline,
    input.selfAuditCheckedIds
  );

  let targetAttemptId = input.attemptId ?? null;
  let nextVersion = 1;
  let draftDelta: WritingDraftDelta | null = null;

  if (targetAttemptId) {
    const existingAttempt = await database
      .select()
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.id, targetAttemptId),
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.lessonId, lesson.id)
        )
      )
      .limit(1);

    if (!existingAttempt[0]) {
      targetAttemptId = null;
    } else {
      const priorDrafts = await database
        .select()
        .from(writingDrafts)
        .where(
          and(
            eq(writingDrafts.attemptId, targetAttemptId),
            eq(writingDrafts.userId, userId)
          )
        )
        .orderBy(desc(writingDrafts.version));

      const maxVer = priorDrafts[0]?.version ?? 1;
      nextVersion = maxVer + 1;

      const draft1 = priorDrafts.find((d) => d.version === 1) ?? priorDrafts[0];
      if (draft1?.offlineMetricsJson) {
        try {
          const prevMetrics = JSON.parse(
            draft1.offlineMetricsJson
          ) as WritingOfflineMetrics;
          draftDelta = compareWritingDrafts(prevMetrics, metrics);
        } catch {
          draftDelta = null;
        }
      }

      await database
        .update(practiceAttempts)
        .set({
          rawScore: metrics.wordCount,
          bandScore: metrics.estimatedBand,
          durationSec: existingAttempt[0].durationSec + input.durationSec,
          completedAt: nowMs,
        })
        .where(eq(practiceAttempts.id, targetAttemptId));
    }
  }

  if (!targetAttemptId) {
    targetAttemptId = crypto.randomUUID();
    await database.insert(practiceAttempts).values({
      id: targetAttemptId,
      userId,
      lessonId: lesson.id,
      skill: "writing",
      mode: input.mode,
      rawScore: metrics.wordCount,
      bandScore: metrics.estimatedBand,
      confidenceBefore: input.confidenceBefore ?? null,
      durationSec: Math.max(1, Math.round(input.durationSec)),
      answersJson: JSON.stringify(input.outline),
      telemetryJson: JSON.stringify(metrics),
      completedAt: nowMs,
    });
  }

  const draftId = crypto.randomUUID();
  await database.insert(writingDrafts).values({
    id: draftId,
    attemptId: targetAttemptId,
    userId,
    version: nextVersion,
    outlineJson: JSON.stringify(input.outline),
    essayText: input.essayText,
    selfAuditJson: JSON.stringify(input.selfAuditCheckedIds),
    offlineMetricsJson: JSON.stringify(metrics),
    aiFeedbackJson: null,
    createdAt: nowMs,
  });

  const profile = await touchStudyActivityAndRecomputeKsa(
    userId,
    database,
    nowMs
  );

  return {
    attemptId: targetAttemptId,
    draftId,
    version: nextVersion,
    metrics,
    draftDelta,
    profile,
  };
}

export async function attachAiFeedbackToDraft(
  userId: string,
  draftId: string,
  aiFeedback: AiWritingFeedback,
  database: AppDatabase = db
): Promise<void> {
  await database
    .update(writingDrafts)
    .set({ aiFeedbackJson: JSON.stringify(aiFeedback) })
    .where(and(eq(writingDrafts.id, draftId), eq(writingDrafts.userId, userId)));
}
