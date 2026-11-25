import { afterEach, describe, expect, it } from "vitest";
import {
  isMutatingUserSql,
  isVercelBlobSqliteEnabled,
} from "@/lib/db/vercelBlobSqlite";

const ORIGINAL_ENV = {
  VERCEL: process.env.VERCEL,
  NEXT_PHASE: process.env.NEXT_PHASE,
  DATABASE_URL: process.env.DATABASE_URL,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  BLOB_STORE_ID: process.env.BLOB_STORE_ID,
};

function restoreEnv(): void {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("vercelBlobSqlite", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("distinguishes mutating user/runtime SQL from read/DDL/idempotent lesson seeds", () => {
    expect(
      isMutatingUserSql('INSERT INTO "user" (id, email) VALUES (?, ?)')
    ).toBe(true);
    expect(
      isMutatingUserSql("INSERT INTO account (id, password) VALUES (?, ?)")
    ).toBe(true);
    expect(
      isMutatingUserSql("UPDATE user_profiles SET k_score = ? WHERE user_id = ?")
    ).toBe(true);
    expect(isMutatingUserSql("DELETE FROM session WHERE token = ?")).toBe(true);
    expect(
      isMutatingUserSql("INSERT INTO lessons (id, skill) VALUES (?, ?)")
    ).toBe(true);

    expect(isMutatingUserSql("SELECT * FROM user WHERE id = ?")).toBe(false);
    expect(
      isMutatingUserSql("CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY)")
    ).toBe(false);
    expect(isMutatingUserSql("PRAGMA journal_mode = DELETE;")).toBe(false);
    expect(
      isMutatingUserSql(
        '/* seed */ INSERT OR IGNORE INTO "lessons" (id, skill) VALUES (?, ?)'
      )
    ).toBe(false);
    expect(
      isMutatingUserSql("insert or ignore into lessons (id) values (?)")
    ).toBe(false);
  });

  it("enables Blob SQLite sync only at Vercel runtime without external libSQL URL", () => {
    delete process.env.VERCEL;
    delete process.env.NEXT_PHASE;
    delete process.env.DATABASE_URL;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_STORE_ID;

    expect(isVercelBlobSqliteEnabled()).toBe(false);

    process.env.VERCEL = "1";
    expect(isVercelBlobSqliteEnabled()).toBe(false);

    process.env.BLOB_STORE_ID = "store_abc123";
    expect(isVercelBlobSqliteEnabled()).toBe(true);

    delete process.env.BLOB_STORE_ID;
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_token";
    expect(isVercelBlobSqliteEnabled()).toBe(true);

    process.env.NEXT_PHASE = "phase-production-build";
    expect(isVercelBlobSqliteEnabled()).toBe(false);

    delete process.env.NEXT_PHASE;
    process.env.DATABASE_URL = "libsql://example.turso.io";
    expect(isVercelBlobSqliteEnabled()).toBe(false);
  });
});
