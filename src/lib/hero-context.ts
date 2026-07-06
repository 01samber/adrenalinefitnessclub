import type { ClientGrowthTrend } from "@/types/api";

const trendCopy: Record<ClientGrowthTrend, string> = {
  INCREASING:
    "New athlete sign-ups are trending up this month — check the grid for exact counts.",
  STABLE:
    "Squad growth is holding steady this month — counts below are your live source of truth.",
  DECLINING:
    "New sign-ups have cooled this month — review momentum in the stat grid below.",
};

export function clientGrowthTrendDetail(trend: ClientGrowthTrend): string {
  return trendCopy[trend];
}
