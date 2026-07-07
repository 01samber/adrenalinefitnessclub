"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  defaultNextBillingDate,
  resolveSubscriptionErrorMessage,
  todayDateInputValue,
} from "@/lib/subscription-utils";
import type {
  CreateSubscriptionResponse,
  OwnerClientListItem,
  OwnerPlan,
  OwnerPlansResponse,
} from "@/types/api";

interface CreateSubscriptionModalProps {
  open: boolean;
  clients: OwnerClientListItem[];
  presetClientId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface FormState {
  clientId: string;
  planId: string;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
}

function createInitialFormState(presetClientId?: string): FormState {
  const startDate = todayDateInputValue();
  return {
    clientId: presetClientId ?? "",
    planId: "",
    startDate,
    endDate: "",
    nextBillingDate: defaultNextBillingDate(startDate),
    autoRenew: true,
  };
}

export function CreateSubscriptionModal({
  open,
  clients,
  presetClientId,
  onClose,
  onSuccess,
}: CreateSubscriptionModalProps) {
  const [values, setValues] = useState<FormState>(() =>
    createInitialFormState(presetClientId),
  );
  const [plans, setPlans] = useState<OwnerPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, loading, onClose]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function fetchPlans() {
      setPlansLoading(true);
      try {
        const result = await apiGet<OwnerPlansResponse>("/api/owner/plans");
        if (!cancelled) setPlans(result.items);
      } catch {
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    }

    void fetchPlans();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.user.id,
        label: client.user.fullName,
        helper: client.user.email,
      })),
    [clients],
  );

  const planOptions = useMemo(
    () =>
      plans.map((plan) => ({
        value: plan.id,
        label: plan.name,
        helper: `${plan.sessionsPerWeek} sessions/week · ${plan.currency} ${plan.monthlyPrice}/mo`,
      })),
    [plans],
  );

  const selectedPlan = plans.find((plan) => plan.id === values.planId);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "startDate" && typeof value === "string") {
        next.nextBillingDate = defaultNextBillingDate(value);
      }
      return next;
    });
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    if (!values.clientId) {
      setSubmitError("Select an athlete for this membership.");
      return;
    }
    if (!values.planId) {
      setSubmitError("Select a membership plan.");
      return;
    }
    if (!values.startDate) {
      setSubmitError("Start date is required.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        clientId: values.clientId,
        planId: values.planId,
        startDate: values.startDate,
        status: "ACTIVE",
        autoRenew: values.autoRenew,
      };

      if (values.endDate) payload.endDate = values.endDate;
      if (values.nextBillingDate) payload.nextBillingDate = values.nextBillingDate;

      await apiPost<CreateSubscriptionResponse>("/api/owner/subscriptions", payload);
      onSuccess("Membership subscription created successfully.");
      onClose();
    } catch (error) {
      setSubmitError(resolveSubscriptionErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const selectedClient = clients.find((client) => client.user.id === values.clientId);

  return (
    <div
      className="afc-measurement-modal"
      role="presentation"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="afc-measurement-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-subscription-title"
        aria-describedby="create-subscription-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="afc-measurement-modal__accent" aria-hidden />

        <header className="afc-measurement-modal__header">
          <p className="afc-measurement-modal__kicker">Membership control</p>
          <h2 id="create-subscription-title" className="afc-measurement-modal__title">
            Create Subscription
          </h2>
          <p id="create-subscription-subtitle" className="afc-measurement-modal__subtitle">
            Assign a real membership plan with billing dates for this athlete.
          </p>
          {selectedClient ? (
            <p className="afc-measurement-modal__client">{selectedClient.user.fullName}</p>
          ) : null}
        </header>

        {submitError ? (
          <div className="afc-measurement-modal__error" role="alert">
            {submitError}
          </div>
        ) : null}

        <form className="afc-measurement-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="afc-measurement-modal__body afc-modal-scroll">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Athlete"
                value={values.clientId}
                options={clientOptions}
                onChange={(value) => updateField("clientId", value)}
                placeholder="Select athlete"
                required
                disabled={loading || Boolean(presetClientId)}
                hint={presetClientId ? "Athlete is fixed for this profile." : undefined}
              />
              <Select
                label="Membership plan"
                value={values.planId}
                options={planOptions}
                onChange={(value) => updateField("planId", value)}
                placeholder={plansLoading ? "Loading plans…" : "Select plan"}
                required
                disabled={loading || plansLoading}
              />
              <Input
                label="Start date"
                type="date"
                value={values.startDate}
                onChange={(event) => updateField("startDate", event.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Next billing date"
                type="date"
                value={values.nextBillingDate}
                onChange={(event) => updateField("nextBillingDate", event.target.value)}
                disabled={loading}
                hint="Defaults to 30 days after start if omitted on create."
              />
              <Input
                label="End date"
                type="date"
                value={values.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
                disabled={loading}
                hint="Optional — leave empty for open-ended membership."
              />
            </div>

            {selectedPlan ? (
              <p className="afc-payment-method-helper">
                Selected plan: {selectedPlan.sessionsPerWeek} sessions/week at{" "}
                {selectedPlan.currency} {selectedPlan.monthlyPrice}/month.
              </p>
            ) : null}

            <label className="mt-4 flex min-h-[44px] items-center gap-3 text-sm text-afc-light-grey">
              <input
                type="checkbox"
                checked={values.autoRenew}
                onChange={(event) => updateField("autoRenew", event.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-afc-border-grey bg-afc-black/50 text-afc-gold focus:ring-afc-gold/25"
              />
              Auto-renew membership
            </label>
          </div>

          <div className="afc-measurement-modal__actions">
            <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>
              {loading ? "Creating subscription..." : "Create subscription"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
