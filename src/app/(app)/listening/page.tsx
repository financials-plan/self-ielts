import { requirePageSession } from "@/lib/auth/session";
import { listListeningLessonsWithUserStats } from "@/lib/db/listeningService";
import { ListeningHubView } from "@/components/listening/ListeningHubView";

export default async function ListeningPage() {
  const session = await requirePageSession();
  const lessons = await listListeningLessonsWithUserStats(session.user.id);

  return <ListeningHubView lessons={lessons} />;
}
