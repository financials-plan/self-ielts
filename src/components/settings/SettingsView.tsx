"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Download,
  ExternalLink,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wifi,
} from "lucide-react";
import {
  clearEphemeralByok,
  loadEphemeralByok,
  saveEphemeralByok,
  type EphemeralByokConfig,
} from "@/lib/ai/ephemeralClient";
import { AI_PROVIDERS, type AiProviderId } from "@/lib/ai/providers";
import type { UserConsentState } from "@/lib/db/consentService";
import type { SafeAiConfigSummary } from "@/lib/db/profileService";
import {
  CONSENT_LABELS_VI,
  type ConsentType,
} from "@/lib/legal/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { HoldToDeleteButton } from "@/components/lucian/HoldToDeleteButton";
import { useToast } from "@/components/lucian/ToastProvider";

interface SettingsViewProps {
  initialProfile: {
    targetTrack: "academic" | "general";
    currentBand: number | null;
    targetBand: number;
    examDate: number | null;
    dailyGoalMinutes: number;
  };
  initialSavedConfigs: SafeAiConfigSummary[];
  initialConsents: UserConsentState;
}

const BAND_OPTIONS = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

export function SettingsView({
  initialProfile,
  initialSavedConfigs,
  initialConsents,
}: SettingsViewProps) {
  const router = useRouter();
  const toast = useToast();

  // Profile state
  const [targetTrack, setTargetTrack] = useState<"academic" | "general">(
    initialProfile.targetTrack
  );
  const [currentBand, setCurrentBand] = useState<string>(
    initialProfile.currentBand ? String(initialProfile.currentBand) : ""
  );
  const [targetBand, setTargetBand] = useState<number>(
    initialProfile.targetBand
  );
  const [examDateStr, setExamDateStr] = useState<string>(
    initialProfile.examDate
      ? new Date(initialProfile.examDate).toISOString().slice(0, 10)
      : ""
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(
    initialProfile.dailyGoalMinutes
  );
  const [profileStatus, setProfileStatus] = useState<MorphStatus>("idle");
  const [profileNotice, setProfileNotice] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // BYOK state
  const [storageMode, setStorageMode] = useState<"ephemeral" | "saved">(
    "ephemeral"
  );
  const [provider, setProvider] = useState<AiProviderId>("gemini");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [baseUrl, setBaseUrl] = useState(
    AI_PROVIDERS["openai-compatible"].defaultBaseUrl ?? ""
  );
  const [preferredModel, setPreferredModel] = useState(
    AI_PROVIDERS.gemini.defaultModel
  );
  const [savedConfigs, setSavedConfigs] =
    useState<SafeAiConfigSummary[]>(initialSavedConfigs);
  const [ephemeralConfig, setEphemeralConfig] =
    useState<EphemeralByokConfig | null>(null);
  const [byokBusy, setByokBusy] = useState(false);
  const [saveKeyStatus, setSaveKeyStatus] = useState<MorphStatus>("idle");
  const [testKeyStatus, setTestKeyStatus] = useState<MorphStatus>("idle");
  const [byokNotice, setByokNotice] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [consentState, setConsentState] =
    useState<UserConsentState>(initialConsents);
  const [aiConsentTick, setAiConsentTick] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  const aiConsentActive = Boolean(
    consentState.latest.ai_third_party_transfer?.accepted
  );

  useEffect(() => {
    setEphemeralConfig(loadEphemeralByok());
  }, []);

  async function syncAiConsentToServer(accepted: boolean): Promise<boolean> {
    const res = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consents: [{ consentType: "ai_third_party_transfer", accepted }],
      }),
    });
    if (!res.ok) return false;
    const updated = (await res.json()) as UserConsentState & {
      aiConfigsCleared?: boolean;
    };
    setConsentState({ latest: updated.latest, history: updated.history });
    if (updated.aiConfigsCleared) {
      setSavedConfigs([]);
    }
    return true;
  }

  function handleSelectProvider(nextProvider: AiProviderId) {
    setProvider(nextProvider);
    const meta = AI_PROVIDERS[nextProvider];
    setPreferredModel(meta.defaultModel);
    if (meta.defaultBaseUrl) {
      setBaseUrl(meta.defaultBaseUrl);
    } else {
      setBaseUrl("");
    }
    setByokNotice(null);
    setSaveKeyStatus("idle");
    setTestKeyStatus("idle");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileStatus("loading");
    setProfileNotice(null);

    try {
      const parsedDate = examDateStr
        ? new Date(`${examDateStr}T00:00:00Z`).getTime()
        : null;
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetTrack,
          currentBand: currentBand ? Number(currentBand) : null,
          targetBand,
          examDate: parsedDate,
          dailyGoalMinutes,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu hồ sơ.");
      }
      setProfileStatus("done");
      setProfileNotice({
        ok: true,
        text: "Đã cập nhật hồ sơ học tập KSA.",
      });
      toast.success("Đã lưu hồ sơ học tập");
      setTimeout(() => setProfileStatus("idle"), 1800);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu hồ sơ.";
      setProfileStatus("error");
      setProfileNotice({ ok: false, text: msg });
      toast.error("Lưu hồ sơ thất bại", msg);
    }
  }

  async function handleSaveKey() {
    setByokNotice(null);
    const cleanKey = apiKeyInput.trim();
    if (cleanKey.length < 8) {
      const msg = "Vui lòng nhập API Key hợp lệ (ít nhất 8 ký tự).";
      setByokNotice({ ok: false, text: msg });
      toast.error(msg);
      return;
    }

    if (!aiConsentActive && !aiConsentTick) {
      const msg =
        "Vui lòng tick đồng ý chuyển dữ liệu nhạy cảm sang nhà cung cấp AI bên thứ ba trước khi sử dụng BYOK.";
      setByokNotice({ ok: false, text: msg });
      toast.error("Cần xác nhận đồng ý AI", msg);
      return;
    }

    if (storageMode === "ephemeral") {
      setSaveKeyStatus("loading");
      if (!aiConsentActive && aiConsentTick) {
        await syncAiConsentToServer(true);
      }
      const saved = saveEphemeralByok({
        provider,
        apiKey: cleanKey,
        baseUrl: provider === "openai-compatible" ? baseUrl.trim() : undefined,
        preferredModel: preferredModel.trim(),
      });
      setEphemeralConfig(saved);
      setApiKeyInput("");
      setSaveKeyStatus("done");
      const msg =
        "Đã lưu khóa vào sessionStorage của trình duyệt (không gửi xuống CSDL).";
      setByokNotice({ ok: true, text: msg });
      toast.success("Đã lưu khóa phiên trình duyệt", AI_PROVIDERS[provider].name);
      setTimeout(() => setSaveKeyStatus("idle"), 1800);
      router.refresh();
      return;
    }

    setByokBusy(true);
    setSaveKeyStatus("loading");
    try {
      const res = await fetch("/api/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: cleanKey,
          baseUrl: provider === "openai-compatible" ? baseUrl.trim() : "",
          preferredModel: preferredModel.trim(),
          aiConsentAccepted: aiConsentActive || aiConsentTick,
        }),
      });
      const data = (await res.json()) as {
        configs?: SafeAiConfigSummary[];
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu API Key.");
      }
      if (data.configs) {
        setSavedConfigs(data.configs);
      }
      if (!aiConsentActive) {
        const consentRes = await fetch("/api/consent");
        if (consentRes.ok) {
          const fresh = (await consentRes.json()) as UserConsentState;
          setConsentState({ latest: fresh.latest, history: fresh.history });
        }
      }
      setApiKeyInput("");
      setSaveKeyStatus("done");
      const msg =
        data.message ||
        "Đã mã hóa AES-256-GCM và đồng bộ API Key lên tài khoản.";
      setByokNotice({ ok: true, text: msg });
      toast.success("Mã hóa & Lưu thành công", msg);
      setTimeout(() => setSaveKeyStatus("idle"), 1800);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu API Key.";
      setSaveKeyStatus("error");
      setByokNotice({ ok: false, text: msg });
      toast.error("Lưu Key thất bại", msg);
    } finally {
      setByokBusy(false);
    }
  }

  async function handleTestConnection(
    testMode: "input" | "ephemeral" | "saved",
    targetProvider: AiProviderId = provider,
    targetBaseUrl?: string | null,
    targetModel?: string
  ) {
    setByokBusy(true);
    if (testMode === "input") setTestKeyStatus("loading");
    setByokNotice(null);

    try {
      let res: Response;
      if (testMode === "saved") {
        res = await fetch("/api/ai-config/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "saved",
            provider: targetProvider,
            baseUrl: targetBaseUrl ?? "",
            preferredModel: targetModel,
          }),
        });
      } else {
        if (!aiConsentActive && !aiConsentTick) {
          throw new Error(
            "Vui lòng tick đồng ý chuyển dữ liệu sang AI bên thứ ba trước khi kiểm thử."
          );
        }
        if (!aiConsentActive && aiConsentTick) {
          await syncAiConsentToServer(true);
        }
        const keyToTest =
          testMode === "input"
            ? apiKeyInput.trim()
            : ephemeralConfig?.apiKey || "";
        if (!keyToTest) {
          throw new Error("Vui lòng nhập API Key trước khi kiểm thử kết nối.");
        }
        res = await fetch("/api/ai-config/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-byok-key": keyToTest,
          },
          body: JSON.stringify({
            mode: "ephemeral",
            provider: targetProvider,
            baseUrl:
              targetBaseUrl ??
              (targetProvider === "openai-compatible" ? baseUrl.trim() : ""),
            preferredModel: targetModel ?? preferredModel.trim(),
          }),
        });
      }

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      const ok = Boolean(res.ok && data.ok);
      const text =
        data.message || data.error || "Không nhận được phản hồi từ máy chủ.";
      if (testMode === "input") {
        setTestKeyStatus(ok ? "done" : "error");
        setTimeout(() => setTestKeyStatus("idle"), 1800);
      }
      setByokNotice({ ok, text });
      if (ok) toast.success("Kết nối AI sẵn sàng", text);
      else toast.error("Kiểm thử thất bại", text);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Kiểm thử kết nối thất bại.";
      if (testMode === "input") setTestKeyStatus("error");
      setByokNotice({ ok: false, text: msg });
      toast.error("Kiểm thử thất bại", msg);
    } finally {
      setByokBusy(false);
    }
  }

  async function handleDeleteSaved(targetProvider: AiProviderId) {
    setByokBusy(true);
    setByokNotice(null);
    try {
      const res = await fetch("/api/ai-config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: targetProvider }),
      });
      const data = (await res.json()) as {
        configs?: SafeAiConfigSummary[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa cấu hình.");
      }
      if (data.configs) {
        setSavedConfigs(data.configs);
      }
      const msg = `Đã xóa API Key đã lưu của ${AI_PROVIDERS[targetProvider].name}.`;
      setByokNotice({ ok: true, text: msg });
      toast.info("Đã xóa khóa đồng bộ", msg);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi xóa API Key.";
      setByokNotice({ ok: false, text: msg });
      toast.error("Xóa khóa thất bại", msg);
    } finally {
      setByokBusy(false);
    }
  }

  function handleClearEphemeral() {
    clearEphemeralByok();
    setEphemeralConfig(null);
    const msg = "Đã xóa khóa khỏi sessionStorage trình duyệt.";
    setByokNotice({ ok: true, text: msg });
    toast.info("Đã gỡ khóa phiên trình duyệt");
    router.refresh();
  }

  const activeMeta = AI_PROVIDERS[provider];

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-medium text-[var(--ux-ink)] sm:text-3xl">
          Cài đặt Hồ sơ và khóa AI miễn phí
        </h1>
        <p className="text-sm text-[var(--ux-ink-2)]">
          Quản lý mục tiêu IELTS Academic / General Training và tùy chọn gắn API
          Key miễn phí (Google AI Studio / Groq) để mở khóa chấm chữa chuyên
          sâu.
        </p>
      </div>

      {/* Section 1: Learner Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Hồ sơ Học tập IELTS</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Hệ thi mục tiêu</label>
                <select
                  value={targetTrack}
                  onChange={(e) =>
                    setTargetTrack(e.target.value as "academic" | "general")
                  }
                  className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm"
                >
                  <option value="academic">IELTS Academic</option>
                  <option value="general">IELTS General Training</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Band hiện tại</label>
                <select
                  value={currentBand}
                  onChange={(e) => setCurrentBand(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm"
                >
                  <option value="">Chưa xác định</option>
                  {BAND_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Band mục tiêu</label>
                <select
                  value={targetBand}
                  onChange={(e) => setTargetBand(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm"
                >
                  {BAND_OPTIONS.filter((b) => b >= 5.0).map((b) => (
                    <option key={b} value={b}>
                      {b.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ngày dự thi</label>
                <Input
                  type="date"
                  value={examDateStr}
                  onChange={(e) => setExamDateStr(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Mục tiêu mỗi ngày (phút)
                </label>
                <Input
                  type="number"
                  min={10}
                  max={180}
                  step={5}
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                />
              </div>
            </div>

            {profileNotice && (
              <p
                className={`rounded-xl px-3.5 py-2 text-sm ${
                  profileNotice.ok
                    ? "border border-[var(--ux-mint)]/30 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]"
                    : "border border-[var(--ux-danger)]/30 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]"
                }`}
              >
                {profileNotice.text}
              </p>
            )}

            <MorphSubmitButton
              type="submit"
              status={profileStatus}
              idleLabel="Lưu hồ sơ học tập"
              loadingLabel="Đang lưu..."
              doneLabel="Đã lưu hồ sơ!"
              icon={<Save className="h-4 w-4" />}
            />
          </form>
        </CardContent>
      </Card>

      {/* Section 2: Free-First BYOK */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-[var(--ux-accent)]" />
              2. Cấu hình AI Miễn phí (Hybrid BYOK · 0đ)
            </CardTitle>
            <Badge variant="free">Không bắt buộc · Offline vẫn dùng đủ</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Chọn cách lưu khóa và nhà cung cấp miễn phí (không cần thẻ tín dụng).
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Storage Mode with Lucian #039 Sliding Pill Tabs */}
          <div className="space-y-2.5">
            <SlidingPillTabs
              ariaLabel="Chế độ lưu API Key"
              value={storageMode}
              onChange={setStorageMode}
              options={[
                {
                  value: "ephemeral",
                  label: "Phiên trình duyệt (An toàn nhất)",
                },
                {
                  value: "saved",
                  label: "Đồng bộ tài khoản (AES-256-GCM)",
                },
              ]}
            />
            <p className="text-xs text-[var(--text-secondary)]">
              {storageMode === "ephemeral"
                ? "Khóa chỉ nằm trong sessionStorage của tab hiện tại, không bao giờ gửi xuống CSDL."
                : "Khóa được mã hóa AES-256-GCM trước khi lưu vào Turso/SQLite để đăng nhập nhiều thiết bị."}
            </p>
          </div>

          {/* Provider Picker */}
          <div className="grid gap-3 md:grid-cols-3">
            {(Object.keys(AI_PROVIDERS) as AiProviderId[]).map((id) => {
              const item = AI_PROVIDERS[id];
              const active = provider === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectProvider(id)}
                  className={`flex flex-col justify-between gap-2 rounded-xl border p-3.5 text-left cursor-pointer transition-colors ${
                    active
                      ? "border-[var(--ux-accent)] bg-[var(--ux-accent-soft)] ring-2 ring-[var(--ux-accent)]/20"
                      : "border-[var(--ux-line)] hover:bg-[var(--ux-surface-2)]/60"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {item.subtitle}
                    </p>
                  </div>
                  <Badge variant="free" className="w-fit">
                    {item.freeTierBadge}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Selected Provider Guide & Form */}
          <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)]/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                Hướng dẫn lấy khóa miễn phí: {activeMeta.name}
              </p>
              <a
                href={activeMeta.signupUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ux-accent)] hover:underline"
              >
                Mở trang lấy Key (0đ)
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <ol className="list-inside list-decimal space-y-1 text-xs text-[var(--text-secondary)]">
              {activeMeta.setupStepsVi.map((stepText) => (
                <li key={stepText}>{stepText}</li>
              ))}
            </ol>

            <div className="flex items-start gap-2 rounded-xl border border-[var(--ux-warn)]/30 bg-[var(--ksa-a-soft)] p-3 text-xs text-[var(--text-secondary)]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ux-warn)]" />
              <div className="space-y-1">
                <p>
                  <strong>Minh bạch AI (Luật AI 134/2025/QH15):</strong> Mọi
                  phản hồi chấm bài từ AI đều gắn nhãn AI, chỉ phục vụ tự học
                  tham khảo.
                </p>
                <p>{activeMeta.privacyNoteVi}</p>
              </div>
            </div>

            {!aiConsentActive && (
              <label
                htmlFor="settings-ai-consent"
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--ux-warn)]/40 bg-[var(--ux-surface)] p-3 text-xs leading-relaxed"
              >
                <input
                  id="settings-ai-consent"
                  type="checkbox"
                  checked={aiConsentTick}
                  onChange={(e) => setAiConsentTick(e.target.checked)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border ${
                    aiConsentTick
                      ? "border-[var(--ux-accent)] bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                      : "border-[var(--ux-line-2)] bg-[var(--ux-surface)]"
                  }`}
                >
                  {aiConsentTick && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    Đồng ý xử lý dữ liệu nhạy cảm qua AI bên thứ ba:
                  </strong>{" "}
                  Tôi đồng ý gửi nội dung bài làm / bản ghi âm sang máy chủ
                  nước ngoài của nhà cung cấp AI đã chọn theo{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[var(--ux-accent)] underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Chính sách BVDLCN
                  </Link>
                  .
                </span>
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ux-ink-2)]">
                  API Key
                </label>
                <Input
                  type="password"
                  autoComplete="off"
                  placeholder={
                    provider === "gemini"
                      ? "AIza..."
                      : provider === "groq"
                        ? "gsk_..."
                        : "sk-..."
                  }
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ux-ink-2)]">
                  Model ưu tiên
                </label>
                <Input
                  type="text"
                  value={preferredModel}
                  onChange={(e) => setPreferredModel(e.target.value)}
                  list={`models-${provider}`}
                />
                <datalist id={`models-${provider}`}>
                  {activeMeta.suggestedModels.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              {activeMeta.requiresBaseUrl && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[var(--ux-ink-2)]">
                    Base URL (HTTPS hoặc http://localhost)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://openrouter.ai/api/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
              )}
            </div>

            {byokNotice && (
              <p
                className={`rounded-xl px-3.5 py-2 text-sm ${
                  byokNotice.ok
                    ? "border border-[var(--ux-mint)]/30 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]"
                    : "border border-[var(--ux-danger)]/30 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]"
                }`}
              >
                {byokNotice.text}
              </p>
            )}

            <div className="flex flex-wrap gap-2.5">
              <MorphSubmitButton
                variant="outline"
                status={testKeyStatus}
                idleLabel="Kiểm thử kết nối"
                loadingLabel="Đang kiểm thử..."
                doneLabel="Kết nối OK!"
                icon={<Wifi className="h-4 w-4" />}
                disabled={byokBusy || !apiKeyInput.trim()}
                onClick={() => handleTestConnection("input")}
              />
              <MorphSubmitButton
                status={saveKeyStatus}
                idleLabel={
                  storageMode === "ephemeral"
                    ? "Lưu vào phiên trình duyệt"
                    : "Mã hóa & Lưu đồng bộ"
                }
                loadingLabel="Đang lưu khóa..."
                doneLabel="Đã lưu khóa!"
                icon={<Save className="h-4 w-4" />}
                disabled={byokBusy}
                onClick={handleSaveKey}
              />
            </div>
          </div>

          {/* Active Configured Keys */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Khóa đang hoạt động</h3>

            {ephemeralConfig && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ux-mint)]/30 bg-[var(--ux-mint-soft)] px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">
                    [Phiên trình duyệt]{" "}
                    {AI_PROVIDERS[ephemeralConfig.provider].name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Model: {ephemeralConfig.preferredModel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={byokBusy}
                    onClick={() =>
                      handleTestConnection(
                        "ephemeral",
                        ephemeralConfig.provider,
                        ephemeralConfig.baseUrl,
                        ephemeralConfig.preferredModel
                      )
                    }
                  >
                    Kiểm thử
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearEphemeral}
                    aria-label="Xóa khóa phiên trình duyệt"
                  >
                    <Trash2 className="h-4 w-4 text-[var(--ux-danger)]" />
                  </Button>
                </div>
              </div>
            )}

            {savedConfigs.length === 0 && !ephemeralConfig && (
              <p className="text-xs text-[var(--text-secondary)]">
                Chưa có API Key nào được gắn. Bạn vẫn học bình thường ở chế độ
                Offline 0đ.
              </p>
            )}

            {savedConfigs.map((cfg) => (
              <div
                key={cfg.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    [Đồng bộ AES-256-GCM] {AI_PROVIDERS[cfg.provider].name} ·{" "}
                    <span className="font-mono text-xs">{cfg.keyHint}</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Model: {cfg.preferredModel}
                    {cfg.baseUrl ? ` · ${cfg.baseUrl}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={byokBusy}
                    onClick={() =>
                      handleTestConnection(
                        "saved",
                        cfg.provider,
                        cfg.baseUrl,
                        cfg.preferredModel
                      )
                    }
                  >
                    Kiểm thử
                  </Button>
                  <HoldToDeleteButton
                    disabled={byokBusy}
                    onConfirm={() => handleDeleteSaved(cfg.provider)}
                    ariaLabel={`Giữ 1 giây để xóa khóa ${cfg.provider}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Data Subject Rights & Consent Evidence (Luật 91/2025 & NĐ 356/2025) */}
      <Card id="privacy-rights">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-[var(--ux-mint)]" />
              3. Quyền Dữ liệu Cá nhân &amp; Bằng chứng Đồng ý
            </CardTitle>
            <Badge variant="S">Luật 91/2025/QH15 &amp; NĐ 356/2025</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Xem lịch sử xác nhận điều khoản, rút lại đồng ý AI, tải bản sao dữ
            liệu hoặc xóa vĩnh viễn tài khoản theo Điều 4 &amp; Điều 10 Luật
            91/2025.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Withdrawal of AI third-party transfer consent */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)]/40 p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Quyền gửi dữ liệu sang AI bên thứ ba (BYOK)
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {aiConsentActive
                  ? "Đang cho phép. Khi rút lại đồng ý, toàn bộ API Key đồng bộ sẽ bị xóa ngay lập tức và chuyển về chế độ Offline 0đ."
                  : "Đang tắt. Tài khoản hoạt động hoàn toàn ở chế độ Offline 0đ, không gửi dữ liệu sang AI bên ngoài."}
              </p>
            </div>

            {aiConsentActive ? (
              <Button
                variant="outline"
                size="sm"
                disabled={privacyBusy}
                onClick={async () => {
                  setPrivacyBusy(true);
                  const ok = await syncAiConsentToServer(false);
                  if (ok) {
                    clearEphemeralByok();
                    setEphemeralConfig(null);
                    setAiConsentTick(false);
                    toast.info(
                      "Đã rút lại đồng ý AI",
                      "Các API Key BYOK đã được xóa sạch khỏi tài khoản."
                    );
                    router.refresh();
                  }
                  setPrivacyBusy(false);
                }}
              >
                Rút lại đồng ý AI
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled={privacyBusy}
                onClick={async () => {
                  setPrivacyBusy(true);
                  const ok = await syncAiConsentToServer(true);
                  if (ok) {
                    toast.success("Đã bật đồng ý BYOK AI");
                    router.refresh();
                  }
                  setPrivacyBusy(false);
                }}
              >
                Cấp lại đồng ý AI
              </Button>
            )}
          </div>

          {/* Consent Evidence Audit Trail */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold">
              Bằng chứng xác nhận đồng ý (Audit Log · Khoản 1, 2 Điều 6 NĐ 356/2025)
            </h3>
            {consentState.history.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">
                Chưa có bản ghi đồng ý nào được lưu cho tài khoản này.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                  <thead className="bg-[var(--bg-muted)] text-[var(--text-primary)]">
                    <tr>
                      <th className="p-2.5 font-semibold">Mục đích đồng ý</th>
                      <th className="p-2.5 font-semibold">Trạng thái</th>
                      <th className="p-2.5 font-semibold">Phiên bản</th>
                      <th className="p-2.5 font-semibold">Thời điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {consentState.history.slice(0, 12).map((row) => {
                      const label =
                        CONSENT_LABELS_VI[row.consentType as ConsentType] ??
                        row.consentType;
                      return (
                        <tr key={row.id}>
                          <td className="p-2.5 font-medium">{label}</td>
                          <td className="p-2.5">
                            <span
                              className={
                                row.accepted === 1
                                  ? "font-semibold text-[var(--ux-mint)]"
                                  : "font-semibold text-[var(--ux-warn)]"
                              }
                            >
                              {row.accepted === 1 ? "Đã đồng ý" : "Đã rút lại"}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[11px]">
                            {row.policyVersion}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-[var(--text-secondary)]">
                            {new Date(row.createdAt).toLocaleString("vi-VN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Data & Delete Account */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Xuất bản sao dữ liệu hoặc Xóa vĩnh viễn tài khoản
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Định dạng JSON chuẩn đọc máy; xóa tài khoản sẽ xóa toàn bộ hồ
                sơ, lịch sử làm bài và khóa BYOK.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/api/account/export"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold hover:bg-[var(--bg-muted)]"
              >
                <Download className="h-3.5 w-3.5" />
                Tải dữ liệu cá nhân (JSON)
              </a>

              <HoldToDeleteButton
                holdMs={1200}
                label="Giữ 1.2s để xóa tài khoản"
                ariaLabel="Giữ 1.2 giây để xóa vĩnh viễn tài khoản"
                disabled={privacyBusy}
                onConfirm={async () => {
                  setPrivacyBusy(true);
                  const res = await fetch("/api/account/delete", {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    clearEphemeralByok();
                    toast.info("Tài khoản và dữ liệu đã được xóa vĩnh viễn.");
                    window.location.assign("/");
                  } else {
                    toast.error("Không thể xóa tài khoản. Vui lòng thử lại.");
                    setPrivacyBusy(false);
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
