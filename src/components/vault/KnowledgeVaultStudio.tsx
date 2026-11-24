"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Layers,
  Plus,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { KnowledgeCard } from "@/db/schema";
import {
  resolveAudioClipFromRef,
  speakListeningSegment,
  stopSpeechPlayback,
} from "@/lib/listening/speechPlayer";
import {
  CARD_TYPE_LABELS_VI,
  SKILL_LABELS_VI,
  type CardType,
  type IeltsSkill,
} from "@/lib/ksa/errorTaxonomy";
import {
  formatIntervalVi,
  previewSrsIntervals,
  type SrsRating,
} from "@/lib/ksa/srs";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { FlipFlashcard } from "@/components/lucian/FlipFlashcard";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { CopyChipButton } from "@/components/lucian/CopyChipButton";
import { CountUpNumber } from "@/components/lucian/CountUpNumber";
import { HoldToDeleteButton } from "@/components/lucian/HoldToDeleteButton";
import { useToast } from "@/components/lucian/ToastProvider";

interface KnowledgeVaultStudioProps {
  initialCards: KnowledgeCard[];
  initialNowMs: number;
}

const RATING_CONFIG: Array<{
  rating: SrsRating;
  shortcut: string;
  label: string;
  toneClass: string;
}> = [
  {
    rating: "again",
    shortcut: "1",
    label: "Quên · Lại",
    toneClass:
      "border-[var(--ux-danger)]/40 bg-[var(--ux-danger-soft)] text-[var(--ux-danger)]",
  },
  {
    rating: "hard",
    shortcut: "2",
    label: "Khó",
    toneClass:
      "border-[var(--ux-warn)]/40 bg-[var(--ux-warn-soft)] text-[var(--ux-warn)]",
  },
  {
    rating: "good",
    shortcut: "3",
    label: "Nhớ tốt",
    toneClass:
      "border-[var(--ux-accent)]/40 bg-[var(--ux-accent-soft)] text-[var(--ux-accent)]",
  },
  {
    rating: "easy",
    shortcut: "4",
    label: "Rất dễ",
    toneClass:
      "border-[var(--ux-mint)]/40 bg-[var(--ux-mint-soft)] text-[var(--ux-mint)]",
  },
];

