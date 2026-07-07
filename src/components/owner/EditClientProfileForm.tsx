"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  type EditClientFormErrors,
  type EditClientFormValues,
} from "@/lib/edit-client-form";

interface EditClientProfileFormProps {
  values: EditClientFormValues;
  errors: EditClientFormErrors;
  disabled?: boolean;
  onChange: <K extends keyof EditClientFormValues>(
    key: K,
    value: EditClientFormValues[K],
  ) => void;
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <label htmlFor={inputId} className="text-sm font-medium text-afc-light-grey">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={`min-h-[96px] w-full rounded-lg border bg-afc-black/50 px-4 py-3 text-base leading-relaxed text-afc-white placeholder:text-afc-soft-grey/50 transition-all focus:border-afc-gold focus:bg-afc-charcoal focus:outline-none focus:ring-2 focus:ring-afc-gold/25 ${
          error ? "border-afc-red" : "border-afc-border-grey"
        }`}
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="afc-measurement-section">
      <h3 className="afc-measurement-section__title">{title}</h3>
      <div className="afc-measurement-section__grid">{children}</div>
    </section>
  );
}

export function EditClientProfileForm({
  values,
  errors,
  disabled = false,
  onChange,
}: EditClientProfileFormProps) {
  return (
    <>
      <FormSection title="Account">
        <Input
          label="Full name"
          value={values.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          required
          disabled={disabled}
          error={errors.fullName}
        />
        <Input
          label="Email"
          value={values.email}
          readOnly
          disabled
          className="afc-input-readonly cursor-not-allowed opacity-80"
          hint="Email cannot be changed here."
        />
        <Input
          label="Phone number"
          type="tel"
          value={values.phoneNumber}
          onChange={(event) => onChange("phoneNumber", event.target.value)}
          required
          disabled={disabled}
          error={errors.phoneNumber}
        />
      </FormSection>

      <FormSection title="Personal details">
        <Input
          label="Date of birth"
          type="date"
          value={values.dateOfBirth}
          onChange={(event) => onChange("dateOfBirth", event.target.value)}
          disabled={disabled}
          error={errors.dateOfBirth}
        />
        <Select
          label="Gender"
          value={values.gender}
          options={GENDER_OPTIONS}
          onChange={(value) => onChange("gender", value as EditClientFormValues["gender"])}
          placeholder="Select gender"
          disabled={disabled}
          error={errors.gender}
        />
        <Input
          label="Height"
          type="number"
          min="0"
          step="0.1"
          value={values.heightCm}
          onChange={(event) => onChange("heightCm", event.target.value)}
          unit="cm"
          disabled={disabled}
          error={errors.heightCm}
        />
        <Input
          label="Join date"
          type="date"
          value={values.joinDate}
          onChange={(event) => onChange("joinDate", event.target.value)}
          disabled={disabled}
          error={errors.joinDate}
        />
      </FormSection>

      <FormSection title="Training profile">
        <div className="sm:col-span-2">
          <Input
            label="Fitness goal"
            value={values.fitnessGoal}
            onChange={(event) => onChange("fitnessGoal", event.target.value)}
            required
            disabled={disabled}
            error={errors.fitnessGoal}
          />
        </div>
        <Select
          label="Activity level"
          value={values.activityLevel}
          options={ACTIVITY_LEVEL_OPTIONS}
          onChange={(value) =>
            onChange("activityLevel", value as EditClientFormValues["activityLevel"])
          }
          placeholder="Select activity level"
          disabled={disabled}
          error={errors.activityLevel}
          usePlaceholderOption={false}
        />
        <TextAreaField
          label="Medical notes"
          value={values.medicalNotes}
          onChange={(value) => onChange("medicalNotes", value)}
          placeholder="Optional medical context for coaches"
          disabled={disabled}
          error={errors.medicalNotes}
        />
        <TextAreaField
          label="Injuries"
          value={values.injuries}
          onChange={(value) => onChange("injuries", value)}
          placeholder="Current or past injuries to track"
          disabled={disabled}
          error={errors.injuries}
        />
        <TextAreaField
          label="Coach notes"
          value={values.coachNotes}
          onChange={(value) => onChange("coachNotes", value)}
          placeholder="Private coach notes for this athlete"
          disabled={disabled}
          error={errors.coachNotes}
          rows={4}
        />
      </FormSection>

      <FormSection title="Emergency contact">
        <Input
          label="Emergency contact name"
          value={values.emergencyContactName}
          onChange={(event) => onChange("emergencyContactName", event.target.value)}
          disabled={disabled}
          error={errors.emergencyContactName}
        />
        <Input
          label="Emergency contact phone"
          type="tel"
          value={values.emergencyContactPhone}
          onChange={(event) => onChange("emergencyContactPhone", event.target.value)}
          disabled={disabled}
          error={errors.emergencyContactPhone}
        />
      </FormSection>
    </>
  );
}
