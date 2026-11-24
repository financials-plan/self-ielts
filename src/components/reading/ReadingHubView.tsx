"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Target,
} from "lucide-react";
import type { ReadingLessonSummary } from "@/lib/db/readingService";
import { QUESTION_TYPE_LABELS_VI } from "@/lib/reading/readingEngine";
import type { IeltsTrack } from "@/lib/ksa/bandCalculator";
import { Badge, KsaBadge, TrackBadge } from "@/components/ui/Badge";
import { SlidingPillTabs } from "@/components/lucian/SlidingPillTabs";
import { CountUpNumber } from "@/components/lucian/CountUpNumber";
import {
  LessonLibraryPagination,
  LessonLibraryTopBar,
  matchesBandBucket,
  type LessonBandFilter,
  type LessonStatusFilter,
} from "@/components/lucian/LessonLibraryControls";

interface ReadingHubViewProps {
  lessons: ReadingLessonSummary[];
  defaultTrack: IeltsTrack;
}

type TrackFilter = "all" | "academic" | "general";

const PAGE_SIZE = 12;

export function ReadingHubView({ lessons, defaultTrack }: ReadingHubViewProps) {
  const [filter, setFilter] = useState<TrackFilter>(defaultTrack);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonStatusFilter>("all");
  const [bandFilter, setBandFilter] = useState<LessonBandFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons.filter((l) => {
      if (filter !== "all" && l.track !== filter) return false;
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
  }, [lessons, filter, statusFilter, bandFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleLessons = useMemo(
    () =>
      filteredLessons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredLessons, safePage]
  );

  const totalAttempts = lessons.reduce((acc, l) => acc + l.attemptsCount, 0);
  const completedLessons = lessons.filter((l) => l.attemptsCount > 0).length;
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
              <BookOpen className="h-3 w-3" />
              Reading Studio · CD-IELTS
            </Badge>
            <TrackBadge track={defaultTrack} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
            Luyện Đọc hiểu tách biệt Academic &amp; General Training
          </h1>
          <p className="max-w-2xl text-sm text-[var(--ux-ink-2)]">
            Màn hình chia đôi chuẩn thi máy tính, bắt buộc ghim câu bằng chứng
            trước khi chốt đáp án, bóc tách logic T/F/NG và lưu cầu nối
            Paraphrase thẳng vào Kho thẻ SRS.
          </p>
        </div>

        <SlidingPillTabs
          size="sm"
          ariaLabel="Lọc bài đọc theo hệ thi IELTS"
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setCurrentPage(1);
          }}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "academic", label: "IELTS Academic" },
            { value: "general", label: "General Training" },
          ]}
        />
      </div>

      {/* Summary Ledger */}
      <div className="grid divide-y divide-[var(--ux-line)] overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-accent)]">
            <Layers className="h-3.5 w-3.5" />
            Bài đọc trong thư viện
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={completedLessons} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              / {lessons.length} bài đã làm thử
            </span>
          </p>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-mint)]">
            <Target className="h-3.5 w-3.5" />
            Band Reading cao nhất
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            {highestBand > 0 ? highestBand.toFixed(1) : "—"}
            <span className="ml-1.5 font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              ({totalAttempts} lượt nộp bài)
            </span>
          </p>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-warn)]">
            <Clock className="h-3.5 w-3.5" />
            Quy đổi Band 7.0 theo hệ
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--ux-ink-2)]">
            <span className="font-mono font-semibold text-[var(--ux-ink)]">
              30/40
            </span>{" "}
            (Academic) ·{" "}
            <span className="font-mono font-semibold text-[var(--ux-ink)]">
              34/40
            </span>{" "}
            (General Training)
          </p>
        </div>
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
        placeholderVi="Tìm đề Reading (Academic Passage, GT Section, từ khóa...)"
      />

      {/* Lesson Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {visibleLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col justify-between rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 transition-colors hover:border-[var(--ux-line-2)] sm:p-6"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <TrackBadge track={lesson.track} />
                  <Badge variant="neutral">{lesson.partType}</Badge>
                </div>
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

              <div className="flex flex-wrap gap-1.5">
                {lesson.questionTypes.map((qt) => (
                  <span
                    key={qt}
                    className="rounded-md border border-[var(--ux-line)] bg-[var(--ux-surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--ux-ink-2)]"
                  >
                    {QUESTION_TYPE_LABELS_VI[qt]}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {lesson.ksaFocus.map((dim) => (
                  <KsaBadge key={dim} dimension={dim} />
                ))}
                <span className="ml-auto font-mono text-[11px] text-[var(--ux-ink-3)]">
                  {lesson.questionCount} câu · {lesson.recommendedMinutes} phút
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-[var(--ux-line)] pt-4">
              {lesson.attemptsCount > 0 ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[var(--ux-mint)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã làm {lesson.attemptsCount} lượt
                  </span>
                  <span className="font-mono font-semibold text-[var(--ux-ink)]">
                    Cao nhất: Band {lesson.bestBandScore?.toFixed(1) ?? "—"}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[var(--ux-ink-3)]">
                  Chưa có lượt làm bài — gợi ý bắt đầu bằng Guided Mode để làm
                  quen ghim bằng chứng.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/reading/${lesson.id}?mode=guided`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--ux-accent)] px-3.5 text-xs font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
                >
                  Guided Mode
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/reading/${lesson.id}?mode=drill`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
                >
                  Drill
                </Link>
                <Link
                  href={`/reading/${lesson.id}?mode=exam`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
                >
                  Exam
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
