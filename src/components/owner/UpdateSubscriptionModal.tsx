"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  SUBSCRIPTION_STATUS_OPTIONS,
  resolveSubscriptionErrorMessage,
} from "@/lib/subscription-utils";
import type {
  OwnerPlan,
  OwnerPlansResponse,
  OwnerSubscriptionListItem,
  SubscriptionStatus,
  UpdateSubscriptionResponse,
} from "@/types/api";

interface UpdateSubscriptionModalProps {
  open: boolean;
  subscription: OwnerSubscriptionListItem | null;
  clientName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface FormState {
  planId: string;
  endDate: string;
  nextBillingDate: string;
  status: SubscriptionStatus | "";
  autoRenew: boolean;
}

function createInitialFormState(
  subscription: OwnerSubscriptionListItem | null,
): FormState {
  if (!subscription) {
    return {
      planId: "",
      endDate: "",
      nextBillingDate: "",
      status: "",
      autoRenew: true,
    };
  }

  return {
    planId: subscription.planId,
    endDate: subscription.endDate?.slice(0, 10) ?? "",
    nextBillingDate: subscription.nextBillingDate?.slice(0, 10) ?? "",
    status: subscription.status as SubscriptionStatus,
    autoRenew: subscription.autoRenew,
  };
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export function UpdateSubscriptionModal({
  open,
  subscription,
  clientName,
  onClose,
  onSuccess,
}: UpdateSubscriptionModalProps) {
  const [values, setValues] = useState<FormState>(() =>
    createInitialFormState(subscription),
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

  const planOptions = useMemo(
    () =>
      plans.map((plan) => ({
        value: plan.id,
        label: plan.name,
        helper: `${plan.sessionsPerWeek} sessions/week · ${plan.currency} ${plan.monthlyPrice}/mo`,
      })),
    [plans],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subscription) return;

    setSubmitError("");
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {};

      if (values.planId && values.planId !== subscription.planId) {
        payload.planId = values.planId;
      }

      const currentEndDate = toDateInputValue(subscription.endDate);
      if (values.endDate !== currentEndDate) {
        payload.endDate = values.endDate || null;
      }

      const currentNextBilling = toDateInputValue(subscription.nextBillingDate);
      if (values.nextBillingDate && values.nextBillingDate !== currentNextBilling) {
        payload.nextBillingDate = values.nextBillingDate;
      }

      if (values.status && values.status !== subscription.status) {
        payload.status = values.status;
      }

      if (values.autoRenew !== subscription.autoRenew) {
        payload.autoRenew = values.autoRenew;
      }

      if (Object.keys(payload).length === 0) {
        setSubmitError("Change at least one field before saving.");
        setLoading(false);
        return;
      }

      await apiPatch<UpdateSubscriptionResponse>(
        `/api/owner/subscriptions/${subscription.id}`,
        payload,
      );
      onSuccess("Membership subscription updated successfully.");
      onClose();
    } catch (error) {
      setSubmitError(resolveSubscriptionErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (!open || !subscription) return null;

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
        aria-labelledby="update-subscription-title"
        aria-describedby="update-subscription-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="afc-measurement-modal__accent" aria-hidden />

        <header className="afc-measurement-modal__header">
          <p className="afc-measurement-modal__kicker">Membership control</p>
          <h2 id="update-subscription-title" className="afc-measurement-modal__title">
            Update Subscription
          </h2>
          <p id="update-subscription-subtitle" className="afc-measurement-modal__subtitle">
            Change plan, billing dates, or membership status.
          </p>
          <p className="afc-measurement-modal__client">{clientName}</p>
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
                label="Membership plan"
                value={values.planId}
                options={planOptions}
                onChange={(value) => updateField("planId", value)}
                placeholder={plansLoading ? "Loading plans…" : "Select plan"}
                disabled={loading || plansLoading}
                usePlaceholderOption={false}
              />
              <Select
                label="Status"
                value={values.status}
                options={SUBSCRIPTION_STATUS_OPTIONS}
                onChange={(value) => updateField("status", value as SubscriptionStatus)}
                disabled={loading}
                usePlaceholderOption={false}
              />
              <Input
                label="Next billing date"
                type="date"
                value={values.nextBillingDate}
                onChange={(event) => updateField("nextBillingDate", event.target.value)}
                disabled={loading}
              />
              <Input
                label="End date"
                type="date"
                value={values.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
                disabled={loading}
                hint="Leave empty to clear the end date."
              />
            </div>

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
              {loading ? "Saving changes..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
