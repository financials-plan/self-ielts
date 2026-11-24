import { z } from "zod";
import { validateSafeBaseUrl } from "@/lib/ai/providers";

export const targetTrackSchema = z.enum(["academic", "general"]);

export const bandScoreSchema = z
  .number()
  .min(3, "Band tối thiểu là 3.0")
  .max(9, "Band tối đa là 9.0")
  .refine((val) => Math.round(val * 2) === val * 2, {
    message: "Điểm Band phải theo bước nhảy 0.5 (ví dụ 6.0, 6.5, 7.0)",
  });

export const updateProfileSchema = z.object({
  targetTrack: targetTrackSchema.optional(),
  currentBand: bandScoreSchema.nullable().optional(),
  targetBand: z
    .number()
    .min(4, "Band mục tiêu tối thiểu là 4.0")
    .max(9, "Band mục tiêu tối đa là 9.0")
    .refine((val) => Math.round(val * 2) === val * 2, {
      message: "Band mục tiêu phải theo bước nhảy 0.5",
    })
    .optional(),
  examDate: z.number().int().positive().nullable().optional(),
  dailyGoalMinutes: z
    .number()
    .int()
    .min(10, "Mục tiêu tối thiểu 10 phút/ngày")
    .max(180, "Mục tiêu tối đa 180 phút/ngày")
    .optional(),
  onboardingCompleted: z.boolean().optional(),
});

export const aiProviderSchema = z.enum([
  "gemini",
  "groq",
  "openai-compatible",
]);

export const saveAiConfigSchema = z
  .object({
    provider: aiProviderSchema,
    apiKey: z
      .string()
      .trim()
      .min(8, "API key quá ngắn (tối thiểu 8 ký tự)")
      .max(300, "API key quá dài"),
    baseUrl: z.string().trim().optional().or(z.literal("")),
    preferredModel: z
      .string()
      .trim()
      .min(1, "Vui lòng chọn hoặc nhập tên model")
      .max(120),
    aiConsentAccepted: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === "openai-compatible") {
      if (!data.baseUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["baseUrl"],
          message: "OpenAI-Compatible cần nhập Base URL.",
        });
        return;
      }
    }
    if (data.baseUrl) {
      try {
        validateSafeBaseUrl(data.baseUrl);
      } catch (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["baseUrl"],
          message: err instanceof Error ? err.message : "Base URL không hợp lệ",
        });
      }
    }
  });

export const testAiConfigSchema = z.object({
  mode: z.enum(["ephemeral", "saved"]),
  provider: aiProviderSchema,
  baseUrl: z.string().trim().optional().or(z.literal("")),
  preferredModel: z.string().trim().optional(),
});

export const deleteAiConfigSchema = z.object({
  provider: aiProviderSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SaveAiConfigInput = z.infer<typeof saveAiConfigSchema>;
