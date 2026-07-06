type MeasurementSectionId = "core" | "composition" | "circumferences" | "notes";

interface MeasurementSectionIconProps {
  id: MeasurementSectionId;
}

const stroke = "currentColor";

export function MeasurementSectionIcon({ id }: MeasurementSectionIconProps) {
  const className = "afc-measurement-section__icon";

  switch (id) {
    case "core":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="6.5" stroke={stroke} strokeWidth="1.35" />
          <path d="M10 6.5v3.5l2.25 1.25" stroke={stroke} strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case "composition":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4 14 7.5 6l2.5 5 1.5-3.5L14 14"
            stroke={stroke}
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "circumferences":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
          <ellipse cx="10" cy="10" rx="6.5" ry="4.5" stroke={stroke} strokeWidth="1.35" />
          <path d="M3.5 10h13" stroke={stroke} strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case "notes":
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M5.5 3.5h9a1.5 1.5 0 0 1 1.5 1.5v11l-2.25-1.5-2.25 1.5-2.25-1.5L7 16V5a1.5 1.5 0 0 1 1.5-1.5Z"
            stroke={stroke}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
