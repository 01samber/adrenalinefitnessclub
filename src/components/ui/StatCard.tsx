import { StatusMeter } from "@/components/ui/StatusMeter";

type StatAccent = "neutral" | "success" | "danger" | "accent";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: StatAccent;
  loading?: boolean;
}

const valueColor: Record<StatAccent, string> = {
  neutral: "text-afc-white",
  success: "text-afc-green-neon",
  danger: "text-afc-red-hot",
  accent: "text-afc-white",
};

const meterTone: Record<StatAccent, "success" | "danger" | "accent" | "neutral"> = {
  neutral: "neutral",
  success: "success",
  danger: "danger",
  accent: "accent",
};

const meterValue: Record<StatAccent, number> = {
  neutral: 55,
  success: 92,
  danger: 38,
  accent: 78,
};

const cornerClass: Record<StatAccent, string> = {
  neutral: "",
  success: "afc-stat-corner-green",
  danger: "afc-stat-corner-red",
  accent: "afc-stat-corner-red",
};

export function StatCard({
  label,
  value,
  hint,
  accent = "neutral",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="afc-stat-tile animate-pulse">
        <div className="mb-3 h-2 w-16 rounded bg-afc-panel-2/80" />
        <div className="mb-3 h-3 w-24 rounded bg-afc-panel-2/60" />
        <div className="h-10 w-28 rounded bg-afc-panel-2/60" />
      </div>
    );
  }

  return (
    <div className="afc-stat-tile afc-stat-tile--hover relative overflow-hidden">
      {cornerClass[accent] ? (
        <div className={cornerClass[accent]} aria-hidden />
      ) : null}
      <div className="relative z-[1]">
        <p className="afc-stat-tile__label">{label}</p>
        <p className={`afc-stat-tile__value ${valueColor[accent]}`}>{value}</p>
        {hint ? (
          <p className="mt-2 text-xs leading-relaxed text-afc-muted">{hint}</p>
        ) : null}
        <StatusMeter tone={meterTone[accent]} value={meterValue[accent]} />
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
    <span className="inline-flex items-center rounded-md border border-afc-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-afc-silver">
      {config.label}
    </span>
  );
}

export function LiveStatusBadge({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border border-afc-green/40 bg-afc-green/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-afc-green-neon">
      <span className="afc-status-pulse" aria-hidden />
      {label}
    </span>
  );
}
