import { desc, eq } from "drizzle-orm";
import { db, type AppDatabase } from "@/db";
import {
  errorLogs,
  knowledgeCards,
  practiceAttempts,
  reflectionLogs,
  userProfiles,
  type UserProfile,
} from "@/db/schema";
import type { IeltsTrack } from "@/lib/ksa/bandCalculator";
import {
  buildBottleneckMatrix,
  buildDailyKsaPlan,
  computeKsaScores,
  evaluateConfidenceCalibration,
  type BottleneckMatrix,
  type ConfidenceCalibrationResult,
  type DailyKsaTask,
  type PrimaryBottleneck,
} from "@/lib/ksa/ksaScoring";
import { getOrCreateUserProfile } from "./profileService";

function toUtcDateIso(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

function addDaysIso(dateIso: string, deltaDays: number): string {
  const dt = new Date(`${dateIso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

export async function touchStudyActivityAndRecomputeKsa(
  userId: string,
  database: AppDatabase = db,
  nowMs: number = Date.now(),
  incrementStreak: boolean = true
): Promise<UserProfile> {
  const profile = await getOrCreateUserProfile(userId, database);

  const [cards, errors, reflections, attempts] = await Promise.all([
    database
      .select({
        skill: knowledgeCards.skill,
        repetitions: knowledgeCards.repetitions,
      })
      .from(knowledgeCards)
      .where(eq(knowledgeCards.userId, userId)),
    database
      .select({
        skill: errorLogs.skill,
        ksaDimension: errorLogs.ksaDimension,
        resolved: errorLogs.resolved,
      })
      .from(errorLogs)
      .where(eq(errorLogs.userId, userId)),
    database
      .select({
        createdAt: reflectionLogs.createdAt,
      })
      .from(reflectionLogs)
      .where(eq(reflectionLogs.userId, userId)),
    database
      .select({
        skill: practiceAttempts.skill,
        bandScore: practiceAttempts.bandScore,
        confidenceBefore: practiceAttempts.confidenceBefore,
      })
      .from(practiceAttempts)
      .where(eq(practiceAttempts.userId, userId)),
  ]);

  let nextStreak = profile.streakDays;
  let nextLastStudyDate = profile.lastStudyDate;
  const todayIso = toUtcDateIso(nowMs);

  if (incrementStreak) {
    if (!profile.lastStudyDate) {
      nextStreak = 1;
      nextLastStudyDate = todayIso;
    } else if (profile.lastStudyDate === todayIso) {
      nextStreak = Math.max(1, profile.streakDays);
    } else if (profile.lastStudyDate === addDaysIso(todayIso, -1)) {
      nextStreak = Math.max(1, profile.streakDays) + 1;
      nextLastStudyDate = todayIso;
    } else {
      nextStreak = 1;
      nextLastStudyDate = todayIso;
    }
  }

  const scores = computeKsaScores({
    cards,
    errors,
    reflections,
    attempts,
    streakDays: nextStreak,
  });

  await database
    .update(userProfiles)
    .set({
      kScore: scores.kScore,
      sScore: scores.sScore,
      aScore: scores.aScore,
      streakDays: nextStreak,
      lastStudyDate: nextLastStudyDate,
      updatedAt: nowMs,
    })
    .where(eq(userProfiles.userId, userId));

  return getOrCreateUserProfile(userId, database);
}

export interface DashboardKsaSnapshot {
  profile: UserProfile;
  totalCardsCount: number;
  dueCardsCount: number;
  masteredCardsCount: number;
  unresolvedErrorsCount: number;
  totalErrorsCount: number;
  bottleneckMatrix: BottleneckMatrix;
  primaryBottleneck: PrimaryBottleneck | null;
  calibration: ConfidenceCalibrationResult;
  dailyPlan: DailyKsaTask[];
  latestReflections: Array<typeof reflectionLogs.$inferSelect>;
  activeDatesMap: Record<string, number>;
  anchorDateIso: string;
}

export async function getDashboardKsaSnapshot(
  userId: string,
  database: AppDatabase = db,
  nowMs: number = Date.now()
): Promise<DashboardKsaSnapshot> {
  const [profile, cards, errors, reflections, attempts] = await Promise.all([
    getOrCreateUserProfile(userId, database),
    database
      .select()
      .from(knowledgeCards)
      .where(eq(knowledgeCards.userId, userId)),
    database
      .select()
      .from(errorLogs)
      .where(eq(errorLogs.userId, userId)),
    database
      .select()
      .from(reflectionLogs)
      .where(eq(reflectionLogs.userId, userId))
      .orderBy(desc(reflectionLogs.createdAt))
      .limit(20),
    database
      .select()
      .from(practiceAttempts)
      .where(eq(practiceAttempts.userId, userId)),
  ]);

  const anchorDateIso = toUtcDateIso(nowMs);
  const dueCardsCount = cards.filter((c) => c.nextReviewAt <= nowMs).length;
  const masteredCardsCount = cards.filter((c) => c.repetitions >= 2).length;
  const unresolvedErrorsCount = errors.filter((e) => e.resolved === 0).length;

  const { matrix, primaryBottleneck } = buildBottleneckMatrix(errors);
  const calibration = evaluateConfidenceCalibration(attempts);
  const hasReflectionToday = reflections.some(
    (r) => toUtcDateIso(r.createdAt) === anchorDateIso
  );

  const track: IeltsTrack =
    profile.targetTrack === "general" ? "general" : "academic";

  const dailyPlan = buildDailyKsaPlan({
    dueCardsCount,
    primaryBottleneck,
    dailyGoalMinutes: profile.dailyGoalMinutes,
    hasReflectionToday,
    track,
  });

  const activeDatesMap: Record<string, number> = {};
  const addActivity = (epoch: number) => {
    const iso = toUtcDateIso(epoch);
    activeDatesMap[iso] = (activeDatesMap[iso] ?? 0) + 1;
  };
  cards.forEach((c) => addActivity(c.createdAt));
  errors.forEach((e) => addActivity(e.createdAt));
  reflections.forEach((r) => addActivity(r.createdAt));
  attempts.forEach((a) => addActivity(a.completedAt));

  return {
    profile,
    totalCardsCount: cards.length,
    dueCardsCount,
    masteredCardsCount,
    unresolvedErrorsCount,
    totalErrorsCount: errors.length,
    bottleneckMatrix: matrix,
    primaryBottleneck,
    calibration,
    dailyPlan,
    latestReflections: reflections.slice(0, 5),
    activeDatesMap,
    anchorDateIso,
  };
}
