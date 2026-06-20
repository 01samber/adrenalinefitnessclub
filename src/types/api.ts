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

export interface OwnerClientListItem {
  user: SafeUser;
  profile: ClientProfile | null;
  assignedPlan: MembershipPlan | null;
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
