import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "file:./data/ielts.db";
const isRemoteTurso =
  databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("https://");

if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.slice("file:".length);
  if (filePath && filePath !== ":memory:") {
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: isRemoteTurso ? "turso" : "sqlite",
  dbCredentials: isRemoteTurso
    ? {
        url: databaseUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }
    : {
        url: databaseUrl,
      },
});
