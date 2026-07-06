export type StatTileIconId =
  | "squad-size"
  | "active-athlete"
  | "frozen"
  | "monthly-score"
  | "payment-alert"
  | "overdue"
  | "upcoming-sessions"
  | "completed-sessions"
  | "new-signups"
  | "membership"
  | "latest-payment"
  | "latest-weight"
  | "latest-bmi"
  | "total-bookings"
  | "scout-results";

type StatAccent = "neutral" | "success" | "danger" | "accent";

interface StatTileIconProps {
  id: StatTileIconId;
  accent?: StatAccent;
}

const stroke = "currentColor";

export function resolveStatTileIcon(label: string): StatTileIconId {
  const key = label.toLowerCase();

  if (key.includes("squad size")) return "squad-size";
  if (key.includes("scout")) return "scout-results";
  if (key.includes("membership")) return "membership";
  if (key.includes("latest payment")) return "latest-payment";
  if (key.includes("latest weight") || key.includes("weight")) return "latest-weight";
  if (key.includes("latest bmi") || key.includes("bmi")) return "latest-bmi";
  if (key.includes("total booking")) return "total-bookings";
  if (key.includes("active athlete")) return "active-athlete";
  if (key.includes("active")) return "active-athlete";
  if (key.includes("frozen")) return "frozen";
  if (key.includes("monthly")) return "monthly-score";
  if (key.includes("payment alert")) return "payment-alert";
  if (key.includes("overdue")) return "overdue";
  if (key.includes("upcoming")) return "upcoming-sessions";
  if (key.includes("completed")) return "completed-sessions";
  if (key.includes("sign-up")) return "new-signups";

  return "squad-size";
}

export function StatTileIcon({ id, accent = "neutral" }: StatTileIconProps) {
  const className = `afc-stat-tile__icon afc-stat-tile__icon--${accent}`;

  switch (id) {
    case "squad-size":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="3" stroke={stroke} strokeWidth="1.5" />
          <circle cx="16" cy="9" r="2.5" stroke={stroke} strokeWidth="1.5" />
          <path
            d="M3.5 18c.7-2.6 2.4-4 4.5-4s3.8 1.4 4.5 4M13.5 17.5c.5-1.8 1.6-2.75 3-2.75"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "active-athlete":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="10" cy="7.5" r="3" stroke={stroke} strokeWidth="1.5" />
          <path
            d="M4.5 19c.8-3.2 2.6-4.75 5.5-4.75"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16.5 12.5l2 2 3.5-4"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "frozen":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3v18M5.5 7.5 18.5 16.5M18.5 7.5 5.5 16.5M4 12h16"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "monthly-score":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 4.5 14.25 9.5 19.5 10.25 15.75 14l.9 5.25L12 17l-4.65 2.25.9-5.25L4.5 10.25 9.75 9.5Z"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M6 19.5h12" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "payment-alert":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 5.5a3.25 3.25 0 0 1 3.25 3.25v1.25l1.5 2.5H7.25l1.5-2.5V8.75A3.25 3.25 0 0 1 12 5.5Z"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 16.5a2 2 0 0 0 4 0" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "overdue":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="7.5" stroke={stroke} strokeWidth="1.5" />
          <path d="M12 8.5v4.25l2.5 1.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.25 17.25 19.5 19.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "upcoming-sessions":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M8 3v3M16 3v3M4 10h16" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "completed-sessions":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="4" width="14" height="16" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M9 12.5l2 2 4.5-4.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "new-signups":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="8" r="3" stroke={stroke} strokeWidth="1.5" />
          <path
            d="M4 18.5c.7-2.5 2.3-3.75 5-3.75"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M17 8.5v5M14.5 11h5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "membership":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="6" width="16" height="12" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M8 10h8M8 14h5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "latest-payment":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M3 10h18" stroke={stroke} strokeWidth="1.5" />
          <path d="M7 14h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "latest-weight":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 18h14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M8 18V9l4-4 4 4v9"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case "latest-bmi":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="7.5" stroke={stroke} strokeWidth="1.5" />
          <path d="M12 7v5l3 2" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 17h8" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "total-bookings":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M8 3v3M16 3v3M4 10h16" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 14h2M8 17h5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "scout-results":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="10.5" cy="10.5" r="5.5" stroke={stroke} strokeWidth="1.5" />
          <path d="M15 15 20 20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function HeroControlIcon() {
  return (
    <svg className="afc-hero-band__kicker-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
