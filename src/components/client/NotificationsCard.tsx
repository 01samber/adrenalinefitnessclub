import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/DataRow";
import { formatClientDateTime } from "@/lib/client-utils";
import type { ClientNotification } from "@/types/api";

interface NotificationsCardProps {
  notifications: ClientNotification[];
  unreadCount: number;
}

export function NotificationsCard({
  notifications,
  unreadCount,
}: NotificationsCardProps) {
  return (
    <Card
      accent="neutral"
      title="Alerts"
      headerAction={
        <Badge variant={unreadCount > 0 ? "danger" : "success"}>
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </Badge>
      }
    >
      {notifications.length ? (
        <ul className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <li
              key={notification.id}
              className={`rounded-xl border px-4 py-3 ${
                notification.status === "UNREAD"
                  ? "border-afc-red/30 bg-afc-red/5"
                  : "border-afc-border-grey bg-afc-black/25"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-afc-white">
                  {notification.title}
                </p>
                {notification.status === "UNREAD" ? (
                  <Badge variant="danger">New</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-afc-soft-grey">
                {notification.message}
              </p>
              <p className="mt-2 text-xs text-afc-soft-grey/70">
                {formatClientDateTime(notification.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message="You're all caught up." />
      )}
    </Card>
  );
}
