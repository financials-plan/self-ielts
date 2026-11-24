"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Mic,
  Repeat2,
  Target,
} from "lucide-react";
import type {
  SpeakingAnxietyPoint,
  SpeakingLessonSummary,
} from "@/lib/db/speakingService";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { CountUpNumber } from "@/components/lucian/CountUpNumber";
import {
  LessonLibraryPagination,
  LessonLibraryTopBar,
  matchesBandBucket,
  type LessonBandFilter,
  type LessonStatusFilter,
} from "@/components/lucian/LessonLibraryControls";

interface SpeakingHubViewProps {
  lessons: SpeakingLessonSummary[];
  anxietyHistory: SpeakingAnxietyPoint[];
}

type SpeakingPartFilter = "all" | "1" | "2" | "3";

const PAGE_SIZE = 12;

export function SpeakingHubView({
  lessons,
  anxietyHistory,
}: SpeakingHubViewProps) {
  const [partFilter, setPartFilter] = useState<SpeakingPartFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonStatusFilter>("all");
  const [bandFilter, setBandFilter] = useState<LessonBandFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons.filter((l) => {
      if (partFilter !== "all" && String(l.partNumber) !== partFilter) {
        return false;
      }
      if (statusFilter === "done" && l.attemptsCount === 0) return false;
      if (statusFilter === "todo" && l.attemptsCount > 0) return false;
      if (!matchesBandBucket(l.difficultyBand, bandFilter)) return false;
      if (
        q &&
        !`${l.title} ${l.subtitleVi} ${l.partType}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [lessons, partFilter, statusFilter, bandFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleLessons = useMemo(
    () =>
      filteredLessons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredLessons, safePage]
  );
  const totalAttempts = lessons.reduce((acc, l) => acc + l.attemptsCount, 0);
  const totalRerecords = lessons.reduce((acc, l) => acc + l.rerecordCount, 0);
  const bestBands = lessons
    .map((l) => l.bestBandScore)
    .filter((b): b is number => typeof b === "number");
  const highestBand = bestBands.length > 0 ? Math.max(...bestBands) : 0;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="S">
              <Mic className="h-3 w-3" />
              Speaking Studio · Part 1–3
            </Badge>
            <Badge variant="neutral">Chung Academic &amp; General Training</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
            Luyện Nói KSA: Shadowing, Nháp 60s &amp; Giảm đứng hình
          </h1>
          <p className="max-w-2xl text-sm text-[var(--ux-ink-2)]">
            Tập nhại ngữ điệu theo ngắt cụm (/), ghi từ khóa 60 giây với Rescue
            Prompt cứu trợ khi bí ý, đo WPM và khoảng lặng &gt;1.5s hoàn toàn
            trên trình duyệt — thu lại Bản 2 để giảm lo âu và nâng Band.
          </p>
        </div>

        <SlidingPillTabs
          size="sm"
          ariaLabel="Lọc bài Speaking theo Part 1 đến Part 3"
          value={partFilter}
          onChange={(v) => {
            setPartFilter(v);
            setCurrentPage(1);
          }}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "1", label: "Part 1" },
            { value: "2", label: "Part 2 · Cue" },
            { value: "3", label: "Part 3" },
          ]}
        />
      </div>

      {/* Summary Ledger */}
      <div className="grid divide-y divide-[var(--ux-line)] overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-accent)]">
            <Mic className="h-3.5 w-3.5" />
            Lượt thu âm Speaking
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={totalAttempts} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              bài thực hành Part 1–3
            </span>
          </p>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-mint)]">
            <Repeat2 className="h-3.5 w-3.5" />
            Lượt thu lại Bản 2 (A)
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={totalRerecords} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              vòng Re-record nâng độ trôi chảy
            </span>
          </p>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-warn)]">
            <Target className="h-3.5 w-3.5" />
            Band Speaking ước tính cao nhất
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            {highestBand > 0 ? highestBand.toFixed(1) : "—"}
            <span className="ml-1.5 font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              (IndexedDB 0đ + BYOK AI)
            </span>
          </p>
        </div>
      </div>

      {/* Speaking Anxiety Tracker (A) */}
      <div className="rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-[var(--ux-warn)]" />
            <h2 className="font-display text-base font-semibold text-[var(--ux-ink)]">
              Biểu đồ Giảm lo âu khi nói (Speaking Anxiety Tracker · A)
            </h2>
          </div>
          <span className="text-[11px] text-[var(--ux-ink-3)]">
            Thang 1 (Bình tĩnh) → 5 (Rất hồi hộp)
          </span>
        </div>

        {anxietyHistory.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--ux-ink-2)]">
            Chưa có dữ liệu lo âu trước khi nói. Chọn một bài Part 1–3 bên dưới
            để ghi nhận cảm giác trước mỗi lượt nói.
          </p>
        ) : (
          <div className="mt-4 flex items-end gap-2.5 overflow-x-auto pb-1">
            {anxietyHistory.slice(-10).map((pt, idx) => {
              const hPct = Math.max(20, pt.anxietyBefore * 20);
              const tone =
                pt.anxietyBefore <= 2
                  ? "bg-[var(--ux-mint)]"
                  : pt.anxietyBefore === 3
                    ? "bg-[var(--ux-accent)]"
                    : "bg-[var(--ux-warn)]";
              return (
                <div
                  key={`${pt.createdAt}-${idx}`}
                  className="flex min-w-[44px] flex-col items-center gap-1 text-center"
                >
                  <span className="font-mono text-[10px] text-[var(--ux-ink-2)]">
                    {pt.wpm > 0 ? `${pt.wpm}w` : ""}
                  </span>
                  <div className="flex h-20 w-7 items-end rounded-md bg-[var(--ux-surface-2)] p-1">
                    <div
                      className={`w-full rounded-sm ${tone}`}
                      style={{ height: `${hPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[var(--ux-ink)]">
                    {pt.anxietyBefore}/5
                  </span>
                  <span className="text-[10px] text-[var(--ux-ink-3)]">
                    P{pt.partNumber}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <LessonLibraryTopBar
        searchQuery={searchQuery}
        onSearchChange={(v) => {
          setSearchQuery(v);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }}
        bandFilter={bandFilter}
        onBandFilterChange={(v) => {
          setBandFilter(v);
          setCurrentPage(1);
        }}
        totalFiltered={filteredLessons.length}
        placeholderVi="Tìm đề Speaking (Part 1, Cue Card 60s, Discussion Part 3...)"
      />

      {/* Lesson Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {visibleLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col justify-between rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 transition-colors hover:border-[var(--ux-line-2)]"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="K">{lesson.partType}</Badge>
                <span className="font-mono text-xs font-semibold text-[var(--ux-ink-2)]">
                  Band ~{lesson.difficultyBand}
                </span>
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--ux-ink)]">
                  {lesson.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ux-ink-2)]">
                  {lesson.subtitleVi}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {lesson.ksaFocus.map((dim) => (
                  <KsaBadge key={dim} dimension={dim} />
                ))}
              </div>

              <p className="font-mono text-[11px] text-[var(--ux-ink-3)]">
                {lesson.shadowingCount} câu Shadowing · {lesson.promptCount} đề
                luyện nói
              </p>
            </div>

            <div className="mt-5 space-y-3 border-t border-[var(--ux-line)] pt-4">
              {lesson.attemptsCount > 0 ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[var(--ux-mint)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {lesson.attemptsCount} lượt ({lesson.rerecordCount} Bản 2)
                  </span>
                  <span className="font-mono font-semibold text-[var(--ux-ink)]">
                    Cao nhất: {lesson.bestBandScore?.toFixed(1) ?? "—"}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[var(--ux-ink-3)]">
                  Khuyên dùng: nghe Shadowing trước rồi thu âm Mock Examiner.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/speaking/${lesson.id}?mode=shadowing`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--ux-accent)] px-3 text-xs font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
                >
                  Vào Studio
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/speaking/${lesson.id}?mode=mock_exam`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
                >
                  Mock Exam
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <LessonLibraryPagination
        currentPage={safePage}
        totalPages={totalPages}
        totalFiltered={filteredLessons.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
