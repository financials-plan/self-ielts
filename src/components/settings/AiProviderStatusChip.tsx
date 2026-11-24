"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, Sparkles } from "lucide-react";
import { loadEphemeralByok } from "@/lib/ai/ephemeralClient";
import { AI_PROVIDERS, type AiProviderId } from "@/lib/ai/providers";
import { Badge } from "@/components/ui/Badge";

export interface SavedAiSummary {
  provider: AiProviderId;
  keyHint: string;
  preferredModel: string;
}

export function AiProviderStatusChip({
  savedConfigs,
}: {
  savedConfigs: SavedAiSummary[];
}) {
  const [ephemeralProvider, setEphemeralProvider] =
    useState<AiProviderId | null>(null);

  useEffect(() => {
    const cfg = loadEphemeralByok();
    if (cfg?.provider && cfg?.apiKey) {
      setEphemeralProvider(cfg.provider);
    }
  }, []);

  if (ephemeralProvider) {
    return (
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--ux-mint)]/30 bg-[var(--ux-mint-soft)] px-3 py-2 text-xs font-medium text-[var(--ux-mint)]"
      >
        <ShieldCheck className="h-4 w-4" />
        <span>
          BYOK trong phiên: {AI_PROVIDERS[ephemeralProvider].name}
        </span>
      </Link>
    );
  }

  if (savedConfigs.length > 0) {
    const primary = savedConfigs[0];
    return (
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--ux-accent)]/30 bg-[var(--ux-accent-soft)] px-3 py-2 text-xs font-medium text-[var(--ux-accent)]"
      >
        <Sparkles className="h-4 w-4" />
        <span>
          BYOK đã lưu: {AI_PROVIDERS[primary.provider].name} (
          {primary.keyHint})
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/settings"
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface)] px-3 py-2 text-xs font-medium text-[var(--ux-ink-2)] hover:border-[var(--ux-line-2)] hover:text-[var(--ux-ink)]"
    >
      <Cpu className="h-4 w-4 text-[var(--ux-ink-3)]" />
      <span>Chế độ Offline 0đ</span>
      <Badge variant="free">Gắn AI miễn phí</Badge>
    </Link>
  );
}
