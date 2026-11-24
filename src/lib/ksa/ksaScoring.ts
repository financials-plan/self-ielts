import type { IeltsTrack } from "./bandCalculator";
import {
  ERROR_TAXONOMY,
  SKILL_LABELS_VI,
  type IeltsSkill,
  type KsaDimension,
} from "./errorTaxonomy";

export interface KsaScoreInput {
  cards: Array<{
    skill: string;
    repetitions: number;
  }>;
  errors: Array<{
    skill: string;
    ksaDimension: string;
    resolved: number;
  }>;
  reflections: Array<{
    createdAt: number;
  }>;
  attempts: Array<{
    skill: string;
    bandScore: number | null;
    confidenceBefore: number | null;
  }>;
  streakDays: number;
}

export interface KsaScoreResult {
  kScore: number;
  sScore: number;
  aScore: number;
}

export function computeKsaScores(input: KsaScoreInput): KsaScoreResult {
  const { cards, errors, reflections, attempts, streakDays } = input;

  const masteredCards = cards.filter((c) => c.repetitions >= 2).length;
  const bandAttempts = attempts.filter(
    (a): a is { skill: string; bandScore: number; confidenceBefore: number | null } =>
      typeof a.bandScore === "number"
  );
  const avgBandRatio =
    bandAttempts.length > 0
      ? bandAttempts.reduce((acc, a) => acc + Math.min(9, Math.max(0, a.bandScore)) / 9, 0) /
        bandAttempts.length
      : 0;

  const kErrors = errors.filter((e) => e.ksaDimension === "K");
  const sErrors = errors.filter((e) => e.ksaDimension === "S");
  const aErrors = errors.filter((e) => e.ksaDimension === "A");

  const resolvedK = kErrors.filter((e) => e.resolved === 1).length;
  const resolvedS = sErrors.filter((e) => e.resolved === 1).length;
  const resolvedA = aErrors.filter((e) => e.resolved === 1).length;

  // Knowledge (K): SRS deck collection/mastery + resolving K errors + attempt baseline
  const kCardsPart = Math.min(45, cards.length * 4 + masteredCards * 6);
  const kErrorPart =
    kErrors.length > 0
      ? Math.round((resolvedK / kErrors.length) * 35)
      : cards.length > 0
        ? 15
        : 0;
  const kAttemptPart = bandAttempts.length > 0 ? Math.round(avgBandRatio * 20) : 0;
  const kScore = Math.min(100, Math.max(0, kCardsPart + kErrorPart + kAttemptPart));

  // Skills (S): Practice attempts + resolving S errors + multi-skill breadth
  const activeSkills = new Set([
    ...cards.map((c) => c.skill),
    ...attempts.map((a) => a.skill),
  ]);
  const sAttemptPart = Math.min(
    45,
    attempts.length * 10 + Math.round(avgBandRatio * 25)
  );
  const sErrorPart =
    sErrors.length > 0
      ? Math.round((resolvedS / sErrors.length) * 35)
      : attempts.length > 0
        ? 15
        : 0;
  const sBreadthPart = Math.min(20, activeSkills.size * 5);
  const sScore = Math.min(100, Math.max(0, sAttemptPart + sErrorPart + sBreadthPart));

  // Attitudes (A): Reflection logs + streak discipline + resolving A errors
  const aReflectionPart = Math.min(40, reflections.length * 12);
  const aStreakPart = Math.min(30, Math.max(0, streakDays) * 5);
  const aErrorPart =
    aErrors.length > 0
      ? Math.round((resolvedA / aErrors.length) * 30)
      : reflections.length > 0
        ? 15
        : 0;
  const aScore = Math.min(100, Math.max(0, aReflectionPart + aStreakPart + aErrorPart));

  return { kScore, sScore, aScore };
}

export interface MatrixCell {
  unresolved: number;
  total: number;
}

export type BottleneckMatrix = Record<
  IeltsSkill,
  Record<KsaDimension, MatrixCell>
>;

export interface PrimaryBottleneck {
  skill: IeltsSkill;
  dimension: KsaDimension;
  unresolvedCount: number;
  topErrorCode: string | null;
  adviceVi: string;
  targetHref: string;
}

const SKILLS_ORDER: IeltsSkill[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];
const DIMENSIONS_ORDER: KsaDimension[] = ["K", "S", "A"];

