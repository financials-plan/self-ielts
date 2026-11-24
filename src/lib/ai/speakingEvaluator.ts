import { z } from "zod";
import {
  AI_PROVIDERS,
  validateSafeBaseUrl,
  type AiProviderId,
} from "@/lib/ai/providers";
import type {
  AiSpeakingFeedback,
  SpeakingLessonContent,
} from "@/lib/speaking/speakingEngine";

const aiSpeakingOutputSchema = z.object({
  transcript: z.string().max(8000).default(""),
  estimatedBand: z.number().min(4).max(9),
  criteriaNotes: z.object({
    fcVi: z.string().min(4).max(600),
    lrVi: z.string().min(4).max(600),
    graVi: z.string().min(4).max(600),
    pronVi: z.string().min(4).max(600),
  }),
  naturalUpgrades: z
    .array(
      z.object({
        basicEn: z.string().min(2).max(250),
        naturalEn: z.string().min(2).max(300),
        noteVi: z.string().min(4).max(350),
      })
    )
    .min(1)
    .max(4),
  ksaActionTipVi: z.string().min(4).max(500),
});

function buildSpeakingPrompt(
  lesson: SpeakingLessonContent,
  transcript?: string
): string {
  const promptText = lesson.prompts[0]?.promptEn ?? lesson.title;
  return [
    "You are an experienced IELTS Speaking examiner coaching a Vietnamese learner via the KSA framework.",
    `Speaking Part ${lesson.partNumber}: ${lesson.partType}`,
    `Prompt: ${promptText}`,
    transcript
      ? `Learner transcript (if provided): ${transcript.slice(0, 4000)}`
      : "No transcript provided; transcribe the audio accurately first.",
    "",
    "Respond ONLY with a valid JSON object matching this schema:",
    `{
  "transcript": "Verbatim English transcript of what the speaker said",
  "estimatedBand": 6.5,
  "criteriaNotes": {
    "fcVi": "Nhận xét tiếng Việt về Fluency & Coherence (tốc độ, ngắt nghỉ, nối ý)",
    "lrVi": "Nhận xét tiếng Việt về Lexical Resource",
    "graVi": "Nhận xét tiếng Việt về Grammatical Range & Accuracy",
    "pronVi": "Nhận xét tiếng Việt về Phát âm (ending sounds, trọng âm, ngữ điệu)"
  },
  "naturalUpgrades": [
    {
      "basicEn": "phrase the speaker used or would commonly say",
      "naturalEn": "natural Band 7.5-8.0 spoken upgrade",
      "noteVi": "Ghi chú ngắn gọn bằng tiếng Việt"
    }
  ],
  "ksaActionTipVi": "1 bước sửa cụ thể khi thu âm lại Bản 2"
}`,
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

async function transcribeWithGroqWhisper(
  apiKey: string,
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const buffer = Buffer.from(audioBase64, "base64");
  const blob = new Blob([buffer], { type: mimeType || "audio/webm" });
  const form = new FormData();
  form.append("file", blob, "speaking.webm");
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "en");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(25_000),
  });

  if (res.status === 429) throw new Error("AI_RATE_LIMITED");
  if (!res.ok) throw new Error(`AI_UPSTREAM_${res.status}`);

  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

export async function evaluateSpeakingWithByok(params: {
  provider: AiProviderId;
  apiKey: string;
  baseUrl?: string | null;
  model?: string;
  lesson: SpeakingLessonContent;
  transcript?: string;
  audioBase64?: string;
  audioMimeType?: string;
}): Promise<AiSpeakingFeedback> {
  const meta = AI_PROVIDERS[params.provider];
  const model = params.model?.trim() || meta.defaultModel;
  const key = params.apiKey.trim();
  let workingTranscript = (params.transcript ?? "").trim();
  let rawText = "";

  if (params.provider === "gemini") {
    const parts: Array<Record<string, unknown>> = [
      { text: buildSpeakingPrompt(params.lesson, workingTranscript || undefined) },
    ];
    if (params.audioBase64) {
      parts.push({
        inlineData: {
          mimeType: params.audioMimeType || "audio/webm",
          data: params.audioBase64,
        },
      });
    }

    const endpoint = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
    );
    endpoint.searchParams.set("key", key);

    const res = await fetch(endpoint.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (res.status === 429) throw new Error("AI_RATE_LIMITED");
    if (!res.ok) throw new Error(`AI_UPSTREAM_${res.status}`);
    const payload = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } else {
    if (params.provider === "groq" && params.audioBase64 && !workingTranscript) {
      workingTranscript = await transcribeWithGroqWhisper(
        key,
        params.audioBase64,
        params.audioMimeType || "audio/webm"
      );
    }

    if (!workingTranscript) {
      throw new Error("MISSING_TRANSCRIPT_FOR_TEXT_PROVIDER");
    }

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
        model:
          model === "whisper-large-v3-turbo"
            ? "llama-3.3-70b-versatile"
            : model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You return strictly valid JSON matching the requested schema.",
          },
          {
            role: "user",
            content: buildSpeakingPrompt(params.lesson, workingTranscript),
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (res.status === 429) throw new Error("AI_RATE_LIMITED");
    if (!res.ok) throw new Error(`AI_UPSTREAM_${res.status}`);
    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    rawText = payload.choices?.[0]?.message?.content ?? "";
  }

  const parsedJson = extractJsonObject(rawText);
  const validated = aiSpeakingOutputSchema.parse(parsedJson);

  return {
    providerName: meta.name,
    model,
    aiGeneratedNoticeVi:
      "Nhận xét phát âm/nói tạo bởi AI (BYOK) — Chỉ phục vụ tham khảo tự học theo Luật Trí tuệ nhân tạo 134/2025/QH15.",
    transcript: validated.transcript || workingTranscript,
    estimatedBand: Math.round(validated.estimatedBand * 2) / 2,
    criteriaNotes: validated.criteriaNotes,
    naturalUpgrades: validated.naturalUpgrades,
    ksaActionTipVi: validated.ksaActionTipVi,
  };
}
