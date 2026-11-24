import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { practiceAttempts } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { submitReadingAttempt } from "@/lib/db/readingService";
import { submitReadingAttemptSchema } from "@/lib/validation/reading";

export async function GET(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  const conditions = [
    eq(practiceAttempts.userId, authResult.session.user.id),
    eq(practiceAttempts.skill, "reading"),
  ];
  if (lessonId) {
    conditions.push(eq(practiceAttempts.lessonId, lessonId));
  }

  const attempts = await db
    .select()
    .from(practiceAttempts)
    .where(and(...conditions))
    .orderBy(desc(practiceAttempts.completedAt))
    .limit(20);

  return NextResponse.json({ attempts });
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

  const parsed = submitReadingAttemptSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu nộp bài Reading không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const result = await submitReadingAttempt(
      authResult.session.user.id,
      parsed.data
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "READING_LESSON_NOT_FOUND") {
      return NextResponse.json(
        { error: "Không tìm thấy bài đọc Reading yêu cầu." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Không thể lưu kết quả bài đọc. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
