"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiClientError, apiGet, apiPost } from "@/lib/api-client";
import {
  CREATE_PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  resolvePaymentErrorMessage,
  todayDateInputValue,
  toIsoDateTimeFromDateInput,
} from "@/lib/payment-utils";
import type {
  CreatePaymentResponse,
  OwnerClientListItem,
  OwnerSubscriptionListItem,
  OwnerSubscriptionsResponse,
  PaymentMethod,
  PaymentStatus,
} from "@/types/api";

interface CreatePaymentModalProps {
  open: boolean;
  clients: OwnerClientListItem[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface FormState {
  clientId: string;
  subscriptionId: string;
  amount: string;
  currency: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes: string;
}

function createInitialFormState(): FormState {
  return {
    clientId: "",
    subscriptionId: "",
    amount: "",
    currency: "USD",
    dueDate: todayDateInputValue(),
    status: "UNPAID",
    paymentMethod: "CASH",
    paymentDate: "",
    notes: "",
  };
}

export function CreatePaymentModal({
  open,
  clients,
  onClose,
  onSuccess,
}: CreatePaymentModalProps) {
  const [values, setValues] = useState<FormState>(createInitialFormState);
  const [subscriptions, setSubscriptions] = useState<OwnerSubscriptionListItem[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
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
    if (!open || !values.clientId) {
      return;
    }

    let cancelled = false;

    async function fetchSubscriptions() {
      setSubscriptionsLoading(true);
      try {
        const result = await apiGet<OwnerSubscriptionsResponse>(
          `/api/owner/subscriptions?clientId=${values.clientId}&limit=20`,
        );
        if (!cancelled) {
          setSubscriptions(result.items);
        }
      } catch {
        if (!cancelled) {
          setSubscriptions([]);
        }
      } finally {
        if (!cancelled) {
          setSubscriptionsLoading(false);
        }
      }
    }

    void fetchSubscriptions();

    return () => {
      cancelled = true;
    };
  }, [open, values.clientId]);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.user.id,
        label: client.user.fullName,
        helper: client.user.email,
      })),
    [clients],
  );

  const subscriptionOptions = useMemo(
    () => [
      { value: "", label: "No subscription link" },
      ...subscriptions.map((subscription) => ({
        value: subscription.id,
        label: subscription.plan.name,
        helper: `${subscription.status} · ${subscription.plan.sessionsPerWeek} sessions/week`,
      })),
    ],
    [subscriptions],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (key === "clientId") {
      setSubscriptions([]);
    }

    setValues((current) => {
      const next = { ...current, [key]: value };

      if (key === "clientId") {
        next.subscriptionId = "";
        next.amount = "";
        next.currency = "USD";
      }

      if (key === "subscriptionId" && value) {
        const subscription = subscriptions.find((item) => item.id === value);
        if (subscription) {
          next.amount = subscription.plan.monthlyPrice;
          next.currency = subscription.plan.currency;
        }
      }

      return next;
    });
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const amount = Number(values.amount);
    if (!values.clientId) {
      setSubmitError("Select an athlete for this payment.");
      return;
    }
    if (!values.dueDate) {
      setSubmitError("Due date is required.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError("Enter a valid payment amount.");
      return;
    }
    if (values.currency.trim().length !== 3) {
      setSubmitError("Currency must be a 3-letter code.");
      return;
    }

    setLoading(true);

    try {
      await apiPost<CreatePaymentResponse>("/api/owner/payments", {
        clientId: values.clientId,
        subscriptionId: values.subscriptionId || null,
        amount,
        currency: values.currency.trim().toUpperCase(),
        dueDate: values.dueDate,
        status: values.status,
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate
          ? toIsoDateTimeFromDateInput(values.paymentDate)
          : values.status === "PAID"
            ? new Date().toISOString()
            : null,
        notes: values.notes.trim() || undefined,
      });
      onSuccess("Payment created successfully.");
      onClose();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message);
      } else {
        setSubmitError(resolvePaymentErrorMessage(error));
      }
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
        aria-labelledby="create-payment-title"
        aria-describedby="create-payment-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="afc-measurement-modal__accent" aria-hidden />

        <header className="afc-measurement-modal__header">
          <p className="afc-measurement-modal__kicker">Revenue tracking</p>
          <h2 id="create-payment-title" className="afc-measurement-modal__title">
            Create Payment
          </h2>
          <p id="create-payment-subtitle" className="afc-measurement-modal__subtitle">
            Record a new payment for an athlete subscription or one-off charge.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Athlete"
              value={values.clientId}
              options={clientOptions}
              onChange={(value) => updateField("clientId", value)}
              placeholder="Select athlete"
              required
              disabled={loading}
            />
            <Select
              label="Subscription"
              value={values.subscriptionId}
              options={subscriptionOptions}
              onChange={(value) => updateField("subscriptionId", value)}
              placeholder={subscriptionsLoading ? "Loading subscriptions…" : "Optional"}
              disabled={loading || !values.clientId || subscriptionsLoading}
              usePlaceholderOption={false}
              hint="Optional — links payment to a membership plan"
            />
            <Input
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              value={values.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              required
              disabled={loading}
            />
            <Input
              label="Currency"
              value={values.currency}
              onChange={(event) => updateField("currency", event.target.value.toUpperCase())}
              maxLength={3}
              required
              disabled={loading}
            />
            <Input
              label="Due date"
              type="date"
              value={values.dueDate}
              onChange={(event) => updateField("dueDate", event.target.value)}
              required
              disabled={loading}
            />
            <Select
              label="Status"
              value={values.status}
              options={CREATE_PAYMENT_STATUS_OPTIONS}
              onChange={(value) => updateField("status", value as PaymentStatus)}
              disabled={loading}
              usePlaceholderOption={false}
            />
            <Select
              label="Payment method"
              value={values.paymentMethod}
              options={PAYMENT_METHOD_OPTIONS}
              onChange={(value) => updateField("paymentMethod", value as PaymentMethod)}
              disabled={loading}
              usePlaceholderOption={false}
            />
            <Input
              label="Paid date"
              type="date"
              value={values.paymentDate}
              onChange={(event) => updateField("paymentDate", event.target.value)}
              disabled={loading}
              hint="Optional — auto-set when status is Paid"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="payment-notes"
              className="mb-2 block text-sm font-medium text-afc-light-grey"
            >
              Notes
            </label>
            <textarea
              id="payment-notes"
              value={values.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              disabled={loading}
              rows={3}
              maxLength={1000}
              className="w-full rounded-lg border border-afc-border-grey bg-afc-black/50 px-4 py-3 text-base text-afc-white placeholder:text-afc-soft-grey/50 transition-all focus:border-afc-gold focus:bg-afc-charcoal focus:outline-none focus:ring-2 focus:ring-afc-gold/25"
              placeholder="Optional payment notes"
            />
          </div>

          <div className="afc-measurement-modal__actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>
              {loading ? "Creating payment..." : "Create payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
