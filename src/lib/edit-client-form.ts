import { ApiClientError } from "@/lib/api-client";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  type ActivityLevelOption,
  type GenderOption,
} from "@/lib/create-client-form";
import type {
  ActivityLevel,
  Gender,
  OwnerClientDetail,
  UpdateClientInput,
} from "@/types/api";

export interface EditClientFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: GenderOption | "";
  heightCm: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  fitnessGoal: string;
  activityLevel: ActivityLevelOption | "";
  medicalNotes: string;
  injuries: string;
  joinDate: string;
  coachNotes: string;
}

export type EditClientFormErrors = Partial<
  Record<keyof EditClientFormValues, string>
>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export function createEditClientFormValues(
  detail: OwnerClientDetail,
): EditClientFormValues {
  const profile = detail.profile;

  return {
    fullName: detail.user.fullName ?? "",
    email: detail.user.email ?? "",
    phoneNumber: detail.user.phoneNumber ?? "",
    dateOfBirth: toDateInputValue(profile?.dateOfBirth),
    gender: (profile?.gender as GenderOption) ?? "",
    heightCm: profile?.heightCm ? String(profile.heightCm) : "",
    emergencyContactName: profile?.emergencyContactName ?? "",
    emergencyContactPhone: profile?.emergencyContactPhone ?? "",
    fitnessGoal: profile?.fitnessGoal ?? "",
    activityLevel: (profile?.activityLevel as ActivityLevelOption) ?? "",
    medicalNotes: profile?.medicalNotes ?? "",
    injuries: profile?.injuries ?? "",
    joinDate: toDateInputValue(profile?.joinDate),
    coachNotes: profile?.coachNotes ?? "",
  };
}

export function validateEditClientForm(
  values: EditClientFormValues,
): EditClientFormErrors {
  const errors: EditClientFormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (values.phoneNumber.trim().length < 5) {
    errors.phoneNumber = "Phone number must be at least 5 characters.";
  }

  if (values.dateOfBirth && !DATE_PATTERN.test(values.dateOfBirth)) {
    errors.dateOfBirth = "Enter a valid date of birth.";
  }

  if (values.joinDate && !DATE_PATTERN.test(values.joinDate)) {
    errors.joinDate = "Enter a valid join date.";
  }

  if (values.heightCm.trim()) {
    const height = Number(values.heightCm);
    if (Number.isNaN(height) || height <= 0) {
      errors.heightCm = "Enter a valid height in centimeters.";
    } else if (height > 300) {
      errors.heightCm = "Height must be 300 cm or less.";
    }
  }

  const emergencyName = values.emergencyContactName.trim();
  const emergencyPhone = values.emergencyContactPhone.trim();

  if (emergencyPhone && !emergencyName) {
    errors.emergencyContactName =
      "Emergency contact name is required when a phone number is provided.";
  } else if (emergencyName && emergencyName.length < 2) {
    errors.emergencyContactName =
      "Emergency contact name must be at least 2 characters.";
  }

  if (emergencyName && !emergencyPhone) {
    errors.emergencyContactPhone =
      "Emergency contact phone is required when a name is provided.";
  } else if (emergencyPhone && emergencyPhone.length < 5) {
    errors.emergencyContactPhone =
      "Emergency contact phone must be at least 5 characters.";
  }

  if (!values.fitnessGoal.trim()) {
    errors.fitnessGoal = "Fitness goal is required.";
  } else if (values.fitnessGoal.trim().length < 2) {
    errors.fitnessGoal = "Fitness goal must be at least 2 characters.";
  }

  if (!values.activityLevel) {
    errors.activityLevel = "Activity level is required.";
  }

  if (values.gender && !GENDER_OPTIONS.some((option) => option.value === values.gender)) {
    errors.gender = "Select a valid gender.";
  }

  return errors;
}

export function toUpdateClientPayload(
  values: EditClientFormValues,
): UpdateClientInput {
  const payload: UpdateClientInput = {
    fullName: values.fullName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    fitnessGoal: values.fitnessGoal.trim(),
    activityLevel: values.activityLevel as ActivityLevel,
    medicalNotes: values.medicalNotes.trim(),
    injuries: values.injuries.trim(),
    coachNotes: values.coachNotes.trim(),
    emergencyContactName: values.emergencyContactName.trim(),
    emergencyContactPhone: values.emergencyContactPhone.trim(),
  };

  if (values.dateOfBirth) {
    payload.dateOfBirth = values.dateOfBirth;
  }

  if (values.joinDate) {
    payload.joinDate = values.joinDate;
  }

  if (values.gender) {
    payload.gender = values.gender as Gender;
  }

  if (values.heightCm.trim()) {
    payload.heightCm = Number(values.heightCm);
  }

  return payload;
}

export function resolveUpdateClientErrorMessage(
  error: unknown,
  fallback = "Unable to update athlete profile. Please try again.",
): string {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export { ACTIVITY_LEVEL_OPTIONS, GENDER_OPTIONS };
