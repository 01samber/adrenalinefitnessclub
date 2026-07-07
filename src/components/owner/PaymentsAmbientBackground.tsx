export function PaymentsAmbientBackground() {
  return (
    <div className="afc-payments-ambient" aria-hidden="true">
      <div className="afc-payments-ambient__lanes" />
      <svg className="afc-payments-ambient__receipt" viewBox="0 0 120 140" fill="none">
        <path
          d="M20 8h80v112l-8-6-8 6-8-6-8 6-8-6-8 6-8-6V8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M34 34h52M34 52h40M34 70h48M34 88h32" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
      <svg className="afc-payments-ambient__card" viewBox="0 0 120 80" fill="none">
        <rect x="8" y="16" width="104" height="48" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <rect x="16" y="28" width="28" height="18" rx="3" stroke="currentColor" strokeWidth="1.25" />
        <path d="M52 40h44M52 50h28" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </div>
  );
}
