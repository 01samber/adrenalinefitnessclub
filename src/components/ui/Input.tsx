import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  unit?: string;
}

export function Input({
  label,
  error,
  hint,
  unit,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const inputEl = (
    <input
      id={inputId}
      className={`min-h-[48px] w-full rounded-lg border bg-afc-black/50 px-4 py-3 text-base text-afc-white placeholder:text-afc-soft-grey/50 transition-all focus:border-afc-gold focus:bg-afc-charcoal focus:outline-none focus:ring-2 focus:ring-afc-gold/25 ${error ? "border-afc-red" : "border-afc-border-grey"} ${unit ? "afc-input-with-unit__field" : ""} ${className}`}
      {...props}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-afc-light-grey">
        {label}
      </label>
      {unit ? (
        <div className="afc-input-with-unit">
          {inputEl}
          <span className="afc-input-with-unit__suffix" aria-hidden>
            {unit}
          </span>
        </div>
      ) : (
        inputEl
      )}
      {hint && !error ? (
        <p className="text-xs text-afc-soft-grey">{hint}</p>
      ) : null}
      {error ? <p className="text-sm text-afc-red">{error}</p> : null}
    </div>
  );
}
