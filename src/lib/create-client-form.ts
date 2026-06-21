export type GenderOption = "MALE" | "FEMALE" | "OTHER";

export type ActivityLevelOption =
  | "SEDENTARY"
  | "LIGHT"
  | "MODERATE"
  | "ACTIVE"
  | "VERY_ACTIVE";

export interface CreateClientFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  temporaryPassword: string;
  dateOfBirth: string;
  gender: GenderOption | "";
  heightCm: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  fitnessGoal: string;
  activityLevel: ActivityLevelOption | "";
  medicalNotes: string;
  injuries: string;
  assignedPlanId: string | null;
  joinDate: string;
  coachNotes: string;
}

export type CreateClientFormErrors = Partial<
  Record<keyof CreateClientFormValues, string>
>;

export const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const ACTIVITY_LEVEL_OPTIONS: {
  value: ActivityLevelOption;
  label: string;
}[] = [
  { value: "SEDENTARY", label: "Sedentary" },
  { value: "LIGHT", label: "Light" },
  { value: "MODERATE", label: "Moderate" },
  { value: "ACTIVE", label: "Active" },
  { value: "VERY_ACTIVE", label: "Very active" },
];

export const ONBOARDING_STEPS = [
  { id: "account", label: "Account Access", shortLabel: "Access" },
  { id: "personal", label: "Personal Details", shortLabel: "Profile" },
  { id: "fitness", label: "Fitness Profile", shortLabel: "Fitness" },
  { id: "emergency", label: "Emergency Contact", shortLabel: "Emergency" },
  { id: "plan", label: "Membership Plan", shortLabel: "Plan" },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];

export type OnboardingStepStatus = "complete" | "current" | "upcoming";

export const MEMBERSHIP_PLAN_PREVIEWS = [
  { sessionsPerWeek: 2, monthlyPrice: 20 },
  { sessionsPerWeek: 3, monthlyPrice: 25 },
  { sessionsPerWeek: 4, monthlyPrice: 30 },
  { sessionsPerWeek: 5, monthlyPrice: 35 },
  { sessionsPerWeek: 6, monthlyPrice: 40 },
] as const;

export function getActivityLevelLabel(value: string) {
  return (
    ACTIVITY_LEVEL_OPTIONS.find((option) => option.value === value)?.label ?? "—"
  );
}

export function getGenderLabel(value: string) {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? "—";
}

function isAccountStepComplete(values: CreateClientFormValues) {
  return Boolean(
    values.fullName.trim() &&
      values.email.trim() &&
      values.phoneNumber.trim() &&
      values.temporaryPassword.length >= 4,
  );
}

function isPersonalStepComplete(values: CreateClientFormValues) {
  const height = Number(values.heightCm);
  return Boolean(
    values.dateOfBirth &&
      values.gender &&
      values.heightCm.trim() &&
      !Number.isNaN(height) &&
      height > 0 &&
      values.joinDate,
  );
}

function isFitnessStepComplete(values: CreateClientFormValues) {
  return Boolean(values.fitnessGoal.trim() && values.activityLevel);
}

function isEmergencyStepComplete(values: CreateClientFormValues) {
  return Boolean(
    values.emergencyContactName.trim() && values.emergencyContactPhone.trim(),
  );
}

export function getOnboardingStepStatus(
  stepId: OnboardingStepId,
  values: CreateClientFormValues,
): OnboardingStepStatus {
  const completion: Record<OnboardingStepId, boolean> = {
    account: isAccountStepComplete(values),
    personal: isPersonalStepComplete(values),
    fitness: isFitnessStepComplete(values),
    emergency: isEmergencyStepComplete(values),
    plan: true,
  };

  const order = ONBOARDING_STEPS.map((step) => step.id);
  const firstIncomplete = order.find((id) => !completion[id]) ?? "plan";

  if (completion[stepId] && stepId !== firstIncomplete) {
    return "complete";
  }

  if (stepId === firstIncomplete) {
    return "current";
  }

  if (completion[stepId]) {
    return "complete";
  }

  return "upcoming";
}

export function listOnboardingErrorSummary(errors: CreateClientFormErrors) {
  const labels: Partial<Record<keyof CreateClientFormValues, string>> = {
    fullName: "Full name",
    email: "Email",
    phoneNumber: "Phone number",
    temporaryPassword: "Temporary password",
    dateOfBirth: "Date of birth",
    gender: "Gender",
    heightCm: "Height",
    joinDate: "Join date",
    fitnessGoal: "Fitness goal",
    activityLevel: "Activity level",
    emergencyContactName: "Emergency contact name",
    emergencyContactPhone: "Emergency contact phone",
  };

  return Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([key, message]) => ({
      field: labels[key as keyof CreateClientFormValues] ?? key,
      message: message as string,
    }));
}

