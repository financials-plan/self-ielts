import fs from "node:fs";
import zlib from "node:zlib";
import {
  createClient,
  type Client,
  type InArgs,
  type InStatement,
  type ResultSet,
  type Transaction,
  type TransactionMode,
} from "@libsql/client";
import { get, put } from "@vercel/blob";

export const VERCEL_TMP_SQLITE_PATH = "/tmp/ielts.db";
export const BLOB_SQLITE_PATHNAME = "_system/ielts-db-v1.sqlite.gz";

const PULL_TTL_MS = 1500;

function hasExternalDatabaseUrl(): boolean {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return false;
  return /^(libsql|https?|wss?):/i.test(raw);
}

/**
 * Returns true when running on Vercel without an external libSQL/Turso URL
 * and a connected Vercel Blob store is available for persisting /tmp/ielts.db.
 */
export function isVercelBlobSqliteEnabled(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return false;
  }
  if (hasExternalDatabaseUrl()) {
    return false;
  }
  const hasBlobCredentials = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim()
  );
  return Boolean(process.env.VERCEL && hasBlobCredentials);
}

function stripLeadingSqlComments(sqlText: string): string {
  let text = sqlText.trimStart();
  while (text.startsWith("--") || text.startsWith("/*")) {
    if (text.startsWith("--")) {
      const nl = text.indexOf("\n");
      text = nl === -1 ? "" : text.slice(nl + 1).trimStart();
    } else {
      const close = text.indexOf("*/");
      text = close === -1 ? "" : text.slice(close + 2).trimStart();
    }
  }
  return text;
}

/**
 * Returns true when a SQL statement writes user/runtime data (accounts, sessions,
 * passwords, profiles, attempts, drafts, recordings, flashcards, consents, imports).
 * Built-in idempotent lesson seeding (`INSERT OR IGNORE INTO lessons ...`) returns false
 * so serverless cold-start lesson seeding never churns Private Blob writes.
 */
