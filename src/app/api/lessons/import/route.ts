import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { importLessonPack } from "@/lib/db/speakingService";
import { importLessonPackSchema } from "@/lib/validation/speaking";

export async function GET() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const rows = await db
    .select({
      id: lessons.id,
      skill: lessons.skill,
      track: lessons.track,
      partType: lessons.partType,
      title: lessons.title,
      difficultyBand: lessons.difficultyBand,
      createdAt: lessons.createdAt,
    })
    .from(lessons)
    .orderBy(desc(lessons.createdAt))
    .limit(50);

  return NextResponse.json({ lessons: rows });
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
      { error: "JSON không hợp lệ." },
      { status: 400 }
    );
  }

  const parsed = importLessonPackSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ||
          "Cấu trúc JSON bài học không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const result = await importLessonPack({
      userRole: authResult.session.user.role || "learner",
      pack: parsed.data,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "FORBIDDEN_BUILTIN_OVERWRITE"
    ) {
      return NextResponse.json(
        {
          error:
            "Không thể ghi đè ID bài mẫu hệ thống (acad-*, gt-*, list-*, writ-*, speak-*). Hãy đặt ID bắt đầu bằng 'custom-'.",
        },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Không thể nạp bài học từ JSON." },
      { status: 500 }
    );
  }
}
