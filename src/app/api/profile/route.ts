import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";
import { getOrCreateUserProfile } from "@/lib/db/profileService";
import { updateProfileSchema } from "@/lib/validation/profile";

function serializeProfile(profile: typeof userProfiles.$inferSelect) {
  return {
    userId: profile.userId,
    targetTrack: profile.targetTrack as "academic" | "general",
    currentBand: profile.currentBand,
    targetBand: profile.targetBand,
    examDate: profile.examDate,
    dailyGoalMinutes: profile.dailyGoalMinutes,
    onboardingCompleted: profile.onboardingCompleted === 1,
    kScore: profile.kScore,
    sScore: profile.sScore,
    aScore: profile.aScore,
    streakDays: profile.streakDays,
    lastStudyDate: profile.lastStudyDate,
    updatedAt: profile.updatedAt,
  };
}

export async function GET() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const profile = await getOrCreateUserProfile(authResult.session.user.id);
  return NextResponse.json({ profile: serializeProfile(profile) });
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

  const parsed = updateProfileSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu hồ sơ không hợp lệ.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const userId = authResult.session.user.id;
  await getOrCreateUserProfile(userId);

  const updates: Partial<typeof userProfiles.$inferInsert> = {
    updatedAt: Date.now(),
  };

  if (parsed.data.targetTrack !== undefined) {
    updates.targetTrack = parsed.data.targetTrack;
  }
  if (parsed.data.currentBand !== undefined) {
    updates.currentBand = parsed.data.currentBand;
  }
  if (parsed.data.targetBand !== undefined) {
    updates.targetBand = parsed.data.targetBand;
  }
  if (parsed.data.examDate !== undefined) {
    updates.examDate = parsed.data.examDate;
  }
  if (parsed.data.dailyGoalMinutes !== undefined) {
    updates.dailyGoalMinutes = parsed.data.dailyGoalMinutes;
  }
  if (parsed.data.onboardingCompleted !== undefined) {
    updates.onboardingCompleted = parsed.data.onboardingCompleted ? 1 : 0;
  }

  await db
    .update(userProfiles)
    .set(updates)
    .where(eq(userProfiles.userId, userId));

  const updated = await getOrCreateUserProfile(userId);
  return NextResponse.json({ profile: serializeProfile(updated) });
}
