import { z } from "zod";

export const listeningModeSchema = z.enum(["guided", "drill", "exam"]);

export const listeningAnswerInputSchema = z.object({
  answer: z.string().max(120),
  reanchored: z.boolean(),
});

export const submitListeningAttemptSchema = z.object({
  lessonId: z.string().trim().min(2).max(100),
  mode: listeningModeSchema,
  confidenceBefore: z.number().int().min(1).max(5).nullable().optional(),
  durationSec: z.number().int().min(1).max(7200),
  preGateCompleted: z.boolean(),
  posPredictionsMatched: z.number().int().min(0).max(50),
  reanchorCount: z.number().int().min(0).max(50),
  dictationCompletedCount: z.number().int().min(0).max(50),
  answers: z.record(z.string().min(1).max(80), listeningAnswerInputSchema),
});

export type SubmitListeningAttemptInput = z.infer<
  typeof submitListeningAttemptSchema
>;
