import { z } from "zod";
import { aiProviderSchema } from "@/lib/validation/profile";

export const speakingModeSchema = z.enum([
  "shadowing",
  "cue_drill",
  "mock_exam",
]);

export const submitSpeakingRecordingSchema = z.object({
  lessonId: z.string().trim().min(2).max(100),
  attemptId: z.string().trim().min(2).max(100).optional(),
  partNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  mode: speakingModeSchema,
  storageKey: z.string().trim().min(2).max(400),
  sizeBytes: z.number().int().min(0).max(5_000_000),
  durationMs: z.number().int().min(1000).max(600_000),
  anxietyBefore: z.number().int().min(1).max(5).nullable().optional(),
  confidenceBefore: z.number().int().min(1).max(5).nullable().optional(),
  transcript: z.string().trim().max(8000).optional(),
  rmsSamples: z.array(z.number().min(0).max(2)).max(6000),
  sampleIntervalMs: z.number().int().min(50).max(1000).optional(),
});

export const requestAiSpeakingFeedbackSchema = z.object({
  lessonId: z.string().trim().min(2).max(100),
  recordingId: z.string().trim().min(2).max(100).optional(),
  partNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  transcript: z.string().trim().max(8000).optional(),
  audioBase64: z.string().max(4_000_000).optional(),
  audioMimeType: z.string().trim().max(80).optional(),
  storageMode: z.enum(["ephemeral", "saved"]),
  provider: aiProviderSchema,
  ephemeralApiKey: z.string().trim().min(6).max(300).optional(),
  ephemeralBaseUrl: z.string().trim().max(300).optional(),
  preferredModel: z.string().trim().min(2).max(120).optional(),
  inlineAiConsentConfirmed: z.boolean().optional(),
});

export const importLessonPackSchema = z.object({
  id: z
    .string()
    .trim()
    .min(4)
    .max(90)
    .regex(
      /^[a-z0-9-]+$/,
      "ID bài học chỉ gồm chữ thường, số và dấu gạch ngang."
    ),
  skill: z.enum(["listening", "reading", "writing", "speaking"]),
  track: z.enum(["shared", "academic", "general"]).default("shared"),
  partType: z.string().trim().min(2).max(100),
  title: z.string().trim().min(4).max(180),
  difficultyBand: z.string().trim().min(1).max(10).default("6.5"),
  contentJson: z.record(z.string(), z.unknown()),
});

export type SubmitSpeakingRecordingInput = z.infer<
  typeof submitSpeakingRecordingSchema
>;
export type RequestAiSpeakingFeedbackInput = z.infer<
  typeof requestAiSpeakingFeedbackSchema
>;
export type ImportLessonPackInput = z.infer<typeof importLessonPackSchema>;
