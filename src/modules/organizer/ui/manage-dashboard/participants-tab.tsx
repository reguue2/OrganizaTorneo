import type { TournamentRow } from "@/modules/organizer/domain"

import { SectionBlock, SummaryTile } from "./dashboard-cards"
import { RegistrationGroupCard } from "./registration-group-card"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function ParticipantsTab({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const {
    busy,
    cancelledRegistrations,
    groupedViews,
    remainingSpots,
    totalCapacity,
  } = dashboard

  return (
    <SectionBlock
      title="Participantes e inscripciones"
      description="Consulta los datos de contacto, revisa el estado de cada inscripción y valida los pagos recibidos en efectivo."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          label="Capacidad total"
          value={totalCapacity === null ? "Sin límite" : `${totalCapacity} plazas`}
        />
        <SummaryTile
          label="Plazas restantes"
          value={remainingSpots === null ? "Sin límite" : `${remainingSpots} libres`}
        />
        <SummaryTile label="Canceladas" value={cancelledRegistrations.length} />
      </div>

      <div className="space-y-6">
        {groupedViews.map((group) => (
          <RegistrationGroupCard
            key={group.id}
            busy={busy}
            cancelRegistration={dashboard.cancelRegistration}
            confirmCashRegistration={dashboard.confirmCashRegistration}
            group={group}
            tournament={tournament}
          />
        ))}
      </div>
    </SectionBlock>
  )
}
