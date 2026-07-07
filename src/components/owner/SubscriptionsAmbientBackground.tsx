export function SubscriptionsAmbientBackground() {
  return (
    <div className="afc-subscriptions-ambient" aria-hidden="true">
      <div className="afc-subscriptions-ambient__lanes" />
      <svg className="afc-subscriptions-ambient__badge" viewBox="0 0 96 96" fill="none">
        <path
          d="M48 8 56 32l24 4-18 16 5 24-19-12-19 12 5-24L20 36l24-4 8-24Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="afc-subscriptions-ambient__card" viewBox="0 0 120 80" fill="none">
        <rect x="8" y="16" width="104" height="48" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 34h28M20 46h44M20 58h20" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </div>
  );
}
