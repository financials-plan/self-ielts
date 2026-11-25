import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { ensureSchemaInitialized } from "@/lib/db/autoMigrate";
import { getAuth, type AppSession } from "./auth";

export async function getServerSession(): Promise<AppSession | null> {
  await ensureSchemaInitialized();
  const reqHeaders = await headers();
  const session = await getAuth().api.getSession({
    headers: reqHeaders,
  });
  return session ?? null;
}

export async function requirePageSession(): Promise<AppSession> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireApiSession(): Promise<
  | { session: AppSession; errorResponse: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await getServerSession();
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn." },
        { status: 401 }
      ),
    };
  }
  return { session, errorResponse: null };
}
