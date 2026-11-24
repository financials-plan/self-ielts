import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reflectionLogs } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import {
  createReflectionSchema,
  deleteByIdSchema,
} from "@/lib/validation/ksa";

export async function GET() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const reflections = await db
    .select()
    .from(reflectionLogs)
    .where(eq(reflectionLogs.userId, authResult.session.user.id))
    .orderBy(desc(reflectionLogs.createdAt))
    .limit(20);

  return NextResponse.json({ reflections });
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

  const parsed = createReflectionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu nhật ký phản tư không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  const now = Date.now();
  const entry = {
    id: crypto.randomUUID(),
    userId,
    attemptId: null,
    preIntention: parsed.data.preIntention || null,
    whatWentWell: parsed.data.whatWentWell,
    nextAdjustment: parsed.data.nextAdjustment,
    energyLevel: parsed.data.energyLevel ?? 3,
    createdAt: now,
  };

  await db.insert(reflectionLogs).values(entry);
  const profile = await touchStudyActivityAndRecomputeKsa(userId, db, now);

  return NextResponse.json({ reflection: entry, profile }, { status: 201 });
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
      { error: "Thiếu id phản tư cần xóa." },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  await db
    .delete(reflectionLogs)
    .where(
      and(eq(reflectionLogs.id, parsed.data.id), eq(reflectionLogs.userId, userId))
    );

  const profile = await touchStudyActivityAndRecomputeKsa(
    userId,
    db,
    Date.now(),
    false
  );
  return NextResponse.json({ deleted: true, profile });
}
