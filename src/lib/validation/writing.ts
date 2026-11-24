import { z } from "zod";
import { aiProviderSchema } from "@/lib/validation/profile";

export const writingModeSchema = z.enum(["guided", "drill", "exam"]);

export const writingOutlineSchema = z.object({
  thesisOrOverview: z.string().trim().max(1200),
  bodyOne: z.string().trim().max(1200),
  bodyTwo: z.string().trim().max(1200),
  bodyThreeOrConclusion: z.string().trim().max(1200),
});

export const submitWritingDraftSchema = z.object({
  lessonId: z.string().trim().min(2).max(100),
  attemptId: z.string().trim().min(2).max(100).optional(),
  mode: writingModeSchema,
  confidenceBefore: z.number().int().min(1).max(5).nullable().optional(),
  durationSec: z.number().int().min(1).max(7200),
  outline: writingOutlineSchema,
  essayText: z
    .string()
    .trim()
    .min(20, "Bài viết cần tối thiểu 20 ký tự trước khi nộp.")
    .max(12000),
  selfAuditCheckedIds: z
    .array(z.string().trim().min(1).max(80))
    .min(3, "Hãy xác nhận tối thiểu 3 mục trong bước Tự rà lỗi (Self-Audit)."),
});

export const requestAiWritingFeedbackSchema = z.object({
  lessonId: z.string().trim().min(2).max(100),
  draftId: z.string().trim().min(2).max(100).optional(),
  essayText: z.string().trim().min(20).max(12000),
  storageMode: z.enum(["ephemeral", "saved"]),
  provider: aiProviderSchema,
  ephemeralApiKey: z.string().trim().min(6).max(300).optional(),
  ephemeralBaseUrl: z.string().trim().max(300).optional(),
  preferredModel: z.string().trim().min(2).max(120).optional(),
  inlineAiConsentConfirmed: z.boolean().optional(),
});

export type SubmitWritingDraftInput = z.infer<typeof submitWritingDraftSchema>;
export type RequestAiWritingFeedbackInput = z.infer<
  typeof requestAiWritingFeedbackSchema
>;
