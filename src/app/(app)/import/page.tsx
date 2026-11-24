import { desc } from "drizzle-orm";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { requirePageSession } from "@/lib/auth/session";
import { ensureListeningLessonsSeeded } from "@/lib/db/listeningService";
import { ensureReadingLessonsSeeded } from "@/lib/db/readingService";
import { ensureSpeakingLessonsSeeded } from "@/lib/db/speakingService";
import { ensureWritingLessonsSeeded } from "@/lib/db/writingService";
import { LessonJsonImporterView } from "@/components/import/LessonJsonImporterView";

export default async function ImportLessonsPage() {
  await requirePageSession();
  await Promise.all([
    ensureListeningLessonsSeeded(),
    ensureReadingLessonsSeeded(),
    ensureWritingLessonsSeeded(),
    ensureSpeakingLessonsSeeded(),
  ]);

  const rows = await db
    .select({
      id: lessons.id,
      skill: lessons.skill,
      track: lessons.track,
      partType: lessons.partType,
      title: lessons.title,
      difficultyBand: lessons.difficultyBand,
      createdAt: lessons.createdAt,
    })
    .from(lessons)
    .orderBy(desc(lessons.createdAt))
    .limit(60);

  return <LessonJsonImporterView initialLessons={rows} />;
}
