import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Compass,
  Gauge,
  Headphones,
  Layers,
  Mic,
  PenTool,
  Target,
} from "lucide-react";
import { requirePageSession } from "@/lib/auth/session";
import { getDashboardKsaSnapshot } from "@/lib/db/ksaService";
import { listSafeAiConfigs } from "@/lib/db/profileService";
import { Badge, KsaBadge, TrackBadge } from "@/components/ui/Badge";
import { AiProviderStatusChip } from "@/components/settings/AiProviderStatusChip";
import { KsaDashboardVisuals } from "@/components/dashboard/KsaDashboardVisuals";
import { CountUpNumber } from "@/components/lucian/CountUpNumber";
import { BandCalculatorWidget } from "@/components/ksa/BandCalculatorWidget";
import { ReflectionCheckinWidget } from "@/components/ksa/ReflectionCheckinWidget";

const SKILL_STUDIOS = [
  {
    href: "/listening",
    icon: Headphones,
    title: "Listening",
    subtitle: "Chung cho IELTS Academic và General Training",
    ksaSummary:
      "Pre-listening Gate (S), nút Re-anchor khi lỡ nhịp (A) và soi bẫy gây nhiễu theo mốc thời gian (K).",
  },
  {
    href: "/reading",
    icon: BookOpen,
    title: "Reading",
    subtitle: "Tách riêng bài đọc và thang điểm Academic / GT",
    ksaSummary:
      "Màn hình chia đôi chuẩn thi máy tính, ghim bằng chứng 4 ô (S/A) và cầu nối Paraphrase lưu thẳng vào SRS (K).",
  },
  {
    href: "/writing",
    icon: PenTool,
    title: "Writing",
    subtitle: "Academic Task 1, GT Letter và Task 2",
    ksaSummary:
      "Xưởng viết 4 chặng: dàn ý & Idea Spark (K/S), tự rà lỗi NLP offline (A) và vòng sửa Draft 2 nâng Band.",
  },
  {
    href: "/speaking",
    icon: Mic,
    title: "Speaking",
    subtitle: "Luyện Part 1, Part 2 Cue Card và Part 3",
    ksaSummary:
      "Shadowing Lab (K), nháp từ khóa 60s + Rescue Prompt khi bí ý (A) và đo tốc độ/khoảng lặng trực tiếp.",
  },
];

const PLAN_BORDER: Record<"K" | "S" | "A", string> = {
  K: "border-l-[var(--ux-accent)]",
  S: "border-l-[var(--ux-mint)]",
  A: "border-l-[var(--ux-warn)]",
};

