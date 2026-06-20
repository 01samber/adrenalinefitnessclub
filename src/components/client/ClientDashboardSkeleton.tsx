export function ClientDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="afc-client-hero animate-pulse rounded-[1.125rem] p-8">
        <div className="h-4 w-32 rounded bg-afc-border-grey/40" />
        <div className="mt-4 h-10 w-64 rounded bg-afc-border-grey/40" />
        <div className="mt-3 h-4 w-full max-w-lg rounded bg-afc-border-grey/30" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="afc-surface h-28 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="afc-surface h-64 animate-pulse" />
        <div className="afc-surface h-64 animate-pulse" />
      </div>
    </div>
  );
}
