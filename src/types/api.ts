export type ClientGrowthTrend = "INCREASING" | "STABLE" | "DECLINING";

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
