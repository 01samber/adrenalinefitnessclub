export function DashboardAmbient() {
  return (
    <div className="afc-dashboard-ambient" aria-hidden>
      <div className="afc-dashboard-ambient__lanes" />
      <svg
        className="afc-dashboard-ambient__barbell"
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="48" y1="40" x2="272" y2="40" stroke="currentColor" strokeWidth="2" />
        <rect x="12" y="22" width="22" height="36" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <rect x="286" y="22" width="22" height="36" rx="3" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    </div>
  );
}
