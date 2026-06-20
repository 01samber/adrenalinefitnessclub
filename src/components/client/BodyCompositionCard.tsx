import { Card } from "@/components/ui/Card";
import { DataRow, EmptyState } from "@/components/ui/DataRow";
import { formatClientDate, formatClientDateTime } from "@/lib/client-utils";
import type { ClientMeasurement } from "@/types/api";

interface BodyCompositionCardProps {
  latest: ClientMeasurement | null;
  history: ClientMeasurement[];
  coachAssessment: string | null;
}

function formatOptional(value: string | number | null | undefined, suffix = "") {
  if (value == null || value === "") return "—";
  return `${value}${suffix}`;
}

export function BodyCompositionCard({
  latest,
  history,
  coachAssessment,
}: BodyCompositionCardProps) {
  return (
    <Card
      accent="green"
      title="Performance metrics"
      subtitle="Coach-tracked performance snapshot. Not medical advice."
    >
      {latest ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DataRow label="Measured" value={formatClientDateTime(latest.measuredAt)} />
            <DataRow label="Weight" value={`${latest.weightKg} kg`} />
            <DataRow label="BMI" value={formatOptional(latest.bmi)} />
            <DataRow
              label="Body fat %"
              value={formatOptional(latest.bodyFatPercentage, "%")}
            />
            <DataRow
              label="Body fat kg"
              value={formatOptional(latest.bodyFatKg, " kg")}
            />
            <DataRow
              label="Muscle %"
              value={formatOptional(latest.musclePercentage, "%")}
            />
            <DataRow
              label="Muscle kg"
              value={formatOptional(latest.muscleKg, " kg")}
            />
            <DataRow
              label="Water %"
              value={formatOptional(latest.waterPercentage, "%")}
            />
            <DataRow
              label="Water liters"
              value={formatOptional(latest.waterLiters, " L")}
            />
            <DataRow
              label="Visceral fat"
              value={formatOptional(latest.visceralFatKg, " kg")}
            />
            <DataRow
              label="BMR"
              value={formatOptional(latest.basalMetabolicRate)}
            />
            <DataRow
              label="Metabolic age"
              value={formatOptional(latest.metabolicAge)}
            />
          </div>

          {coachAssessment || latest.coachAssessment ? (
            <div className="rounded-xl border border-afc-green/25 bg-afc-green/5 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-afc-green">
                Coach assessment
              </p>
              <p className="mt-2 text-sm leading-relaxed text-afc-light-grey">
                {coachAssessment ?? latest.coachAssessment}
              </p>
            </div>
          ) : null}

          {history.length > 1 ? (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-afc-soft-grey">
                Measurement history preview
              </p>
              <ul className="space-y-2">
                {history.slice(1, 4).map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-afc-border-grey/60 bg-afc-black/25 px-3 py-2 text-sm"
                  >
                    <span className="text-afc-soft-grey">
                      {formatClientDate(item.measuredAt)}
                    </span>
                    <span className="font-medium text-afc-white">
                      {item.weightKg} kg
                      {item.bmi ? ` · BMI ${item.bmi}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState message="No measurements recorded yet." />
      )}
    </Card>
  );
}
