"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/Input";
import {
  type MeasurementFormErrors,
  type MeasurementFormValues,
} from "@/lib/measurement-form";

interface MeasurementFormProps {
  values: MeasurementFormValues;
  errors: MeasurementFormErrors;
  onChange: <K extends keyof MeasurementFormValues>(
    key: K,
    value: MeasurementFormValues[K],
  ) => void;
  disabled?: boolean;
}

function TextAreaField({
  label,
  value,
  onChange,
  error,
  disabled,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  rows?: number;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-afc-light-grey">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`afc-measurement-textarea ${error ? "afc-measurement-textarea--error" : ""}`}
      />
      {error ? (
        <p className="text-sm text-afc-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FormSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="afc-measurement-section">
      {collapsible ? (
        <button
          type="button"
          className="afc-measurement-section__toggle"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <span>{title}</span>
          <span aria-hidden>{open ? "−" : "+"}</span>
        </button>
      ) : (
        <h3 className="afc-measurement-section__title">{title}</h3>
      )}
      {open ? (
        <div className="afc-measurement-section__grid">{children}</div>
      ) : null}
    </section>
  );
}

export function MeasurementForm({
  values,
  errors,
  onChange,
  disabled = false,
}: MeasurementFormProps) {
  return (
    <div className="afc-measurement-form">
      <FormSection title="Core metrics">
        <Input
          label="Measured at"
          type="date"
          value={values.measuredAt}
          onChange={(event) => onChange("measuredAt", event.target.value)}
          error={errors.measuredAt}
          disabled={disabled}
          required
        />
        <Input
          label="Weight (kg)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          value={values.weightKg}
          onChange={(event) => onChange("weightKg", event.target.value)}
          error={errors.weightKg}
          disabled={disabled}
          required
        />
        <Input
          label="Height snapshot (cm)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.heightCmSnapshot}
          onChange={(event) => onChange("heightCmSnapshot", event.target.value)}
          error={errors.heightCmSnapshot}
          hint="Defaults from athlete profile when available."
          disabled={disabled}
        />
        <Input
          label="Body fat %"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step="0.1"
          value={values.bodyFatPercentage}
          onChange={(event) => onChange("bodyFatPercentage", event.target.value)}
          error={errors.bodyFatPercentage}
          disabled={disabled}
        />
      </FormSection>

      <FormSection title="Composition" collapsible defaultOpen={false}>
        <Input
          label="Muscle (kg)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.muscleKg}
          onChange={(event) => onChange("muscleKg", event.target.value)}
          error={errors.muscleKg}
          disabled={disabled}
        />
        <Input
          label="Muscle %"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          value={values.musclePercentage}
          onChange={(event) => onChange("musclePercentage", event.target.value)}
          error={errors.musclePercentage}
          disabled={disabled}
        />
        <Input
          label="Water %"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          value={values.waterPercentage}
          onChange={(event) => onChange("waterPercentage", event.target.value)}
          error={errors.waterPercentage}
          disabled={disabled}
        />
        <Input
          label="Visceral fat (kg)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.visceralFatKg}
          onChange={(event) => onChange("visceralFatKg", event.target.value)}
          error={errors.visceralFatKg}
          disabled={disabled}
        />
        <Input
          label="BMR (kcal)"
          type="number"
          inputMode="numeric"
          min={1}
          value={values.basalMetabolicRate}
          onChange={(event) => onChange("basalMetabolicRate", event.target.value)}
          error={errors.basalMetabolicRate}
          disabled={disabled}
        />
        <Input
          label="Metabolic age"
          type="number"
          inputMode="numeric"
          min={1}
          value={values.metabolicAge}
          onChange={(event) => onChange("metabolicAge", event.target.value)}
          error={errors.metabolicAge}
          disabled={disabled}
        />
      </FormSection>

      <FormSection title="Circumferences" collapsible defaultOpen={false}>
        <Input
          label="Chest (cm)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.chestCm}
          onChange={(event) => onChange("chestCm", event.target.value)}
          error={errors.chestCm}
          disabled={disabled}
        />
        <Input
          label="Waist (cm)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.waistCm}
          onChange={(event) => onChange("waistCm", event.target.value)}
          error={errors.waistCm}
          disabled={disabled}
        />
        <Input
          label="Hips (cm)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.hipsCm}
          onChange={(event) => onChange("hipsCm", event.target.value)}
          error={errors.hipsCm}
          disabled={disabled}
        />
        <Input
          label="Arms (cm)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.armsCm}
          onChange={(event) => onChange("armsCm", event.target.value)}
          error={errors.armsCm}
          disabled={disabled}
        />
        <Input
          label="Thighs (cm)"
          type="number"
          inputMode="decimal"
          min={0}
          value={values.thighsCm}
          onChange={(event) => onChange("thighsCm", event.target.value)}
          error={errors.thighsCm}
          disabled={disabled}
        />
      </FormSection>

      <FormSection title="Coach notes">
        <div className="sm:col-span-2">
          <TextAreaField
            label="Coach assessment"
            value={values.coachAssessment}
            onChange={(value) => onChange("coachAssessment", value)}
            error={errors.coachAssessment}
            disabled={disabled}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="Notes"
            value={values.notes}
            onChange={(value) => onChange("notes", value)}
            error={errors.notes}
            disabled={disabled}
          />
        </div>
      </FormSection>
    </div>
  );
}
