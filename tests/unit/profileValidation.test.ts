import { describe, expect, it } from "vitest";
import {
  saveAiConfigSchema,
  updateProfileSchema,
} from "@/lib/validation/profile";

describe("Profile & BYOK Zod validation", () => {
  it("accepts valid academic and general track profile updates", () => {
    const academic = updateProfileSchema.safeParse({
      targetTrack: "academic",
      currentBand: 6.0,
      targetBand: 7.5,
      dailyGoalMinutes: 45,
      onboardingCompleted: true,
    });
    expect(academic.success).toBe(true);

    const general = updateProfileSchema.safeParse({
      targetTrack: "general",
      currentBand: null,
      targetBand: 7.0,
    });
    expect(general.success).toBe(true);
  });

  it("rejects invalid tracks, out-of-range bands, and non-0.5 band steps", () => {
    expect(
      updateProfileSchema.safeParse({ targetTrack: "business" }).success
    ).toBe(false);
    expect(
      updateProfileSchema.safeParse({ targetBand: 6.3 }).success
    ).toBe(false);
    expect(
      updateProfileSchema.safeParse({ targetBand: 9.5 }).success
    ).toBe(false);
    expect(
      updateProfileSchema.safeParse({ dailyGoalMinutes: 5 }).success
    ).toBe(false);
  });

  it("validates Gemini & Groq configs without requiring baseUrl", () => {
    const gemini = saveAiConfigSchema.safeParse({
      provider: "gemini",
      apiKey: "AIzaSyFreeTierKey123456",
      preferredModel: "gemini-2.5-flash",
    });
    expect(gemini.success).toBe(true);

    const groq = saveAiConfigSchema.safeParse({
      provider: "groq",
      apiKey: "gsk_free_tier_key_123456",
      preferredModel: "llama-3.3-70b-versatile",
    });
    expect(groq.success).toBe(true);
  });

  it("requires safe baseUrl for openai-compatible and blocks SSRF targets", () => {
    const missingUrl = saveAiConfigSchema.safeParse({
      provider: "openai-compatible",
      apiKey: "sk-openrouter-free-12345",
      preferredModel: "meta-llama/llama-3.3-70b-instruct:free",
    });
    expect(missingUrl.success).toBe(false);

    const metadataUrl = saveAiConfigSchema.safeParse({
      provider: "openai-compatible",
      apiKey: "sk-openrouter-free-12345",
      baseUrl: "http://169.254.169.254/latest/meta-data",
      preferredModel: "llama3.2",
    });
    expect(metadataUrl.success).toBe(false);

    const localOllama = saveAiConfigSchema.safeParse({
      provider: "openai-compatible",
      apiKey: "ollama-local",
      baseUrl: "http://localhost:11434/v1",
      preferredModel: "llama3.2",
    });
    expect(localOllama.success).toBe(true);
  });
});
