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

export interface ClientMeData {
  user: SafeUser;
  profile: Record<string, unknown> | null;
  assignedPlan: Record<string, unknown> | null;
  activeSubscription: Record<string, unknown> | null;
  latestPayment: Record<string, unknown> | null;
  latestBodyMeasurement: Record<string, unknown> | null;
  upcomingBookings: Record<string, unknown>[];
  unreadNotificationsCount: number;
  notifications: Record<string, unknown>[];
}
