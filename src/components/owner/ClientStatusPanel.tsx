"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiClientError, apiPatch } from "@/lib/api-client";
import type { OwnerClientStatusUpdate } from "@/types/api";

type PendingAction = "freeze" | "reactivate" | null;

interface ClientStatusPanelProps {
  clientId: string;
  status: string;
  onStatusChanged: () => void;
}

function displayStatus(status: string) {
  if (status === "SUSPENDED") return "INACTIVE";
  return status;
}

function statusVariant(
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

function canFreeze(status: string) {
  return status === "ACTIVE";
}

function canReactivate(status: string) {
  return status === "FROZEN" || status === "SUSPENDED";
}

export function ClientStatusPanel({
  clientId,
  status,
  onStatusChanged,
}: ClientStatusPanelProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const showFreeze = canFreeze(status);
  const showReactivate = canReactivate(status);
  const isDeleted = status === "DELETED";

  async function handleConfirm() {
    if (!pendingAction) return;

    setLoading(true);
    setActionError("");
    setSuccessMessage("");

    const endpoint =
      pendingAction === "freeze"
        ? `/api/owner/clients/${clientId}/freeze`
        : `/api/owner/clients/${clientId}/reactivate`;

    try {
      await apiPatch<OwnerClientStatusUpdate>(endpoint);
      setPendingAction(null);
      setSuccessMessage(
        pendingAction === "freeze"
          ? "Athlete profile frozen successfully."
          : "Athlete profile reactivated successfully.",
      );
      onStatusChanged();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to update athlete status.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (loading) return;
    setPendingAction(null);
    setActionError("");
  }

  return (
    <Card
      accent={showReactivate ? "green" : "red"}
      title="Roster status control"
      subtitle="Manage athlete active status for club operations"
      headerAction={
        <Badge variant={statusVariant(status)}>{displayStatus(status)}</Badge>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-afc-muted">
          Freezing an athlete profile marks them as inactive in the squad roster.
          They remain in the system but are not treated as active until
          reactivated.
        </p>

        {successMessage ? (
          <p
            className="rounded-lg border border-afc-green/35 bg-afc-green/10 px-4 py-3 text-sm text-afc-green-neon"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        {actionError ? (
          <p
            className="rounded-lg border border-afc-red/35 bg-afc-red/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {actionError}
          </p>
        ) : null}

        {pendingAction ? (
          <div
            className="afc-surface rounded-xl border border-afc-border p-5"
            role="dialog"
            aria-labelledby="status-confirm-title"
            aria-describedby="status-confirm-desc"
          >
            <h3
              id="status-confirm-title"
              className="text-base font-bold uppercase tracking-wide text-afc-white"
            >
              {pendingAction === "freeze"
                ? "Freeze this athlete profile?"
                : "Reactivate this athlete profile?"}
            </h3>
            <p id="status-confirm-desc" className="mt-2 text-sm text-afc-muted">
              {pendingAction === "freeze"
                ? "The client will no longer be treated as active until reactivated."
                : "The client will return to active status."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={loading}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={pendingAction === "freeze" ? "danger" : "success"}
                size="md"
                loading={loading}
                disabled={loading}
                onClick={() => void handleConfirm()}
              >
                {pendingAction === "freeze"
                  ? "Confirm Freeze"
                  : "Confirm Reactivate"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {showFreeze ? (
              <Button
                type="button"
                variant="danger"
                size="md"
                disabled={loading}
                onClick={() => {
                  setSuccessMessage("");
                  setActionError("");
                  setPendingAction("freeze");
                }}
              >
                Freeze athlete
              </Button>
            ) : null}
            {showReactivate ? (
              <Button
                type="button"
                variant="success"
                size="md"
                disabled={loading}
                onClick={() => {
                  setSuccessMessage("");
                  setActionError("");
                  setPendingAction("reactivate");
                }}
              >
                Reactivate athlete
              </Button>
            ) : null}
            {isDeleted ? (
              <p className="text-sm text-afc-muted">
                Deleted profiles cannot be frozen or reactivated from this panel.
              </p>
            ) : null}
            {!showFreeze && !showReactivate && !isDeleted ? (
              <p className="text-sm text-afc-muted">
                No status action is available for the current roster state.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}
