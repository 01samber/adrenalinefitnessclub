"use client";

import { Button } from "@/components/ui/Button";
import {
  formatMonthLabel,
  getCurrentMonthSelection,
  monthSelectionToInputValue,
  parseMonthInputValue,
  shiftMonthSelection,
} from "@/lib/payment-utils";
import type { MonthSelection } from "@/types/api";

interface PaymentMonthSelectorProps {
  value: MonthSelection;
  onChange: (value: MonthSelection) => void;
}

export function PaymentMonthSelector({ value, onChange }: PaymentMonthSelectorProps) {
  const currentMonth = getCurrentMonthSelection();
  const isCurrentMonth =
    value.year === currentMonth.year && value.month === currentMonth.month;

  return (
    <div className="afc-payment-month">
      <div className="afc-payment-month__header">
        <div>
          <p className="afc-section-label">Monthly payment ledger</p>
          <h2 className="afc-payment-month__title">{formatMonthLabel(value)}</h2>
          <p className="afc-payment-month__subtitle">
            Track who paid, who is pending, and how much revenue is still outstanding.
          </p>
        </div>
        <span className="afc-live-badge">
          <span className="afc-status-pulse afc-status-pulse--gold" aria-hidden />
          Tracking: {formatMonthLabel(value)}
        </span>
      </div>

      <div className="afc-payment-month__controls">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-[44px]"
          onClick={() => onChange(shiftMonthSelection(value, -1))}
        >
          Previous
        </Button>

        <label className="afc-payment-month__picker">
          <span className="sr-only">Select month</span>
          <input
            type="month"
            value={monthSelectionToInputValue(value)}
            onChange={(event) => onChange(parseMonthInputValue(event.target.value))}
            className="afc-payment-month__input"
          />
        </label>

        <Button
          type="button"
          variant={isCurrentMonth ? "primary" : "secondary"}
          size="sm"
          className="min-h-[44px]"
          onClick={() => onChange(currentMonth)}
        >
          Current month
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-[44px]"
          onClick={() => onChange(shiftMonthSelection(value, 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
