import { Card } from "@/components/ui/Card";
import { DataRow, EmptyState } from "@/components/ui/DataRow";
import { formatClientDate } from "@/lib/client-utils";
import type { ClientMeData } from "@/types/api";

interface ProfileGoalCardProps {
  data: ClientMeData;
}

export function ProfileGoalCard({ data }: ProfileGoalCardProps) {
  const profile = data.profile;

  return (
    <Card accent="neutral" title="Training profile" subtitle="Coach-entered athlete details" hover>
      {profile ? (
        <>
          <DataRow label="Full name" value={data.user.fullName} />
          <DataRow label="Email" value={data.user.email} />
          <DataRow label="Phone" value={data.user.phoneNumber ?? "—"} />
          <DataRow label="Fitness goal" value={profile.fitnessGoal} />
          <DataRow label="Activity level" value={profile.activityLevel} />
          <DataRow
            label="Height"
            value={profile.heightCm ? `${profile.heightCm} cm` : "—"}
          />
          <DataRow label="Join date" value={formatClientDate(profile.joinDate)} />
          <DataRow
            label="Emergency contact"
            value={`${profile.emergencyContactName} · ${profile.emergencyContactPhone}`}
          />
          {profile.medicalNotes ? (
            <DataRow label="Medical notes" value={profile.medicalNotes} />
          ) : null}
          {profile.injuries ? (
            <DataRow label="Injuries / considerations" value={profile.injuries} />
          ) : null}
        </>
      ) : (
        <EmptyState message="Profile details are not available yet." />
      )}
    </Card>
  );
}
