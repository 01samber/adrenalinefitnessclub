import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

interface ScoreboardHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  live?: boolean;
}

/** Compact page header for detail/sub-pages — not the dashboard hero band. */
export function ScoreboardHeader({
  kicker = "Coach view",
  title,
  subtitle,
  badge,
  live = false,
}: ScoreboardHeaderProps) {
  return (
    <header className="afc-page-header afc-animate-enter">
      <div className="afc-page-header__rail" aria-hidden />
      <div className="afc-page-header__content">
        <div className="afc-page-header__meta">
          <p className="afc-page-header__kicker">{kicker}</p>
          {live ? (
            <Badge variant="success" className="normal-case">
              LIVE
            </Badge>
          ) : null}
          {badge}
        </div>
        <h2 className="afc-page-header__title">{title}</h2>
        {subtitle ? <p className="afc-page-header__subtitle">{subtitle}</p> : null}
      </div>
    </header>
  );
}
