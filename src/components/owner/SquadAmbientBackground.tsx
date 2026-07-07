type SquadAmbientVariant = "roster" | "detail";

interface SquadAmbientBackgroundProps {
  variant?: SquadAmbientVariant;
}

const stroke = "currentColor";

export function SquadAmbientBackground({
  variant = "roster",
}: SquadAmbientBackgroundProps) {
  return (
    <div
      className={`afc-squad-ambient afc-squad-ambient--${variant}`}
      aria-hidden="true"
    >
      <div className="afc-squad-ambient__lanes" />

      {/* Equipment — corners only */}
      <svg
        className="afc-squad-ambient__barbell"
        viewBox="0 0 320 80"
        fill="none"
      >
        <line x1="48" y1="40" x2="272" y2="40" stroke={stroke} strokeWidth="2" />
        <rect x="12" y="22" width="22" height="36" rx="3" stroke={stroke} strokeWidth="1.75" />
        <rect x="286" y="22" width="22" height="36" rx="3" stroke={stroke} strokeWidth="1.75" />
      </svg>

      <svg className="afc-squad-ambient__kettlebell" viewBox="0 0 64 80" fill="none">
        <path
          d="M32 8c-6 0-10 4-10 9v6h20v-6c0-5-4-9-10-9Z"
          stroke={stroke}
          strokeWidth="1.75"
        />
        <path
          d="M14 52c0-10 8-18 18-18s18 8 18 18v6H14v-6Z"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <rect x="26" y="58" width="12" height="10" rx="2" stroke={stroke} strokeWidth="1.75" />
      </svg>

      <svg className="afc-squad-ambient__band" viewBox="0 0 120 48" fill="none">
        <path
          d="M4 28c18-18 36-18 54 0s36 18 54 0"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 36c14-12 28-12 42 0s28 12 42 0"
          stroke={stroke}
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Nutrition / composition — detail page emphasis */}
      <svg className="afc-squad-ambient__droplet" viewBox="0 0 40 52" fill="none">
        <path
          d="M20 4c-8 10-14 18-14 26a14 14 0 1 0 28 0C34 22 28 14 20 4Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      <svg className="afc-squad-ambient__leaf" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 42C10 30 6 16 24 6c18 10 14 24 0 36Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M24 6v36" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" />
      </svg>

      <svg className="afc-squad-ambient__bottle" viewBox="0 0 36 56" fill="none">
        <rect x="10" y="16" width="16" height="32" rx="4" stroke={stroke} strokeWidth="1.5" />
        <path d="M14 16V10a4 4 0 0 1 8 0v6" stroke={stroke} strokeWidth="1.5" />
        <path d="M12 28h12" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" />
      </svg>

      <svg className="afc-squad-ambient__macro-ring" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="28" stroke={stroke} strokeWidth="1.25" opacity="0.5" />
        <path
          d="M40 12a28 28 0 0 1 24.25 14"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M64.25 54A28 28 0 0 1 40 68"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M15.75 54A28 28 0 0 1 12 40"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
