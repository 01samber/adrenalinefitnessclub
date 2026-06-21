"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiClientError, apiPatch } from "@/lib/api-client";
import {
  clientStatusActionLabel,
  clientStatusSuccessMessage,
  getClientStatusAction,
  type ClientStatusAction,
} from "@/lib/client-status-actions";
import type { OwnerClientStatusUpdate } from "@/types/api";
import { ClientStatusConfirmModal } from "@/components/owner/ClientStatusConfirmModal";

interface ClientStatusActionsProps {
  clientId: string;
  clientName: string;
  userStatus: string;
  layout?: "stacked" | "inline";
  onStatusChanged?: (message: string) => void;
}

export function ClientStatusActions({
  clientId,
  clientName,
  userStatus,
  layout = "stacked",
  onStatusChanged,
}: ClientStatusActionsProps) {
  const [pendingAction, setPendingAction] = useState<ClientStatusAction | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const availableAction = getClientStatusAction(userStatus);

  async function handleConfirm() {
    if (!pendingAction) return;

    setLoading(true);
    setActionError("");

    try {
      const endpoint =
        pendingAction === "freeze"
          ? `/api/owner/clients/${clientId}/freeze`
          : `/api/owner/clients/${clientId}/reactivate`;

      await apiPatch<OwnerClientStatusUpdate>(endpoint);
      setPendingAction(null);
      onStatusChanged?.(clientStatusSuccessMessage(pendingAction));
    } catch (err) {
      setActionError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to update client status.",
      );
    } finally {
      setLoading(false);
    }
  }

  const statusButton =
    availableAction === null ? (
      <span className="text-xs text-afc-muted">No actions available</span>
    ) : (
      <Button
        type="button"
        size="sm"
        variant={availableAction === "freeze" ? "danger" : "success"}
        className="!min-h-[44px] !px-3 !text-xs"
        onClick={() => {
          setActionError("");
          setPendingAction(availableAction);
        }}
        disabled={loading}
      >
        {clientStatusActionLabel(availableAction)}
      </Button>
    );

  const profileLink = (
    <Link
      href={`/owner/clients/${clientId}`}
      className="inline-flex min-h-[36px] w-fit items-center justify-center rounded-lg border border-afc-red/30 bg-afc-red/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-afc-red-hot transition-colors hover:bg-afc-red/20 hover:text-afc-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-afc-red"
    >
      Open Profile
    </Link>
  );

  const mobileProfileLink = (
    <Link
      href={`/owner/clients/${clientId}`}
      className="inline-flex min-h-[44px] w-fit items-center justify-center rounded-lg border border-afc-red/30 bg-afc-red/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-afc-red-hot transition-colors hover:bg-afc-red/20 hover:text-afc-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-afc-red"
    >
      Open Profile
    </Link>
  );

  const content =
    layout === "inline" ? (
      <div className="afc-roster-actions-cell">
        {profileLink}
        <div className="afc-roster-actions-secondary">{statusButton}</div>
      </div>
    ) : (
      <div className="space-y-2">
        {mobileProfileLink}
        {statusButton}
      </div>
    );

  return (
    <>
      {content}

      {actionError ? (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {actionError}
        </p>
      ) : null}

      {pendingAction ? (
        <ClientStatusConfirmModal
          open
          action={pendingAction}
          clientName={clientName}
          userStatus={userStatus}
          loading={loading}
          onCancel={() => {
            if (!loading) {
              setPendingAction(null);
            }
          }}
          onConfirm={() => void handleConfirm()}
        />
      ) : null}
    </>
  );
}
