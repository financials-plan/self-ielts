import { requirePageSession } from "@/lib/auth/session";
import { listSpeakingLessonsWithUserStats } from "@/lib/db/speakingService";
import { SpeakingHubView } from "@/components/speaking/SpeakingHubView";

export default async function SpeakingPage() {
  const session = await requirePageSession();
  const { lessons, anxietyHistory } = await listSpeakingLessonsWithUserStats(
    session.user.id
  );

  return (
    <SpeakingHubView lessons={lessons} anxietyHistory={anxietyHistory} />
  );
}
