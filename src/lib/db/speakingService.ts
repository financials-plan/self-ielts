import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, type AppDatabase } from "@/db";
import {
  lessons,
  practiceAttempts,
  speakingRecordings,
  type UserProfile,
} from "@/db/schema";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import { seedSkillLessonsBatch } from "@/lib/db/seedHelper";
import { SPEAKING_LESSONS_CATALOG } from "@/lib/speaking/speakingCatalog";
import {
  analyzeSpeakingFluencyOffline,
  compareSpeakingRecordings,
  type AiSpeakingFeedback,
  type SpeakingFluencyMetrics,
  type SpeakingImprovementDelta,
  type SpeakingLessonContent,
  type SpeakingMode,
  type SpeakingPartNumber,
} from "@/lib/speaking/speakingEngine";
import type { ImportLessonPackInput } from "@/lib/validation/speaking";

export interface SpeakingLessonSummary {
  id: string;
  partNumber: SpeakingPartNumber;
  partType: string;
  title: string;
  subtitleVi: string;
  difficultyBand: string;
  ksaFocus: Array<"K" | "S" | "A">;
  shadowingCount: number;
  promptCount: number;
  attemptsCount: number;
  rerecordCount: number;
  bestBandScore: number | null;
  lastAnxietyBefore: number | null;
}

export interface SpeakingRecordingSummary {
  id: string;
  attemptId: string;
  partNumber: number;
  attemptNumber: number;
  storageKey: string;
  sizeBytes: number;
  durationMs: number;
  anxietyBefore: number | null;
  transcript: string | null;
  fluencyMetrics: SpeakingFluencyMetrics | null;
  aiFeedback: AiSpeakingFeedback | null;
  createdAt: number;
}

export interface SpeakingAttemptDetail {
  id: string;
  mode: string;
  bandScore: number | null;
  durationSec: number;
  completedAt: number;
  recordings: SpeakingRecordingSummary[];
}

export interface SpeakingAnxietyPoint {
  createdAt: number;
  partNumber: number;
  anxietyBefore: number;
  wpm: number;
}

export async function ensureSpeakingLessonsSeeded(
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<void> {
  const rows = SPEAKING_LESSONS_CATALOG.map((item) => ({
    id: item.id,
    skill: "speaking",
    track: "shared",
    partType: item.partType,
    title: item.title,
    difficultyBand: item.difficultyBand,
    contentJson: JSON.stringify(item),
    ksaTagsJson: JSON.stringify({
      partNumber: item.partNumber,
      ksaFocus: item.ksaFocus,
    }),
    createdAt: nowMs,
  }));

  await seedSkillLessonsBatch(database, "speaking", rows);
}

export async function listSpeakingLessonsWithUserStats(
  userId: string,
  database: AppDatabase = db
): Promise<{
  lessons: SpeakingLessonSummary[];
  anxietyHistory: SpeakingAnxietyPoint[];
}> {
  await ensureSpeakingLessonsSeeded(database);

  const [lessonRows, userAttempts, userRecordings] = await Promise.all([
    database.select().from(lessons).where(eq(lessons.skill, "speaking")),
    database
      .select({
        id: practiceAttempts.id,
        lessonId: practiceAttempts.lessonId,
        bandScore: practiceAttempts.bandScore,
      })
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.skill, "speaking")
        )
      )
      .orderBy(desc(practiceAttempts.completedAt)),
    database
      .select()
      .from(speakingRecordings)
      .where(eq(speakingRecordings.userId, userId))
      .orderBy(desc(speakingRecordings.createdAt))
      .limit(20),
  ]);

  const attemptsByLesson = new Map<
    string,
    Array<{ id: string; bandScore: number | null }>
  >();
  for (const a of userAttempts) {
    const list = attemptsByLesson.get(a.lessonId) ?? [];
    list.push(a);
    attemptsByLesson.set(a.lessonId, list);
  }

  const rerecordAttemptIds = new Set(
    userRecordings.filter((r) => r.attemptNumber >= 2).map((r) => r.attemptId)
  );

  const anxietyHistory: SpeakingAnxietyPoint[] = userRecordings
    .filter((r) => typeof r.anxietyBefore === "number")
    .map((r) => {
      let wpm = 0;
      if (r.fluencyMetricsJson) {
        try {
          const m = JSON.parse(r.fluencyMetricsJson) as SpeakingFluencyMetrics;
          wpm = m.wpm;
        } catch {
          wpm = 0;
        }
      }
      return {
        createdAt: r.createdAt,
        partNumber: r.partNumber,
        anxietyBefore: r.anxietyBefore!,
        wpm,
      };
    })
    .reverse();

  const summaries = lessonRows
    .map((row): SpeakingLessonSummary | null => {
      try {
        const parsed = JSON.parse(row.contentJson) as SpeakingLessonContent;
        const attempts = attemptsByLesson.get(row.id) ?? [];
        const bands = attempts
          .map((a) => a.bandScore)
          .filter((b): b is number => typeof b === "number");
        const latestRecForPart = userRecordings.find(
          (r) => r.partNumber === parsed.partNumber
        );

        return {
          id: row.id,
          partNumber: parsed.partNumber,
          partType: parsed.partType,
          title: parsed.title,
          subtitleVi: parsed.subtitleVi,
          difficultyBand: parsed.difficultyBand,
          ksaFocus: parsed.ksaFocus,
          shadowingCount: parsed.shadowingLines.length,
          promptCount: parsed.prompts.length,
          attemptsCount: attempts.length,
          rerecordCount: attempts.filter((a) => rerecordAttemptIds.has(a.id))
            .length,
          bestBandScore: bands.length > 0 ? Math.max(...bands) : null,
          lastAnxietyBefore: latestRecForPart?.anxietyBefore ?? null,
        };
      } catch {
        return null;
      }
    })
    .filter((x): x is SpeakingLessonSummary => x !== null)
    .sort((a, b) => a.partNumber - b.partNumber);

  return { lessons: summaries, anxietyHistory };
}

