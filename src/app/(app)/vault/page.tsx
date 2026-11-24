import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { knowledgeCards } from "@/db/schema";
import { requirePageSession } from "@/lib/auth/session";
import { KnowledgeVaultStudio } from "@/components/vault/KnowledgeVaultStudio";

export default async function VaultPage() {
  const session = await requirePageSession();
  const initialNowMs = Date.now();

  const cards = await db
    .select()
    .from(knowledgeCards)
    .where(eq(knowledgeCards.userId, session.user.id))
    .orderBy(knowledgeCards.nextReviewAt, desc(knowledgeCards.createdAt));

  return (
    <KnowledgeVaultStudio
      initialCards={cards}
      initialNowMs={initialNowMs}
    />
  );
}
