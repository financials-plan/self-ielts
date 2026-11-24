"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileJson,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  MorphSubmitButton,
  type MorphStatus,
} from "@/components/lucian/MorphSubmitButton";
import { useToast } from "@/components/lucian/ToastProvider";

interface ImportedLessonRow {
  id: string;
  skill: string;
  track: string;
  partType: string;
  title: string;
  difficultyBand: string;
  createdAt: number;
}

const SAMPLE_WRITING_PACK = {
  id: "custom-writ-technology-education",
  skill: "writing",
  track: "shared",
  partType: "Task 2 Essay · Custom Pack",
  title: "Digital Tablets vs. Printed Textbooks in Secondary Schools",
  difficultyBand: "7.0",
  contentJson: {
    taskType: "task2_essay",
    subtitleVi: "Đề tự nhập JSON: cân bằng lợi ích học liệu số và sách giấy.",
    recommendedMinutes: 40,
    minWords: 250,
    ksaFocus: ["K", "S", "A"],
    promptEn:
      "Some schools are replacing printed textbooks with digital tablets, while others worry screens reduce concentration. Discuss both views and give your opinion. Write at least 250 words.",
    deconstructPrompts: {
      taskTypeTargetVi:
        "Task 2 Discuss both views + opinion: nêu quan điểm rõ ràng ở Mở bài và Kết bài.",
      keyRequirementsVi: [
        "Phân tích ưu điểm thiết bị số (cập nhật nhanh, nhẹ cặp sách).",
        "Phân tích lo ngại mất tập trung và mỏi mắt khi dùng màn hình.",
      ],
      ideaSparkQuestionsVi: [
        "Học sinh vùng sâu hưởng lợi gì từ kho học liệu mở trên tablet?",
        "Nếu giới hạn chế độ đọc không thông báo (offline mode), vấn đề xao nhãng có giảm không?",
      ],
    },
    selfAuditChecklist: [
      { id: "c-250", labelVi: "Đủ tối thiểu 250 từ.", ksaDimension: "S" },
      { id: "c-4p", labelVi: "Chia rõ 4 đoạn văn.", ksaDimension: "K" },
      { id: "c-rep", labelVi: "Kiểm tra lặp từ & sai chính tả.", ksaDimension: "A" },
    ],
    modelComparison: {
      band65: {
        band: 6.5,
        essayEn:
          "Sample Band 6.5 model placeholder — add full 250-word reference essay when authoring.",
        annotationsVi: [
          { criterion: "TA_TR", noteVi: "Đủ 2 luồng quan điểm chính." },
        ],
      },
      band80: {
        band: 8.0,
        essayEn:
          "Sample Band 8.0 model placeholder — add full 250-word reference essay when authoring.",
        annotationsVi: [
          { criterion: "LR", noteVi: "Collocation chuẩn học thuật." },
        ],
        upgradeCollocations: [
          {
            basicEn: "reduce paper books",
            upgradedEn: "phase out conventional printed textbooks",
            usageVi: "Nâng Band Vocabulary cho chủ đề công nghệ giáo dục.",
          },
        ],
      },
    },
  },
};

export function LessonJsonImporterView({
  initialLessons,
}: {
  initialLessons: ImportedLessonRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [rawJson, setRawJson] = useState(
    JSON.stringify(SAMPLE_WRITING_PACK, null, 2)
  );
  const [status, setStatus] = useState<MorphStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [importedResult, setImportedResult] = useState<{
    id: string;
    skill: string;
    title: string;
    href: string;
  } | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setImportedResult(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      setError("JSON chưa hợp lệ về cú pháp (kiểm tra dấu phẩy / ngoặc kép).");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/lessons/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Không thể nạp JSON bài học.");
        return;
      }

      setStatus("done");
      setImportedResult(data);
      toast.success("Đã nạp bài học mới vào CSDL", data.title);
      router.refresh();
    } catch {
      setStatus("error");
      setError("Lỗi kết nối khi nạp bài học.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="K">
          <FileJson className="h-3 w-3" />
          Lesson Pack Importer · Không cần sửa code
        </Badge>
        <h1 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
          Nạp Đề &amp; Bài học IELTS từ JSON
        </h1>
        <p className="max-w-2xl text-sm text-[var(--ux-ink-2)]">
          Dán cấu trúc JSON cho Listening, Reading, Writing hoặc Speaking (đặt ID
          bắt đầu bằng <code className="font-mono">custom-</code>) để mở rộng
          kho đề luyện tập trực tiếp trong CSDL SQLite / Turso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Trình kiểm tra &amp; nạp JSON</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRawJson(JSON.stringify(SAMPLE_WRITING_PACK, null, 2));
                setError(null);
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--ux-accent)]" />
              Nạp lại JSON mẫu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImport} className="space-y-4">
            <textarea
              rows={16}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              spellCheck={false}
              className="w-full rounded-xl border border-[var(--ux-line-2)] bg-[var(--ux-surface)] p-4 font-mono text-xs leading-relaxed text-[var(--ux-ink)] focus:border-[var(--ux-accent)] focus:outline-none"
            />

            {error && (
              <p className="rounded-lg border border-[var(--ux-danger)]/35 bg-[var(--ux-danger-soft)] px-3.5 py-2 text-xs text-[var(--ux-danger)]">
                {error}
              </p>
            )}

            {importedResult && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ux-mint)]/40 bg-[var(--ux-mint-soft)] p-3.5 text-xs">
                <span className="font-semibold text-[var(--ux-ink)]">
                  Đã lưu thành công: {importedResult.title}
                </span>
                <Link
                  href={importedResult.href}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-[var(--ux-accent)] px-3 font-semibold text-[var(--ux-accent-ink)]"
                >
                  Mở bài học ngay
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <MorphSubmitButton
              type="submit"
              status={status}
              idleLabel="Kiểm tra & Nạp bài học vào CSDL"
              loadingLabel="Đang kiểm tra Zod & lưu..."
              doneLabel="Đã nạp xong!"
              icon={<PlusCircle className="h-4 w-4" />}
            />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Danh sách bài học hiện có trong bảng lessons ({initialLessons.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {initialLessons.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface-2)]/40 px-4 py-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="K">{item.skill}</Badge>
                  <Badge variant="neutral">{item.track}</Badge>
                  <span className="font-mono text-[11px] text-[var(--ux-ink-3)]">
                    {item.id}
                  </span>
                </div>
                <p className="font-semibold text-[var(--ux-ink)]">
                  {item.title}
                </p>
              </div>
              <Link
                href={`/${item.skill}/${item.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-3 font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
              >
                Mở
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
