import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth/session";
import { listSpeakingLessonsWithUserStats } from "@/lib/db/speakingService";

export async function GET() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const result = await listSpeakingLessonsWithUserStats(
    authResult.session.user.id
  );
  return NextResponse.json(result);
}
