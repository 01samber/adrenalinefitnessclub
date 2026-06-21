"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ApiClientError, apiGet } from "@/lib/api-client";
import type { OwnerPlan, OwnerPlansResponse } from "@/types/api";

interface PlanSelectorProps {
  selectedPlanId: string | null;
  onChange: (planId: string | null) => void;
  onPlansLoaded?: (plans: OwnerPlan[]) => void;
}

function formatPlanPrice(plan: OwnerPlan) {
  const amount = Number(plan.monthlyPrice);
  if (Number.isNaN(amount)) {
    return `${plan.currency} ${plan.monthlyPrice} / month`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PlanCardSkeleton() {
  return (
    <div className="afc-plan-card afc-plan-card--skeleton" aria-hidden>
      <div className="afc-plan-card__skeleton-line afc-plan-card__skeleton-line--title" />
      <div className="afc-plan-card__skeleton-line afc-plan-card__skeleton-line--meta" />
      <div className="afc-plan-card__skeleton-line afc-plan-card__skeleton-line--price" />
    </div>
  );
}

export function PlanSelector({
  selectedPlanId,
  onChange,
  onPlansLoaded,
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<OwnerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGet<OwnerPlansResponse>("/api/owner/plans");
      setPlans(data.items);
      onPlansLoaded?.(data.items);
    } catch (err) {
      setPlans([]);
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not load membership plans.",
      );
    } finally {
      setLoading(false);
    }
  }, [onPlansLoaded]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await apiGet<OwnerPlansResponse>("/api/owner/plans");
        if (!active) return;
        setPlans(data.items);
        onPlansLoaded?.(data.items);
      } catch (err) {
        if (!active) return;
        setPlans([]);
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Could not load membership plans.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [onPlansLoaded]);

  if (loading) {
    return (
      <div className="afc-plan-selector" aria-busy="true" aria-live="polite">
        <p className="afc-plan-selector__status">Loading membership plans...</p>
        <div className="afc-plan-selector__grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlanCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="afc-plan-selector" role="alert">
        <p className="afc-plan-selector__error">Could not load membership plans.</p>
        <Button type="button" variant="secondary" size="sm" onClick={() => void loadPlans()}>
          Retry
        </Button>
      </div>
    );
  }

  const noPlanSelected = selectedPlanId === null || selectedPlanId === "";

  return (
    <div className="afc-plan-selector">
      {plans.length === 0 ? (
        <p className="afc-plan-selector__empty">No active plans available.</p>
      ) : null}

      <div className="afc-plan-selector__grid" role="radiogroup" aria-label="Membership plan">
        <button
          type="button"
          role="radio"
          aria-checked={noPlanSelected}
          className={`afc-plan-card afc-plan-card--none ${noPlanSelected ? "afc-plan-card--selected" : ""}`}
          onClick={() => onChange(null)}
        >
          <span className="afc-plan-card__name">No plan for now</span>
          <span className="afc-plan-card__meta">Assign a membership later</span>
          {noPlanSelected ? (
            <Badge variant="outline" className="afc-plan-card__badge">
              Selected
            </Badge>
          ) : null}
        </button>

        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`afc-plan-card ${isSelected ? "afc-plan-card--selected" : ""}`}
              onClick={() => onChange(plan.id)}
            >
              <div className="afc-plan-card__header">
                <span className="afc-plan-card__name">{plan.name}</span>
                <Badge variant="success">{plan.status}</Badge>
              </div>
              <span className="afc-plan-card__meta">
                {plan.sessionsPerWeek} sessions / week
              </span>
              <span className="afc-plan-card__price">{formatPlanPrice(plan)}</span>
              {isSelected ? (
                <Badge variant="outline" className="afc-plan-card__badge">
                  Selected
                </Badge>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
