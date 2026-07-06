interface PlanSessionIconProps {
  sessionsPerWeek: number;
}

export function PlanSessionIcon({ sessionsPerWeek }: PlanSessionIconProps) {
  const bars = Math.min(6, Math.max(1, sessionsPerWeek || 1));

  return (
    <svg
      className="afc-plan-session-icon"
      viewBox="0 0 28 20"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, index) => {
        const height = 6 + index * 2;
        const x = 2 + index * 4.5;
        const y = 18 - height;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width="3"
            height={height}
            rx="0.75"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        );
      })}
    </svg>
  );
}
