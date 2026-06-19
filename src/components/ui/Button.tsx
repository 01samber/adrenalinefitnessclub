import type { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-afc-red text-afc-white hover:bg-afc-red-dark shadow-[0_4px_24px_var(--afc-red-glow)] border border-afc-red/30",
  secondary:
    "bg-afc-panel-grey text-afc-white border border-afc-border-grey hover:bg-afc-dark-grey hover:border-white/15",
  ghost:
    "bg-transparent text-afc-soft-grey hover:bg-white/5 hover:text-afc-white border border-transparent",
  danger:
    "bg-afc-red-dark text-afc-white hover:bg-afc-red border border-afc-red/50",
  success:
    "bg-afc-green-dark text-afc-white hover:bg-afc-green border border-afc-green/40 shadow-[0_4px_20px_var(--afc-green-glow)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[36px] px-3 py-1.5 text-sm",
  md: "min-h-[44px] px-4 py-2.5 text-sm",
  lg: "min-h-[48px] px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
