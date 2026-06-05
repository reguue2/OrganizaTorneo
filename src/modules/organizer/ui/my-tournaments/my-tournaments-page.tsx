import Link from "next/link"
import { Plus } from "lucide-react"

import { OrganizerPageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import type { OrganizerTournamentsOverview } from "@/modules/organizer/domain"

import { TournamentSection } from "./tournament-section"

export function MyTournamentsPage({
  overview,
}: {
  overview: OrganizerTournamentsOverview
}) {
  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Mis torneos"
        actions={
          <Button asChild size="lg">
            <Link href="/crear-torneo">
              <Plus data-icon="inline-start" />
              Crear torneo
            </Link>
          </Button>
        }
      />

      <TournamentSection
        title="Torneos activos"
        description=""
        emptyTitle="No tienes torneos activos"
        emptyDescription="Cuando publiques un torneo o cierres inscripciones de uno ya existente, aparecerá aquí."
        tournaments={overview.activeTournaments}
      />

      {overview.unpublishedTournaments.length > 0 && (
        <TournamentSection
          title="Pendientes de rehacer"
          description="Son torneos no publicados que conviene recrear con el flujo actual antes de usarlos."
          emptyTitle="No tienes borradores antiguos"
          emptyDescription="Los torneos no publicados pendientes de rehacer aparecerán aquí."
          notice="Lo recomendable es rehacer estos torneos con el flujo actual y publicar una versión nueva."
          tournaments={overview.unpublishedTournaments}
        />
      )}

      <TournamentSection
        title="Torneos finalizados"
        description="Historial de torneos ya terminados."
        emptyTitle="No tienes torneos finalizados"
        emptyDescription="Cuando marques un torneo como finalizado, lo verás aquí."
        tournaments={overview.finishedTournaments}
      />

      {overview.cancelledTournaments.length > 0 && (
        <TournamentSection
          title="Torneos cancelados"
          description="Torneos que ya no seguirán adelante."
          emptyTitle="No tienes torneos cancelados"
          emptyDescription="Los torneos cancelados aparecerán aquí."
          tournaments={overview.cancelledTournaments}
        />
      )}
    </div>
  )
}
