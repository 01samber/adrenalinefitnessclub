"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CancelSubscriptionConfirmModal } from "@/components/owner/CancelSubscriptionConfirmModal";
import { CreateSubscriptionModal } from "@/components/owner/CreateSubscriptionModal";
import { UpdateSubscriptionModal } from "@/components/owner/UpdateSubscriptionModal";
import { Button } from "@/components/ui/Button";
import { DataRow, EmptyState } from "@/components/ui/DataRow";
import { apiPatch } from "@/lib/api-client";
import {
  canCancelSubscription,
  canUpdateSubscription,
  formatSubscriptionDate,
  formatSubscriptionMoney,
  formatSubscriptionStatus,
  isRenewableSubscriptionStatus,
  resolveSubscriptionErrorMessage,
} from "@/lib/subscription-utils";
import type {
  CancelSubscriptionResponse,
  ClientSubscription,
  OwnerClientListItem,
  OwnerSubscriptionListItem,
} from "@/types/api";

interface SubscriptionManagementPanelProps {
  clientId: string;
  clientName: string;
  subscriptions: ClientSubscription[];
  clients: OwnerClientListItem[];
  onChanged: (message: string) => void;
}

function getPrimarySubscription(subscriptions: ClientSubscription[]) {
  return (
    subscriptions.find((subscription) => subscription.status === "ACTIVE") ??
    subscriptions[0] ??
    null
  );
}

function toListItem(subscription: ClientSubscription): OwnerSubscriptionListItem {
  return {
    id: subscription.id,
    clientId: subscription.clientId,
    planId: subscription.planId,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    nextBillingDate: subscription.nextBillingDate,
    status: subscription.status,
    autoRenew: subscription.autoRenew,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    client: null,
    latestPayment: null,
    plan: {
      id: subscription.plan.id,
      name: subscription.plan.name,
      sessionsPerWeek: subscription.plan.sessionsPerWeek,
      monthlyPrice: subscription.plan.monthlyPrice,
      currency: subscription.plan.currency,
      status: subscription.plan.isActive ? "ACTIVE" : "INACTIVE",
      isActive: subscription.plan.isActive,
    },
  };
}

export function SubscriptionManagementPanel({
  clientId,
  clientName,
  subscriptions,
  clients,
  onChanged,
}: SubscriptionManagementPanelProps) {
  const primarySubscription = getPrimarySubscription(subscriptions);
  const hasActive = subscriptions.some((item) => item.status === "ACTIVE");

  const [createOpen, setCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const updateTarget = useMemo(
    () => (primarySubscription ? toListItem(primarySubscription) : null),
    [primarySubscription],
  );

  async function handleCancelConfirm() {
    if (!updateTarget) return;

    setLoading(true);
    setActionError("");

    try {
      await apiPatch<CancelSubscriptionResponse>(
        `/api/owner/subscriptions/${updateTarget.id}/cancel`,
      );
      setCancelOpen(false);
      onChanged("Membership subscription cancelled successfully.");
    } catch (error) {
      setActionError(resolveSubscriptionErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {actionError ? (
        <p className="mb-4 rounded-xl border border-afc-red/40 bg-afc-red/10 px-4 py-3 text-sm text-red-300" role="alert">
          {actionError}
        </p>
      ) : null}

      {primarySubscription ? (
        <>
          <DataRow label="Plan" value={primarySubscription.plan?.name ?? "No plan assigned"} />
          <DataRow
            label="Sessions / week"
            value={
              primarySubscription.plan
                ? String(primarySubscription.plan.sessionsPerWeek)
                : "—"
            }
          />
          <DataRow
            label="Monthly price"
            value={
              primarySubscription.plan
                ? formatSubscriptionMoney(
                    primarySubscription.plan.monthlyPrice,
                    primarySubscription.plan.currency,
                  )
                : "—"
            }
          />
          <DataRow
            label="Start date"
            value={formatSubscriptionDate(primarySubscription.startDate)}
          />
          <DataRow
            label="End date"
            value={formatSubscriptionDate(primarySubscription.endDate)}
          />
          <DataRow
            label="Next billing"
            value={formatSubscriptionDate(primarySubscription.nextBillingDate)}
          />
          <DataRow
            label="Auto-renew"
            value={primarySubscription.autoRenew ? "Enabled" : "Disabled"}
          />
          <DataRow
            label="Status"
            value={formatSubscriptionStatus(primarySubscription.status)}
          />
        </>
      ) : (
        <EmptyState message="No subscription on file." />
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!hasActive ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            className="min-h-[44px] w-full sm:w-auto"
            onClick={() => {
              setCreateKey((key) => key + 1);
              setCreateOpen(true);
            }}
          >
            {primarySubscription && isRenewableSubscriptionStatus(primarySubscription.status)
              ? "Renew membership"
              : "Create subscription"}
          </Button>
        ) : null}

        {primarySubscription && canUpdateSubscription(primarySubscription.status) ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="min-h-[44px] w-full sm:w-auto"
            onClick={() => {
              setUpdateKey((key) => key + 1);
              setUpdateOpen(true);
            }}
          >
            Update subscription
          </Button>
        ) : null}

        {primarySubscription && canCancelSubscription(primarySubscription.status) ? (
          <Button
            type="button"
            variant="danger"
            size="md"
            className="min-h-[44px] w-full sm:w-auto"
            onClick={() => setCancelOpen(true)}
          >
            Cancel subscription
          </Button>
        ) : null}

        <Link href={`/owner/subscriptions?clientId=${clientId}`} className="w-full sm:w-auto">
          <Button type="button" variant="ghost" size="md" className="min-h-[44px] w-full">
            Open membership workspace
          </Button>
        </Link>
      </div>

      <CreateSubscriptionModal
        key={`create-subscription-${clientId}-${createKey}`}
        open={createOpen}
        clients={clients}
        presetClientId={clientId}
        onClose={() => setCreateOpen(false)}
        onSuccess={onChanged}
      />

      <UpdateSubscriptionModal
        key={`update-subscription-${clientId}-${updateKey}`}
        open={updateOpen}
        subscription={updateTarget}
        clientName={clientName}
        onClose={() => setUpdateOpen(false)}
        onSuccess={onChanged}
      />

      <CancelSubscriptionConfirmModal
        open={cancelOpen}
        subscription={updateTarget}
        clientName={clientName}
        loading={loading}
        onCancel={() => {
          if (!loading) setCancelOpen(false);
        }}
        onConfirm={() => void handleCancelConfirm()}
      />
    </>
  );
}
