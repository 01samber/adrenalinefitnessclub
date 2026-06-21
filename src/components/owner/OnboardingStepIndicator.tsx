"use client";

import {
  ONBOARDING_STEPS,
  getOnboardingStepStatus,
  type CreateClientFormValues,
  type OnboardingStepId,
} from "@/lib/create-client-form";

interface OnboardingStepIndicatorProps {
  values: CreateClientFormValues;
  activeStep?: OnboardingStepId;
}

export function OnboardingStepIndicator({
  values,
  activeStep,
}: OnboardingStepIndicatorProps) {
  return (
    <nav
      className="afc-onboarding-stepper"
      aria-label="Athlete onboarding progress"
    >
      <ol className="afc-onboarding-stepper__list">
        {ONBOARDING_STEPS.map((step, index) => {
          const status = activeStep
            ? step.id === activeStep
              ? "current"
              : getOnboardingStepStatus(step.id, values)
            : getOnboardingStepStatus(step.id, values);

          return (
            <li
              key={step.id}
              className={`afc-onboarding-stepper__item afc-onboarding-stepper__item--${status}`}
            >
              <div className="afc-onboarding-stepper__marker" aria-hidden>
                <span className="afc-onboarding-stepper__index">
                  {status === "complete" ? "✓" : index + 1}
                </span>
              </div>
              <div className="afc-onboarding-stepper__copy">
                <span className="afc-onboarding-stepper__label">{step.label}</span>
                <span className="afc-onboarding-stepper__short">
                  {step.shortLabel}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
