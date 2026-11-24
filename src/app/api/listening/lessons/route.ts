import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import { listListeningLessonsWithUserStats } from "@/lib/db/listeningService";

export async function GET(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const rawPart = searchParams.get("part");
  let partFilter: 1 | 2 | 3 | 4 | undefined;

  if (rawPart) {
    const n = Number(rawPart);
    if (n === 1 || n === 2 || n === 3 || n === 4) {
      partFilter = n;
    } else {
      return NextResponse.json(
        { error: "Tham số part không hợp lệ (chỉ nhận 1–4)." },
        { status: 400 }
      );
    }
  }

  const lessons = await listListeningLessonsWithUserStats(
    authResult.session.user.id,
    undefined,
    partFilter
  );

  return NextResponse.json({ lessons });
}
