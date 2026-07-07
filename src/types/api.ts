export type ClientGrowthTrend = "INCREASING" | "STABLE" | "DECLINING";

export type UserStatusFilter = "ACTIVE" | "FROZEN" | "SUSPENDED" | "DELETED";

export type ClientListStatusFilter = "" | "ACTIVE" | "FROZEN" | "INACTIVE" | "DELETED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface MembershipPlan {
  id: string;
  name: string;
  sessionsPerWeek: number;
  monthlyPrice: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  dateOfBirth: string;
  gender: string;
  heightCm: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  fitnessGoal: string;
  medicalNotes: string | null;
  injuries: string | null;
  activityLevel: string;
  joinDate: string;
  coachNotes: string | null;
  assignedPlanId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignedPlan?: MembershipPlan | null;
}

export interface OwnerClientListPlan {
  id: string;
  name: string;
  sessionsPerWeek: number;
  monthlyPrice: string;
  currency: string;
  status?: string;
}

export interface OwnerClientListActiveSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  plan: OwnerClientListPlan;
}

export interface OwnerClientListPayment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paidAt: string | null;
  dueDate: string;
}

export interface OwnerClientListMeasurement {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  muscleKg: number | null;
}

export interface OwnerClientListItem {
  user: SafeUser;
  profile: ClientProfile | null;
  assignedPlan: MembershipPlan | null;
  activeSubscription: OwnerClientListActiveSubscription | null;
  latestPayment: OwnerClientListPayment | null;
  latestMeasurement: OwnerClientListMeasurement | null;
}

export type OwnerClientsData = PaginatedResponse<OwnerClientListItem>;

export interface ClientSubscription {
  id: string;
  clientId: string;
  planId: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string;
  status: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  plan: MembershipPlan;
}

