import crypto from "node:crypto";
import { getCloudflareEnv } from "@/db";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export interface EncryptedSecretPayload {
  encryptedKey: string;
  iv: string;
  authTag: string;
}

function deriveKey(rawSecret?: string): Buffer {
  const cfKey = getCloudflareEnv()?.BYOK_ENCRYPTION_KEY;
  const secret =
    rawSecret ??
    (process.env.BYOK_ENCRYPTION_KEY ||
      (typeof cfKey === "string" ? cfKey : undefined));
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      "BYOK_ENCRYPTION_KEY thiếu hoặc quá ngắn (yêu cầu tối thiểu 16 ký tự hoặc chuỗi hex 64 ký tự)."
    );
  }
  const trimmed = secret.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  return crypto.createHash("sha256").update(trimmed, "utf8").digest();
}

export function encryptSecret(
  plaintext: string,
  masterKeyHex?: string
): EncryptedSecretPayload {
  const clean = plaintext.trim();
  if (!clean) {
    throw new Error("Không thể mã hóa API key rỗng.");
  }

  const key = deriveKey(masterKeyHex);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(clean, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedKey: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptSecret(
  payload: EncryptedSecretPayload,
  masterKeyHex?: string
): string {
  const key = deriveKey(masterKeyHex);
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const ciphertext = Buffer.from(payload.encryptedKey, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function maskApiKey(rawKey: string): string {
  const clean = rawKey.trim();
  if (clean.length <= 8) {
    return `${clean.slice(0, 2)}••••${clean.slice(-2)}`;
  }
  return `${clean.slice(0, 4)}••••${clean.slice(-4)}`;
}
