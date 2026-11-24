import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireApiSession } from "@/lib/auth/session";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_data",
];

export async function DELETE() {
  const authResult = await requireApiSession();
  if (authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const userId = authResult.session.user.id;
  await db.delete(user).where(eq(user.id, userId));

  const response = NextResponse.json({
    deleted: true,
    message:
      "Đã xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân liên quan.",
  });

  for (const cookieName of SESSION_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", {
      maxAge: 0,
      path: "/",
    });
  }

  return response;
}
