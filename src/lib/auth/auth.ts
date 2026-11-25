import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getCloudflareEnv, resolveRuntimeDb } from "@/db";
import * as schema from "@/db/schema";

function readRuntimeEnv(key: string): string | undefined {
  const procVal = process.env[key];
  if (procVal) return procVal;
  const cfVal = getCloudflareEnv()?.[key];
  return typeof cfVal === "string" && cfVal.length > 0 ? cfVal : undefined;
}

function createAuthInstance() {
  const googleClientId = readRuntimeEnv("GOOGLE_CLIENT_ID");
  const googleClientSecret = readRuntimeEnv("GOOGLE_CLIENT_SECRET");
  const hasGoogleOAuth = Boolean(googleClientId && googleClientSecret);

  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined;
  const vercelPreviewUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;

  const baseUrl =
    readRuntimeEnv("BETTER_AUTH_URL") ||
    readRuntimeEnv("NEXT_PUBLIC_APP_URL") ||
    vercelProdUrl ||
    vercelPreviewUrl;
  const publicUrl = readRuntimeEnv("NEXT_PUBLIC_APP_URL");
  const secret = readRuntimeEnv("BETTER_AUTH_SECRET");

  const trustedOrigins = Array.from(
    new Set(
      [
        baseUrl,
        publicUrl,
        vercelProdUrl,
        vercelPreviewUrl,
        "https://*.vercel.app",
        "https://*.workers.dev",
        "http://localhost:3000",
      ].filter((origin): origin is string => Boolean(origin))
    )
  );

  return betterAuth({
    database: drizzleAdapter(resolveRuntimeDb(), {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    ...(secret ? { secret } : {}),
    ...(baseUrl ? { baseURL: baseUrl } : {}),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    ...(hasGoogleOAuth
      ? {
          socialProviders: {
            google: {
              clientId: googleClientId!,
              clientSecret: googleClientSecret!,
            },
          },
        }
      : {}),
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "learner",
          input: false,
        },
      },
    },
    trustedOrigins,
    plugins: [nextCookies()],
  });
}

const d1AuthCache = new WeakMap<object, ReturnType<typeof createAuthInstance>>();
let localAuthCache: ReturnType<typeof createAuthInstance> | null = null;

export function getAuth() {
  const cfEnv = getCloudflareEnv();
  const d1Binding = cfEnv?.DB;
  if (d1Binding && typeof d1Binding === "object") {
    const cached = d1AuthCache.get(d1Binding);
    if (cached) return cached;
    const instance = createAuthInstance();
    d1AuthCache.set(d1Binding, instance);
    return instance;
  }

  if (!localAuthCache) {
    localAuthCache = createAuthInstance();
  }
  return localAuthCache;
}

export type AppSession = ReturnType<typeof createAuthInstance>["$Infer"]["Session"];
