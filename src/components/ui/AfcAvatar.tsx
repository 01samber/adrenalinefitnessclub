export type AfcAvatarStatus = "active" | "frozen" | "inactive" | "pending";

export type AfcAvatarSize = "roster" | "card" | "preview" | "hero";

interface AfcAvatarProps {
  name: string;
  status?: AfcAvatarStatus;
  size?: AfcAvatarSize;
  className?: string;
}

export function userStatusToAvatarStatus(status: string): AfcAvatarStatus {
  if (status === "ACTIVE") return "active";
  if (status === "FROZEN") return "frozen";
  return "inactive";
}

export function AfcAvatar({
  name,
  status = "active",
  size = "roster",
  className = "",
}: AfcAvatarProps) {
  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={[
        "afc-avatar",
        `afc-avatar--${size}`,
        `afc-avatar--${status}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <span className="afc-avatar__fill" />
      <span className="afc-avatar__initial">{initial}</span>
      <span className="afc-avatar__ring" />
      {status === "pending" ? (
        <span className="afc-avatar__pulse afc-status-pulse afc-status-pulse--gold" />
      ) : null}
    </div>
  );
}
