"use client";

import { useState, type ReactNode } from "react";
import { MeasurementSectionIcon } from "@/components/owner/MeasurementSectionIcon";
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
  sectionId,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  sectionId: "core" | "composition" | "circumferences" | "notes";
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const heading = (
    <span className="afc-measurement-section__heading">
      <MeasurementSectionIcon id={sectionId} />
      <span>{title}</span>
    </span>
  );

  return (
    <section className="afc-measurement-section">
      {collapsible ? (
        <button
          type="button"
          className="afc-measurement-section__toggle"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          {heading}
          <span className="afc-measurement-section__chevron" aria-hidden>
            {open ? "−" : "+"}
          </span>
        </button>
      ) : (
        <h3 className="afc-measurement-section__title">{heading}</h3>
      )}
      <div
        className={`afc-measurement-section__collapse ${open ? "afc-measurement-section__collapse--open" : ""}`}
      >
        <div className="afc-measurement-section__collapse-inner">
          <div className="afc-measurement-section__grid">{children}</div>
        </div>
      </div>
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
      <FormSection title="Core metrics" sectionId="core">
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
          label="Weight"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          unit="kg"
          value={values.weightKg}
          onChange={(event) => onChange("weightKg", event.target.value)}
          error={errors.weightKg}
          disabled={disabled}
          required
        />
        <Input
          label="Height snapshot"
          type="number"
          inputMode="decimal"
          min={0}
          unit="cm"
          value={values.heightCmSnapshot}
          onChange={(event) => onChange("heightCmSnapshot", event.target.value)}
          error={errors.heightCmSnapshot}
          hint="Defaults from athlete profile when available."
          disabled={disabled}
        />
        <Input
          label="Body fat"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step="0.1"
          unit="%"
          value={values.bodyFatPercentage}
          onChange={(event) => onChange("bodyFatPercentage", event.target.value)}
          error={errors.bodyFatPercentage}
          disabled={disabled}
        />
      </FormSection>

      <FormSection
        title="Composition"
        sectionId="composition"
        collapsible
        defaultOpen={false}
      >
        <Input
          label="Muscle"
          type="number"
          inputMode="decimal"
          min={0}
          unit="kg"
          value={values.muscleKg}
          onChange={(event) => onChange("muscleKg", event.target.value)}
          error={errors.muscleKg}
          disabled={disabled}
        />
        <Input
          label="Muscle"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          unit="%"
          value={values.musclePercentage}
          onChange={(event) => onChange("musclePercentage", event.target.value)}
          error={errors.musclePercentage}
          disabled={disabled}
        />
        <Input
          label="Water"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          unit="%"
          value={values.waterPercentage}
          onChange={(event) => onChange("waterPercentage", event.target.value)}
          error={errors.waterPercentage}
          disabled={disabled}
        />
        <Input
          label="Visceral fat"
          type="number"
          inputMode="decimal"
          min={0}
          unit="kg"
          value={values.visceralFatKg}
          onChange={(event) => onChange("visceralFatKg", event.target.value)}
          error={errors.visceralFatKg}
          disabled={disabled}
        />
        <Input
          label="BMR"
          type="number"
          inputMode="numeric"
          min={1}
          unit="kcal"
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
          unit="yrs"
          value={values.metabolicAge}
          onChange={(event) => onChange("metabolicAge", event.target.value)}
          error={errors.metabolicAge}
          disabled={disabled}
        />
      </FormSection>

      <FormSection
        title="Circumferences"
        sectionId="circumferences"
        collapsible
        defaultOpen={false}
      >
        <Input
          label="Chest"
          type="number"
          inputMode="decimal"
          min={0}
          unit="cm"
          value={values.chestCm}
          onChange={(event) => onChange("chestCm", event.target.value)}
          error={errors.chestCm}
          disabled={disabled}
        />
        <Input
          label="Waist"
          type="number"
          inputMode="decimal"
          min={0}
          unit="cm"
          value={values.waistCm}
          onChange={(event) => onChange("waistCm", event.target.value)}
          error={errors.waistCm}
          disabled={disabled}
        />
        <Input
          label="Hips"
          type="number"
          inputMode="decimal"
          min={0}
          unit="cm"
          value={values.hipsCm}
          onChange={(event) => onChange("hipsCm", event.target.value)}
          error={errors.hipsCm}
          disabled={disabled}
        />
        <Input
          label="Arms"
          type="number"
          inputMode="decimal"
          min={0}
          unit="cm"
          value={values.armsCm}
          onChange={(event) => onChange("armsCm", event.target.value)}
          error={errors.armsCm}
          disabled={disabled}
        />
        <Input
          label="Thighs"
          type="number"
          inputMode="decimal"
          min={0}
          unit="cm"
          value={values.thighsCm}
          onChange={(event) => onChange("thighsCm", event.target.value)}
          error={errors.thighsCm}
          disabled={disabled}
        />
      </FormSection>

      <FormSection title="Coach notes" sectionId="notes">
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
