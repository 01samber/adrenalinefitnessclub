export type SectionIconId =
  | "training-profile"
  | "membership-status"
  | "payment-record"
  | "body-composition"
  | "session-history"
  | "coach-notes";

const stroke = "currentColor";

export function resolveSectionIcon(title: string): SectionIconId {
  const key = title.toLowerCase();

  if (key.includes("training")) return "training-profile";
  if (key.includes("membership")) return "membership-status";
  if (key.includes("payment")) return "payment-record";
  if (key.includes("composition") || key.includes("measurement")) {
    return "body-composition";
  }
  if (key.includes("session")) return "session-history";
  if (key.includes("coach") || key.includes("note")) return "coach-notes";

  return "training-profile";
}

export function AfcSectionIcon({ id }: { id: SectionIconId }) {
  const className = "afc-section-icon";

  switch (id) {
    case "training-profile":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 14 7 6l3 5 2-4 4 7"
            stroke={stroke}
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="5" r="2" stroke={stroke} strokeWidth="1.35" />
        </svg>
      );
    case "membership-status":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 3 12.5 7.5 17.5 8.25 14 11.75l.75 5L10 15l-4.75 1.75.75-5L3 8.25 8 7.5Z"
            stroke={stroke}
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "payment-record":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="14" height="10" rx="1.5" stroke={stroke} strokeWidth="1.35" />
          <path d="M3 8.5h14" stroke={stroke} strokeWidth="1.35" />
          <path d="M6.5 12h3" stroke={stroke} strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case "body-composition":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 15h12" stroke={stroke} strokeWidth="1.35" strokeLinecap="round" />
          <path
            d="M6 15V8l4-3 4 3v7"
            stroke={stroke}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path d="M10 5v3" stroke={stroke} strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case "session-history":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3.5" y="4" width="13" height="12" rx="1.5" stroke={stroke} strokeWidth="1.35" />
          <path d="M7 2.5v3M13 2.5v3M3.5 8h13" stroke={stroke} strokeWidth="1.35" strokeLinecap="round" />
          <circle cx="10" cy="12" r="2.25" stroke={stroke} strokeWidth="1.25" />
        </svg>
      );
    case "coach-notes":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5.5 3.5h9a1.5 1.5 0 0 1 1.5 1.5v11l-2.25-1.5-2.25 1.5-2.25-1.5L7 16V5a1.5 1.5 0 0 1 1.5-1.5Z"
            stroke={stroke}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path d="M8 8h4M8 11h3" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
  }
}
