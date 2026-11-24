import { notFound } from "next/navigation";
import { requirePageSession } from "@/lib/auth/session";
import { getListeningLessonDetail } from "@/lib/db/listeningService";
import type { ListeningMode } from "@/lib/listening/listeningEngine";
import { ListeningStudioWorkspace } from "@/components/listening/ListeningStudioWorkspace";

interface ListeningLessonPageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function ListeningLessonPage({
  params,
  searchParams,
}: ListeningLessonPageProps) {
  const session = await requirePageSession();
  const [{ lessonId }, query] = await Promise.all([params, searchParams]);

  const detail = await getListeningLessonDetail(lessonId, session.user.id);
  if (!detail) {
    notFound();
  }

  const rawMode = query.mode;
  const initialMode: ListeningMode =
    rawMode === "drill" || rawMode === "exam" ? rawMode : "guided";

  return (
    <ListeningStudioWorkspace
      lesson={detail.lesson}
      initialMode={initialMode}
      recentAttempts={detail.recentAttempts}
    />
  );
}