export function KnowledgeVaultStudio({
  initialCards,
  initialNowMs,
}: KnowledgeVaultStudioProps) {
  const router = useRouter();
  const toast = useToast();

  const [cards, setCards] = useState<KnowledgeCard[]>(initialCards);
  const [nowMs, setNowMs] = useState<number>(initialNowMs);
  const [skillFilter, setSkillFilter] = useState<"all" | IeltsSkill>("all");
  const [flipped, setFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);

  useEffect(() => {
    return () => stopSpeechPlayback();
  }, []);

  function handleToggleReplayClip(cardId: string, audioClipRef: string) {
    if (playingClipId === cardId) {
      stopSpeechPlayback();
      setPlayingClipId(null);
      return;
    }
    const resolved = resolveAudioClipFromRef(audioClipRef);
    if (!resolved) {
      toast.info("Không tìm thấy đoạn audio tương ứng trong thư viện.");
      return;
    }
    setPlayingClipId(cardId);
    speakListeningSegment(resolved.segment, 0.95, () => {
      setPlayingClipId(null);
    });
  }

  // Create card state
  const [newSkill, setNewSkill] = useState<IeltsSkill>("reading");
  const [newType, setNewType] = useState<CardType>("paraphrase");
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [createStatus, setCreateStatus] = useState<MorphStatus>("idle");
  const [seedStatus, setSeedStatus] = useState<MorphStatus>("idle");

  const dueQueue = useMemo(() => {
    return cards
      .filter((c) => c.nextReviewAt <= nowMs)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }, [cards, nowMs]);

  const activeCard = dueQueue[0] ?? null;
  const masteredCount = useMemo(
    () => cards.filter((c) => c.repetitions >= 2).length,
    [cards]
  );

  const filteredCards = useMemo(() => {
    if (skillFilter === "all") return cards;
    return cards.filter((c) => c.skill === skillFilter);
  }, [cards, skillFilter]);

  const previews = useMemo(() => {
    if (!activeCard) return null;
    return previewSrsIntervals({
      intervalDays: activeCard.intervalDays,
      easeFactor: activeCard.easeFactor,
      repetitions: activeCard.repetitions,
    });
  }, [activeCard]);

  const handleReview = useCallback(
    async (rating: SrsRating) => {
      if (!activeCard || reviewing) return;
      setReviewing(true);
      try {
        const res = await fetch("/api/vault/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: activeCard.id, rating }),
        });
        const data = (await res.json()) as {
          card?: KnowledgeCard;
          error?: string;
        };
        if (!res.ok || !data.card) {
          throw new Error(data.error || "Không thể lưu lượt ôn thẻ.");
        }
        const updatedCard = data.card;
        setCards((prev) =>
          prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
        );
        setNowMs(Date.now());
        setFlipped(false);
        toast.success(
          "Đã lên lịch ôn lại",
          `Thẻ sẽ quay lại sau ${formatIntervalVi(updatedCard.intervalDays)}.`
        );
        router.refresh();
      } catch (err) {
        toast.error(
          "Lỗi ôn thẻ",
          err instanceof Error ? err.message : "Vui lòng thử lại."
        );
      } finally {
        setReviewing(false);
      }
    },
    [activeCard, reviewing, toast, router]
  );

  // Keyboard shortcuts during active SRS session (Space to flip, 1-4 to rate)
  useEffect(() => {
    if (!activeCard) return;
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        if (e.key === "1") void handleReview("again");
        else if (e.key === "2") void handleReview("hard");
        else if (e.key === "3") void handleReview("good");
        else if (e.key === "4") void handleReview("easy");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCard, flipped, handleReview]);

  async function handleSeedStarter() {
    setSeedStatus("loading");
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedStarter: true }),
      });
      const data = (await res.json()) as {
        insertedCount?: number;
        cards?: KnowledgeCard[];
        error?: string;
      };
      if (!res.ok || !data.cards) {
        throw new Error(data.error || "Không thể nạp bộ thẻ mẫu.");
      }
      setCards(data.cards);
      setNowMs(Date.now());
      setSeedStatus("done");
      toast.success(
        `Đã nạp ${data.insertedCount ?? 0} thẻ mẫu KSA`,
        "Sẵn sàng ôn tập ngay ở bên dưới."
      );
      setTimeout(() => setSeedStatus("idle"), 1600);
      router.refresh();
    } catch (err) {
      setSeedStatus("error");
      toast.error(
        "Nạp thẻ mẫu thất bại",
        err instanceof Error ? err.message : "Vui lòng thử lại."
      );
    }
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus("loading");
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: newSkill,
          cardType: newType,
          front: newFront.trim(),
          back: newBack.trim(),
        }),
      });
      const data = (await res.json()) as {
        card?: KnowledgeCard;
        error?: string;
      };
      if (!res.ok || !data.card) {
        throw new Error(data.error || "Không thể tạo thẻ mới.");
      }
      setCards((prev) => [data.card!, ...prev]);
      setNewFront("");
      setNewBack("");
      setCreateStatus("done");
      toast.success("Đã lưu thẻ vào Knowledge Vault");
      setTimeout(() => setCreateStatus("idle"), 1500);
      router.refresh();
    } catch (err) {
      setCreateStatus("error");
      toast.error(
        "Tạo thẻ thất bại",
        err instanceof Error ? err.message : "Vui lòng kiểm tra nội dung."
      );
    }
  }

  async function handleDeleteCard(id: string) {
    const res = await fetch("/api/vault", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.info("Đã xóa thẻ SRS");
      router.refresh();
    } else {
      toast.error("Không thể xóa thẻ");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="K">
              <Layers className="h-3 w-3" />
              Thẻ ghi nhớ giãn cách SM-2
            </Badge>
            <Badge variant="free">Miễn phí 0đ</Badge>
          </div>
          <h1 className="font-display text-2xl font-medium text-[var(--ux-ink)] sm:text-3xl">
            Kho Kiến thức SRS cho 4 Kỹ năng
          </h1>
          <p className="text-sm text-[var(--ux-ink-2)]">
            Gom nối âm Listening, cặp Paraphrase Reading, Collocation Writing và
            cụm mở ý Speaking vào một lịch ôn giãn cách thông minh.
          </p>
        </div>

        <MorphSubmitButton
          variant="outline"
          status={seedStatus}
          idleLabel="Nạp 8 thẻ mẫu KSA"
          loadingLabel="Đang nạp..."
          doneLabel="Đã nạp xong!"
          icon={<Sparkles className="h-4 w-4 text-[var(--ux-accent)]" />}
          onClick={handleSeedStarter}
        />
      </div>

      {/* KPI Summary Ledger */}
      <div className="grid grid-cols-3 divide-x divide-[var(--ux-line)] overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)]">
        <div className="p-4 sm:p-5">
          <p className="text-xs text-[var(--ux-ink-2)]">Tổng số thẻ</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={cards.length} />
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-[var(--ux-ink-2)]">Đến hạn hôm nay</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-accent)]">
            <CountUpNumber value={dueQueue.length} />
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-[var(--ux-ink-2)]">Đã thành thạo</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ux-mint)]">
            <CountUpNumber value={masteredCount} />
          </p>
        </div>
      </div>

      {/* Active SRS Review Deck */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">
              Phiên ôn tập hôm nay ({dueQueue.length} thẻ chờ)
            </CardTitle>
            {activeCard && (
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                Lặp: {activeCard.repetitions} · EF{" "}
                {activeCard.easeFactor.toFixed(2)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeCard ? (
            <>
              <FlipFlashcard
                skillLabel={
                  SKILL_LABELS_VI[activeCard.skill as IeltsSkill] ??
                  activeCard.skill
                }
                cardTypeLabel={
                  CARD_TYPE_LABELS_VI[activeCard.cardType as CardType] ??
                  activeCard.cardType
                }
                front={activeCard.front}
                back={activeCard.back}
                flipped={flipped}
                onToggleFlip={() => setFlipped((f) => !f)}
              />

              {activeCard.audioClipRef &&
                resolveAudioClipFromRef(activeCard.audioClipRef) && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleReplayClip(
                          activeCard.id,
                          activeCard.audioClipRef!
                        )
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--ux-accent)]/40 bg-[var(--ux-accent-soft)] px-4 text-xs font-semibold text-[var(--ux-accent)] hover:brightness-95 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      {playingClipId === activeCard.id
                        ? "Dừng phát đoạn Audio (0-byte)"
                        : "▶ Nghe mẫu nối âm / bẫy (0-byte clip)"}
                    </button>
                  </div>
                )}

              {flipped && previews ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {RATING_CONFIG.map((item) => (
                    <button
                      key={item.rating}
                      type="button"
                      disabled={reviewing}
                      onClick={() => handleReview(item.rating)}
                      className={`flex flex-col items-center justify-center rounded-lg border px-3 py-2.5 text-center transition-transform active:scale-95 cursor-pointer disabled:opacity-50 ${item.toneClass}`}
                    >
                      <span className="text-xs font-bold">
                        [{item.shortcut}] {item.label}
                      </span>
                      <span className="mt-0.5 font-mono text-[11px] opacity-85">
                        {previews[item.rating]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setFlipped(true)}
                    className="h-10 rounded-lg bg-[var(--ux-accent)] px-6 text-sm font-semibold text-[var(--ux-accent-ink)] hover:brightness-110 cursor-pointer"
                  >
                    Lật xem đáp án (Space)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--ux-line-2)] bg-[var(--ux-surface-2)]/40 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-[var(--ux-mint)]" />
              <p className="text-sm font-semibold">
                {cards.length === 0
                  ? "Kho SRS đang trống — hãy bấm 'Nạp 8 thẻ mẫu KSA' hoặc tự tạo thẻ đầu tiên!"
                  : "Tuyệt vời! Bạn đã hoàn thành toàn bộ thẻ đến hạn hôm nay."}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Các thẻ sẽ tự động xuất hiện lại đúng ngày đến chu kỳ ôn tập.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm thẻ Kiến thức mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kỹ năng</label>
                <select
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value as IeltsSkill)}
                  className="h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-sm"
                >
                  <option value="listening">Listening (Nghe)</option>
                  <option value="reading">Reading (Đọc)</option>
                  <option value="writing">Writing (Viết)</option>
                  <option value="speaking">Speaking (Nói)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Loại thẻ</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as CardType)}
                  className="h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-sm"
                >
                  {(Object.keys(CARD_TYPE_LABELS_VI) as CardType[]).map((t) => (
                    <option key={t} value={t}>
                      {CARD_TYPE_LABELS_VI[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Mặt trước (Từ khóa / Câu hỏi / Cụm gốc)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Passage: 'reluctant to adopt' ↔ Question: ?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-3 text-sm focus:border-[var(--ux-accent)] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Mặt sau (Giải thích / Paraphrase / Mẹo nhớ)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: 'unwilling to embrace' / 'hesitant to implement' (Synonym paraphrase)."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-3 text-sm focus:border-[var(--ux-accent)] focus:outline-none"
                />
              </div>
            </div>

            <MorphSubmitButton
              type="submit"
              status={createStatus}
              idleLabel="Lưu thẻ vào Knowledge Vault"
              loadingLabel="Đang lưu..."
              doneLabel="Đã thêm thẻ!"
              icon={<Plus className="h-4 w-4" />}
            />
          </form>
        </CardContent>
      </Card>

      {/* Card Library */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <CardTitle className="text-lg">
              Thư viện thẻ ({filteredCards.length})
            </CardTitle>
            <SlidingPillTabs
              size="sm"
              ariaLabel="Lọc thẻ SRS theo kỹ năng"
              value={skillFilter}
              onChange={setSkillFilter}
              options={[
                { value: "all", label: "Tất cả" },
                { value: "listening", label: "Listening" },
                { value: "reading", label: "Reading" },
                { value: "writing", label: "Writing" },
                { value: "speaking", label: "Speaking" },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCards.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
              Chưa có thẻ nào trong nhóm này.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredCards.map((card) => {
                const isDue = card.nextReviewAt <= nowMs;
                const dueDateStr = new Date(card.nextReviewAt)
                  .toISOString()
                  .slice(0, 10);
                return (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="K">
                          {SKILL_LABELS_VI[card.skill as IeltsSkill] ??
                            card.skill}
                        </Badge>
                        <Badge variant="neutral">
                          {CARD_TYPE_LABELS_VI[card.cardType as CardType] ??
                            card.cardType}
                        </Badge>
                        <Badge variant={isDue ? "A" : "S"}>
                          {isDue ? "Đến hạn ôn" : `Ôn lại: ${dueDateStr}`}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">{card.front}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {card.back}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {card.audioClipRef &&
                        resolveAudioClipFromRef(card.audioClipRef) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleReplayClip(
                                card.id,
                                card.audioClipRef!
                              )
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--ux-accent)]/35 bg-[var(--ux-accent-soft)] px-2.5 text-xs font-semibold text-[var(--ux-accent)] hover:brightness-95 cursor-pointer"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            {playingClipId === card.id ? "Dừng" : "Nghe 0-byte"}
                          </button>
                        )}
                      <CopyChipButton text={`${card.front}\n${card.back}`} />
                      <HoldToDeleteButton
                        onConfirm={() => handleDeleteCard(card.id)}
                        ariaLabel="Giữ 1 giây để xóa thẻ SRS"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
