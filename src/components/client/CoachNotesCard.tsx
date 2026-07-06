import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/DataRow";
import { formatClientDateTime, progressNoteVariant } from "@/lib/client-utils";
import type { ClientProgressNote } from "@/types/api";

interface CoachNotesCardProps {
  progressNotes: ClientProgressNote[];
  coachAssessment: string | null;
  profileCoachNotes: string | null;
}

export function CoachNotesCard({
  progressNotes,
  coachAssessment,
  profileCoachNotes,
}: CoachNotesCardProps) {
  const hasContent =
    progressNotes.length > 0 || coachAssessment || profileCoachNotes;

  return (
    <Card accent="neutral" title="Coach feedback" subtitle="Guidance from your training team">
      {hasContent ? (
        <div className="space-y-4">
          {profileCoachNotes ? (
            <div className="rounded-xl border border-afc-border-grey/70 bg-afc-black/25 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-afc-soft-grey">
                Profile notes
              </p>
              <p className="mt-2 text-sm leading-relaxed text-afc-light-grey">
                {profileCoachNotes}
              </p>
            </div>
          ) : null}

          {coachAssessment ? (
            <div className="rounded-xl border border-afc-green/25 bg-afc-green/5 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-afc-green">
                Latest assessment
              </p>
              <p className="mt-2 text-sm leading-relaxed text-afc-light-grey">
                {coachAssessment}
              </p>
            </div>
          ) : null}

          {progressNotes.length ? (
            <ul className="space-y-3">
              {progressNotes.map((note) => (
                <li key={note.id} className="afc-surface rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={progressNoteVariant(note.noteType)}>
                      {note.noteType}
                    </Badge>
                    <span className="text-xs text-afc-soft-grey">
                      {formatClientDateTime(note.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-afc-light-grey">
                    {note.content}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <EmptyState message="No coach notes yet." />
      )}
    </Card>
  );
}
