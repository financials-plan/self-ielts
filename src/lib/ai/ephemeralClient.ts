"use client";

import type { AiProviderId } from "./providers";

const STORAGE_KEY = "self_ielts_ephemeral_byok_v1";

export interface EphemeralByokConfig {
  provider: AiProviderId;
  apiKey: string;
  baseUrl?: string;
  preferredModel: string;
  updatedAt: number;
}

export function loadEphemeralByok(): EphemeralByokConfig | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EphemeralByokConfig;
    if (!parsed?.provider || !parsed?.apiKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveEphemeralByok(
  config: Omit<EphemeralByokConfig, "updatedAt">
): EphemeralByokConfig {
  const payload: EphemeralByokConfig = {
    ...config,
    updatedAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
  return payload;
}

export function clearEphemeralByok(): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}
