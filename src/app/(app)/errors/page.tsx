import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { errorLogs } from "@/db/schema";
import { requirePageSession } from "@/lib/auth/session";
import { ErrorJournalStudio } from "@/components/errors/ErrorJournalStudio";

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; dimension?: string }>;
}) {
  const session = await requirePageSession();
  const params = await searchParams;

  const errors = await db
    .select()
    .from(errorLogs)
    .where(eq(errorLogs.userId, session.user.id))
    .orderBy(desc(errorLogs.createdAt));

  return (
    <ErrorJournalStudio
      initialErrors={errors}
      initialSkillFilter={params.skill}
      initialDimFilter={params.dimension}
    />
  );
}
