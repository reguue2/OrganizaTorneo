import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TournamentRow } from "@/modules/organizer/domain"

import { SectionBlock, SummaryTile } from "./dashboard-cards"
import { RegistrationGroupCard } from "./registration-group-card"
import { TournamentStatusActions } from "./tournament-status-actions"
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
    pendingOnlinePayments,
    remainingSpots,
    totalCapacity,
    updateTournamentStatus,
  } = dashboard

  return (
    <SectionBlock
      title="Inscripciones y operaciones"
      description="Aquí se ve el estado real de cada inscripción: confirmada, pendiente de validación en efectivo, pendiente online, cancelada o caducada."
      action={
        <TournamentStatusActions
          busy={busy}
          tournament={tournament}
          updateTournamentStatus={updateTournamentStatus}
        />
      }
    >
      {pendingOnlinePayments.length > 0 && (
        <Alert variant="info">
          <AlertDescription>
            Tienes inscripciones en <strong>pendiente de pago online</strong>. Mientras el
            pago online siga simulado, puedes confirmarlas manualmente desde este panel.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          label="Capacidad total"
          value={totalCapacity === null ? "Sin máximo" : `${totalCapacity} plazas`}
        />
        <SummaryTile
          label="Plazas restantes"
          value={remainingSpots === null ? "Sin máximo" : `${remainingSpots} libres`}
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
            confirmOnlineRegistration={dashboard.confirmOnlineRegistration}
            group={group}
            tournament={tournament}
          />
        ))}
      </div>
    </SectionBlock>
  )
}
