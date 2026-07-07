export type EmptyStateVariant =
  | "payments"
  | "measurements"
  | "sessions"
  | "notes"
  | "generic";

interface EmptyStateIconProps {
  variant: EmptyStateVariant;
}

const stroke = "currentColor";

export function EmptyStateIcon({ variant }: EmptyStateIconProps) {
  const className = `afc-empty-state__icon afc-empty-state__icon--${variant}`;

  switch (variant) {
    case "payments":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="6" width="16" height="12" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M4 10h16" stroke={stroke} strokeWidth="1.5" />
          <path d="M8 15h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "measurements":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 18 9 6l3 8 2-5 2 5 3-9"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4 19h16" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "sessions":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M8 3v3M16 3v3M4 10h16" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 14.5l2 2 4-4.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "notes":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 9h6M9 13h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="7.5" stroke={stroke} strokeWidth="1.5" />
          <path d="M12 8.5v4M12 15.5h.01" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}
