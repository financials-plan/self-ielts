import Link from "next/link";
import { ArrowLeft, CalendarClock, Sparkles } from "lucide-react";
import { Badge, KsaBadge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface KsaFeatureItem {
  dimension: "K" | "S" | "A";
  title: string;
  description: string;
}

export interface PhaseRoadmapPageProps {
  phaseLabel: string;
  title: string;
  subtitle: string;
  items: KsaFeatureItem[];
}

export function PhaseRoadmapPage({
  phaseLabel,
  title,
  subtitle,
  items,
}: PhaseRoadmapPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="free">
              <CalendarClock className="h-3.5 w-3.5" />
              {phaseLabel}
            </Badge>
            <Badge variant="neutral">Hồ sơ và mục tiêu đã đồng bộ</Badge>
          </div>
          <h1 className="font-display text-2xl font-medium text-[var(--ux-ink)] sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-[var(--ux-ink-2)]">
            {subtitle}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--ux-line-2)] bg-[var(--ux-surface)] px-4 text-sm font-medium text-[var(--ux-ink)] hover:bg-[var(--ux-surface-2)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Về Tổng quan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={`${item.dimension}-${item.title}`}>
            <CardHeader>
              <div className="mb-1">
                <KsaBadge dimension={item.dimension} />
              </div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-[var(--ux-ink-2)]">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-start justify-between gap-4 pt-5 sm:flex-row sm:items-center sm:pt-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ux-ink)]">
              <Sparkles className="h-4 w-4 text-[var(--ux-accent)]" />
              Hạ tầng dữ liệu và hệ thi đã sẵn sàng
            </div>
            <p className="text-sm text-[var(--ux-ink-2)]">
              Bảng lưu lịch sử luyện tập, tài khoản cá nhân và lựa chọn hệ
              Academic / General Training cho phân hệ này đã được kích hoạt sẵn.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex h-9 shrink-0 items-center rounded-lg bg-[var(--ux-accent)] px-4 text-xs font-semibold text-[var(--ux-accent-ink)] hover:brightness-110"
          >
            Kiểm tra cài đặt AI 0đ
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
