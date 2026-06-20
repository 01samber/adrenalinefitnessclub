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

export function StatusMeter({ tone = "neutral", value = 72 }: StatusMeterProps) {
  const width = Math.min(100, Math.max(12, value));

  return (
    <div className="afc-meter" aria-hidden>
      <div
        className={`afc-meter__fill ${fillClass[tone]}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
