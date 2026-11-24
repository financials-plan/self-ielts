import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeCards } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import { calculateNextSrsReview } from "@/lib/ksa/srs";
import { reviewCardSchema } from "@/lib/validation/ksa";

export async function POST(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Payload JSON không hợp lệ." },
      { status: 400 }
    );
  }

  const parsed = reviewCardSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu đánh giá SRS không hợp lệ." },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  const rows = await db
    .select()
    .from(knowledgeCards)
    .where(
      and(
        eq(knowledgeCards.id, parsed.data.cardId),
        eq(knowledgeCards.userId, userId)
      )
    )
    .limit(1);

  const card = rows[0];
  if (!card) {
    return NextResponse.json(
      { error: "Không tìm thấy thẻ SRS thuộc tài khoản của bạn." },
      { status: 404 }
    );
  }

  const now = Date.now();
  const next = calculateNextSrsReview(
    {
      intervalDays: card.intervalDays,
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
    },
    parsed.data.rating,
    now
  );

  await db
    .update(knowledgeCards)
    .set({
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions,
      nextReviewAt: next.nextReviewAt,
    })
    .where(
      and(eq(knowledgeCards.id, card.id), eq(knowledgeCards.userId, userId))
    );

  const profile = await touchStudyActivityAndRecomputeKsa(userId, db, now);

  return NextResponse.json({
    card: {
      ...card,
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions,
      nextReviewAt: next.nextReviewAt,
    },
    profile,
  });
}
