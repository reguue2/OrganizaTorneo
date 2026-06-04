import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmptyState } from "@/components/ui/empty-state"
import { OrganizerSection } from "@/components/layout"
import type { OrganizerTournamentView } from "@/modules/organizer/domain"

import { TournamentCard } from "./tournament-card"

export function TournamentSection({
  description,
  emptyDescription,
  emptyTitle,
  notice,
  title,
  tournaments,
}: {
  description: string
  emptyDescription: string
  emptyTitle: string
  notice?: string
  title: string
  tournaments: OrganizerTournamentView[]
}) {
  if (tournaments.length === 0) {
    return (
      <OrganizerSection>
        <SectionHeader title={title} description={description} />
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </OrganizerSection>
    )
  }

  return (
    <OrganizerSection>
      <SectionHeader title={title} description={description} />

      {notice && (
        <Alert variant="warning">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </OrganizerSection>
  )
}

function SectionHeader({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
