import { requirePageSession } from "@/lib/auth/session";
import { getOrCreateUserProfile } from "@/lib/db/profileService";
import { AppShell } from "@/components/layout/AppShell";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePageSession();
  const profile = await getOrCreateUserProfile(session.user.id);

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      initialTrack={profile.targetTrack === "general" ? "general" : "academic"}
    >
      {children}
    </AppShell>
  );
}
