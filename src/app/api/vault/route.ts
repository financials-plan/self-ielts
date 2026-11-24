import crypto from "node:crypto";
import { and, desc, eq, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeCards } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import { STARTER_KNOWLEDGE_CARDS } from "@/lib/ksa/errorTaxonomy";
import {
  createCardSchema,
  deleteByIdSchema,
  seedStarterCardsSchema,
  skillSchema,
} from "@/lib/validation/ksa";

export async function GET(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const userId = authResult.session.user.id;
  const { searchParams } = new URL(request.url);
  const rawSkill = searchParams.get("skill");
  const dueOnly = searchParams.get("dueOnly") === "true";

  const conditions = [eq(knowledgeCards.userId, userId)];
  if (rawSkill) {
    const parsedSkill = skillSchema.safeParse(rawSkill);
    if (!parsedSkill.success) {
      return NextResponse.json(
        { error: "Tham số skill không hợp lệ." },
        { status: 400 }
      );
    }
    conditions.push(eq(knowledgeCards.skill, parsedSkill.data));
  }
  if (dueOnly) {
    conditions.push(lte(knowledgeCards.nextReviewAt, Date.now()));
  }

  const cards = await db
    .select()
    .from(knowledgeCards)
    .where(and(...conditions))
    .orderBy(knowledgeCards.nextReviewAt, desc(knowledgeCards.createdAt));

  return NextResponse.json({ cards });
}

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

  const userId = authResult.session.user.id;
  const now = Date.now();

  const seedCheck = seedStarterCardsSchema.safeParse(rawBody);
  if (seedCheck.success) {
    const existing = await db
      .select({ front: knowledgeCards.front })
      .from(knowledgeCards)
      .where(eq(knowledgeCards.userId, userId));
    const existingFronts = new Set(existing.map((e) => e.front));

    const toInsert = STARTER_KNOWLEDGE_CARDS.filter(
      (c) => !existingFronts.has(c.front)
    ).map((c, idx) => ({
      id: crypto.randomUUID(),
      userId,
      skill: c.skill,
      cardType: c.cardType,
      front: c.front,
      back: c.back,
      audioClipRef: null,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: now,
      createdAt: now + idx,
    }));

    if (toInsert.length > 0) {
      await db.insert(knowledgeCards).values(toInsert);
    }

    const profile = await touchStudyActivityAndRecomputeKsa(userId, db, now);
    const cards = await db
      .select()
      .from(knowledgeCards)
      .where(eq(knowledgeCards.userId, userId))
      .orderBy(knowledgeCards.nextReviewAt, desc(knowledgeCards.createdAt));

    return NextResponse.json({
      insertedCount: toInsert.length,
      cards,
      profile,
    });
  }

  const parsed = createCardSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu thẻ SRS không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const newCard = {
    id: crypto.randomUUID(),
    userId,
    skill: parsed.data.skill,
    cardType: parsed.data.cardType,
    front: parsed.data.front,
    back: parsed.data.back,
    audioClipRef: parsed.data.audioClipRef ?? null,
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewAt: now,
    createdAt: now,
  };

  await db.insert(knowledgeCards).values(newCard);
  const profile = await touchStudyActivityAndRecomputeKsa(userId, db, now);

  return NextResponse.json({ card: newCard, profile }, { status: 201 });
}

export async function DELETE(request: Request) {
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

  const parsed = deleteByIdSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Thiếu id thẻ cần xóa." },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  await db
    .delete(knowledgeCards)
    .where(
      and(
        eq(knowledgeCards.id, parsed.data.id),
        eq(knowledgeCards.userId, userId)
      )
    );

  const profile = await touchStudyActivityAndRecomputeKsa(
    userId,
    db,
    Date.now(),
    false
  );
  return NextResponse.json({ deleted: true, profile });
}
