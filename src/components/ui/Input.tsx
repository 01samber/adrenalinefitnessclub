import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-afc-light-grey">
        {label}
      </label>
      <input
        id={inputId}
        className={`min-h-[48px] w-full rounded-xl border bg-afc-black/40 px-4 py-3 text-base text-afc-white placeholder:text-afc-soft-grey/50 transition-all focus:border-afc-red focus:bg-afc-charcoal focus:outline-none focus:ring-2 focus:ring-afc-red/25 sm:text-sm ${error ? "border-afc-red" : "border-afc-border-grey"} ${className}`}
        {...props}
      />
      {hint && !error ? (
        <p className="text-xs text-afc-soft-grey">{hint}</p>
      ) : null}
      {error ? <p className="text-sm text-afc-red">{error}</p> : null}
    </div>
  );
}
