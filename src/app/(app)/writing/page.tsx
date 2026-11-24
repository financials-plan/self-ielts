import { requirePageSession } from "@/lib/auth/session";
import { getOrCreateUserProfile } from "@/lib/db/profileService";
import { listWritingLessonsWithUserStats } from "@/lib/db/writingService";
import { WritingHubView } from "@/components/writing/WritingHubView";

export default async function WritingPage() {
  const session = await requirePageSession();
  const [profile, lessons] = await Promise.all([
    getOrCreateUserProfile(session.user.id),
    listWritingLessonsWithUserStats(session.user.id),
  ]);

  const defaultTrack =
    profile.targetTrack === "general" ? "general" : "academic";

  return <WritingHubView lessons={lessons} defaultTrack={defaultTrack} />;
}
