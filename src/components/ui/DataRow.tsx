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

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-afc-border-grey/80 bg-afc-black/30 px-4 py-8 text-center">
      <p className="text-sm leading-relaxed text-afc-soft-grey">{message}</p>
    </div>
  );
}
