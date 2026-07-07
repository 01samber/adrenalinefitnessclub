import { StatCard } from "@/components/ui/StatCard";

export function SubscriptionsWorkspaceSkeleton() {
  return (
    <div
      className="afc-page-stack space-y-6 sm:space-y-8"
      role="status"
      aria-live="polite"
      aria-label="Loading membership workspace"
    >
      <p className="afc-section-label">Syncing membership control…</p>

      <div className="afc-hero-band afc-surface p-6 sm:p-8">
        <div className="afc-stat-tile__skeleton-label w-28" />
        <div className="mt-4 h-6 w-full max-w-2xl rounded bg-afc-panel-2 animate-pulse" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-afc-panel-2/80 animate-pulse" />
      </div>

      <div className="afc-stat-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCard key={index} label="—" value="—" loading staggerIndex={index} />
        ))}
      </div>

      <div className="afc-surface p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 rounded-lg bg-afc-panel-2/70 animate-pulse" />
          ))}
        </div>
      </div>

      <div className="hidden xl:block afc-surface afc-roster-board p-0">
        <div className="afc-roster-scroll p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 rounded bg-afc-panel-2/60 animate-pulse" />
          ))}
        </div>
      </div>

      <div className="space-y-4 xl:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="afc-subscription-card afc-subscription-card--neutral p-5">
            <div className="h-5 w-40 rounded bg-afc-panel-2 animate-pulse" />
            <div className="mt-3 h-4 w-56 rounded bg-afc-panel-2/80 animate-pulse" />
            <div className="mt-4 h-10 rounded bg-afc-panel-2/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