export default async function DashboardPage() {
  const session = await requirePageSession();
  const [snapshot, aiConfigs] = await Promise.all([
    getDashboardKsaSnapshot(session.user.id),
    listSafeAiConfigs(session.user.id),
  ]);

  const { profile } = snapshot;
  const track = profile.targetTrack === "general" ? "general" : "academic";
  const daysUntilExam = profile.examDate
    ? Math.max(
        0,
        Math.ceil((profile.examDate - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;

  return (
    <div className="space-y-8">
      {profile.onboardingCompleted === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--ux-warn)]/35 bg-[var(--ksa-a-soft)] p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[var(--ux-ink)]">
              Hoàn tất thiết lập hồ sơ để hệ thống đồng bộ lộ trình
            </p>
            <p className="text-xs text-[var(--ux-ink-2)]">
              Chọn hệ Academic hay General Training, Band mục tiêu và nhịp học
              mỗi ngày chỉ trong 1 phút.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex h-9 items-center rounded-lg bg-[var(--ux-warn)] px-4 text-xs font-semibold text-[var(--ux-warn-ink)] hover:brightness-110"
          >
            Thiết lập ngay
          </Link>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <TrackBadge track={track} />
            <Badge variant="neutral">
              <Target className="h-3 w-3" />
              Mục tiêu Band {profile.targetBand.toFixed(1)}
            </Badge>
            {daysUntilExam !== null && (
              <Badge variant="neutral">
                <Calendar className="h-3 w-3" />
                Còn {daysUntilExam} ngày
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ux-ink)] sm:text-3xl">
            Chào {session.user.name}, hôm nay bạn muốn gỡ điểm nghẽn nào?
          </h1>
          <p className="max-w-2xl text-sm text-[var(--ux-ink-2)]">
            Theo dõi cân bằng Kiến thức (K), Kỹ năng (S) và Tâm lý (A) trước
            khi chọn bài luyện tiếp theo.
          </p>
        </div>

        <AiProviderStatusChip
          savedConfigs={aiConfigs.map((c) => ({
            provider: c.provider,
            keyHint: c.keyHint,
            preferredModel: c.preferredModel,
          }))}
        />
      </div>

      {/* Unified Desk Summary Ledger */}
      <div className="grid divide-y divide-[var(--ux-line)] overflow-hidden rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Link
          href="/vault"
          className="block p-5 transition-colors hover:bg-[var(--ux-surface-2)]/60"
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-accent)]">
            <Layers className="h-3.5 w-3.5" />
            Thẻ SRS đến hạn ôn
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={snapshot.dueCardsCount} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              / {snapshot.totalCardsCount} thẻ trong kho
            </span>
          </p>
        </Link>

        <Link
          href="/errors"
          className="block p-5 transition-colors hover:bg-[var(--ux-surface-2)]/60"
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-warn)]">
            <AlertTriangle className="h-3.5 w-3.5" />
            Lỗi K–S–A chưa xử lý
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--ux-ink)]">
            <CountUpNumber value={snapshot.unresolvedErrorsCount} />{" "}
            <span className="font-sans text-xs font-normal text-[var(--ux-ink-3)]">
              / {snapshot.totalErrorsCount} lỗi đã ghi
            </span>
          </p>
        </Link>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ux-mint)]">
            <Gauge className="h-3.5 w-3.5" />
            Hiệu chuẩn tự tin
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--ux-ink-2)]">
            {snapshot.calibration.messageVi}
          </p>
        </div>
      </div>

      {/* Daily KSA Study Plan */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[var(--ux-ink)]">
          Đề xuất tập trung hôm nay
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {snapshot.dailyPlan.map((task) => (
            <Link key={task.dimension} href={task.href} className="group block">
              <div
                className={`h-full rounded-xl border border-[var(--ux-line)] border-l-2 bg-[var(--ux-surface)] p-5 transition-colors group-hover:border-[var(--ux-line-2)] group-hover:bg-[var(--ux-surface-2)]/35 ${PLAN_BORDER[task.dimension]}`}
              >
                <div className="mb-2.5">
                  <KsaBadge dimension={task.dimension} />
                </div>
                <p className="text-sm font-semibold text-[var(--ux-ink)]">
                  {task.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ux-ink-2)]">
                  {task.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Lucian Interactive KSA Visual Suite (#099, #154, #151, #193) */}
      <KsaDashboardVisuals
        kScore={profile.kScore}
        sScore={profile.sScore}
        aScore={profile.aScore}
        dailyGoalMinutes={profile.dailyGoalMinutes}
        streakDays={profile.streakDays}
        lastStudyDate={profile.lastStudyDate}
        currentBand={profile.currentBand}
        targetBand={profile.targetBand}
        track={track}
        anchorDateIso={snapshot.anchorDateIso}
        activeDates={snapshot.activeDatesMap}
      />

      {/* Interactive Band Calculator (Academic vs General Training) */}
      <BandCalculatorWidget defaultTrack={track} />

      {/* Attitude & Metacognition Reflection Widget */}
      <ReflectionCheckinWidget initialReflections={snapshot.latestReflections} />

      {/* 4 Skill Workspaces */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-[var(--ux-ink)]">
            4 Không gian luyện kỹ năng
          </h2>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ux-accent)] hover:underline"
          >
            <Compass className="h-3.5 w-3.5" />
            Quản lý hồ sơ và khóa AI miễn phí
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SKILL_STUDIOS.map((studio) => {
            const Icon = studio.icon;
            const liveBadge =
              studio.href === "/reading"
                ? "109 bài · Acad & GT"
                : studio.href === "/listening"
                  ? "109 bài · 4 Parts"
                  : studio.href === "/writing"
                    ? "109 bài · 4 Chặng"
                    : studio.href === "/speaking"
                      ? "108 bài · Part 1–3"
                      : null;
            return (
              <Link key={studio.href} href={studio.href} className="group block">
                <div className="h-full rounded-xl border border-[var(--ux-line)] bg-[var(--ux-surface)] p-5 transition-colors group-hover:border-[var(--ux-line-2)] group-hover:bg-[var(--ux-surface-2)]/35">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-1 h-5 w-5 shrink-0 text-[var(--ux-accent)]" />
                      <div>
                        <h3 className="font-display text-lg font-semibold text-[var(--ux-ink)]">
                          {studio.title}
                        </h3>
                        <p className="text-xs text-[var(--ux-ink-3)]">
                          {studio.subtitle}
                        </p>
                      </div>
                    </div>
                    {liveBadge ? (
                      <Badge variant="free">{liveBadge}</Badge>
                    ) : (
                      <Badge variant="neutral">Sắp mở</Badge>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--ux-ink-2)]">
                    {studio.ksaSummary}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
