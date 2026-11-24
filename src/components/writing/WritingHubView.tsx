"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  PenTool,
  Repeat2,
  Target,
} from "lucide-react";
import type { WritingLessonSummary } from "@/lib/db/writingService";
import type { IeltsTrack } from "@/lib/ksa/bandCalculator";
import { WRITING_TASK_LABELS_VI } from "@/lib/writing/writingEngine";
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

interface WritingHubViewProps {
  lessons: WritingLessonSummary[];
  defaultTrack: IeltsTrack;
}

type WritingFilter = "my_track" | "all" | "academic" | "general";

const PAGE_SIZE = 12;

export function WritingHubView({
  lessons,
  defaultTrack,
}: WritingHubViewProps) {
  const [filter, setFilter] = useState<WritingFilter>("my_track");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonStatusFilter>("all");
  const [bandFilter, setBandFilter] = useState<LessonBandFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const target = filter === "my_track" ? defaultTrack : filter;
    return lessons.filter((l) => {
      if (filter !== "all" && l.track !== "shared" && l.track !== target) {
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
  }, [lessons, filter, defaultTrack, statusFilter, bandFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleLessons = useMemo(
    () =>
      filteredLessons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredLessons, safePage]
  );

  const totalAttempts = lessons.reduce((acc, l) => acc + l.attemptsCount, 0);
  const totalDraft2 = lessons.reduce((acc, l) => acc + l.draft2Count, 0);
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
              <PenTool className="h-3 w-3" />
              Writing 4-Stage Studio
            </Badge>
            <TrackBadge track={defaultTrack} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
            Xưởng viết 4 chặng: Bóc đề, Dàn ý, Nháp &amp; Tự rà lỗi
          </h1>
          <p className="max-w-2xl text-sm text-[var(--ux-ink-2)]">
            Vượt nỗi sợ trang giấy trắng theo quy trình Deconstruct → Outline +
            Idea Spark → Timed Draft → Self-Audit. Phân tích lặp từ &amp; câu
            phức chạy Offline 0đ; gắn thêm Gemini hoặc Groq Free khi muốn nhận
            Inline Diff nâng Band và viết lại Draft 2.
          </p>
        </div>

        <SlidingPillTabs
          size="sm"
          ariaLabel="Lọc đề Writing theo hệ thi"
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setCurrentPage(1);
          }}
          options={[
            {
              value: "my_track",
              label: defaultTrack === "general" ? "Hệ GT của tôi" : "Hệ Academic của tôi",
            },
            { value: "all", label: "Tất cả" },
            { value: "academic", label: "Academic" },
            { value: "general", label: "General Training" },
          ]}
        />
      </div>

      {/* Summary Ledger */}
      <div className="grid divide-y divide-[var(--ux-line)] overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-accent)]">
            <FileText className="h-3.5 w-3.5" />
            Bài viết đã nộp
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={totalAttempts} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              bài thực hành
            </span>
          </p>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-mint)]">
            <Repeat2 className="h-3.5 w-3.5" />
            Vòng sửa bài Draft 2 (A)
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={totalDraft2} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              bài đã viết lại nâng Band
            </span>
          </p>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-warn)]">
            <Target className="h-3.5 w-3.5" />
            Band Writing ước tính cao nhất
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            {highestBand > 0 ? highestBand.toFixed(1) : "—"}
            <span className="ml-1.5 font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              (NLP 0đ + Model 8.0)
            </span>
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
        placeholderVi="Tìm đề Writing (Task 1 Chart, GT Letter, Task 2 Essay...)"
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
                  {lesson.track === "shared" ? (
                    <Badge variant="neutral">Chung Academic &amp; GT</Badge>
                  ) : (
                    <TrackBadge track={lesson.track} />
                  )}
                  <Badge variant="K">
                    {WRITING_TASK_LABELS_VI[lesson.taskType]}
                  </Badge>
                </div>
                <span className="font-mono text-xs font-semibold text-[var(--ux-ink-2)]">
                  Mục tiêu ~{lesson.difficultyBand}
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

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {lesson.ksaFocus.map((dim) => (
                  <KsaBadge key={dim} dimension={dim} />
                ))}
                <span className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-[var(--ux-ink-3)]">
                  <Clock className="h-3 w-3" />
                  &ge;{lesson.minWords} từ · {lesson.recommendedMinutes} phút
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-[var(--ux-line)] pt-4">
              {lesson.attemptsCount > 0 ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[var(--ux-mint)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã viết {lesson.attemptsCount} lượt ({lesson.draft2Count}{" "}
                    Draft 2)
                  </span>
                  <span className="font-mono font-semibold text-[var(--ux-ink)]">
                    Cao nhất: Band {lesson.bestBandScore?.toFixed(1) ?? "—"}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[var(--ux-ink-3)]">
                  Đi từng bước Bóc đề → Lập dàn ý + Idea Spark → Viết nháp →
                  Tự kiểm tra 4 tiêu chí.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/writing/${lesson.id}?mode=guided`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--ux-accent)] px-3.5 text-xs font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
                >
                  Guided 4 Chặng
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/writing/${lesson.id}?mode=drill`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
                >
                  Drill
                </Link>
                <Link
                  href={`/writing/${lesson.id}?mode=exam`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
                >
                  Exam Timer
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
