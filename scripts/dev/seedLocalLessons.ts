import "dotenv/config";
import { sql } from "drizzle-orm";
import { createDbClient } from "@/db";
import { lessons } from "@/db/schema";
import { ensureReadingLessonsSeeded } from "@/lib/db/readingService";
import { ensureListeningLessonsSeeded } from "@/lib/db/listeningService";
import { ensureWritingLessonsSeeded } from "@/lib/db/writingService";
import { ensureSpeakingLessonsSeeded } from "@/lib/db/speakingService";

async function main() {
  const { client, db } = createDbClient();
  try {
    const nowMs = Date.now();
    await ensureReadingLessonsSeeded(db, nowMs);
    await ensureListeningLessonsSeeded(db, nowMs);
    await ensureWritingLessonsSeeded(db, nowMs);
    await ensureSpeakingLessonsSeeded(db, nowMs);

    const counts = await db
      .select({
        skill: lessons.skill,
        total: sql<number>`count(*)`,
      })
      .from(lessons)
      .groupBy(lessons.skill);

    let grandTotal = 0;
    for (const row of counts) {
      grandTotal += Number(row.total);
      console.log(`${row.skill}: ${row.total}`);
    }
    console.log(`TOTAL LESSONS IN LOCAL DB: ${grandTotal}`);
  } finally {
    client.close();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed local lessons:", err);
    process.exit(1);
  });