export interface ClientPayment {
  id: string;
  clientId: string;
  subscriptionId: string | null;
  amount: string;
  currency: string;
  paymentDate: string | null;
  dueDate: string;
  status: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientMeasurement {
  id: string;
  clientId: string;
  measuredAt: string;
  weightKg: string;
  heightCmSnapshot: string;
  bmi: string | null;
  bodyFatPercentage: string | null;
  bodyFatKg: string | null;
  musclePercentage: string | null;
  muscleKg: string | null;
  waterPercentage: string | null;
  waterLiters: string | null;
  visceralFatKg: string | null;
  basalMetabolicRate: number | null;
  metabolicAge: number | null;
  chestCm: string | null;
  waistCm: string | null;
  hipsCm: string | null;
  armsCm: string | null;
  thighsCm: string | null;
  notes: string | null;
  coachAssessment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientBooking {
  id: string;
  clientId: string;
  ownerId: string;
  scheduleSlotId: string | null;
  startTime: string;
  endTime: string;
  status: string;
  requestedBy: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  cancellationReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProgressNote {
  id: string;
  measurementId: string | null;
  clientId: string;
  ownerId: string;
  noteType: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerClientDetail {
  user: SafeUser;
  profile: ClientProfile | null;
  subscriptions: ClientSubscription[];
  payments: ClientPayment[];
  measurements: ClientMeasurement[];
  bookings: ClientBooking[];
  progressNotes: ClientProgressNote[];
}

export type OwnerBodyMeasurement = {
  id: string;
  clientId: string;
  measuredAt: string;
  weightKg: number;
  heightCmSnapshot: number;
  bodyFatPercentage: number | null;
  muscleKg: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  armsCm: number | null;
  thighsCm: number | null;
  coachAssessment: string | null;
  notes: string | null;
};

export type CreateMeasurementInput = {
  measuredAt?: string;
  weightKg: number;
  heightCmSnapshot?: number | null;
  bodyFatPercentage?: number | null;
  muscleKg?: number | null;
  musclePercentage?: number | null;
  waterPercentage?: number | null;
  visceralFatKg?: number | null;
  basalMetabolicRate?: number | null;
  metabolicAge?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  coachAssessment?: string;
  notes?: string;
};

export type CreateMeasurementResponse = {
  measurement: OwnerBodyMeasurement;
};

export interface OwnerClientStatusUpdate {
  user: SafeUser;
  profile: ClientProfile;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHT"
  | "MODERATE"
  | "ACTIVE"
  | "VERY_ACTIVE";

export interface CreateClientInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  temporaryPassword: string;
  dateOfBirth: string;
  gender: Gender;
  heightCm: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  fitnessGoal: string;
  activityLevel: ActivityLevel;
  medicalNotes?: string;
  injuries?: string;
  assignedPlanId?: string | null;
  joinDate: string;
  coachNotes?: string;
}

export type OwnerPlan = {
  id: string;
  name: string;
  sessionsPerWeek: number;
  monthlyPrice: string;
  currency: string;
  status: "ACTIVE";
};

export type OwnerPlansResponse = {
  items: OwnerPlan[];
};

export interface CreateClientResponse {
  client: SafeUser;
  profile: ClientProfile;
  subscription: {
    id: string;
    status: string;
    startDate: string;
    nextBillingDate: string;
    plan: Pick<
      OwnerPlan,
      "id" | "name" | "sessionsPerWeek" | "monthlyPrice" | "currency"
    >;
  } | null;
}

export interface UpdateClientInput {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  heightCm?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fitnessGoal?: string;
  activityLevel?: ActivityLevel;
  medicalNotes?: string;
  injuries?: string;
  assignedPlanId?: string | null;
  joinDate?: string;
  coachNotes?: string;
}

export interface UpdateClientResponse {
  user: SafeUser;
  profile: ClientProfile;
}

export interface OwnerDashboardData {
  totalClients: number;
  activeClients: number;
  frozenClients: number;
  totalRevenueThisMonth: number;
  unpaidPaymentsCount: number;
  overduePaymentsCount: number;
  upcomingBookingsCount: number;
  completedBookingsThisMonth: number;
  newClientsThisMonth: number;
  clientGrowthTrend: ClientGrowthTrend;
}

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface ClientNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  readAt: string | null;
}

export interface ClientMeData {
  user: SafeUser;
  profile: ClientProfile | null;
  assignedPlan: MembershipPlan | null;
  activeSubscription: ClientSubscription | null;
  latestPayment: ClientPayment | null;
  latestBodyMeasurement: ClientMeasurement | null;
  coachAssessment: string | null;
  upcomingBookings: ClientBooking[];
  recentBookings: ClientBooking[];
  recentPayments: ClientPayment[];
  recentBodyMeasurements: ClientMeasurement[];
  progressNotes: ClientProgressNote[];
  unreadNotificationsCount: number;
  notifications: ClientNotification[];
}

export type PaymentStatus =
  | "PAID"
  | "UNPAID"
  | "PARTIAL"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "WHISH"
  | "OMT"
  | "OTHER";

export type PaymentStatusFilter = "" | PaymentStatus;

export interface OwnerPayment {
  id: string;
  clientId: string;
  subscriptionId: string | null;
  amount: string;
  currency: string;
  paymentDate: string | null;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OwnerPaymentsResponse = PaginatedResponse<OwnerPayment>;

export interface CreatePaymentInput {
  clientId: string;
  subscriptionId?: string | null;
  amount: number;
  currency?: string;
  paymentDate?: string | null;
  dueDate: string;
  status?: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type CreatePaymentResponse = OwnerPayment;

export interface UpdatePaymentStatusInput {
  status: PaymentStatus;
  paymentDate?: string | null;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export type UpdatePaymentStatusResponse = OwnerPayment;

export interface OwnerSubscriptionListItem {
  id: string;
  clientId: string;
  planId: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string;
  status: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  plan: MembershipPlan;
}

export type OwnerSubscriptionsResponse =
  PaginatedResponse<OwnerSubscriptionListItem>;

export interface PaymentPageSummary {
  totalCount: number;
  paidAmount: number;
  unpaidAmount: number;
  partialAmount: number;
  overdueAmount: number;
  totalAmount: number;
  collectionRate: number;
  currency: string;
}

export interface MonthSelection {
  year: number;
  month: number;
}
