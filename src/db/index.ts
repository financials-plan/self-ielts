import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type AppDatabase = LibSQLDatabase<typeof schema>;

function ensureLocalSqliteDir(databaseUrl: string): void {
  if (!databaseUrl.startsWith("file:")) {
    return;
  }
  const filePath = databaseUrl.slice("file:".length);
  if (!filePath || filePath === ":memory:") {
    return;
  }
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
}

export function createDbClient(
  url = process.env.DATABASE_URL || "file:./data/ielts.db",
  authToken = process.env.DATABASE_AUTH_TOKEN || undefined
): { client: Client; db: AppDatabase } {
  ensureLocalSqliteDir(url);
  const client = createClient({
    url,
    authToken: authToken || undefined,
  });
  const db = drizzle(client, { schema });
  return { client, db };
}

const globalForDb = globalThis as unknown as {
  __ieltsDb?: AppDatabase;
};

export const db: AppDatabase =
  globalForDb.__ieltsDb ?? createDbClient().db;

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ieltsDb = db;
}
