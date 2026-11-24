"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  RotateCcw,
} from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { errorLogs } from "@/db/schema";
import {
  ERROR_TAXONOMY,
  SKILL_LABELS_VI,
  type IeltsSkill,
  type KsaDimension,
} from "@/lib/ksa/errorTaxonomy";
import {
  buildBottleneckMatrix,
} from "@/lib/ksa/ksaScoring";
import { Badge, KsaBadge } from "@/components/ui/Badge";
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

type ErrorLogRow = InferSelectModel<typeof errorLogs>;

interface ErrorJournalStudioProps {
  initialErrors: ErrorLogRow[];
  initialSkillFilter?: string;
  initialDimFilter?: string;
}

const SKILLS: IeltsSkill[] = ["listening", "reading", "writing", "speaking"];
const DIMS: KsaDimension[] = ["K", "S", "A"];

export function ErrorJournalStudio({
  initialErrors,
  initialSkillFilter,
  initialDimFilter,
}: ErrorJournalStudioProps) {
  const router = useRouter();
  const toast = useToast();

  const [errors, setErrors] = useState<ErrorLogRow[]>(initialErrors);
  const [filterSkill, setFilterSkill] = useState<"all" | IeltsSkill>(
    SKILLS.includes(initialSkillFilter as IeltsSkill)
      ? (initialSkillFilter as IeltsSkill)
      : "all"
  );
  const [filterDim, setFilterDim] = useState<"all" | KsaDimension>(
    DIMS.includes(initialDimFilter as KsaDimension)
      ? (initialDimFilter as KsaDimension)
      : "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "unresolved" | "resolved" | "all"
  >("unresolved");

  // New error form state
  const [skill, setSkill] = useState<IeltsSkill>("reading");
  const [ksaDim, setKsaDim] = useState<KsaDimension>("K");
  const availableCodes = useMemo(
    () =>
      ERROR_TAXONOMY.filter(
        (t) => t.skill === skill && t.ksaDimension === ksaDim
      ),
    [skill, ksaDim]
  );
  const [errorCode, setErrorCode] = useState<string>(
    ERROR_TAXONOMY.find((t) => t.skill === "reading" && t.ksaDimension === "K")
      ?.code ?? "R_PARAPHRASE_MISS"
  );
  const [contextSnippet, setContextSnippet] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [createStatus, setCreateStatus] = useState<MorphStatus>("idle");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const { matrix, primaryBottleneck } = useMemo(
    () => buildBottleneckMatrix(errors),
    [errors]
  );

  const visibleErrors = useMemo(() => {
    return errors.filter((e) => {
      if (filterSkill !== "all" && e.skill !== filterSkill) return false;
      if (filterDim !== "all" && e.ksaDimension !== filterDim) return false;
      if (statusFilter === "unresolved" && e.resolved !== 0) return false;
      if (statusFilter === "resolved" && e.resolved !== 1) return false;
      return true;
    });
  }, [errors, filterSkill, filterDim, statusFilter]);

  function handleSkillOrDimChange(
    nextSkill: IeltsSkill,
    nextDim: KsaDimension
  ) {
    setSkill(nextSkill);
    setKsaDim(nextDim);
    const first = ERROR_TAXONOMY.find(
      (t) => t.skill === nextSkill && t.ksaDimension === nextDim
    );
    if (first) setErrorCode(first.code);
  }

  async function handleCreateError(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus("loading");
    try {
      const res = await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill,
          ksaDimension: ksaDim,
          errorCode,
          contextSnippet: contextSnippet.trim(),
          resolutionNote: resolutionNote.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        errorLog?: ErrorLogRow;
        error?: string;
      };
      if (!res.ok || !data.errorLog) {
        throw new Error(data.error || "Không thể ghi lỗi mới.");
      }
      setErrors((prev) => [data.errorLog!, ...prev]);
      setContextSnippet("");
      setResolutionNote("");
      setCreateStatus("done");
      toast.success("Đã ghi nhận lỗi vào Sổ tay K-S-A");
      setTimeout(() => setCreateStatus("idle"), 1500);
      router.refresh();
    } catch (err) {
      setCreateStatus("error");
      toast.error(
        "Ghi lỗi thất bại",
        err instanceof Error ? err.message : "Vui lòng kiểm tra lại."
      );
    }
  }

  async function handleToggleResolved(row: ErrorLogRow) {
    const nextResolved = row.resolved === 0;
    const noteToSave = noteDrafts[row.id] ?? row.resolutionNote ?? undefined;
    const res = await fetch("/api/errors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        resolved: nextResolved,
        resolutionNote: noteToSave,
      }),
    });
    const data = (await res.json()) as {
      errorLog?: ErrorLogRow;
      error?: string;
    };
    if (!res.ok || !data.errorLog) {
      toast.error(data.error || "Không thể cập nhật trạng thái lỗi.");
      return;
    }
    setErrors((prev) =>
      prev.map((item) => (item.id === row.id ? data.errorLog! : item))
    );
    toast.success(
      nextResolved ? "Đã đánh dấu khắc phục xong!" : "Đã mở lại mục lỗi"
    );
    router.refresh();
  }

  async function handleDeleteError(id: string) {
    const res = await fetch("/api/errors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setErrors((prev) => prev.filter((item) => item.id !== id));
      toast.info("Đã xóa mục lỗi");
      router.refresh();
    } else {
      toast.error("Không thể xóa mục lỗi");
    }
  }

  const taxonomyMap = useMemo(
    () => new Map(ERROR_TAXONOMY.map((t) => [t.code, t])),
    []
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="A">
            <AlertTriangle className="h-3 w-3" />
            Sổ theo dõi lỗi sai
          </Badge>
          <Badge variant="neutral">
            {errors.filter((e) => e.resolved === 0).length} chưa xử lý /{" "}
            {errors.length} tổng lỗi
          </Badge>
        </div>
        <h1 className="font-display text-2xl font-medium text-[var(--ux-ink)] sm:text-3xl">
          Sổ tay Lỗi sai theo Gốc rễ K–S–A
        </h1>
        <p className="text-sm text-[var(--ux-ink-2)]">
          Phân loại lỗi sai thuộc Kiến thức (K), Kỹ năng xử lý (S) hay Tâm lý
          phòng thi (A) để sửa tận gốc thay vì lặp lại lỗi cũ.
        </p>
      </div>

      {/* Bottleneck Alert */}
      {primaryBottleneck ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--ux-warn)]/40 bg-[var(--ksa-a-soft)] p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <KsaBadge dimension={primaryBottleneck.dimension} />
              <span className="text-sm font-bold">
                Điểm nghẽn lớn nhất: {SKILL_LABELS_VI[primaryBottleneck.skill]}{" "}
                ({primaryBottleneck.unresolvedCount} lỗi chưa xử lý)
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {primaryBottleneck.adviceVi}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFilterSkill(primaryBottleneck.skill);
              setFilterDim(primaryBottleneck.dimension);
              setStatusFilter("unresolved");
            }}
          >
            Lọc đúng điểm nghẽn
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--ux-mint)]/30 bg-[var(--ksa-s-soft)] p-4 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--ux-mint)]" />
          <span>
            Hiện chưa có điểm nghẽn tồn đọng. Khi luyện bài bị sai hoặc mất
            nhịp, hãy ghi vào sổ để theo dõi xu hướng K–S–A.
          </span>
        </div>
      )}

      {/* 4x3 Interactive Bottleneck Matrix */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">
              Ma trận Điểm nghẽn (4 Kỹ năng × K–S–A)
            </CardTitle>
            {(filterSkill !== "all" || filterDim !== "all") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterSkill("all");
                  setFilterDim("all");
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Bỏ lọc ô ma trận
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-center text-xs">
              <thead>
                <tr className="text-[var(--text-secondary)]">
                  <th className="p-2 text-left font-semibold">Kỹ năng</th>
                  <th className="p-2 font-semibold text-[var(--ux-accent)]">
                    K: Knowledge
                  </th>
                  <th className="p-2 font-semibold text-[var(--ux-mint)]">
                    S: Skills
                  </th>
                  <th className="p-2 font-semibold text-[var(--ux-warn)]">
                    A: Attitudes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {SKILLS.map((sk) => (
                  <tr key={sk}>
                    <td className="p-2 text-left font-semibold">
                      {SKILL_LABELS_VI[sk]}
                    </td>
                    {DIMS.map((dm) => {
                      const cell = matrix[sk][dm];
                      const selected =
                        filterSkill === sk && filterDim === dm;
                      return (
                        <td key={dm} className="p-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (selected) {
                                setFilterSkill("all");
                                setFilterDim("all");
                              } else {
                                setFilterSkill(sk);
                                setFilterDim(dm);
                              }
                            }}
                            className={`w-full rounded-lg border px-3 py-2 font-mono transition-all cursor-pointer ${
                              selected
                                ? "border-[var(--ux-accent)] ring-2 ring-[var(--ux-accent)]/25"
                                : "border-[var(--ux-line)] hover:border-[var(--ux-line-2)]"
                            } ${
                              cell.unresolved >= 3
                                ? "bg-[var(--ux-danger-soft)] text-[var(--ux-danger)] font-bold"
                                : cell.unresolved > 0
                                  ? "bg-[var(--ksa-a-soft)] text-[var(--ux-warn)] font-semibold"
                                  : "bg-[var(--ux-surface-2)]/40 text-[var(--ux-ink-2)]"
                            }`}
                          >
                            {cell.unresolved}{" "}
                            <span className="text-[10px] opacity-75">
                              / {cell.total}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Log New Error */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ghi nhận lỗi mới theo K–S–A</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateError} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kỹ năng</label>
                <select
                  value={skill}
                  onChange={(e) =>
                    handleSkillOrDimChange(
                      e.target.value as IeltsSkill,
                      ksaDim
                    )
                  }
                  className="h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-sm"
                >
                  {SKILLS.map((s) => (
                    <option key={s} value={s}>
                      {SKILL_LABELS_VI[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Trục nguyên nhân</label>
                <select
                  value={ksaDim}
                  onChange={(e) =>
                    handleSkillOrDimChange(
                      skill,
                      e.target.value as KsaDimension
                    )
                  }
                  className="h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-sm"
                >
                  <option value="K">K: Thiếu kiến thức</option>
                  <option value="S">S: Vỡ kỹ năng xử lý</option>
                  <option value="A">A: Tâm lý và thói quen</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nhóm lỗi chuẩn IELTS</label>
                <select
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 text-sm"
                >
                  {availableCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.labelVi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Ngữ cảnh cụ thể câu vừa sai
                </label>
                <Input
                  required
                  placeholder="Ví dụ: Listening Q14 nghe 'Tuesday' xong quên chờ sửa thành 'Thursday'"
                  value={contextSnippet}
                  onChange={(e) => setContextSnippet(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Cách khắc phục rút ra (tùy ý)
                </label>
                <Input
                  placeholder="Ví dụ: Khi nghe ngày/giờ luôn đợi qua câu sau mới chốt đáp án"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>
            </div>

            <MorphSubmitButton
              type="submit"
              status={createStatus}
              idleLabel="Lưu vào Sổ lỗi K–S–A"
              loadingLabel="Đang ghi..."
              doneLabel="Đã lưu lỗi!"
              icon={<Plus className="h-4 w-4" />}
            />
          </form>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <CardTitle className="text-lg">
              Danh sách lỗi ({visibleErrors.length})
            </CardTitle>
            <SlidingPillTabs
              size="sm"
              ariaLabel="Lọc trạng thái lỗi"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "unresolved", label: "Chưa xử lý" },
                { value: "resolved", label: "Đã khắc phục" },
                { value: "all", label: "Tất cả" },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {visibleErrors.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
              Không có bản ghi lỗi nào khớp bộ lọc hiện tại.
            </p>
          ) : (
            <div className="space-y-3">
              {visibleErrors.map((row) => {
                const tax = taxonomyMap.get(row.errorCode);
                const dateStr = new Date(row.createdAt)
                  .toISOString()
                  .slice(0, 10);
                return (
                  <div
                    key={row.id}
                    className="space-y-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <KsaBadge dimension={row.ksaDimension as KsaDimension} />
                        <Badge variant="neutral">
                          {SKILL_LABELS_VI[row.skill as IeltsSkill] ?? row.skill}
                        </Badge>
                        <Badge variant={row.resolved === 1 ? "S" : "A"}>
                          {row.resolved === 1 ? "Đã khắc phục" : "Cần xử lý"}
                        </Badge>
                      </div>
                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {dateStr}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {tax?.labelVi ?? row.errorCode}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                        Ngữ cảnh: {row.contextSnippet}
                      </p>
                      {tax && (
                        <p className="mt-1 text-xs text-[var(--ux-mint)]">
                          Gợi ý KSA: {tax.remediationVi}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                      <Input
                        placeholder="Ghi chú bài học rút ra trước khi đánh dấu Đã khắc phục..."
                        value={noteDrafts[row.id] ?? row.resolutionNote ?? ""}
                        onChange={(e) =>
                          setNoteDrafts((d) => ({
                            ...d,
                            [row.id]: e.target.value,
                          }))
                        }
                        className="h-8 text-xs"
                      />
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          size="sm"
                          variant={row.resolved === 1 ? "outline" : "primary"}
                          onClick={() => handleToggleResolved(row)}
                        >
                          {row.resolved === 1 ? "Mở lại" : "Đã khắc phục"}
                        </Button>
                        <HoldToDeleteButton
                          onConfirm={() => handleDeleteError(row.id)}
                          ariaLabel="Giữ 1 giây để xóa bản ghi lỗi"
                        />
                      </div>
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
