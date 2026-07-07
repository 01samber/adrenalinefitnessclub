"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AthleteOnboardingPreview } from "@/components/owner/AthleteOnboardingPreview";
import { PlanSelector } from "@/components/owner/PlanSelector";
import { OnboardingStepIndicator } from "@/components/owner/OnboardingStepIndicator";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ScoreboardHeader } from "@/components/ui/ScoreboardHeader";
import { ApiClientError, apiPost } from "@/lib/api-client";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  createInitialClientFormValues,
  getFirstErrorStep,
  listOnboardingErrorSummary,
  resolveCreateClientErrorMessage,
  toCreateClientPayload,
  validateCreateClientForm,
  type CreateClientFormErrors,
  type CreateClientFormValues,
  type OnboardingStepId,
} from "@/lib/create-client-form";
import { ownerSidebarItems } from "@/lib/owner-sidebar";
import type { CreateClientResponse, OwnerPlan } from "@/types/api";

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-afc-light-grey">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`min-h-[112px] w-full rounded-lg border bg-afc-black/50 px-4 py-3 text-base leading-relaxed text-afc-white placeholder:text-afc-soft-grey/50 transition-all focus:border-afc-gold focus:bg-afc-charcoal focus:outline-none focus:ring-2 focus:ring-afc-gold/25 ${
          error ? "border-afc-red" : "border-afc-border-grey"
        }`}
      />
      {error ? (
        <p className="text-sm text-afc-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function OnboardingSection({
  id,
  step,
  title,
  subtitle,
  accent = "neutral",
  children,
}: {
  id: OnboardingStepId;
  step: number;
  title: string;
  subtitle?: string;
  accent?: "neutral" | "red" | "green";
  children: React.ReactNode;
}) {
  return (
    <section
      id={`onboarding-${id}`}
      className="afc-onboarding-section scroll-mt-28"
      aria-labelledby={`onboarding-${id}-title`}
    >
      <Card accent={accent} hover className="afc-onboarding-section__card">
        <div className="mb-5 flex items-start gap-4 border-b border-afc-border-grey/50 pb-4">
          <span className="afc-onboarding-section__step" aria-hidden>
            {step}
          </span>
          <div className="min-w-0">
            <h2
              id={`onboarding-${id}-title`}
              className="text-lg font-bold tracking-tight text-afc-white sm:text-xl"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-afc-muted">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">{children}</div>
      </Card>
    </section>
  );
}

function CreateClientContent() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<CreateClientFormValues>(
    createInitialClientFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<CreateClientFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightStep, setHighlightStep] = useState<OnboardingStepId | undefined>();
  const [availablePlans, setAvailablePlans] = useState<OwnerPlan[]>([]);

  const selectedPlan = availablePlans.find(
    (plan) => plan.id === values.assignedPlanId,
  );
  const selectedPlanLabel = selectedPlan
    ? selectedPlan.name
    : values.assignedPlanId
      ? "Plan selected"
      : "No plan yet";

  const errorSummary = listOnboardingErrorSummary(fieldErrors);

  function updateField<K extends keyof CreateClientFormValues>(
    key: K,
    value: CreateClientFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
    setHighlightStep(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSuccessMessage("");

    const errors = validateCreateClientForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstStep = getFirstErrorStep(errors);
      setHighlightStep(firstStep);
      formRef.current?.querySelector(`#onboarding-${firstStep}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setFieldErrors({});
    setHighlightStep(undefined);
    setLoading(true);

    try {
      const payload = toCreateClientPayload(values);
      const result = await apiPost<CreateClientResponse>(
        "/api/owner/clients",
        payload,
      );

      setSuccessMessage(
        result.subscription
          ? "Athlete profile created successfully. Membership plan assigned successfully."
          : "Athlete profile created successfully.",
      );

      if (result.client?.id) {
        router.push(`/owner/clients/${result.client.id}`);
        return;
      }

      router.push("/owner/clients");
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? resolveCreateClientErrorMessage(error)
          : resolveCreateClientErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Athlete Onboarding"
      mobileTitle="Onboarding"
      subtitle="Create a new AFC athlete profile, login access, and training foundation."
      sidebarItems={ownerSidebarItems}
      brandSubtitle="Coach Mode"
    >
      <div className="afc-onboarding-page min-w-0 space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <Link
            href="/owner/clients"
            className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-lg border border-afc-border bg-afc-black/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-afc-muted transition-colors hover:border-afc-gold/40 hover:bg-afc-gold/10 hover:text-afc-white"
          >
            <span aria-hidden>←</span>
            Back to squad
          </Link>

          <div className="afc-glass inline-flex w-fit items-center gap-2 rounded-full border border-afc-border-grey/80 px-3 py-1.5">
            <span className="afc-status-pulse shrink-0" aria-hidden />
            <span className="text-xs text-afc-soft-grey">
              Squad registration ·{" "}
              <code className="font-mono text-afc-green">POST /api/owner/clients</code>
            </span>
          </div>
        </div>

        <div className="afc-onboarding-hero hidden min-[480px]:block">
        <ScoreboardHeader
          kicker="Squad registration"
          title="Athlete Onboarding"
          subtitle="Create a new AFC athlete profile, login access, and training foundation."
          live
          badge={<Badge variant="outline">Coach Mode</Badge>}
        />
        </div>

        <div className="afc-onboarding-stepper-wrap">
          <OnboardingStepIndicator values={values} activeStep={highlightStep} />
        </div>

        <div className="afc-onboarding-preview-mobile xl:hidden">
          <AthleteOnboardingPreview
            values={values}
            compact
            selectedPlanLabel={selectedPlanLabel}
          />
        </div>

        {successMessage ? (
          <div
            className="rounded-xl border border-afc-green/40 bg-afc-green/10 px-4 py-3 text-sm text-afc-green-neon"
            role="status"
          >
            {successMessage}
          </div>
        ) : null}

        {submitError ? (
          <div
            className="rounded-xl border border-afc-red/40 bg-afc-red/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}

        {errorSummary.length > 0 ? (
          <div
            className="afc-onboarding-error-summary"
            role="alert"
            aria-live="polite"
          >
            <p className="font-semibold text-afc-white">
              Please review the highlighted fields:
            </p>
            <ul className="mt-2 space-y-1">
              {errorSummary.map((item) => (
                <li key={item.field}>
                  <span className="text-afc-red-hot">{item.field}</span>
                  <span className="text-afc-muted"> — {item.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <form
            ref={formRef}
            id="athlete-onboarding-form"
            className="afc-onboarding-form min-w-0 space-y-5 sm:space-y-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <OnboardingSection
              id="account"
              step={1}
              title="Account Access"
              subtitle="Portal credentials for the new athlete"
              accent="neutral"
            >
              <Input
                label="Full name"
                value={values.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="George Test"
                error={fieldErrors.fullName}
                required
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="athlete@afc.com"
                error={fieldErrors.email}
                required
                autoComplete="email"
              />
              <Input
                label="Phone number"
                type="tel"
                value={values.phoneNumber}
                onChange={(event) =>
                  updateField("phoneNumber", event.target.value)
                }
                placeholder="+96100000044"
                error={fieldErrors.phoneNumber}
                required
                autoComplete="tel"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Temporary password"
                  type="password"
                  value={values.temporaryPassword}
                  onChange={(event) =>
                    updateField("temporaryPassword", event.target.value)
                  }
                  placeholder="Minimum 4 characters"
                  error={fieldErrors.temporaryPassword}
                  hint="Temporary access credentials can be changed later when password management is added."
                  required
                  autoComplete="new-password"
                />
              </div>
            </OnboardingSection>

            <OnboardingSection
              id="personal"
              step={2}
              title="Personal Details"
              subtitle="Core athlete profile information"
            >
              <Input
                label="Date of birth"
                type="date"
                value={values.dateOfBirth}
                onChange={(event) =>
                  updateField("dateOfBirth", event.target.value)
                }
                error={fieldErrors.dateOfBirth}
                required
              />
              <Select
                label="Gender"
                value={values.gender}
                onChange={(value) =>
                  updateField("gender", value as CreateClientFormValues["gender"])
                }
                options={GENDER_OPTIONS}
                placeholder="Select gender"
                error={fieldErrors.gender}
                required
              />
              <Input
                label="Height (cm)"
                type="number"
                inputMode="decimal"
                min={1}
                max={300}
                value={values.heightCm}
                onChange={(event) => updateField("heightCm", event.target.value)}
                placeholder="180"
                error={fieldErrors.heightCm}
                required
              />
              <Input
                label="Join date"
                type="date"
                value={values.joinDate}
                onChange={(event) => updateField("joinDate", event.target.value)}
                error={fieldErrors.joinDate}
                required
              />
            </OnboardingSection>

            <OnboardingSection
              id="fitness"
              step={3}
              title="Fitness Profile"
              subtitle="Training goals and coach notes"
              accent="green"
            >
              <Input
                label="Fitness goal"
                value={values.fitnessGoal}
                onChange={(event) =>
                  updateField("fitnessGoal", event.target.value)
                }
                placeholder="Build strength"
                error={fieldErrors.fitnessGoal}
                required
              />
              <Select
                label="Activity level"
                value={values.activityLevel}
                onChange={(value) =>
                  updateField(
                    "activityLevel",
                    value as CreateClientFormValues["activityLevel"],
                  )
                }
                options={ACTIVITY_LEVEL_OPTIONS}
                placeholder="Select activity level"
                error={fieldErrors.activityLevel}
                required
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Medical notes"
                  value={values.medicalNotes}
                  onChange={(value) => updateField("medicalNotes", value)}
                  placeholder="Optional medical context for coaching staff"
                />
              </div>
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Injuries"
                  value={values.injuries}
                  onChange={(value) => updateField("injuries", value)}
                  placeholder="Optional injury history or restrictions"
                />
              </div>
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Coach notes"
                  value={values.coachNotes}
                  onChange={(value) => updateField("coachNotes", value)}
                  placeholder="Internal notes for the coaching team"
                />
              </div>
            </OnboardingSection>

            <OnboardingSection
              id="emergency"
              step={4}
              title="Emergency Contact"
              subtitle="Required safety contact for training sessions"
            >
              <Input
                label="Emergency contact name"
                value={values.emergencyContactName}
                onChange={(event) =>
                  updateField("emergencyContactName", event.target.value)
                }
                placeholder="Emergency Person"
                error={fieldErrors.emergencyContactName}
                required
                autoComplete="name"
              />
              <Input
                label="Emergency contact phone"
                type="tel"
                value={values.emergencyContactPhone}
                onChange={(event) =>
                  updateField("emergencyContactPhone", event.target.value)
                }
                placeholder="+96100000045"
                error={fieldErrors.emergencyContactPhone}
                required
                autoComplete="tel"
              />
            </OnboardingSection>

            <section
              id="onboarding-plan"
              className="afc-onboarding-section scroll-mt-28"
              aria-labelledby="onboarding-plan-title"
            >
              <Card accent="neutral" hover className="afc-onboarding-section__card">
                <div className="mb-5 flex items-start gap-4 border-b border-afc-border-grey/50 pb-4">
                  <span className="afc-onboarding-section__step" aria-hidden>
                    5
                  </span>
                  <div className="min-w-0">
                    <h2
                      id="onboarding-plan-title"
                      className="text-lg font-bold tracking-tight text-afc-white sm:text-xl"
                    >
                      Membership Plan
                    </h2>
                    <p className="mt-1 text-sm text-afc-muted">
                      Assign the athlete to a training membership during onboarding.
                    </p>
                  </div>
                </div>
                <PlanSelector
                  selectedPlanId={values.assignedPlanId}
                  onChange={(planId) => updateField("assignedPlanId", planId)}
                  onPlansLoaded={setAvailablePlans}
                />
              </Card>
            </section>

            <div className="afc-onboarding-actions afc-onboarding-actions--mobile xl:hidden">
              <div className="afc-onboarding-actions__inner">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={loading}
                  className="afc-onboarding-actions__primary"
                >
                  {loading ? "Creating athlete..." : "Create athlete profile"}
                </Button>
                <Link
                  href="/owner/clients"
                  className="afc-onboarding-actions__cancel"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>

          <aside className="hidden xl:block">
            <div className="afc-onboarding-sidebar">
              <AthleteOnboardingPreview
                values={values}
                selectedPlanLabel={selectedPlanLabel}
              />
              <div className="afc-onboarding-actions afc-onboarding-actions--desktop">
                <Button
                  type="submit"
                  form="athlete-onboarding-form"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  {loading ? "Creating athlete..." : "Create athlete profile"}
                </Button>
                <Link href="/owner/clients">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

export default function CreateClientPage() {
  return (
    <AuthGuard requiredRole="OWNER">
      <CreateClientContent />
    </AuthGuard>
  );
}
