import { notFound } from "next/navigation";
import { requirePageSession } from "@/lib/auth/session";
import { hasActiveAiConsent } from "@/lib/db/consentService";
import { listSafeAiConfigs } from "@/lib/db/profileService";
import { getSpeakingLessonDetail } from "@/lib/db/speakingService";
import type { SpeakingMode } from "@/lib/speaking/speakingEngine";
import { SpeakingStudioWorkspace } from "@/components/speaking/SpeakingStudioWorkspace";

interface SpeakingLessonPageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function SpeakingLessonPage({
  params,
  searchParams,
}: SpeakingLessonPageProps) {
  const session = await requirePageSession();
  const [{ lessonId }, query] = await Promise.all([params, searchParams]);

  const [detail, savedAiConfigs, aiConsentActive] = await Promise.all([
    getSpeakingLessonDetail(lessonId, session.user.id),
    listSafeAiConfigs(session.user.id),
    hasActiveAiConsent(session.user.id),
  ]);

  if (!detail) {
    notFound();
  }

  const rawMode = query.mode;
  const initialMode: SpeakingMode =
    rawMode === "cue_drill" || rawMode === "mock_exam"
      ? rawMode
      : "shadowing";

  return (
    <SpeakingStudioWorkspace
      lesson={detail.lesson}
      initialMode={initialMode}
      recentAttempts={detail.recentAttempts}
      savedAiConfigs={savedAiConfigs}
      initialAiConsentActive={aiConsentActive}
    />
  );
}