export function buildBottleneckMatrix(
  errors: Array<{
    skill: string;
    ksaDimension: string;
    errorCode: string;
    resolved: number;
  }>
): { matrix: BottleneckMatrix; primaryBottleneck: PrimaryBottleneck | null } {
  const matrix: BottleneckMatrix = {
    listening: {
      K: { unresolved: 0, total: 0 },
      S: { unresolved: 0, total: 0 },
      A: { unresolved: 0, total: 0 },
    },
    reading: {
      K: { unresolved: 0, total: 0 },
      S: { unresolved: 0, total: 0 },
      A: { unresolved: 0, total: 0 },
    },
    writing: {
      K: { unresolved: 0, total: 0 },
      S: { unresolved: 0, total: 0 },
      A: { unresolved: 0, total: 0 },
    },
    speaking: {
      K: { unresolved: 0, total: 0 },
      S: { unresolved: 0, total: 0 },
      A: { unresolved: 0, total: 0 },
    },
  };

  for (const err of errors) {
    const skill = err.skill as IeltsSkill;
    const dim = err.ksaDimension as KsaDimension;
    if (!SKILLS_ORDER.includes(skill) || !DIMENSIONS_ORDER.includes(dim)) {
      continue;
    }
    matrix[skill][dim].total += 1;
    if (err.resolved === 0) {
      matrix[skill][dim].unresolved += 1;
    }
  }

  let bestSkill: IeltsSkill | null = null;
  let bestDim: KsaDimension | null = null;
  let maxUnresolved = 0;

  for (const skill of SKILLS_ORDER) {
    for (const dim of DIMENSIONS_ORDER) {
      const count = matrix[skill][dim].unresolved;
      if (count > maxUnresolved) {
        maxUnresolved = count;
        bestSkill = skill;
        bestDim = dim;
      }
    }
  }

  if (!bestSkill || !bestDim || maxUnresolved === 0) {
    return { matrix, primaryBottleneck: null };
  }

  const matchingErrors = errors.filter(
    (e) =>
      e.skill === bestSkill &&
      e.ksaDimension === bestDim &&
      e.resolved === 0
  );
  const codeCounts = new Map<string, number>();
  for (const item of matchingErrors) {
    codeCounts.set(item.errorCode, (codeCounts.get(item.errorCode) ?? 0) + 1);
  }
  let topErrorCode: string | null = null;
  let topCount = 0;
  for (const [code, cnt] of codeCounts.entries()) {
    if (cnt > topCount) {
      topCount = cnt;
      topErrorCode = code;
    }
  }

  const taxonomyEntry =
    ERROR_TAXONOMY.find((t) => t.code === topErrorCode) ??
    ERROR_TAXONOMY.find(
      (t) => t.skill === bestSkill && t.ksaDimension === bestDim
    );

  const dimLabel =
    bestDim === "K"
      ? "Kiến thức [K]"
      : bestDim === "S"
        ? "Kỹ năng thao tác [S]"
        : "Tâm lý & Thói quen [A]";

  const adviceVi = taxonomyEntry
    ? `${SKILL_LABELS_VI[bestSkill]} đang vướng ${maxUnresolved} lỗi ở trục ${dimLabel}. Gợi ý: ${taxonomyEntry.remediationVi}`
    : `${SKILL_LABELS_VI[bestSkill]} đang có ${maxUnresolved} lỗi chưa xử lý ở trục ${dimLabel}.`;

  return {
    matrix,
    primaryBottleneck: {
      skill: bestSkill,
      dimension: bestDim,
      unresolvedCount: maxUnresolved,
      topErrorCode,
      adviceVi,
      targetHref: `/errors?skill=${bestSkill}&dimension=${bestDim}`,
    },
  };
}

export interface ConfidenceCalibrationResult {
  status:
    | "insufficient_data"
    | "well_calibrated"
    | "overconfident"
    | "underconfident";
  sampleCount: number;
  avgConfidencePct: number;
  avgActualPct: number;
  gapPct: number;
  messageVi: string;
}