export async function getSpeakingLessonDetail(
  lessonId: string,
  userId: string,
  database: AppDatabase = db
): Promise<{
  lesson: SpeakingLessonContent;
  recentAttempts: SpeakingAttemptDetail[];
} | null> {
  await ensureSpeakingLessonsSeeded(database);

  const rows = await database
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.skill, "speaking")))
    .limit(1);

  if (!rows[0]) return null;
  const lesson = JSON.parse(rows[0].contentJson) as SpeakingLessonContent;

  const [attemptRows, recRows] = await Promise.all([
    database
      .select()
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.lessonId, lessonId),
          eq(practiceAttempts.skill, "speaking")
        )
      )
      .orderBy(desc(practiceAttempts.completedAt))
      .limit(8),
    database
      .select()
      .from(speakingRecordings)
      .where(eq(speakingRecordings.userId, userId))
      .orderBy(desc(speakingRecordings.attemptNumber), desc(speakingRecordings.createdAt)),
  ]);

  const recsByAttempt = new Map<string, SpeakingRecordingSummary[]>();
  for (const r of recRows) {
    const parseJson = <T,>(raw: string | null): T | null => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };
    const list = recsByAttempt.get(r.attemptId) ?? [];
    list.push({
      id: r.id,
      attemptId: r.attemptId,
      partNumber: r.partNumber,
      attemptNumber: r.attemptNumber,
      storageKey: r.storageKey,
      sizeBytes: r.sizeBytes,
      durationMs: r.durationMs,
      anxietyBefore: r.anxietyBefore,
      transcript: r.transcript,
      fluencyMetrics: parseJson<SpeakingFluencyMetrics>(r.fluencyMetricsJson),
      aiFeedback: parseJson<AiSpeakingFeedback>(r.aiFeedbackJson),
      createdAt: r.createdAt,
    });
    recsByAttempt.set(r.attemptId, list);
  }

  const recentAttempts: SpeakingAttemptDetail[] = attemptRows.map((a) => ({
    id: a.id,
    mode: a.mode,
    bandScore: a.bandScore,
    durationSec: a.durationSec,
    completedAt: a.completedAt,
    recordings: recsByAttempt.get(a.id) ?? [],
  }));

  return { lesson, recentAttempts };
}

