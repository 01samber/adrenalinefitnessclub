import type { ReactNode } from "react";
import { LiveStatusBadge } from "@/components/ui/StatCard";

interface HeroBandProps {
  kicker?: string;
  kickerIcon?: ReactNode;
  /** Prose context — never duplicate KPI numbers from the stat grid below */
  headline: string;
  detail?: string;
  badge?: ReactNode;
  live?: boolean;
  liveLabel?: string;
  footer?: ReactNode;
}

export function HeroBand({
  kicker = "Live command",
  kickerIcon,
  headline,
  detail,
  badge,
  live = false,
  liveLabel = "LIVE",
  footer,
}: HeroBandProps) {
  return (
    <section className="afc-hero-band afc-animate-enter" aria-label="Page context">
      <div className="afc-hero-band__lane" aria-hidden />
      <div className="afc-hero-band__inner">
        <div className="afc-hero-band__meta">
          <div className="afc-hero-band__kicker-row">
            {kickerIcon}
            <p className="afc-hero-band__kicker">{kicker}</p>
          </div>
          <div className="afc-hero-band__badges">
            {live ? <LiveStatusBadge label={liveLabel} /> : null}
            {badge}
          </div>
        </div>

        <div className="afc-hero-band__copy">
          <p className="afc-hero-band__headline">{headline}</p>
          {detail ? <p className="afc-hero-band__detail">{detail}</p> : null}
        </div>

        {footer ? <div className="afc-hero-band__footer">{footer}</div> : null}
      </div>
    </section>
  );
}
