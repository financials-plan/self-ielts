import { requirePageSession } from "@/lib/auth/session";
import { getUserConsentState } from "@/lib/db/consentService";
import {
  getOrCreateUserProfile,
  listSafeAiConfigs,
} from "@/lib/db/profileService";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const session = await requirePageSession();
  const [profile, savedConfigs, consentState] = await Promise.all([
    getOrCreateUserProfile(session.user.id),
    listSafeAiConfigs(session.user.id),
    getUserConsentState(session.user.id),
  ]);

  return (
    <SettingsView
      initialProfile={{
        targetTrack: profile.targetTrack === "general" ? "general" : "academic",
        currentBand: profile.currentBand,
        targetBand: profile.targetBand,
        examDate: profile.examDate,
        dailyGoalMinutes: profile.dailyGoalMinutes,
      }}
      initialSavedConfigs={savedConfigs}
      initialConsents={consentState}
    />
  );
}
