export type ClientStatusAction = "freeze" | "reactivate";

export function getClientStatusAction(
  userStatus: string,
): ClientStatusAction | null {
  if (userStatus === "ACTIVE") {
    return "freeze";
  }

  if (
    userStatus === "FROZEN" ||
    userStatus === "SUSPENDED" ||
    userStatus === "INACTIVE"
  ) {
    return "reactivate";
  }

  return null;
}

export function clientStatusActionLabel(action: ClientStatusAction): string {
  return action === "freeze" ? "Freeze" : "Reactivate";
}

export function clientStatusSuccessMessage(action: ClientStatusAction): string {
  return action === "freeze"
    ? "Client frozen successfully."
    : "Client reactivated successfully.";
}
