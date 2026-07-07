interface MacroCompositionRingProps {
  musclePercentage?: string | number | null;
  bodyFatPercentage?: string | number | null;
  waterPercentage?: string | number | null;
}

function toNumber(value: string | number | null | undefined) {
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function MacroCompositionRing({
  musclePercentage,
  bodyFatPercentage,
  waterPercentage,
}: MacroCompositionRingProps) {
  const muscle = toNumber(musclePercentage);
  const fat = toNumber(bodyFatPercentage);
  const water = toNumber(waterPercentage);

  const segments = [
    { value: muscle, color: "var(--afc-green-neon)", label: "Muscle" },
    { value: fat, color: "var(--afc-red-hot)", label: "Fat" },
    { value: water, color: "var(--afc-gold-muted)", label: "Water" },
  ].filter((segment) => segment.value != null);

  if (segments.length === 0) return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div
      className="afc-macro-ring"
      role="img"
      aria-label={`Body composition: ${segments
        .map((segment) => `${segment.label} ${segment.value}%`)
        .join(", ")}`}
    >
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        {segments.map((segment) => {
          const length = ((segment.value ?? 0) / 100) * circumference;
          const dasharray = `${length} ${circumference - length}`;
          const dashoffset = -offset;
          offset += length;

          return (
            <circle
              key={segment.label}
              cx="24"
              cy="24"
              r={radius}
              stroke={segment.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 24 24)"
              opacity="0.85"
            />
          );
        })}
      </svg>
      <div className="afc-macro-ring__legend" aria-hidden="true">
        {segments.map((segment) => (
          <span key={segment.label} className="afc-macro-ring__item">
            <span
              className="afc-macro-ring__dot"
              style={{ background: segment.color }}
            />
            {segment.label} {segment.value}%
          </span>
        ))}
      </div>
    </div>
  );
}
