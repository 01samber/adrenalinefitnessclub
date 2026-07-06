"use client";

import { StatusMeter } from "@/components/ui/StatusMeter";
import {
  resolveStatTileIcon,
  StatTileIcon,
} from "@/components/ui/StatTileIcon";
import { useCountUp } from "@/lib/use-count-up";

type StatAccent = "neutral" | "success" | "danger" | "accent";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: StatAccent;
  loading?: boolean;
  /** 0–100 fill for a real ratio; omit when no meaningful ratio exists */
  meterPercent?: number;
  /** Stagger index for page-load animation */
  staggerIndex?: number;
  /** When value is numeric, animate count-up on load/change */
  animateNumeric?: boolean;
}

const valueColor: Record<StatAccent, string> = {
  neutral: "text-afc-white",
  success: "text-afc-green-neon",
  danger: "text-afc-red-hot",
  accent: "text-afc-gold",
};

const meterTone: Record<StatAccent, "success" | "danger" | "accent" | "neutral"> =
  {
    neutral: "neutral",
    success: "success",
    danger: "danger",
    accent: "accent",
  };

export function StatCard({
  label,
  value,
  hint,
  accent = "neutral",
  loading = false,
  meterPercent,
  staggerIndex = 0,
  animateNumeric = true,
}: StatCardProps) {
  const isNumeric = typeof value === "number";
  const numericTarget = isNumeric ? value : 0;
  const animated = useCountUp(numericTarget, {
    enabled: animateNumeric && isNumeric && !loading,
  });

  const displayValue = isNumeric && animateNumeric && !loading ? animated : value;

  if (loading) {
    return (
      <div className="afc-stat-tile afc-stat-tile--skeleton">
        <div className="afc-stat-tile__skeleton-label" />
        <div className="afc-stat-tile__skeleton-value" />
      </div>
    );
  }

  const showMeter =
    meterPercent !== undefined && meterPercent > 0;

  const iconId = resolveStatTileIcon(label);
  const iconAccent = accent === "danger" ? "danger" : "neutral";

  return (
    <div
      className="afc-stat-tile afc-stat-tile--hover afc-animate-enter"
      style={{ animationDelay: `${120 + staggerIndex * 50}ms` }}
    >
      <div className="afc-stat-tile__chamfer" aria-hidden />
      <div className="relative z-[1]">
        <div className="afc-stat-tile__header">
          <StatTileIcon id={iconId} accent={iconAccent} />
          <p className="afc-stat-tile__label">{label}</p>
        </div>
        <p className={`afc-stat-tile__value ${valueColor[accent]}`}>
          {displayValue}
        </p>
        {hint ? (
          <p className="afc-stat-tile__hint">{hint}</p>
        ) : null}
        {showMeter ? (
          <StatusMeter tone={meterTone[accent]} value={meterPercent} />
        ) : null}
      </div>
    </div>
  );
}

interface GrowthBadgeProps {
  trend: "INCREASING" | "STABLE" | "DECLINING";
}

export function GrowthTrendBadge({ trend }: GrowthBadgeProps) {
  const config = {
    INCREASING: { variant: "success" as const, label: "Rising" },
    STABLE: { variant: "neutral" as const, label: "Stable" },
    DECLINING: { variant: "danger" as const, label: "Cooling" },
  }[trend];

  return (
    <span className="inline-flex items-center rounded-sm border border-afc-border-grey px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-afc-silver">
      {config.label}
    </span>
  );
}

export function LiveStatusBadge({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="afc-live-badge">
      <span className="afc-status-pulse afc-status-pulse--gold" aria-hidden />
      {label}
    </span>
  );
}
