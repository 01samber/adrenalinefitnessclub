type ActionIconId = "pause" | "profile" | "play";

interface ActionIconProps {
  id: ActionIconId;
}

const stroke = "currentColor";

export function ActionIcon({ id }: ActionIconProps) {
  const className = "afc-action-icon";

  if (id === "pause") {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="4" y="3.5" width="2.5" height="9" rx="0.5" fill={stroke} />
        <rect x="9.5" y="3.5" width="2.5" height="9" rx="0.5" fill={stroke} />
      </svg>
    );
  }

  if (id === "play") {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M6 4.5v7l5.5-3.5L6 4.5Z"
          stroke={stroke}
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="5.5" r="2.25" stroke={stroke} strokeWidth="1.25" />
      <path
        d="M3.25 13.25c.5-2 1.75-3 3.75-3s3.25 1 3.75 3"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M11.5 8.25 13.25 10 11.5 11.75M13.25 10H9.5"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
