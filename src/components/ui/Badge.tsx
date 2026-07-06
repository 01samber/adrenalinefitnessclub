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
  default: "bg-afc-gold/12 text-afc-gold border-afc-gold/35 afc-badge-lane",
  success: "bg-afc-green/12 text-afc-green-neon border-afc-green/35 afc-badge-lane",
  danger: "bg-afc-red-dark/25 text-red-300 border-afc-red/40 afc-badge-lane",
  warning: "bg-afc-amber/12 text-afc-amber border-afc-amber/35 afc-badge-lane",
  neutral: "bg-afc-panel text-afc-soft-grey border-afc-border-grey afc-badge-lane",
  outline: "bg-transparent text-afc-soft-grey border-afc-border-grey afc-badge-lane",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
