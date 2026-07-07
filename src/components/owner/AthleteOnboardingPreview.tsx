"use client";

import { Badge } from "@/components/ui/Badge";
import { AfcAvatar } from "@/components/ui/AfcAvatar";
import { RevealField } from "@/components/ui/RevealField";
import {
  getActivityLevelLabel,
  getGenderLabel,
  type CreateClientFormValues,
} from "@/lib/create-client-form";

interface AthleteOnboardingPreviewProps {
  values: CreateClientFormValues;
  compact?: boolean;
  selectedPlanLabel?: string;
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
  selectedPlanLabel = "No plan yet",
}: AthleteOnboardingPreviewProps) {
  const displayName = values.fullName.trim() || "New Athlete";
  const hasName = Boolean(values.fullName.trim());
  const hasEmail = Boolean(values.email.trim());
  const hasPhone = Boolean(values.phoneNumber.trim());
  const hasGoal = Boolean(values.fitnessGoal.trim());
  const hasActivity = Boolean(values.activityLevel);
  const hasGender = Boolean(values.gender);
  const hasJoinDate = Boolean(values.joinDate);
  const hasPlan = selectedPlanLabel !== "No plan yet";

  return (
    <aside
      className={`afc-onboarding-preview ${compact ? "afc-onboarding-preview--compact" : ""}`}
      aria-label="Athlete profile preview"
    >
      <div className="afc-onboarding-preview__header">
        <p className="afc-onboarding-preview__kicker">Live roster preview</p>
        <Badge variant="success">Pending ACTIVE</Badge>
      </div>

      <AfcAvatar name={displayName} status="pending" size="preview" />

      <div className="afc-onboarding-preview__body">
        <RevealField show={hasName}>
          <h3 className="afc-onboarding-preview__name">{displayName}</h3>
        </RevealField>

        <RevealField show={hasEmail}>
          <p className="afc-onboarding-preview__meta">
            {values.email.trim() || "Email pending"}
          </p>
        </RevealField>

        <RevealField show={hasPhone}>
          <p className="afc-onboarding-preview__meta">
            {values.phoneNumber.trim() || "Phone pending"}
          </p>
        </RevealField>

        <dl className="afc-onboarding-preview__stats">
          <RevealField show={hasGoal} className="afc-onboarding-preview__stat">
            <div>
              <dt>Goal</dt>
              <dd>{values.fitnessGoal.trim() || "—"}</dd>
            </div>
          </RevealField>
          <RevealField show={hasActivity} className="afc-onboarding-preview__stat">
            <div>
              <dt>Activity</dt>
              <dd>{getActivityLevelLabel(values.activityLevel)}</dd>
            </div>
          </RevealField>
          <RevealField show={hasGender} className="afc-onboarding-preview__stat">
            <div>
              <dt>Gender</dt>
              <dd>{getGenderLabel(values.gender)}</dd>
            </div>
          </RevealField>
          <RevealField show={hasJoinDate} className="afc-onboarding-preview__stat">
            <div>
              <dt>Join date</dt>
              <dd>{formatPreviewDate(values.joinDate)}</dd>
            </div>
          </RevealField>
          <RevealField show={hasPlan} className="afc-onboarding-preview__stat">
            <div>
              <dt>Membership</dt>
              <dd>{selectedPlanLabel}</dd>
            </div>
          </RevealField>
        </dl>

        {hasGoal ? (
          <RevealField show={hasGoal}>
            <p className="afc-onboarding-preview__goal">
              <span>Training focus · </span>
              {values.fitnessGoal.trim()}
            </p>
          </RevealField>
        ) : null}
      </div>
    </aside>
  );
}
