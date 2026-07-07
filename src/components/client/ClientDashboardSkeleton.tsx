import { StatCard } from "@/components/ui/StatCard";

function PanelSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`afc-surface ${tall ? "p-6 sm:p-8" : "p-5"}`}>
      <div className="afc-stat-tile__skeleton-label w-28" />
      <div className="mt-4 h-4 w-full max-w-md rounded bg-afc-panel-2 animate-pulse" />
      <div className="mt-3 h-4 w-2/3 max-w-sm rounded bg-afc-panel-2/80 animate-pulse" />
      {tall ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-10 rounded-lg bg-afc-panel-2/70 animate-pulse"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ClientDashboardSkeleton() {
  return (
    <div
      className="afc-page-stack space-y-6 sm:space-y-8"
      role="status"
      aria-live="polite"
      aria-label="Loading athlete dashboard"
    >
      <p className="afc-section-label">Syncing live athlete data…</p>

      <div className="afc-hero-band afc-surface p-6 sm:p-8">
        <div className="afc-stat-tile__skeleton-label w-24" />
        <div className="mt-4 h-6 w-full max-w-2xl rounded bg-afc-panel-2 animate-pulse" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-afc-panel-2/80 animate-pulse" />
        <div className="mt-5 h-8 w-48 rounded bg-afc-panel-2/60 animate-pulse" />
      </div>

      <div className="afc-client-hero rounded-[1.125rem] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 rounded-xl bg-afc-panel-2 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-48 rounded bg-afc-panel-2 animate-pulse" />
            <div className="h-4 w-56 rounded bg-afc-panel-2/80 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-7 w-24 rounded-full bg-afc-panel-2/70 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="afc-stat-tile__skeleton-label mb-4 w-36" />
        <div className="afc-stat-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <StatCard key={index} label="—" value="—" loading staggerIndex={index} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <PanelSkeleton tall />
        <PanelSkeleton tall />
      </div>
    </div>
  );
}
