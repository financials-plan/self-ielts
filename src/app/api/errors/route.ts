import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { errorLogs } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { touchStudyActivityAndRecomputeKsa } from "@/lib/db/ksaService";
import { buildBottleneckMatrix } from "@/lib/ksa/ksaScoring";
import {
  createErrorLogSchema,
  deleteByIdSchema,
  ksaDimensionSchema,
  skillSchema,
  updateErrorLogSchema,
} from "@/lib/validation/ksa";

export async function GET(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const userId = authResult.session.user.id;
  const { searchParams } = new URL(request.url);
  const rawSkill = searchParams.get("skill");
  const rawDim = searchParams.get("dimension");
  const rawResolved = searchParams.get("resolved");

  const conditions = [eq(errorLogs.userId, userId)];
  if (rawSkill) {
    const parsedSkill = skillSchema.safeParse(rawSkill);
    if (!parsedSkill.success) {
      return NextResponse.json(
        { error: "Tham số skill không hợp lệ." },
        { status: 400 }
      );
    }
    conditions.push(eq(errorLogs.skill, parsedSkill.data));
  }
  if (rawDim) {
    const parsedDim = ksaDimensionSchema.safeParse(rawDim);
    if (!parsedDim.success) {
      return NextResponse.json(
        { error: "Tham số dimension không hợp lệ." },
        { status: 400 }
      );
    }
    conditions.push(eq(errorLogs.ksaDimension, parsedDim.data));
  }
  if (rawResolved === "true" || rawResolved === "false") {
    conditions.push(eq(errorLogs.resolved, rawResolved === "true" ? 1 : 0));
  }

  const [filteredErrors, allUserErrors] = await Promise.all([
    db
      .select()
      .from(errorLogs)
      .where(and(...conditions))
      .orderBy(desc(errorLogs.createdAt)),
    db
      .select({
        skill: errorLogs.skill,
        ksaDimension: errorLogs.ksaDimension,
        errorCode: errorLogs.errorCode,
        resolved: errorLogs.resolved,
      })
      .from(errorLogs)
      .where(eq(errorLogs.userId, userId)),
  ]);

  const { matrix, primaryBottleneck } = buildBottleneckMatrix(allUserErrors);
  return NextResponse.json({
    errors: filteredErrors,
    matrix,
    primaryBottleneck,
  });
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

  const parsed = createErrorLogSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu ghi nhận lỗi không hợp lệ.",
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
    skill: parsed.data.skill,
    ksaDimension: parsed.data.ksaDimension,
    errorCode: parsed.data.errorCode,
    contextSnippet: parsed.data.contextSnippet,
    resolutionNote: parsed.data.resolutionNote ?? null,
    resolved: 0,
    createdAt: now,
  };

  await db.insert(errorLogs).values(entry);
  const profile = await touchStudyActivityAndRecomputeKsa(userId, db, now);

  return NextResponse.json({ errorLog: entry, profile }, { status: 201 });
}

export async function PATCH(request: Request) {
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

  const parsed = updateErrorLogSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu cập nhật lỗi không hợp lệ." },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  const updates: Partial<typeof errorLogs.$inferInsert> = {};
  if (parsed.data.resolved !== undefined) {
    updates.resolved = parsed.data.resolved ? 1 : 0;
  }
  if (parsed.data.resolutionNote !== undefined) {
    updates.resolutionNote = parsed.data.resolutionNote;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Không có trường nào cần cập nhật." },
      { status: 400 }
    );
  }

  await db
    .update(errorLogs)
    .set(updates)
    .where(
      and(eq(errorLogs.id, parsed.data.id), eq(errorLogs.userId, userId))
    );

  const now = Date.now();
  const profile = await touchStudyActivityAndRecomputeKsa(
    userId,
    db,
    now,
    Boolean(parsed.data.resolved)
  );
  const updatedRows = await db
    .select()
    .from(errorLogs)
    .where(
      and(eq(errorLogs.id, parsed.data.id), eq(errorLogs.userId, userId))
    )
    .limit(1);

  if (!updatedRows[0]) {
    return NextResponse.json(
      { error: "Không tìm thấy bản ghi lỗi thuộc tài khoản của bạn." },
      { status: 404 }
    );
  }

  return NextResponse.json({ errorLog: updatedRows[0], profile });
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
      { error: "Thiếu id bản ghi lỗi cần xóa." },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  await db
    .delete(errorLogs)
    .where(
      and(eq(errorLogs.id, parsed.data.id), eq(errorLogs.userId, userId))
    );

  const profile = await touchStudyActivityAndRecomputeKsa(
    userId,
    db,
    Date.now(),
    false
  );
  return NextResponse.json({ deleted: true, profile });
}
