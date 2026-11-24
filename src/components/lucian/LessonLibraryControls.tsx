"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

export type LessonStatusFilter = "all" | "todo" | "done";
export type LessonBandFilter = "all" | "6.5" | "7.0" | "7.5";

interface LessonLibraryControlsProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: LessonStatusFilter;
  onStatusFilterChange: (val: LessonStatusFilter) => void;
  bandFilter: LessonBandFilter;
  onBandFilterChange: (val: LessonBandFilter) => void;
  totalFiltered: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  placeholderVi?: string;
}

export function LessonLibraryTopBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  bandFilter,
  onBandFilterChange,
  totalFiltered,
  placeholderVi = "Tìm theo tiêu đề, chủ đề hoặc từ khóa...",
}: Pick<
  LessonLibraryControlsProps,
  | "searchQuery"
  | "onSearchChange"
  | "statusFilter"
  | "onStatusFilterChange"
  | "bandFilter"
  | "onBandFilterChange"
  | "totalFiltered"
  | "placeholderVi"
>) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--ux-ink-3)]" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholderVi}
          aria-label="Tìm kiếm bài luyện"
          className="h-9 w-full rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)] pr-8 pl-9 text-xs text-[var(--ux-ink)] placeholder:text-[var(--ux-ink-3)] focus:border-[var(--ux-accent)] focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--ux-ink-3)] hover:text-[var(--ux-ink)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Lọc theo trạng thái hoàn thành"
          className="inline-flex rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)] p-0.5 text-[11px]"
        >
          {(
            [
              { value: "all", label: "Mọi trạng thái" },
              { value: "todo", label: "Chưa làm" },
              { value: "done", label: "Đã làm" },
            ] as const
          ).map((opt) => {
            const active = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusFilterChange(opt.value)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  active
                    ? "bg-[var(--ux-accent)] text-[var(--ux-accent-ink)]"
                    : "text-[var(--ux-ink-2)] hover:text-[var(--ux-ink)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <select
          aria-label="Lọc theo mức độ Band"
          value={bandFilter}
          onChange={(e) => onBandFilterChange(e.target.value as LessonBandFilter)}
          className="h-9 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)] px-2.5 text-xs font-medium text-[var(--ux-ink)] focus:border-[var(--ux-accent)] focus:outline-none"
        >
          <option value="all">Mọi Band</option>
          <option value="6.5">Band ~6.0–6.5</option>
          <option value="7.0">Band ~7.0</option>
          <option value="7.5">Band ~7.5–8.0</option>
        </select>

        <span className="font-mono text-xs text-[var(--ux-ink-3)]">
          {totalFiltered} bài
        </span>
      </div>
    </div>
  );
}

export function LessonLibraryPagination({
  currentPage,
  totalPages,
  totalFiltered,
  pageSize,
  onPageChange,
}: Pick<
  LessonLibraryControlsProps,
  "currentPage" | "totalPages" | "totalFiltered" | "pageSize" | "onPageChange"
>) {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(totalFiltered, currentPage * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] px-4 py-3 text-xs">
      <p className="text-[var(--ux-ink-2)]">
        Hiển thị{" "}
        <span className="font-mono font-semibold text-[var(--ux-ink)]">
          {startIdx}–{endIdx}
        </span>{" "}
        /{" "}
        <span className="font-mono font-semibold text-[var(--ux-ink)]">
          {totalFiltered}
        </span>{" "}
        bài học cục bộ
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)] px-3 font-medium text-[var(--ux-ink)] transition-colors hover:border-[var(--ux-line-2)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Trước
        </button>

        <span className="font-mono text-xs font-semibold text-[var(--ux-ink)]">
          Trang {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--ux-line)] bg-[var(--ux-surface-2)] px-3 font-medium text-[var(--ux-ink)] transition-colors hover:border-[var(--ux-line-2)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Sau
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function matchesBandBucket(
  difficultyBand: string,
  filter: LessonBandFilter
): boolean {
  if (filter === "all") return true;
  const num = Number.parseFloat(difficultyBand);
  if (!Number.isFinite(num)) return true;
  if (filter === "6.5") return num <= 6.5;
  if (filter === "7.0") return num > 6.5 && num <= 7.0;
  return num >= 7.5;
}
