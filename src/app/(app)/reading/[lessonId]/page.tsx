import { notFound } from "next/navigation";
import { requirePageSession } from "@/lib/auth/session";
import { getReadingLessonDetail } from "@/lib/db/readingService";
import type { ReadingMode } from "@/lib/reading/readingEngine";
import { ReadingStudioWorkspace } from "@/components/reading/ReadingStudioWorkspace";

interface ReadingLessonPageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function ReadingLessonPage({
  params,
  searchParams,
}: ReadingLessonPageProps) {
  const session = await requirePageSession();
  const [{ lessonId }, query] = await Promise.all([params, searchParams]);

  const detail = await getReadingLessonDetail(lessonId, session.user.id);
  if (!detail) {
    notFound();
  }

  const rawMode = query.mode;
  const initialMode: ReadingMode =
    rawMode === "drill" || rawMode === "exam" ? rawMode : "guided";

  return (
    <ReadingStudioWorkspace
      lesson={detail.lesson}
      initialMode={initialMode}
      recentAttempts={detail.recentAttempts}
    />
  );
}
