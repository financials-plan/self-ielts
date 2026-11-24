import { z } from "zod";

export const readingModeSchema = z.enum(["guided", "drill", "exam"]);

export const readingAnswerInputSchema = z.object({
  answer: z.string().max(120),
  pinnedSentenceId: z.string().trim().max(80).nullable(),
  timeSpentSec: z.number().min(0).max(3600),
  flagged: z.boolean(),
});

export const submitReadingAttemptSchema = z.object({
  lessonId: z.string().trim().min(2).max(100),
  mode: readingModeSchema,
  confidenceBefore: z.number().int().min(1).max(5).nullable().optional(),
  durationSec: z.number().int().min(1).max(7200),
  answers: z.record(z.string().min(1).max(80), readingAnswerInputSchema),
  vocabLookups: z
    .object({
      step1Count: z.number().int().min(0).max(100),
      step2Count: z.number().int().min(0).max(100),
    })
    .optional(),
});

export type SubmitReadingAttemptInput = z.infer<
  typeof submitReadingAttemptSchema
>;
