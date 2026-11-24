import { requirePageSession } from "@/lib/auth/session";
import { getOrCreateUserProfile } from "@/lib/db/profileService";
import { listReadingLessonsWithUserStats } from "@/lib/db/readingService";
import { ReadingHubView } from "@/components/reading/ReadingHubView";

export default async function ReadingPage() {
  const session = await requirePageSession();
  const [profile, lessons] = await Promise.all([
    getOrCreateUserProfile(session.user.id),
    listReadingLessonsWithUserStats(session.user.id),
  ]);

  const defaultTrack =
    profile.targetTrack === "general" ? "general" : "academic";

  return <ReadingHubView lessons={lessons} defaultTrack={defaultTrack} />;
}
