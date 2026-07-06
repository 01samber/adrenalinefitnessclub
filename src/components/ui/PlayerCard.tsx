import { Badge } from "@/components/ui/Badge";
import { AfcAvatar } from "@/components/ui/AfcAvatar";

type PlayerAccent = "red" | "green" | "neutral";

interface PlayerCardProps {
  name: string;
  subtitle?: string;
  role?: string;
  statusBadge?: {
    label: string;
    variant: "success" | "warning" | "danger" | "neutral" | "outline";
  };
  planLabel?: string;
  goal?: string;
  chips?: { label: string; value: string; tone?: "green" | "default" }[];
  accent?: PlayerAccent;
  avatarStatus?: "active" | "frozen" | "inactive" | "pending";
}

export function PlayerCard({
  name,
  subtitle,
  role = "Athlete",
  statusBadge,
  planLabel,
  goal,
  chips = [],
  accent = "neutral",
  avatarStatus,
}: PlayerCardProps) {
  const resolvedAvatarStatus =
    avatarStatus ??
    (statusBadge?.label === "Frozen"
      ? "frozen"
      : statusBadge?.label === "Active"
        ? "active"
        : "inactive");

  const accentClass =
    accent === "green"
      ? "afc-player-card--green"
      : accent === "neutral"
        ? "afc-player-card--neutral"
        : "";

  return (
    <article className={`afc-player-card ${accentClass}`}>
      <div className="afc-player-card__edge afc-player-card__edge--tl" aria-hidden />
      <div className="afc-player-card__edge afc-player-card__edge--br" aria-hidden />

      <div className="relative z-[1] flex flex-col gap-5 sm:flex-row sm:items-start">
        <AfcAvatar name={name} status={resolvedAvatarStatus} size="hero" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{role}</Badge>
            {statusBadge ? (
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            ) : null}
            {planLabel ? <Badge variant="default">{planLabel}</Badge> : null}
          </div>

          <h2 className="afc-display mt-3 text-2xl font-bold tracking-tight text-afc-white sm:text-3xl">
            {name}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-afc-muted">{subtitle}</p>
          ) : null}

          {goal ? (
            <p className="mt-4 rounded-lg border border-afc-border bg-afc-black/40 px-4 py-3 text-sm leading-relaxed text-afc-silver">
              <span className="font-bold text-afc-white">Goal · </span>
              {goal}
            </p>
          ) : null}

          {chips.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className={`afc-stat-chip ${chip.tone === "green" ? "afc-stat-chip--green" : ""}`}
                >
                  <span className="afc-stat-chip__label">{chip.label}</span>
                  <span className="afc-stat-chip__value">{chip.value}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