const FIELD_TO_STEP: Partial<Record<keyof CreateClientFormValues, OnboardingStepId>> =
  {
    fullName: "account",
    email: "account",
    phoneNumber: "account",
    temporaryPassword: "account",
    dateOfBirth: "personal",
    gender: "personal",
    heightCm: "personal",
    joinDate: "personal",
    fitnessGoal: "fitness",
    activityLevel: "fitness",
    emergencyContactName: "emergency",
    emergencyContactPhone: "emergency",
  };

export function getFirstErrorStep(
  errors: CreateClientFormErrors,
): OnboardingStepId | undefined {
  for (const step of ONBOARDING_STEPS) {
    const hasError = Object.keys(errors).some(
      (key) => FIELD_TO_STEP[key as keyof CreateClientFormValues] === step.id,
    );
    if (hasError) return step.id;
  }
  return undefined;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialClientFormValues(): CreateClientFormValues {
  return {
    fullName: "",
    email: "",
    phoneNumber: "",
    temporaryPassword: "1234",
    dateOfBirth: "",
    gender: "",
    heightCm: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    fitnessGoal: "",
    activityLevel: "",
    medicalNotes: "",
    injuries: "",
    assignedPlanId: null,
    joinDate: todayIsoDate(),
    coachNotes: "",
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCreateClientForm(
  values: CreateClientFormValues,
): CreateClientFormErrors {
  const errors: CreateClientFormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  const email = values.email.trim().toLowerCase();
  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (values.phoneNumber.trim().length < 5) {
    errors.phoneNumber = "Phone number must be at least 5 characters.";
  }

  if (!values.temporaryPassword) {
    errors.temporaryPassword = "Temporary password is required.";
  } else if (values.temporaryPassword.length < 4) {
    errors.temporaryPassword = "Password must be at least 4 characters.";
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  }

  if (!values.gender) {
    errors.gender = "Gender is required.";
  }

  const height = Number(values.heightCm);
  if (!values.heightCm.trim()) {
    errors.heightCm = "Height is required.";
  } else if (Number.isNaN(height) || height <= 0) {
    errors.heightCm = "Enter a valid height in centimeters.";
  } else if (height > 300) {
    errors.heightCm = "Height must be 300 cm or less.";
  }

  if (!values.emergencyContactName.trim()) {
    errors.emergencyContactName = "Emergency contact name is required.";
  } else if (values.emergencyContactName.trim().length < 2) {
    errors.emergencyContactName =
      "Emergency contact name must be at least 2 characters.";
  }

  if (!values.emergencyContactPhone.trim()) {
    errors.emergencyContactPhone = "Emergency contact phone is required.";
  } else if (values.emergencyContactPhone.trim().length < 5) {
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

  if (!values.joinDate) {
    errors.joinDate = "Join date is required.";
  }

  return errors;
}

export function toCreateClientPayload(values: CreateClientFormValues) {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    phoneNumber: values.phoneNumber.trim(),
    temporaryPassword: values.temporaryPassword,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender as GenderOption,
    heightCm: Number(values.heightCm),
    emergencyContactName: values.emergencyContactName.trim(),
    emergencyContactPhone: values.emergencyContactPhone.trim(),
    fitnessGoal: values.fitnessGoal.trim(),
    activityLevel: values.activityLevel as ActivityLevelOption,
    medicalNotes: values.medicalNotes.trim(),
    injuries: values.injuries.trim(),
    assignedPlanId: values.assignedPlanId || null,
    joinDate: values.joinDate,
    coachNotes: values.coachNotes.trim(),
  };
}

export function resolveCreateClientErrorMessage(
  error: unknown,
  fallback = "Unable to create athlete profile. Please try again.",
): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("email already") ||
      message.includes("already in use")
    ) {
      return "A client with this email already exists.";
    }

    if (
      message.includes("plan not found") ||
      message.includes("plan is not active") ||
      message.includes("no longer available")
    ) {
      return "Selected plan is no longer available. Please choose another plan.";
    }

    if (error.message && error.message !== "ApiClientError") {
      return error.message;
    }
  }

  return fallback;
}
