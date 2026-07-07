"use client";

import { Button } from "@/components/ui/Button";
import { SubscriptionStatusBadge } from "@/components/owner/SubscriptionStatusBadge";
import {
  formatSubscriptionDate,
  formatSubscriptionMoney,
} from "@/lib/subscription-utils";
import type { OwnerSubscriptionListItem } from "@/types/api";

interface CancelSubscriptionConfirmModalProps {
  open: boolean;
  subscription: OwnerSubscriptionListItem | null;
  clientName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CancelSubscriptionConfirmModal({
  open,
  subscription,
  clientName,
  loading,
  onCancel,
  onConfirm,
}: CancelSubscriptionConfirmModalProps) {
  if (!open || !subscription) return null;

  return (
    <div
      className="afc-status-modal"
      role="presentation"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="afc-status-modal__panel afc-status-modal__panel--danger"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-subscription-title"
        aria-describedby="cancel-subscription-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="afc-status-modal__accent afc-status-modal__accent--danger" aria-hidden />

        <div className="afc-status-modal__header">
          <SubscriptionStatusBadge status={subscription.status} />
          <h2 id="cancel-subscription-title" className="afc-status-modal__title">
            Cancel Subscription
          </h2>
          <p className="afc-status-modal__client">{clientName}</p>
          <p className="mt-2 text-sm font-semibold text-afc-gold">
            {subscription.plan ? (
              <>
                {subscription.plan.name} ·{" "}
                {formatSubscriptionMoney(
                  subscription.plan.monthlyPrice,
                  subscription.plan.currency,
                )}
              </>
            ) : (
              "No plan assigned"
            )}
          </p>
        </div>

        <p id="cancel-subscription-description" className="afc-status-modal__copy">
          This will stop the athlete&apos;s active membership. Payments already recorded
          will remain in the ledger.
        </p>

        <dl className="grid gap-2 text-sm text-afc-soft-grey">
          <div className="flex justify-between gap-3">
            <dt>Start date</dt>
            <dd className="text-afc-white">{formatSubscriptionDate(subscription.startDate)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Next billing</dt>
            <dd className="text-afc-white">
              {formatSubscriptionDate(subscription.nextBillingDate)}
            </dd>
          </div>
        </dl>

        <div className="afc-status-modal__actions">
          <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={loading}>
            Keep membership
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            Cancel subscription
          </Button>
        </div>
      </div>
    </div>
  );
}
