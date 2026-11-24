import { z } from "zod";
import {
  AI_PROVIDERS,
  validateSafeBaseUrl,
  type AiProviderId,
} from "@/lib/ai/providers";
import type {
  AiWritingFeedback,
  WritingLessonContent,
} from "@/lib/writing/writingEngine";

const aiOutputSchema = z.object({
  estimatedBand: z.number().min(4).max(9),
  criteriaNotes: z.object({
    taTrVi: z.string().min(4).max(600),
    ccVi: z.string().min(4).max(600),
    lrVi: z.string().min(4).max(600),
    graVi: z.string().min(4).max(600),
  }),
  inlineDiffs: z
    .array(
      z.object({
        originalSnippet: z.string().min(3).max(400),
        upgradedSnippet: z.string().min(3).max(500),
        criterion: z.enum(["TA_TR", "CC", "LR", "GRA"]),
        reasonVi: z.string().min(4).max(400),
      })
    )
    .min(1)
    .max(5),
  ksaActionTipVi: z.string().min(4).max(500),
});

function buildExaminerPrompt(
  lesson: WritingLessonContent,
  essayText: string
): string {
  return [
    "You are an experienced IELTS Writing examiner coaching a Vietnamese self-learner via the KSA (Knowledge, Skills, Attitudes) framework.",
    `Task Type: ${lesson.partType} (minimum ${lesson.minWords} words).`,
    `Prompt: ${lesson.promptEn}`,
    "",
    "Evaluate the learner's essay below and respond ONLY with a valid JSON object (no markdown fences) matching this exact structure:",
    `{
  "estimatedBand": 6.5,
  "criteriaNotes": {
    "taTrVi": "Nhận xét ngắn gọn bằng tiếng Việt về Task Achievement/Response",
    "ccVi": "Nhận xét ngắn gọn bằng tiếng Việt về Coherence & Cohesion",
    "lrVi": "Nhận xét ngắn gọn bằng tiếng Việt về Lexical Resource",
    "graVi": "Nhận xét ngắn gọn bằng tiếng Việt về Grammatical Range & Accuracy"
  },
  "inlineDiffs": [
    {
      "originalSnippet": "exact short sentence or phrase from learner essay",
      "upgradedSnippet": "natural Band 7.5-8.0 upgrade in English preserving learner's idea",
      "criterion": "LR",
      "reasonVi": "Giải thích ngắn gọn bằng tiếng Việt lý do nâng cấp"
    }
  ],
  "ksaActionTipVi": "1 lời khuyên cụ thể để sửa khi viết lại Draft 2"
}`,
    "",
    "Learner Essay:",
    essayText.slice(0, 6000),
  ].join("\n");
}

function extractJsonObject(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("AI_RESPONSE_INVALID_JSON");
  }
}

export async function evaluateWritingWithByok(params: {
  provider: AiProviderId;
  apiKey: string;
  baseUrl?: string | null;
  model?: string;
  lesson: WritingLessonContent;
  essayText: string;
}): Promise<AiWritingFeedback> {
  const providerMeta = AI_PROVIDERS[params.provider];
  const model = params.model?.trim() || providerMeta.defaultModel;
  const prompt = buildExaminerPrompt(params.lesson, params.essayText);
  const key = params.apiKey.trim();

  let rawText = "";

  if (params.provider === "gemini") {
    const endpoint = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
    );
    endpoint.searchParams.set("key", key);
    const res = await fetch(endpoint.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (res.status === 429) {
      throw new Error("AI_RATE_LIMITED");
    }
    if (!res.ok) {
      throw new Error(`AI_UPSTREAM_${res.status}`);
    }
    const payload = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } else {
    const safeBase =
      params.provider === "groq"
        ? "https://api.groq.com/openai/v1"
        : validateSafeBaseUrl(params.baseUrl) ?? "https://openrouter.ai/api/v1";

    const res = await fetch(`${safeBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You return strictly valid JSON matching the requested schema.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (res.status === 429) {
      throw new Error("AI_RATE_LIMITED");
    }
    if (!res.ok) {
      throw new Error(`AI_UPSTREAM_${res.status}`);
    }
    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    rawText = payload.choices?.[0]?.message?.content ?? "";
  }

  const parsedJson = extractJsonObject(rawText);
  const validated = aiOutputSchema.parse(parsedJson);

  return {
    providerName: providerMeta.name,
    model,
    aiGeneratedNoticeVi:
      "Nhận xét tạo tự động bởi AI (BYOK) — Chỉ phục vụ tham khảo tự học theo Luật Trí tuệ nhân tạo 134/2025/QH15.",
    estimatedBand: Math.round(validated.estimatedBand * 2) / 2,
    criteriaNotes: validated.criteriaNotes,
    inlineDiffs: validated.inlineDiffs,
    ksaActionTipVi: validated.ksaActionTipVi,
  };
}
