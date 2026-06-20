"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";

interface FrozenAccountOverlayProps {
  clientName?: string | null;
}

export function FrozenAccountOverlay({ clientName }: FrozenAccountOverlayProps) {
  const greeting = clientName?.trim() ? `${clientName.trim()}, ` : "";

  return (
    <div
      className="afc-frozen-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="frozen-account-title"
      aria-describedby="frozen-account-description"
    >
      <div className="afc-frozen-overlay__panel">
        <div className="afc-frozen-overlay__accent" aria-hidden />

        <div className="afc-frozen-overlay__header">
          <span className="afc-frozen-overlay__badge">FROZEN</span>
          <h2 id="frozen-account-title" className="afc-frozen-overlay__title">
            Account Frozen
          </h2>
        </div>

        <p id="frozen-account-description" className="afc-frozen-overlay__lead">
          {greeting}your membership is currently frozen by Adrenaline Fitness Center.
        </p>

        <p className="afc-frozen-overlay__copy">
          You can view limited account status, but your portal access is paused until
          the coach reactivates your account. Please contact the coach or gym owner for
          more information.
        </p>

        <p className="afc-frozen-overlay__note">
          This message will disappear automatically once your account is reactivated.
        </p>

        <div className="afc-frozen-overlay__actions">
          <LogoutButton variant="danger" size="md" className="w-full sm:w-auto" />
        </div>
      </div>
    </div>
  );
}
