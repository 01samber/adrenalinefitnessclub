"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  RECEIVED_METHOD_OPTIONS,
  formatPaymentMoney,
  requiresReceivedMethod,
  statusUpdateConfirmCopy,
  statusUpdateConfirmTitle,
} from "@/lib/payment-utils";
import type { OwnerPayment, PaymentMethod, PaymentStatus } from "@/types/api";

interface PaymentStatusConfirmModalProps {
  open: boolean;
  payment: OwnerPayment | null;
  nextStatus: PaymentStatus | null;
  clientName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (paymentMethod?: PaymentMethod) => void;
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");

  if (!open || !payment || !nextStatus) {
    return null;
  }

  const isDanger = nextStatus === "CANCELLED" || nextStatus === "OVERDUE";
  const needsMethod = requiresReceivedMethod(nextStatus);
  const canConfirm = !needsMethod || Boolean(selectedMethod);

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

        {needsMethod ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-afc-muted">
              How was the payment received?
            </p>
            <div className="afc-received-method-grid">
              {RECEIVED_METHOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={selectedMethod === option.value ? "primary" : "secondary"}
                  size="md"
                  className={`afc-received-method-btn ${selectedMethod === option.value ? "afc-received-method-btn--active" : ""}`}
                  onClick={() => setSelectedMethod(option.value)}
                  disabled={loading}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="afc-payment-method-helper">
              Card is recorded only — no online gateway is processed in this app.
            </p>
          </div>
        ) : null}

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
            onClick={() => onConfirm(selectedMethod || undefined)}
            loading={loading}
            disabled={!canConfirm}
          >
            Confirm update
          </Button>
        </div>
      </div>
    </div>
  );
}
