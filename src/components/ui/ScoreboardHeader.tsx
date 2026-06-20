import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

interface ScoreboardHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  live?: boolean;
}

export function ScoreboardHeader({
  kicker = "AFC Live",
  title,
  subtitle,
  badge,
  live = false,
}: ScoreboardHeaderProps) {
  return (
    <div className="afc-scoreboard">
      <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-afc-red">
              {kicker}
            </p>
            {live ? (
              <Badge variant="success" className="normal-case">
                LIVE
              </Badge>
            ) : null}
            {badge}
          </div>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-afc-white sm:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-afc-muted sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div
          className="hidden h-12 w-24 shrink-0 bg-gradient-to-r from-afc-red/40 via-afc-panel-2 to-afc-green/30 sm:block"
          style={{ clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)" }}
          aria-hidden
        />
      </div>
    </div>
  );
}
