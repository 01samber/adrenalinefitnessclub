type BadgeVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "neutral"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-afc-red/15 text-afc-red border-afc-red/35",
  success: "bg-afc-green/15 text-afc-green border-afc-green/35",
  danger: "bg-afc-red-dark/30 text-red-300 border-afc-red/40",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/35",
  neutral: "bg-afc-panel-grey text-afc-soft-grey border-afc-border-grey",
  outline: "bg-transparent text-afc-soft-grey border-afc-border-grey",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
