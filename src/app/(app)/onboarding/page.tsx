import { requirePageSession } from "@/lib/auth/session";
import { getOrCreateUserProfile } from "@/lib/db/profileService";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await requirePageSession();
  const profile = await getOrCreateUserProfile(session.user.id);

  return (
    <OnboardingWizard
      userName={session.user.name}
      initialProfile={{
        targetTrack: profile.targetTrack === "general" ? "general" : "academic",
        currentBand: profile.currentBand,
        targetBand: profile.targetBand,
        examDate: profile.examDate,
        dailyGoalMinutes: profile.dailyGoalMinutes,
      }}
    />
  );
}
