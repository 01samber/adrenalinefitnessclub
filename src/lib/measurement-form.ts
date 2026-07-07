import type { CreateMeasurementInput } from "@/types/api";

export type MeasurementFormValues = {
  measuredAt: string;
  weightKg: string;
  heightCmSnapshot: string;
  bodyFatPercentage: string;
  muscleKg: string;
  musclePercentage: string;
  waterPercentage: string;
  visceralFatKg: string;
  basalMetabolicRate: string;
  metabolicAge: string;
  chestCm: string;
  waistCm: string;
  hipsCm: string;
  armsCm: string;
  thighsCm: string;
  coachAssessment: string;
  notes: string;
};

export type MeasurementFormErrors = Partial<
  Record<keyof MeasurementFormValues, string>
>;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialMeasurementFormValues(
  profileHeightCm?: string | number | null,
): MeasurementFormValues {
  const height =
    profileHeightCm != null && String(profileHeightCm).trim() !== ""
      ? String(profileHeightCm)
      : "";

  return {
    measuredAt: todayIsoDate(),
    weightKg: "",
    heightCmSnapshot: height,
    bodyFatPercentage: "",
    muscleKg: "",
    musclePercentage: "",
    waterPercentage: "",
    visceralFatKg: "",
    basalMetabolicRate: "",
    metabolicAge: "",
    chestCm: "",
    waistCm: "",
    hipsCm: "",
    armsCm: "",
    thighsCm: "",
    coachAssessment: "",
    notes: "",
  };
}

function parseOptionalPositive(
  value: string,
  label: string,
  errors: MeasurementFormErrors,
  key: keyof MeasurementFormValues,
  max?: number,
) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric <= 0) {
    errors[key] = `${label} must be a positive number.`;
    return undefined;
  }

  if (max != null && numeric > max) {
    errors[key] = `${label} must be ${max} or less.`;
    return undefined;
  }

  return numeric;
}

function parseOptionalPercent(
  value: string,
  errors: MeasurementFormErrors,
  key: keyof MeasurementFormValues,
  label: string,
) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
    errors[key] = `${label} must be between 0 and 100.`;
    return undefined;
  }

  return numeric;
}

function parseOptionalNonNegative(
  value: string,
  label: string,
  errors: MeasurementFormErrors,
  key: keyof MeasurementFormValues,
) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric < 0) {
    errors[key] = `${label} must be zero or greater.`;
    return undefined;
  }

  return numeric;
}

function parseOptionalIntPositive(
  value: string,
  label: string,
  errors: MeasurementFormErrors,
  key: keyof MeasurementFormValues,
) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numeric = Number(trimmed);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    errors[key] = `${label} must be a positive whole number.`;
    return undefined;
  }

  return numeric;
}

