import { EmptyStateIcon, type EmptyStateVariant } from "@/components/ui/EmptyStateIcon";

interface DataRowProps {
  label: string;
  value: string;
}

export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="afc-data-row">
      <span className="text-sm text-afc-soft-grey">{label}</span>
      <span className="text-right text-sm font-medium leading-snug text-afc-white">
        {value}
      </span>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  variant?: EmptyStateVariant;
}

export function EmptyState({ message, variant = "generic" }: EmptyStateProps) {
  return (
    <div
      className={`afc-empty-state afc-empty-state--${variant}`}
      role="status"
    >
      <EmptyStateIcon variant={variant} />
      <p className="afc-empty-state__message">{message}</p>
    </div>
  );
}
