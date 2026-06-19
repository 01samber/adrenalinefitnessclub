import type { HTMLAttributes, ReactNode } from "react";

type CardAccent = "none" | "red" | "green" | "neutral";
type CardVariant = "default" | "elevated" | "glass";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  title?: string;
  subtitle?: string;
  accent?: CardAccent;
  variant?: CardVariant;
  hover?: boolean;
  headerAction?: ReactNode;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

const accentClasses: Record<CardAccent, string> = {
  none: "",
  red: "afc-surface-accent-red",
  green: "afc-surface-accent-green",
  neutral: "afc-surface-accent-neutral",
};

const variantClasses: Record<CardVariant, string> = {
  default: "afc-surface",
  elevated: "afc-surface afc-surface-elevated",
  glass: "afc-surface afc-glass",
};

export function Card({
  padding = "md",
  title,
  subtitle,
  accent = "none",
  variant = "default",
  hover = false,
  headerAction,
  className = "",
  children,
  ...props
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || headerAction);

  return (
    <div
      className={`${variantClasses[variant]} ${accentClasses[accent]} ${hover ? "afc-surface--hover" : ""} ${className}`}
      {...props}
    >
      {hasHeader ? (
        <div
          className={`relative z-[1] flex flex-col gap-3 border-b border-afc-border-grey/60 sm:flex-row sm:items-start sm:justify-between ${padding === "none" ? "px-5 py-4 sm:px-6" : `${paddingClasses[padding]} pb-4`}`}
        >
          <div>
            {title ? (
              <h2 className="text-base font-semibold tracking-tight text-afc-white sm:text-lg">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm leading-relaxed text-afc-soft-grey">
                {subtitle}
              </p>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      ) : null}

      <div
        className={`relative z-[1] ${
          hasHeader
            ? padding === "none"
              ? "px-5 py-4 sm:px-6"
              : `${paddingClasses[padding]} pt-4`
            : paddingClasses[padding]
        }`}
      >
        {children}
      </div>
    </div>
  );
}
