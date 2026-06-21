import { Badge } from "@/components/ui/Badge";
import { MEMBERSHIP_PLAN_PREVIEWS } from "@/lib/create-client-form";

export function MembershipPlanPreview() {
  return (
    <section className="afc-plan-preview" aria-labelledby="membership-plan-heading">
      <div className="afc-plan-preview__intro">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="membership-plan-heading" className="afc-plan-preview__title">
            Membership Plan
          </h3>
          <Badge variant="outline">Preview only</Badge>
        </div>
        <p className="afc-plan-preview__copy">
          Plan assignment will be connected after the plan selector endpoint is
          added. The athlete can still be created now and assigned a plan later.
        </p>
      </div>

      <div className="afc-plan-preview__grid">
        {MEMBERSHIP_PLAN_PREVIEWS.map((plan) => (
          <div
            key={plan.sessionsPerWeek}
            className="afc-plan-preview__card"
            aria-disabled="true"
          >
            <p className="afc-plan-preview__sessions">
              {plan.sessionsPerWeek} sessions/week
            </p>
            <p className="afc-plan-preview__price">${plan.monthlyPrice}</p>
            <p className="afc-plan-preview__note">Coming soon</p>
          </div>
        ))}
      </div>
    </section>
  );
}
