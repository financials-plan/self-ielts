"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Headphones,
  Layers,
  MapPin,
  Target,
} from "lucide-react";
import type { ListeningLessonSummary } from "@/lib/db/listeningService";
import { QUESTION_TYPE_LABELS_VI } from "@/lib/listening/listeningEngine";
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

interface ListeningHubViewProps {
  lessons: ListeningLessonSummary[];
}

type PartFilter = "all" | "1" | "2" | "3" | "4";

const PAGE_SIZE = 12;

export function ListeningHubView({ lessons }: ListeningHubViewProps) {
  const [partFilter, setPartFilter] = useState<PartFilter>("all");
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

  const completedCount = lessons.filter((l) => l.attemptsCount > 0).length;
  const totalAttempts = lessons.reduce((acc, l) => acc + l.attemptsCount, 0);
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
              <Headphones className="h-3 w-3" />
              Listening Studio · 4 Parts
            </Badge>
            <Badge variant="neutral">Chung Academic &amp; General Training</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
            Luyện Nghe KSA: Dự đoán, Bám nhịp &amp; Soi bẫy Distractor
          </h1>
          <p className="max-w-2xl text-sm text-[var(--ux-ink-2)]">
            Khóa bước dự đoán loại từ 30 giây trước khi nghe, nút Let-go &amp;
            Re-anchor chống mất chuỗi câu, soi transcript X-Ray 3 lớp, Dictation
            Lab bắt lỗi đuôi -s/-ed và lưu Audio Flashcard 0 byte.
          </p>
        </div>

        <SlidingPillTabs
          size="sm"
          ariaLabel="Lọc bài nghe theo Part 1 đến Part 4"
          value={partFilter}
          onChange={(v) => {
            setPartFilter(v);
            setCurrentPage(1);
          }}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "1", label: "Part 1" },
            { value: "2", label: "Part 2 · Map" },
            { value: "3", label: "Part 3" },
            { value: "4", label: "Part 4" },
          ]}
        />
      </div>

      {/* Summary Ledger */}
      <div className="grid divide-y divide-[var(--ux-line)] overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-accent)]">
            <Layers className="h-3.5 w-3.5" />
            Tiến độ 4 Part Listening
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={completedCount} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              / {lessons.length} phần đã luyện
            </span>
          </p>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-mint)]">
            <Target className="h-3.5 w-3.5" />
            Band Listening cao nhất
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
            Chuẩn nghe 1 lần (One-Shot)
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--ux-ink-2)]">
            <span className="font-mono font-semibold text-[var(--ux-ink)]">
              30/40
            </span>{" "}
            = Band{" "}
            <span className="font-mono font-semibold text-[var(--ux-ink)]">
              7.0
            </span>{" "}
            · Chế độ Exam Mode khóa tua lại đúng chuẩn phòng thi thật.
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
        placeholderVi="Tìm bài Listening (Map, Dialogue, Seminar, Lecture...)"
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
                  <Badge variant="K">{lesson.partType}</Badge>
                  {lesson.hasMap && (
                    <Badge variant="S">
                      <MapPin className="h-3 w-3" />
                      Map Spatial Trainer
                    </Badge>
                  )}
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
                <span className="rounded-md border border-[var(--ux-line)] bg-[var(--ux-surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--ux-ink-2)]">
                  {lesson.dictationCount} bài Dictation Lab
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {lesson.ksaFocus.map((dim) => (
                  <KsaBadge key={dim} dimension={dim} />
                ))}
                <span className="ml-auto font-mono text-[11px] text-[var(--ux-ink-3)]">
                  {lesson.questionCount} câu · ~
                  {Math.ceil(lesson.durationSec / 60)} phút audio
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-[var(--ux-line)] pt-4">
              {lesson.attemptsCount > 0 ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[var(--ux-mint)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã hoàn thành {lesson.attemptsCount} lượt
                  </span>
                  <span className="font-mono font-semibold text-[var(--ux-ink)]">
                    Cao nhất: Band {lesson.bestBandScore?.toFixed(1) ?? "—"}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[var(--ux-ink-3)]">
                  Bắt đầu bằng Guided Mode để mở Pre-listening Gate &amp; theo
                  dõi transcript theo từng đoạn.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/listening/${lesson.id}?mode=guided`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--ux-accent)] px-3.5 text-xs font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
                >
                  Guided Mode
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/listening/${lesson.id}?mode=drill`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
                >
                  Drill
                </Link>
                <Link
                  href={`/listening/${lesson.id}?mode=exam`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-xs font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
                >
                  One-Shot Exam
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
