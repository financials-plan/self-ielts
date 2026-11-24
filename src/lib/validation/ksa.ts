import { z } from "zod";

export const skillSchema = z.enum([
  "listening",
  "reading",
  "writing",
  "speaking",
]);

export const ksaDimensionSchema = z.enum(["K", "S", "A"]);

export const cardTypeSchema = z.enum([
  "vocab",
  "paraphrase",
  "audio_clip",
  "collocation",
  "phrase",
]);

export const srsRatingSchema = z.enum(["again", "hard", "good", "easy"]);

export const createCardSchema = z.object({
  skill: skillSchema,
  cardType: cardTypeSchema,
  front: z.string().trim().min(2, "Mặt trước cần ít nhất 2 ký tự").max(600),
  back: z.string().trim().min(2, "Mặt sau cần ít nhất 2 ký tự").max(1200),
  audioClipRef: z.string().trim().max(300).optional(),
});

export const seedStarterCardsSchema = z.object({
  seedStarter: z.literal(true),
});

export const reviewCardSchema = z.object({
  cardId: z.string().trim().min(1),
  rating: srsRatingSchema,
});

export const deleteByIdSchema = z.object({
  id: z.string().trim().min(1),
});

export const createErrorLogSchema = z.object({
  skill: skillSchema,
  ksaDimension: ksaDimensionSchema,
  errorCode: z.string().trim().min(2).max(80),
  contextSnippet: z
    .string()
    .trim()
    .min(3, "Mô tả ngữ cảnh lỗi cần ít nhất 3 ký tự")
    .max(800),
  resolutionNote: z.string().trim().max(800).optional(),
});

export const updateErrorLogSchema = z.object({
  id: z.string().trim().min(1),
  resolved: z.boolean().optional(),
  resolutionNote: z.string().trim().max(800).optional(),
});

export const createReflectionSchema = z.object({
  preIntention: z.string().trim().max(300).optional(),
  whatWentWell: z
    .string()
    .trim()
    .min(2, "Hãy ghi ít nhất 1 điều làm tốt")
    .max(600),
  nextAdjustment: z
    .string()
    .trim()
    .min(2, "Hãy ghi ít nhất 1 hành động điều chỉnh")
    .max(600),
  energyLevel: z.number().int().min(1).max(5).optional(),
});
