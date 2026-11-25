import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";
import {
  getBlobDbGeneration,
  getOrCreateVercelBlobLibsqlClient,
  isVercelBlobSqliteEnabled,
  VERCEL_TMP_SQLITE_PATH,
} from "@/lib/db/vercelBlobSqlite";

export type AppDatabase = LibSQLDatabase<typeof schema>;

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

export function getCloudflareEnv(): Record<string, unknown> | undefined {
  const ctx = (globalThis as Record<symbol, unknown>)[
    CLOUDFLARE_CONTEXT_SYMBOL
  ] as { env?: Record<string, unknown> } | undefined;
  return ctx?.env;
}

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

function getDefaultDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  if (process.env.VERCEL) {
    return `file:${VERCEL_TMP_SQLITE_PATH}`;
  }
  return "file:./data/ielts.db";
}

export function createDbClient(
  url = getDefaultDatabaseUrl(),
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

const d1DrizzleCache = new WeakMap<object, AppDatabase>();

const globalForDb = globalThis as unknown as {
  __ieltsDb?: AppDatabase;
  __ieltsBlobDb?: AppDatabase;
  __ieltsBlobGen?: number;
};

export function resolveRuntimeDb(): AppDatabase {
  const cfEnv = getCloudflareEnv();
  const d1Binding = cfEnv?.DB;
  if (d1Binding && typeof d1Binding === "object") {
    const cached = d1DrizzleCache.get(d1Binding);
    if (cached) return cached;
    const d1Db = drizzleD1(
      d1Binding as Parameters<typeof drizzleD1>[0],
      { schema }
    ) as unknown as AppDatabase;
    d1DrizzleCache.set(d1Binding, d1Db);
    return d1Db;
  }

  if (isVercelBlobSqliteEnabled()) {
    const gen = getBlobDbGeneration();
    if (!globalForDb.__ieltsBlobDb || globalForDb.__ieltsBlobGen !== gen) {
      globalForDb.__ieltsBlobDb = drizzle(
        getOrCreateVercelBlobLibsqlClient(),
        { schema }
      );
      globalForDb.__ieltsBlobGen = gen;
    }
    return globalForDb.__ieltsBlobDb;
  }

  if (!globalForDb.__ieltsDb) {
    globalForDb.__ieltsDb = createDbClient().db;
  }
  return globalForDb.__ieltsDb;
}

export const db: AppDatabase = new Proxy({} as AppDatabase, {
  get(_target, prop) {
    const actual = resolveRuntimeDb();
    const value = Reflect.get(actual as object, prop, actual as object);
    return typeof value === "function" ? value.bind(actual) : value;
  },
});
