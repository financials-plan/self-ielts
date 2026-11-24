export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  level: "empty" | "weak" | "fair" | "good" | "strong";
  labelVi: string;
  rules: {
    minLength: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

export function evaluatePasswordStrength(
  password: string
): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      level: "empty",
      labelVi: "Chưa nhập mật khẩu",
      rules: {
        minLength: false,
        hasUpper: false,
        hasNumber: false,
        hasSymbol: false,
      },
    };
  }

  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };

  const count = Object.values(rules).filter(Boolean).length;
  const score = Math.min(4, Math.max(1, count)) as 1 | 2 | 3 | 4;

  const map: Record<
    1 | 2 | 3 | 4,
    { level: PasswordStrengthResult["level"]; labelVi: string }
  > = {
    1: { level: "weak", labelVi: "Yếu · Cần bổ sung thêm tiêu chí" },
    2: { level: "fair", labelVi: "Trung bình · Thêm số hoặc ký tự đặc biệt" },
    3: { level: "good", labelVi: "Khá tốt · Gần đạt mức bảo mật cao" },
    4: { level: "strong", labelVi: "Mạnh · Đạt chuẩn bảo mật Cloud" },
  };

  return {
    score,
    level: map[score].level,
    labelVi: map[score].labelVi,
    rules,
  };
}

export interface RadarPoint {
  x: number;
  y: number;
  value: number;
}

export function computeRadarPolygon(
  values: number[],
  maxVal: number,
  cx: number,
  cy: number,
  radius: number
): { pointsAttr: string; vertices: RadarPoint[] } {
  const n = values.length;
  if (n === 0 || maxVal <= 0) {
    return { pointsAttr: "", vertices: [] };
  }

  const vertices: RadarPoint[] = values.map((raw, idx) => {
    const clamped = Math.max(0, Math.min(maxVal, raw));
    const ratio = clamped / maxVal;
    const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
    const x = Number((cx + Math.cos(angle) * radius * ratio).toFixed(2));
    const y = Number((cy + Math.sin(angle) * radius * ratio).toFixed(2));
    return { x, y, value: clamped };
  });

  const pointsAttr = vertices.map((v) => `${v.x},${v.y}`).join(" ");
  return { pointsAttr, vertices };
}

export interface RingDashMetrics {
  circumference: number;
  primaryOffset: number;
  lapOffset: number;
  hasLap: boolean;
}

export function computeRingDash(
  valuePercent: number,
  radius: number
): RingDashMetrics {
  const circumference = 2 * Math.PI * radius;
  const safeVal = Math.max(0, valuePercent);
  const primaryFill = Math.min(100, safeVal) / 100;
  const primaryOffset = circumference * (1 - primaryFill);

  const hasLap = safeVal > 100;
  const lapFill = hasLap ? Math.min(100, safeVal - 100) / 100 : 0;
  const lapOffset = circumference * (1 - lapFill);

  return {
    circumference: Number(circumference.toFixed(2)),
    primaryOffset: Number(primaryOffset.toFixed(2)),
    lapOffset: Number(lapOffset.toFixed(2)),
    hasLap,
  };
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function buildContributionDays(
  totalDays: number,
  streakDays: number,
  lastStudyDate: string | null,
  activeDates?: Record<string, number>,
  anchorDateIso?: string
): ContributionDay[] {
  const countDays = Math.max(1, totalDays);
  const anchor = anchorDateIso
    ? new Date(`${anchorDateIso}T00:00:00Z`)
    : lastStudyDate
      ? new Date(`${lastStudyDate}T00:00:00Z`)
      : new Date();

  const safeAnchor = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
  const anchorUtc = Date.UTC(
    safeAnchor.getUTCFullYear(),
    safeAnchor.getUTCMonth(),
    safeAnchor.getUTCDate()
  );

  const days: ContributionDay[] = [];
  const streakCount = Math.max(0, Math.min(countDays, Math.floor(streakDays)));

  for (let i = countDays - 1; i >= 0; i--) {
    const dayMs = anchorUtc - i * 86_400_000;
    const iso = new Date(dayMs).toISOString().slice(0, 10);

    let count = activeDates?.[iso] ?? 0;
    if (count === 0 && streakCount > 0 && i < streakCount) {
      count = i === 0 ? 2 : 1;
    }

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 4) level = 4;
    else if (count === 3) level = 3;
    else if (count === 2) level = 2;
    else if (count === 1) level = 1;

    days.push({ date: iso, count, level });
  }

  return days;
}

export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - (1 - clamped) ** 3;
}

export function computeCountUpValue(
  target: number,
  elapsedMs: number,
  durationMs: number,
  decimals = 0
): number {
  if (durationMs <= 0) return target;
  const progress = easeOutCubic(elapsedMs / durationMs);
  return Number((target * progress).toFixed(decimals));
}
