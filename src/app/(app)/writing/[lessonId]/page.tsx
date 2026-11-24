import { notFound } from "next/navigation";
import { requirePageSession } from "@/lib/auth/session";
import { hasActiveAiConsent } from "@/lib/db/consentService";
import { listSafeAiConfigs } from "@/lib/db/profileService";
import { getWritingLessonDetail } from "@/lib/db/writingService";
import type { WritingMode } from "@/lib/writing/writingEngine";
import { WritingStudioWorkspace } from "@/components/writing/WritingStudioWorkspace";

interface WritingLessonPageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function WritingLessonPage({
  params,
  searchParams,
}: WritingLessonPageProps) {
  const session = await requirePageSession();
  const [{ lessonId }, query] = await Promise.all([params, searchParams]);

  const [detail, savedAiConfigs, aiConsentActive] = await Promise.all([
    getWritingLessonDetail(lessonId, session.user.id),
    listSafeAiConfigs(session.user.id),
    hasActiveAiConsent(session.user.id),
  ]);

  if (!detail) {
    notFound();
  }

  const rawMode = query.mode;
  const initialMode: WritingMode =
    rawMode === "drill" || rawMode === "exam" ? rawMode : "guided";

  return (
    <WritingStudioWorkspace
      lesson={detail.lesson}
      initialMode={initialMode}
      recentAttempts={detail.recentAttempts}
      savedAiConfigs={savedAiConfigs}
      initialAiConsentActive={aiConsentActive}
    />
  );
}
