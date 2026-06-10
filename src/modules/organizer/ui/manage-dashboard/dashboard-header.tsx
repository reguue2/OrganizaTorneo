import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { TournamentRow } from "@/modules/organizer/domain"
import { ShareTournamentButton } from "@/modules/tournaments/ui/public-tournament/share-tournament-button"

export function DashboardHeader({
  tournament,
}: {
  tournament: TournamentRow
}) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <Link
          href="/mis-torneos"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Mis torneos
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {tournament.title}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <ShareTournamentButton
          path={`/torneos/${tournament.id}`}
          title={tournament.title}
          variant="inline"
          label="Compartir torneo"
        />
        <Button asChild variant="secondary" size="lg">
          <Link href={`/torneos/${tournament.id}`}>
            <ExternalLink data-icon="inline-start" />
            Ver publicación
          </Link>
        </Button>
      </div>
    </header>
  )
}