export function validateMeasurementForm(
  values: MeasurementFormValues,
): MeasurementFormErrors {
  const errors: MeasurementFormErrors = {};

  if (!values.measuredAt.trim()) {
    errors.measuredAt = "Measurement date is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.measuredAt.trim())) {
    errors.measuredAt = "Use a valid date (YYYY-MM-DD).";
  } else {
    const parsed = new Date(`${values.measuredAt.trim()}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      errors.measuredAt = "Use a valid date (YYYY-MM-DD).";
    }
  }

  const weight = values.weightKg.trim();
  if (!weight) {
    errors.weightKg = "Weight is required.";
  } else {
    const numeric = Number(weight);
    if (Number.isNaN(numeric) || numeric <= 0 || numeric > 500) {
      errors.weightKg = "Enter a valid weight in kg.";
    }
  }

  parseOptionalPositive(
    values.heightCmSnapshot,
    "Height",
    errors,
    "heightCmSnapshot",
    300,
  );
  parseOptionalPercent(
    values.bodyFatPercentage,
    errors,
    "bodyFatPercentage",
    "Body fat %",
  );
  parseOptionalPositive(values.muscleKg, "Muscle mass", errors, "muscleKg", 500);
  parseOptionalPercent(
    values.musclePercentage,
    errors,
    "musclePercentage",
    "Muscle %",
  );
  parseOptionalPercent(
    values.waterPercentage,
    errors,
    "waterPercentage",
    "Water %",
  );
  parseOptionalNonNegative(
    values.visceralFatKg,
    "Visceral fat",
    errors,
    "visceralFatKg",
  );
  parseOptionalIntPositive(
    values.basalMetabolicRate,
    "BMR",
    errors,
    "basalMetabolicRate",
  );
  parseOptionalIntPositive(
    values.metabolicAge,
    "Metabolic age",
    errors,
    "metabolicAge",
  );
  parseOptionalPositive(values.chestCm, "Chest", errors, "chestCm", 300);
  parseOptionalPositive(values.waistCm, "Waist", errors, "waistCm", 300);
  parseOptionalPositive(values.hipsCm, "Hips", errors, "hipsCm", 300);
  parseOptionalPositive(values.armsCm, "Arms", errors, "armsCm", 300);
  parseOptionalPositive(values.thighsCm, "Thighs", errors, "thighsCm", 300);

  return errors;
}

function assignOptionalNumber(
  payload: CreateMeasurementInput,
  key: keyof CreateMeasurementInput,
  value: number | undefined,
) {
  if (value !== undefined) {
    payload[key] = value as never;
  }
}

export function toCreateMeasurementPayload(
  values: MeasurementFormValues,
): CreateMeasurementInput {
  const errors: MeasurementFormErrors = {};
  const payload: CreateMeasurementInput = {
    measuredAt: values.measuredAt.trim(),
    weightKg: Number(values.weightKg),
  };

  assignOptionalNumber(
    payload,
    "heightCmSnapshot",
    parseOptionalPositive(
      values.heightCmSnapshot,
      "Height",
      errors,
      "heightCmSnapshot",
      300,
    ),
  );
  assignOptionalNumber(
    payload,
    "bodyFatPercentage",
    parseOptionalPercent(
      values.bodyFatPercentage,
      errors,
      "bodyFatPercentage",
      "Body fat %",
    ),
  );
  assignOptionalNumber(
    payload,
    "muscleKg",
    parseOptionalPositive(values.muscleKg, "Muscle mass", errors, "muscleKg", 500),
  );

  assignOptionalNumber(
    payload,
    "musclePercentage",
    parseOptionalPercent(
      values.musclePercentage,
      errors,
      "musclePercentage",
      "Muscle %",
    ),
  );
  assignOptionalNumber(
    payload,
    "waterPercentage",
    parseOptionalPercent(
      values.waterPercentage,
      errors,
      "waterPercentage",
      "Water %",
    ),
  );
  assignOptionalNumber(
    payload,
    "visceralFatKg",
    parseOptionalNonNegative(
      values.visceralFatKg,
      "Visceral fat",
      errors,
      "visceralFatKg",
    ),
  );
  assignOptionalNumber(
    payload,
    "basalMetabolicRate",
    parseOptionalIntPositive(
      values.basalMetabolicRate,
      "BMR",
      errors,
      "basalMetabolicRate",
    ),
  );
  assignOptionalNumber(
    payload,
    "metabolicAge",
    parseOptionalIntPositive(
      values.metabolicAge,
      "Metabolic age",
      errors,
      "metabolicAge",
    ),
  );
  assignOptionalNumber(
    payload,
    "chestCm",
    parseOptionalPositive(values.chestCm, "Chest", errors, "chestCm", 300),
  );
  assignOptionalNumber(
    payload,
    "waistCm",
    parseOptionalPositive(values.waistCm, "Waist", errors, "waistCm", 300),
  );
  assignOptionalNumber(
    payload,
    "hipsCm",
    parseOptionalPositive(values.hipsCm, "Hips", errors, "hipsCm", 300),
  );
  assignOptionalNumber(
    payload,
    "armsCm",
    parseOptionalPositive(values.armsCm, "Arms", errors, "armsCm", 300),
  );
  assignOptionalNumber(
    payload,
    "thighsCm",
    parseOptionalPositive(values.thighsCm, "Thighs", errors, "thighsCm", 300),
  );

  const coachAssessment = values.coachAssessment.trim();
  if (coachAssessment) {
    payload.coachAssessment = coachAssessment;
  }

  const notes = values.notes.trim();
  if (notes) {
    payload.notes = notes;
  }

  return payload;
}

export function resolveMeasurementErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to save measurement. Please try again.";
}
