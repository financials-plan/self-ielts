import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import { listReadingLessonsWithUserStats } from "@/lib/db/readingService";
import type { IeltsTrack } from "@/lib/ksa/bandCalculator";

export async function GET(request: Request) {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const rawTrack = searchParams.get("track");
  let trackFilter: IeltsTrack | undefined;

  if (rawTrack === "academic" || rawTrack === "general") {
    trackFilter = rawTrack;
  } else if (rawTrack !== null && rawTrack !== "") {
    return NextResponse.json(
      { error: "Tham số track không hợp lệ (chỉ nhận academic hoặc general)." },
      { status: 400 }
    );
  }

  const lessons = await listReadingLessonsWithUserStats(
    authResult.session.user.id,
    undefined,
    trackFilter
  );

  return NextResponse.json({ lessons });
}
