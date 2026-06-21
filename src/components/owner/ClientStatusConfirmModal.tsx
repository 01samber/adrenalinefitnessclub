"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ClientStatusAction } from "@/lib/client-status-actions";

interface ClientStatusConfirmModalProps {
  open: boolean;
  action: ClientStatusAction;
  clientName: string;
  userStatus: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
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

export function ClientStatusConfirmModal({
  open,
  action,
  clientName,
  userStatus,
  loading,
  onCancel,
  onConfirm,
}: ClientStatusConfirmModalProps) {
  if (!open) {
    return null;
  }

  const isFreeze = action === "freeze";
  const title = isFreeze ? "Freeze this athlete?" : "Reactivate this athlete?";
  const description = isFreeze
    ? "This client will no longer be able to log in until reactivated."
    : "This client will regain access to the client portal.";
  const confirmLabel = isFreeze ? "Confirm Freeze" : "Confirm Reactivate";

  return (
    <div
      className="afc-status-modal"
      role="presentation"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className={`afc-status-modal__panel ${isFreeze ? "afc-status-modal__panel--danger" : "afc-status-modal__panel--success"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-status-modal-title"
        aria-describedby="client-status-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`afc-status-modal__accent ${isFreeze ? "afc-status-modal__accent--danger" : "afc-status-modal__accent--success"}`}
          aria-hidden
        />

        <div className="afc-status-modal__header">
          <Badge variant={statusBadgeVariant(userStatus)}>
            {displayUserStatus(userStatus)}
          </Badge>
          <h2 id="client-status-modal-title" className="afc-status-modal__title">
            {title}
          </h2>
          <p className="afc-status-modal__client">{clientName}</p>
        </div>

        <p id="client-status-modal-description" className="afc-status-modal__copy">
          {description}
        </p>

        <div className="afc-status-modal__actions">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isFreeze ? "danger" : "success"}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
