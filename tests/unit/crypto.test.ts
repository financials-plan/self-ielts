import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, maskApiKey } from "@/lib/ai/crypto";

const TEST_MASTER_KEY = crypto.randomBytes(32).toString("hex");
const ALT_MASTER_KEY = crypto.randomBytes(32).toString("hex");

describe("BYOK AES-256-GCM crypto", () => {
  it("encrypts and decrypts an API key round-trip", () => {
    const rawKey = "AIzaSyExampleGeminiFreeKey1234567890";
    const encrypted = encryptSecret(rawKey, TEST_MASTER_KEY);

    expect(encrypted.encryptedKey).not.toContain(rawKey);
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.authTag).toBeTruthy();

    const decrypted = decryptSecret(encrypted, TEST_MASTER_KEY);
    expect(decrypted).toBe(rawKey);
  });

  it("generates unique random IVs for identical inputs", () => {
    const rawKey = "gsk_example_groq_key_abc123";
    const first = encryptSecret(rawKey, TEST_MASTER_KEY);
    const second = encryptSecret(rawKey, TEST_MASTER_KEY);

    expect(first.iv).not.toBe(second.iv);
    expect(first.encryptedKey).not.toBe(second.encryptedKey);
  });

  it("fails decryption if ciphertext or authTag is tampered", () => {
    const encrypted = encryptSecret("sk-test-secret-key", TEST_MASTER_KEY);
    const tamperedTag = Buffer.from(encrypted.authTag, "base64");
    tamperedTag[0] = tamperedTag[0] ^ 0xff;

    expect(() =>
      decryptSecret(
        {
          ...encrypted,
          authTag: tamperedTag.toString("base64"),
        },
        TEST_MASTER_KEY
      )
    ).toThrow();
  });

  it("fails decryption when using a different master key", () => {
    const encrypted = encryptSecret("AIzaSyDifferentMasterKeyTest", TEST_MASTER_KEY);
    expect(() => decryptSecret(encrypted, ALT_MASTER_KEY)).toThrow();
  });

  it("rejects weak/missing master key and empty secrets", () => {
    expect(() => encryptSecret("valid-key", "short")).toThrow();
    expect(() => encryptSecret("   ", TEST_MASTER_KEY)).toThrow();
  });

  it("masks API keys safely without exposing middle characters", () => {
    expect(maskApiKey("AIzaSyD-1234567890wxyz")).toBe("AIza••••wxyz");
    expect(maskApiKey("12345678")).toBe("12••••78");
  });
});
