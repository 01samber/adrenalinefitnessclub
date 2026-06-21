"use client";

import { Badge } from "@/components/ui/Badge";
import {
  getActivityLevelLabel,
  getGenderLabel,
  type CreateClientFormValues,
} from "@/lib/create-client-form";

interface AthleteOnboardingPreviewProps {
  values: CreateClientFormValues;
  compact?: boolean;
}

function formatPreviewDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AthleteOnboardingPreview({
  values,
  compact = false,
}: AthleteOnboardingPreviewProps) {
  const displayName = values.fullName.trim() || "New Athlete";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside
      className={`afc-onboarding-preview ${compact ? "afc-onboarding-preview--compact" : ""}`}
      aria-label="Athlete profile preview"
    >
      <div className="afc-onboarding-preview__header">
        <p className="afc-onboarding-preview__kicker">Live roster preview</p>
        <Badge variant="success">Pending ACTIVE</Badge>
      </div>

      <div className="afc-onboarding-preview__avatar" aria-hidden>
        <span>{initial}</span>
      </div>

      <div className="afc-onboarding-preview__body">
        <h3 className="afc-onboarding-preview__name">{displayName}</h3>
        <p className="afc-onboarding-preview__meta">
          {values.email.trim() || "Email pending"}
        </p>
        <p className="afc-onboarding-preview__meta">
          {values.phoneNumber.trim() || "Phone pending"}
        </p>

        <dl className="afc-onboarding-preview__stats">
          <div>
            <dt>Goal</dt>
            <dd>{values.fitnessGoal.trim() || "—"}</dd>
          </div>
          <div>
            <dt>Activity</dt>
            <dd>{getActivityLevelLabel(values.activityLevel)}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{getGenderLabel(values.gender)}</dd>
          </div>
          <div>
            <dt>Join date</dt>
            <dd>{formatPreviewDate(values.joinDate)}</dd>
          </div>
        </dl>

        {values.fitnessGoal.trim() ? (
          <p className="afc-onboarding-preview__goal">
            <span>Training focus · </span>
            {values.fitnessGoal.trim()}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