export function evaluateConfidenceCalibration(
  attempts: Array<{
    confidenceBefore: number | null;
    bandScore: number | null;
  }>
): ConfidenceCalibrationResult {
  const valid = attempts.filter(
    (a): a is { confidenceBefore: number; bandScore: number } =>
      typeof a.confidenceBefore === "number" &&
      typeof a.bandScore === "number"
  );

  if (valid.length < 2) {
    return {
      status: "insufficient_data",
      sampleCount: valid.length,
      avgConfidencePct: 0,
      avgActualPct: 0,
      gapPct: 0,
      messageVi:
        "Cần tối thiểu 2 bài làm có đánh giá mức độ tự tin trước khi làm để hiệu chuẩn nhận thức.",
    };
  }

  const avgConfidencePct = Math.round(
    (valid.reduce((acc, a) => acc + Math.max(1, Math.min(5, a.confidenceBefore)) / 5, 0) /
      valid.length) *
      100
  );
  const avgActualPct = Math.round(
    (valid.reduce((acc, a) => acc + Math.max(0, Math.min(9, a.bandScore)) / 9, 0) /
      valid.length) *
      100
  );
  const gapPct = avgConfidencePct - avgActualPct;

  if (gapPct >= 15) {
    return {
      status: "overconfident",
      sampleCount: valid.length,
      avgConfidencePct,
      avgActualPct,
      gapPct,
      messageVi: `Cảnh báo Tự tin quá mức (+${gapPct}%): cảm giác chắc chắn cao hơn kết quả thực tế. Hãy siết kỹ bước ghim bằng chứng & kiểm tra lỗi.`,
    };
  }

  if (gapPct <= -15) {
    return {
      status: "underconfident",
      sampleCount: valid.length,
      avgConfidencePct,
      avgActualPct,
      gapPct,
      messageVi: `Tự tin thấp hơn năng lực thật (${gapPct}%): bạn làm bài tốt hơn mức bạn tự đánh giá — hãy giữ tâm lý vững vàng khi vào phòng thi.`,
    };
  }

  return {
    status: "well_calibrated",
    sampleCount: valid.length,
    avgConfidencePct,
    avgActualPct,
    gapPct,
    messageVi:
      "Hiệu chuẩn tự tin rất chuẩn: cảm nhận bài làm khớp sát với điểm Band thực tế.",
  };
}

export interface DailyKsaTask {
  dimension: KsaDimension;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

export function buildDailyKsaPlan(params: {
  dueCardsCount: number;
  primaryBottleneck: PrimaryBottleneck | null;
  dailyGoalMinutes: number;
  hasReflectionToday: boolean;
  track: IeltsTrack;
}): DailyKsaTask[] {
  const trackLabel = params.track === "general" ? "General Training" : "Academic";

  const kTask: DailyKsaTask =
    params.dueCardsCount > 0
      ? {
          dimension: "K",
          title: `Ôn ${params.dueCardsCount} thẻ SRS đến hạn hôm nay`,
          description:
            "Củng cố từ vựng, cặp Paraphrase và collocation đúng thời điểm sắp quên theo thuật toán SM-2.",
          href: "/vault",
          ctaLabel: "Mở Knowledge Vault",
        }
      : {
          dimension: "K",
          title: "Nạp thêm 2 thẻ Kiến thức mới vào SRS",
          description:
            "Dùng bộ 8 thẻ mẫu KSA hoặc ghi lại cụm từ/paraphrase bạn mới gặp hôm nay.",
          href: "/vault",
          ctaLabel: "Quản lý thẻ SRS",
        };

  const sTask: DailyKsaTask = params.primaryBottleneck
    ? {
        dimension: "S",
        title: `Xử lý điểm nghẽn: ${SKILL_LABELS_VI[params.primaryBottleneck.skill]}`,
        description: params.primaryBottleneck.adviceVi,
        href: params.primaryBottleneck.targetHref,
        ctaLabel: "Mở Sổ lỗi K-S-A",
      }
    : {
        dimension: "S",
        title: `Luyện Reading ${params.dailyGoalMinutes} phút (${trackLabel})`,
        description:
          "Thực hành ghim câu bằng chứng trên màn hình chia đôi CD-IELTS để tách rõ điểm nghẽn K–S–A.",
        href: "/reading",
        ctaLabel: "Mở Reading Studio",
      };

  const aTask: DailyKsaTask = params.hasReflectionToday
    ? {
        dimension: "A",
        title: "Đã hoàn thành Nhật ký Phản tư hôm nay",
        description:
          "Giữ vững thói quen tập thở 4–2–4s trước các bài nghe và nói để kiểm soát hồi hộp.",
        href: "/dashboard#breathing-pacer",
        ctaLabel: "Tập thở 4–2–4s",
      }
    : {
        dimension: "A",
        title: "Viết 1 phút Nhật ký Phản tư hôm nay",
        description:
          "Ghi lại 1 điều làm tốt và 1 điều chỉnh cụ thể để khóa lại bài học siêu nhận thức.",
        href: "/dashboard#reflection-checkin",
        ctaLabel: "Check-in Phản tư",
      };

  return [kTask, sTask, aTask];
}
