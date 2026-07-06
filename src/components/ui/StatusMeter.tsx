type MeterTone = "success" | "danger" | "accent" | "neutral";

interface StatusMeterProps {
  tone?: MeterTone;
  value?: number;
}

const fillClass: Record<MeterTone, string> = {
  success: "afc-meter__fill--green",
  danger: "afc-meter__fill--red",
  accent: "afc-meter__fill--accent",
  neutral: "afc-meter__fill--neutral",
};

export function StatusMeter({ tone = "neutral", value = 0 }: StatusMeterProps) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className="afc-meter"
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`afc-meter__fill ${fillClass[tone]} afc-meter__fill--animate`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
