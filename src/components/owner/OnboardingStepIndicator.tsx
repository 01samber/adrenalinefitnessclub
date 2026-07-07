"use client";

import { useEffect, useRef, useState } from "react";
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
  const completedCount = ONBOARDING_STEPS.filter(
    (step) => getOnboardingStepStatus(step.id, values) === "complete",
  ).length;
  const progressPercent = Math.round(
    (completedCount / ONBOARDING_STEPS.length) * 100,
  );

  const [poppedSteps, setPoppedSteps] = useState<Set<OnboardingStepId>>(
    () => new Set(),
  );
  const prevComplete = useRef<Set<OnboardingStepId>>(new Set());

  useEffect(() => {
    const nowComplete = new Set<OnboardingStepId>();
    for (const step of ONBOARDING_STEPS) {
      if (getOnboardingStepStatus(step.id, values) === "complete") {
        nowComplete.add(step.id);
      }
    }

    const newlyComplete = [...nowComplete].filter(
      (id) => !prevComplete.current.has(id),
    );

    if (newlyComplete.length) {
      setPoppedSteps((current) => {
        const next = new Set(current);
        for (const id of newlyComplete) {
          next.add(id);
        }
        return next;
      });
    }

    prevComplete.current = nowComplete;
  }, [values]);

  return (
    <div className="afc-onboarding-stepper-shell">
      <div
        className="afc-onboarding-progress"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Onboarding progress"
      >
        <div
          className="afc-onboarding-progress__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

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

            const markerPop =
              status === "complete" && poppedSteps.has(step.id);

            return (
              <li
                key={step.id}
                className={`afc-onboarding-stepper__item afc-onboarding-stepper__item--${status}`}
              >
                <div
                  className={[
                    "afc-onboarding-stepper__marker",
                    markerPop ? "afc-onboarding-stepper__marker--pop" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  <span className="afc-onboarding-stepper__index">
                    {status === "complete" ? "✓" : index + 1}
                  </span>
                </div>
                <div className="afc-onboarding-stepper__copy">
                  <span className="afc-onboarding-stepper__label">
                    {step.label}
                  </span>
                  <span className="afc-onboarding-stepper__short">
                    {step.shortLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
