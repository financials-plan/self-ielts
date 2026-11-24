import { z } from "zod";
import { CONSENT_TYPES } from "@/lib/legal/constants";

export const consentItemSchema = z.object({
  consentType: z.enum(CONSENT_TYPES),
  accepted: z.boolean(),
  policyVersion: z.string().trim().min(1).max(64).optional(),
});

export const recordConsentsSchema = z.object({
  consents: z
    .array(consentItemSchema)
    .min(1, "Cần ít nhất 1 mục đồng ý hoặc rút đồng ý."),
});

export type RecordConsentsInput = z.infer<typeof recordConsentsSchema>;
