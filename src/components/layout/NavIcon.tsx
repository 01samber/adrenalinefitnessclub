export type NavIconId =
  | "dashboard"
  | "squad"
  | "revenue"
  | "sessions"
  | "progress"
  | "analytics"
  | "alerts"
  | "performance";

interface NavIconProps {
  id: NavIconId;
  active?: boolean;
}

const stroke = "currentColor";

export function NavIcon({ id, active = false }: NavIconProps) {
  const className = `afc-nav-icon ${active ? "afc-nav-icon--active" : ""}`;

  switch (id) {
    case "dashboard":
    case "performance":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="8" height="8" rx="1.5" stroke={stroke} strokeWidth="1.75" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" stroke={stroke} strokeWidth="1.75" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" stroke={stroke} strokeWidth="1.75" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case "squad":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="8" r="3.25" stroke={stroke} strokeWidth="1.75" />
          <path
            d="M3.5 19.5c.8-3.2 2.8-4.75 5.5-4.75s4.7 1.55 5.5 4.75"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M16.5 11.25h4.25M18.625 9.125v4.25"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M15.25 19.5c.45-1.65 1.55-2.5 3.375-2.5"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "revenue":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 17l4.5-5 3.5 3 4-6.5L20 7"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4 19h16" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "sessions":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="5" width="16" height="15" rx="2" stroke={stroke} strokeWidth="1.75" />
          <path d="M8 3v4M16 3v4M4 10h16" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="12" cy="15" r="2.25" stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case "progress":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 17l3.5-4.5 3 2.5L16 8l3 3"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4 19h16" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "analytics":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 18V11M12 18V6M18 18V13" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4 19h16" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "alerts":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 4.5a4.25 4.25 0 0 1 4.25 4.25v2.5l1.5 2.75H6.25l1.5-2.75v-2.5A4.25 4.25 0 0 1 12 4.5Z"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M10 17.5a2 2 0 0 0 4 0" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function NavLockIcon() {
  return (
    <svg className="afc-nav-lock" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
