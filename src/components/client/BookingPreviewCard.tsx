import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/DataRow";
import { bookingStatusVariant, formatClientDateTime } from "@/lib/client-utils";
import type { ClientBooking } from "@/types/api";

interface BookingPreviewCardProps {
  upcomingBookings: ClientBooking[];
  recentBookings: ClientBooking[];
}

function BookingItem({ booking }: { booking: ClientBooking }) {
  return (
    <li className="afc-surface rounded-xl border-l-4 border-l-afc-green/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-afc-white">
          {formatClientDateTime(booking.startTime)}
        </p>
        <Badge variant={bookingStatusVariant(booking.status)}>
          {booking.status}
        </Badge>
      </div>
      {booking.notes ? (
        <p className="mt-2 text-sm text-afc-soft-grey">{booking.notes}</p>
      ) : null}
      <p className="mt-1 text-xs text-afc-soft-grey/80">
        Requested by {booking.requestedBy}
      </p>
    </li>
  );
}

export function BookingPreviewCard({
  upcomingBookings,
  recentBookings,
}: BookingPreviewCardProps) {
  const pastOrOther = recentBookings.filter(
    (booking) =>
      !upcomingBookings.some((upcoming) => upcoming.id === booking.id),
  );

  return (
    <Card
      accent="neutral"
      title="Session schedule"
      subtitle="Upcoming sessions and recent history"
      headerAction={
        <Badge variant="outline">{upcomingBookings.length} upcoming</Badge>
      }
      hover
    >
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-afc-soft-grey">
            Upcoming
          </p>
          {upcomingBookings.length ? (
            <ul className="space-y-3">
              {upcomingBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </ul>
          ) : (
            <EmptyState message="No upcoming bookings yet." />
          )}
        </div>

        {pastOrOther.length ? (
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-afc-soft-grey">
              Recent history
            </p>
            <ul className="space-y-3">
              {pastOrOther.slice(0, 5).map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