export function isMutatingUserSql(sqlText: string): boolean {
  const cleaned = stripLeadingSqlComments(sqlText);
  if (!cleaned) return false;

  if (!/^(insert|update|delete|replace)\b/i.test(cleaned)) {
    return false;
  }

  // Built-in lesson seeding uses `INSERT OR IGNORE INTO "lessons"` / `lessons`
  if (/^insert\s+or\s+ignore\s+into\s+["`]?lessons["`]?\b/i.test(cleaned)) {
    return false;
  }

  return true;
}

function extractSqlFromInStatement(
  stmt: InStatement | [string, InArgs?]
): string {
  if (typeof stmt === "string") {
    return stmt;
  }
  if (Array.isArray(stmt)) {
    return stmt[0] ?? "";
  }
  return stmt.sql;
}

interface BlobSqliteState {
  rawClient: Client | null;
  pragmasApplied: boolean;
  wrappedClient: Client | null;
  loadedETag: string | undefined;
  lastPullCheckMs: number;
  suppressFlushDepth: number;
  inTxDepth: number;
  inInternalInit: boolean;
  dbGeneration: number;
  syncQueue: Promise<void>;
}

const globalForBlobState = globalThis as unknown as {
  __ieltsBlobSqliteState?: BlobSqliteState;
};

function getState(): BlobSqliteState {
  if (!globalForBlobState.__ieltsBlobSqliteState) {
    globalForBlobState.__ieltsBlobSqliteState = {
      rawClient: null,
      pragmasApplied: false,
      wrappedClient: null,
      loadedETag: undefined,
      lastPullCheckMs: 0,
      suppressFlushDepth: 0,
      inTxDepth: 0,
      inInternalInit: false,
      dbGeneration: 0,
      syncQueue: Promise.resolve(),
    };
  }
  return globalForBlobState.__ieltsBlobSqliteState;
}

function enqueueSync<T>(fn: () => Promise<T>): Promise<T> {
  const state = getState();
  const next = state.syncQueue.then(fn, fn);
  state.syncQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export function getBlobDbGeneration(): number {
  return getState().dbGeneration;
}

export async function withSuppressedBlobFlush<T>(
  fn: () => Promise<T>
): Promise<T> {
  const state = getState();
  state.suppressFlushDepth += 1;
  try {
    return await fn();
  } finally {
    state.suppressFlushDepth = Math.max(0, state.suppressFlushDepth - 1);
  }
}

async function ensureRawClientWithPragmas(): Promise<Client> {
  const state = getState();
  if (!state.rawClient) {
    state.rawClient = createClient({
      url: `file:${VERCEL_TMP_SQLITE_PATH}`,
    });
    state.pragmasApplied = false;
  }

  if (!state.pragmasApplied) {
    state.inInternalInit = true;
    try {
      await state.rawClient.execute("PRAGMA journal_mode = DELETE;");
      await state.rawClient.execute("PRAGMA synchronous = NORMAL;");
      await state.rawClient.execute("PRAGMA foreign_keys = ON;");
      state.pragmasApplied = true;
    } finally {
      state.inInternalInit = false;
    }
  }

  return state.rawClient;
}

export async function syncSqliteFromBlobIfNeeded(
  force = false
): Promise<void> {
  const state = getState();
  if (
    !isVercelBlobSqliteEnabled() ||
    state.inInternalInit ||
    state.inTxDepth > 0
  ) {
    return;
  }

  return enqueueSync(async () => {
    const fileExists = fs.existsSync(VERCEL_TMP_SQLITE_PATH);
    if (
      !force &&
      fileExists &&
      state.loadedETag &&
      Date.now() - state.lastPullCheckMs < PULL_TTL_MS
    ) {
      await ensureRawClientWithPragmas();
      return;
    }

    const res = await get(BLOB_SQLITE_PATHNAME, {
      access: "private",
      ...(state.loadedETag && fileExists
        ? { ifNoneMatch: state.loadedETag }
        : {}),
      useCache: false,
    });

    if (res === null) {
      await ensureRawClientWithPragmas();
      state.lastPullCheckMs = Date.now();
      return;
    }

    if (res.statusCode === 304) {
      await ensureRawClientWithPragmas();
      state.lastPullCheckMs = Date.now();
      return;
    }

    if (res.statusCode === 200) {
      const arrayBuffer = await new Response(res.stream).arrayBuffer();
      const sqliteBytes = zlib.gunzipSync(Buffer.from(arrayBuffer));

      if (state.rawClient) {
        try {
          state.rawClient.close();
        } catch {
          // Ignore close errors before swapping underlying file
        }
        state.rawClient = null;
        state.pragmasApplied = false;
      }

      const tmpUploadPath = `${VERCEL_TMP_SQLITE_PATH}.tmp`;
      fs.writeFileSync(tmpUploadPath, sqliteBytes);
      fs.renameSync(tmpUploadPath, VERCEL_TMP_SQLITE_PATH);

      state.dbGeneration += 1;
      state.loadedETag = res.blob.etag;
      state.lastPullCheckMs = Date.now();
      await ensureRawClientWithPragmas();
    }
  });
}

export async function flushSqliteToBlob(): Promise<void> {
  const state = getState();
  if (
    !isVercelBlobSqliteEnabled() ||
    state.suppressFlushDepth > 0 ||
    state.inTxDepth > 0 ||
    state.inInternalInit ||
    !fs.existsSync(VERCEL_TMP_SQLITE_PATH)
  ) {
    return;
  }

  return enqueueSync(async () => {
    if (!fs.existsSync(VERCEL_TMP_SQLITE_PATH)) {
      return;
    }
    const rawBytes = fs.readFileSync(VERCEL_TMP_SQLITE_PATH);
    const gzBytes = zlib.gzipSync(rawBytes, { level: 1 });
    const putResult = await put(BLOB_SQLITE_PATHNAME, gzBytes, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/gzip",
    });

    state.loadedETag = putResult.etag || undefined;
    state.lastPullCheckMs = Date.now();
  });
}

function wrapTransaction(rawTx: Transaction): Transaction {
  const state = getState();
  let txMutated = false;
  let settled = false;

  const markReleased = () => {
    if (!settled) {
      settled = true;
      state.inTxDepth = Math.max(0, state.inTxDepth - 1);
    }
  };

  return new Proxy(rawTx, {
    get(target, prop, receiver) {
      if (prop === "execute") {
        return async (
          stmtOrSql: InStatement | string,
          args?: InArgs
        ): Promise<ResultSet> => {
          const sqlStr =
            typeof stmtOrSql === "string"
              ? stmtOrSql
              : extractSqlFromInStatement(stmtOrSql);
          if (isMutatingUserSql(sqlStr)) {
            txMutated = true;
          }
          const stmt: InStatement =
            typeof stmtOrSql === "string" && args !== undefined
              ? { sql: stmtOrSql, args }
              : (stmtOrSql as InStatement);
          return target.execute(stmt);
        };
      }

      if (prop === "batch") {
        return async (stmts: Array<InStatement>): Promise<Array<ResultSet>> => {
          for (const stmt of stmts) {
            if (isMutatingUserSql(extractSqlFromInStatement(stmt))) {
              txMutated = true;
              break;
            }
          }
          return target.batch(stmts);
        };
      }

      if (prop === "executeMultiple") {
        return async (sqlStr: string): Promise<void> => {
          if (isMutatingUserSql(sqlStr)) {
            txMutated = true;
          }
          return target.executeMultiple(sqlStr);
        };
      }

      if (prop === "commit") {
        return async (): Promise<void> => {
          try {
            await target.commit();
          } finally {
            markReleased();
          }
          if (txMutated) {
            await flushSqliteToBlob();
          }
        };
      }

      if (prop === "rollback") {
        return async (): Promise<void> => {
          try {
            await target.rollback();
          } finally {
            markReleased();
          }
        };
      }

      if (prop === "close") {
        return (): void => {
          try {
            target.close();
          } finally {
            markReleased();
          }
        };
      }

      const val = Reflect.get(target, prop, receiver);
      return typeof val === "function" ? val.bind(target) : val;
    },
  });
}

export function getOrCreateVercelBlobLibsqlClient(): Client {
  const state = getState();
  if (state.wrappedClient) {
    return state.wrappedClient;
  }

  const wrapper: Client = {
    async execute(
      stmtOrSql: InStatement | string,
      args?: InArgs
    ): Promise<ResultSet> {
      await syncSqliteFromBlobIfNeeded();
      const client = await ensureRawClientWithPragmas();
      const stmt: InStatement =
        typeof stmtOrSql === "string" && args !== undefined
          ? { sql: stmtOrSql, args }
          : (stmtOrSql as InStatement);
      const result = await client.execute(stmt);

      const sqlStr =
        typeof stmtOrSql === "string"
          ? stmtOrSql
          : extractSqlFromInStatement(stmtOrSql);
      if (isMutatingUserSql(sqlStr)) {
        await flushSqliteToBlob();
      }
      return result;
    },

    async batch(
      stmts: Array<InStatement | [string, InArgs?]>,
      mode?: TransactionMode
    ): Promise<Array<ResultSet>> {
      await syncSqliteFromBlobIfNeeded();
      const client = await ensureRawClientWithPragmas();
      const results = await client.batch(stmts, mode);

      const mutated = stmts.some((s) =>
        isMutatingUserSql(extractSqlFromInStatement(s))
      );
      if (mutated) {
        await flushSqliteToBlob();
      }
      return results;
    },

    async migrate(stmts: Array<InStatement>): Promise<Array<ResultSet>> {
      await syncSqliteFromBlobIfNeeded();
      const client = await ensureRawClientWithPragmas();
      const results = await client.migrate(stmts);
      const mutated = stmts.some((s) =>
        isMutatingUserSql(extractSqlFromInStatement(s))
      );
      if (mutated) {
        await flushSqliteToBlob();
      }
      return results;
    },

    async transaction(mode?: TransactionMode): Promise<Transaction> {
      await syncSqliteFromBlobIfNeeded();
      const client = await ensureRawClientWithPragmas();
      const rawTx = await client.transaction(mode);
      state.inTxDepth += 1;
      return wrapTransaction(rawTx);
    },

    async executeMultiple(sqlStr: string): Promise<void> {
      await syncSqliteFromBlobIfNeeded();
      const client = await ensureRawClientWithPragmas();
      await client.executeMultiple(sqlStr);
      if (isMutatingUserSql(sqlStr)) {
        await flushSqliteToBlob();
      }
    },

    async sync() {
      await syncSqliteFromBlobIfNeeded(true);
      const client = await ensureRawClientWithPragmas();
      return client.sync();
    },

    close(): void {
      if (state.rawClient) {
        state.rawClient.close();
        state.rawClient = null;
        state.pragmasApplied = false;
      }
    },

    reconnect(): void {
      if (state.rawClient) {
        state.rawClient.reconnect();
      }
    },

    get closed(): boolean {
      return state.rawClient ? state.rawClient.closed : false;
    },

    get protocol(): string {
      return state.rawClient ? state.rawClient.protocol : "file";
    },
  };

  state.wrappedClient = wrapper;
  return wrapper;
}
