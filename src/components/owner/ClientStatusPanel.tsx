"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ClientStatusConfirmModal } from "@/components/owner/ClientStatusConfirmModal";
import { ApiClientError, apiPatch } from "@/lib/api-client";
import {
  clientStatusActionLabel,
  clientStatusSuccessMessage,
  getClientStatusAction,
  type ClientStatusAction,
} from "@/lib/client-status-actions";
import type { OwnerClientStatusUpdate } from "@/types/api";

interface ClientStatusPanelProps {
  clientId: string;
  clientName: string;
  userStatus: string;
  profileStatus?: string | null;
  onStatusChanged: () => void;
}

function displayUserStatus(status: string) {
  if (status === "SUSPENDED") return "INACTIVE";
  return status;
}

function statusBadgeVariant(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FROZEN":
      return "warning";
    case "DELETED":
      return "danger";
    default:
      return "neutral";
  }
}

export function ClientStatusPanel({
  clientId,
  clientName,
  userStatus,
  profileStatus,
  onStatusChanged,
}: ClientStatusPanelProps) {
  const [pendingAction, setPendingAction] = useState<ClientStatusAction | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const availableAction = getClientStatusAction(userStatus);

  async function handleConfirm() {
    if (!pendingAction) return;

    setLoading(true);
    setFeedback(null);

    try {
      const endpoint =
        pendingAction === "freeze"
          ? `/api/owner/clients/${clientId}/freeze`
          : `/api/owner/clients/${clientId}/reactivate`;

      await apiPatch<OwnerClientStatusUpdate>(endpoint);
      setPendingAction(null);
      setFeedback({
        type: "success",
        message: clientStatusSuccessMessage(pendingAction),
      });
      onStatusChanged();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Unable to update client status.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card
        accent={userStatus === "FROZEN" ? "red" : "neutral"}
        title="Account status"
        subtitle="Freeze or reactivate portal access for this athlete"
        headerAction={
          <Badge variant={statusBadgeVariant(userStatus)}>
            {displayUserStatus(userStatus)}
          </Badge>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="afc-glass rounded-xl border border-afc-border-grey/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-afc-soft-grey">
                User status
              </p>
              <p className="mt-1 text-sm font-semibold text-afc-white">
                {displayUserStatus(userStatus)}
              </p>
            </div>
            <div className="afc-glass rounded-xl border border-afc-border-grey/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-afc-soft-grey">
                Profile status
              </p>
              <p className="mt-1 text-sm font-semibold text-afc-white">
                {profileStatus ? displayUserStatus(profileStatus) : "—"}
              </p>
            </div>
          </div>

          {userStatus === "FROZEN" ? (
            <p className="text-sm text-afc-muted">
              This athlete cannot log in while frozen. Reactivate to restore portal
              access.
            </p>
          ) : null}

          {feedback ? (
            <p
              className={`rounded-xl border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-afc-green/40 bg-afc-green/10 text-afc-green-neon"
                  : "border-afc-red/40 bg-afc-red/10 text-red-300"
              }`}
              role="alert"
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {availableAction ? (
              <Button
                type="button"
                variant={availableAction === "freeze" ? "danger" : "success"}
                size="md"
                onClick={() => {
                  setFeedback(null);
                  setPendingAction(availableAction);
                }}
                disabled={loading}
              >
                {clientStatusActionLabel(availableAction)}
              </Button>
            ) : (
              <span className="inline-flex min-h-[44px] items-center text-sm text-afc-muted">
                No actions available
              </span>
            )}
          </div>
        </div>
      </Card>

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
