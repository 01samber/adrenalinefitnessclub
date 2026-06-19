import { Badge } from "@/components/ui/Badge";

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
  success: "text-afc-green",
  danger: "text-afc-red",
  accent: "text-afc-white",
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
      <div className="afc-surface animate-pulse p-5 sm:p-6">
        <div className="mb-4 h-2 w-10 rounded-full bg-afc-border-grey/50" />
        <div className="mb-3 h-3 w-24 rounded bg-afc-border-grey/40" />
        <div className="h-10 w-28 rounded bg-afc-border-grey/40" />
      </div>
    );
  }

  return (
    <div className="afc-surface afc-surface--hover relative overflow-hidden p-5 sm:p-6">
      {cornerClass[accent] ? (
        <div className={cornerClass[accent]} aria-hidden />
      ) : null}
      <div className="relative z-[1]">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`h-1.5 w-8 rounded-full ${
              accent === "success"
                ? "bg-afc-green"
                : accent === "danger"
                  ? "bg-afc-red"
                  : accent === "accent"
                    ? "bg-gradient-to-r from-afc-red to-afc-panel-grey"
                    : "bg-afc-border-grey"
            }`}
            aria-hidden
          />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-afc-soft-grey">
          {label}
        </p>
        <p
          className={`mt-2 text-3xl font-bold tracking-tight tabular-nums sm:text-[2rem] ${valueColor[accent]}`}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-2 text-xs leading-relaxed text-afc-soft-grey">{hint}</p>
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
    INCREASING: { variant: "success" as const, label: "Increasing" },
    STABLE: { variant: "neutral" as const, label: "Stable" },
    DECLINING: { variant: "danger" as const, label: "Declining" },
  }[trend];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function LiveStatusBadge({ label = "Connected" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-afc-green/30 bg-afc-green/10 px-3 py-1 text-xs font-semibold text-afc-green">
      <span className="afc-status-pulse" aria-hidden />
      {label}
    </span>
  );
}
