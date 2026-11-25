import { eq } from "drizzle-orm";
import { db, resolveRuntimeDb, type AppDatabase } from "@/db";
import { lessons } from "@/db/schema";
import { ensureSchemaInitialized } from "@/lib/db/autoMigrate";
import { withSuppressedBlobFlush } from "@/lib/db/vercelBlobSqlite";

export type LessonSeedRow = typeof lessons.$inferInsert;

export type LessonSkill = "reading" | "listening" | "writing" | "speaking";

/**
 * In-memory cache per AppDatabase instance so ensure*LessonsSeeded
 * only checks and inserts missing lessons once per process / test DB.
 */
const seededSkillsCache = new WeakMap<object, Set<string>>();

const BATCH_SIZE = 8;

export async function seedSkillLessonsBatch(
  database: AppDatabase,
  skill: LessonSkill,
  rows: LessonSeedRow[]
): Promise<void> {
  await ensureSchemaInitialized(database);

  const targetDb = database === db ? resolveRuntimeDb() : database;
  const dbKey = targetDb as unknown as object;
  let cachedSkills = seededSkillsCache.get(dbKey);
  if (cachedSkills?.has(skill)) {
    return;
  }

  const existing = await targetDb
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.skill, skill));

  const existingIds = new Set(existing.map((r) => r.id));
  const missing = rows.filter((r) => !existingIds.has(r.id));

  if (missing.length > 0) {
    await withSuppressedBlobFlush(async () => {
      for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const chunk = missing.slice(i, i + BATCH_SIZE);
        await targetDb.insert(lessons).values(chunk).onConflictDoNothing();
      }
    });
  }

  if (!cachedSkills) {
    cachedSkills = new Set<string>();
    seededSkillsCache.set(dbKey, cachedSkills);
  }
  cachedSkills.add(skill);
}
