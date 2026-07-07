"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatPaymentMoney,
  statusUpdateConfirmCopy,
  statusUpdateConfirmTitle,
} from "@/lib/payment-utils";
import type { OwnerPayment, PaymentStatus } from "@/types/api";

interface PaymentStatusConfirmModalProps {
  open: boolean;
  payment: OwnerPayment | null;
  nextStatus: PaymentStatus | null;
  clientName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PaymentStatusConfirmModal({
  open,
  payment,
  nextStatus,
  clientName,
  loading,
  onCancel,
  onConfirm,
}: PaymentStatusConfirmModalProps) {
  if (!open || !payment || !nextStatus) {
    return null;
  }

  const isDanger = nextStatus === "CANCELLED" || nextStatus === "OVERDUE";

  return (
    <div
      className="afc-status-modal"
      role="presentation"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className={`afc-status-modal__panel ${isDanger ? "afc-status-modal__panel--danger" : "afc-status-modal__panel--success"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-status-modal-title"
        aria-describedby="payment-status-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`afc-status-modal__accent ${isDanger ? "afc-status-modal__accent--danger" : "afc-status-modal__accent--success"}`}
          aria-hidden
        />

        <div className="afc-status-modal__header">
          <Badge variant="outline">{payment.status}</Badge>
          <h2 id="payment-status-modal-title" className="afc-status-modal__title">
            {statusUpdateConfirmTitle(nextStatus)}
          </h2>
          <p className="afc-status-modal__client">{clientName}</p>
          <p className="mt-2 text-sm font-semibold text-afc-gold">
            {formatPaymentMoney(payment.amount, payment.currency)}
          </p>
        </div>

        <p id="payment-status-modal-description" className="afc-status-modal__copy">
          {statusUpdateConfirmCopy(nextStatus)}
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
            variant={isDanger ? "danger" : "primary"}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            Confirm update
          </Button>
        </div>
      </div>
    </div>
  );
}