export async function submitSpeakingRecording(
  userId: string,
  input: {
    lessonId: string;
    attemptId?: string;
    partNumber: SpeakingPartNumber;
    mode: SpeakingMode;
    storageKey: string;
    sizeBytes: number;
    durationMs: number;
    anxietyBefore?: number | null;
    confidenceBefore?: number | null;
    transcript?: string;
    rmsSamples: number[];
    sampleIntervalMs?: number;
  },
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<{
  attemptId: string;
  recordingId: string;
  attemptNumber: number;
  fluencyMetrics: SpeakingFluencyMetrics;
  improvementDelta: SpeakingImprovementDelta | null;
  profile: UserProfile;
}> {
  await ensureSpeakingLessonsSeeded(database, nowMs);

  const lessonRows = await database
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, input.lessonId), eq(lessons.skill, "speaking")))
    .limit(1);

  if (!lessonRows[0]) {
    throw new Error("SPEAKING_LESSON_NOT_FOUND");
  }

  const fluencyMetrics = analyzeSpeakingFluencyOffline({
    durationMs: input.durationMs,
    rmsSamples: input.rmsSamples,
    sampleIntervalMs: input.sampleIntervalMs,
    transcript: input.transcript,
    partNumber: input.partNumber,
  });

  const durationSec = Math.max(1, Math.round(input.durationMs / 1000));
  let targetAttemptId = input.attemptId ?? null;
  let nextAttemptNumber = 1;
  let improvementDelta: SpeakingImprovementDelta | null = null;

  if (targetAttemptId) {
    const existing = await database
      .select()
      .from(practiceAttempts)
      .where(
        and(
          eq(practiceAttempts.id, targetAttemptId),
          eq(practiceAttempts.userId, userId),
          eq(practiceAttempts.lessonId, input.lessonId)
        )
      )
      .limit(1);

    if (!existing[0]) {
      targetAttemptId = null;
    } else {
      const priorRecs = await database
        .select()
        .from(speakingRecordings)
        .where(
          and(
            eq(speakingRecordings.attemptId, targetAttemptId),
            eq(speakingRecordings.userId, userId)
          )
        )
        .orderBy(desc(speakingRecordings.attemptNumber));

      nextAttemptNumber = (priorRecs[0]?.attemptNumber ?? 1) + 1;
      const firstRec =
        priorRecs.find((r) => r.attemptNumber === 1) ?? priorRecs[0];
      if (firstRec?.fluencyMetricsJson) {
        try {
          const prevMetrics = JSON.parse(
            firstRec.fluencyMetricsJson
          ) as SpeakingFluencyMetrics;
          improvementDelta = compareSpeakingRecordings(
            prevMetrics,
            fluencyMetrics,
            firstRec.anxietyBefore,
            input.anxietyBefore ?? null
          );
        } catch {
          improvementDelta = null;
        }
      }

      await database
        .update(practiceAttempts)
        .set({
          rawScore: fluencyMetrics.wpm,
          bandScore: fluencyMetrics.estimatedBand,
          durationSec: existing[0].durationSec + durationSec,
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
      lessonId: input.lessonId,
      skill: "speaking",
      mode: input.mode,
      rawScore: fluencyMetrics.wpm,
      bandScore: fluencyMetrics.estimatedBand,
      confidenceBefore: input.confidenceBefore ?? null,
      durationSec,
      answersJson: JSON.stringify({ transcript: input.transcript ?? "" }),
      telemetryJson: JSON.stringify(fluencyMetrics),
      completedAt: nowMs,
    });
  }

  const recordingId = crypto.randomUUID();
  await database.insert(speakingRecordings).values({
    id: recordingId,
    attemptId: targetAttemptId,
    userId,
    partNumber: input.partNumber,
    attemptNumber: nextAttemptNumber,
    storageKey: input.storageKey,
    sizeBytes: input.sizeBytes,
    durationMs: input.durationMs,
    anxietyBefore: input.anxietyBefore ?? null,
    transcript: input.transcript ?? null,
    fluencyMetricsJson: JSON.stringify(fluencyMetrics),
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
    recordingId,
    attemptNumber: nextAttemptNumber,
    fluencyMetrics,
    improvementDelta,
    profile,
  };
}

export async function attachAiFeedbackToSpeakingRecording(
  userId: string,
  recordingId: string,
  transcript: string,
  aiFeedback: AiSpeakingFeedback,
  database: AppDatabase = db
): Promise<void> {
  await database
    .update(speakingRecordings)
    .set({
      transcript,
      aiFeedbackJson: JSON.stringify(aiFeedback),
    })
    .where(
      and(
        eq(speakingRecordings.id, recordingId),
        eq(speakingRecordings.userId, userId)
      )
    );
}

const RESERVED_BUILTIN_PREFIXES = [
  "acad-",
  "gt-",
  "list-",
  "writ-",
  "speak-",
];

export async function importLessonPack(
  params: {
    userRole: string;
    pack: ImportLessonPackInput;
  },
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<{ id: string; skill: string; title: string; href: string }> {
  const { pack, userRole } = params;
  const isBuiltinId = RESERVED_BUILTIN_PREFIXES.some((p) =>
    pack.id.startsWith(p)
  );
  if (isBuiltinId && userRole !== "admin") {
    throw new Error("FORBIDDEN_BUILTIN_OVERWRITE");
  }

  const mergedContent = {
    ...pack.contentJson,
    id: pack.id,
    track: pack.track,
    partType: pack.partType,
    title: pack.title,
    difficultyBand: pack.difficultyBand,
  };

  const contentJsonStr = JSON.stringify(mergedContent);
  const ksaTagsJson = JSON.stringify({
    importedBy: userRole,
    ksaFocus: ["K", "S", "A"],
  });

  await database
    .insert(lessons)
    .values({
      id: pack.id,
      skill: pack.skill,
      track: pack.track,
      partType: pack.partType,
      title: pack.title,
      difficultyBand: pack.difficultyBand,
      contentJson: contentJsonStr,
      ksaTagsJson,
      createdAt: nowMs,
    })
    .onConflictDoUpdate({
      target: lessons.id,
      set: {
        track: pack.track,
        partType: pack.partType,
        title: pack.title,
        difficultyBand: pack.difficultyBand,
        contentJson: contentJsonStr,
        ksaTagsJson,
      },
    });

  return {
    id: pack.id,
    skill: pack.skill,
    title: pack.title,
    href: `/${pack.skill}/${pack.id}`,
  };
}
