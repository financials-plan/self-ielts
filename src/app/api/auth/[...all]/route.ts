import { getAuth } from "@/lib/auth/auth";
import { ensureSchemaInitialized } from "@/lib/db/autoMigrate";

export async function GET(request: Request) {
  await ensureSchemaInitialized();
  return getAuth().handler(request);
}

export async function POST(request: Request) {
  await ensureSchemaInitialized();
  return getAuth().handler(request);
}
