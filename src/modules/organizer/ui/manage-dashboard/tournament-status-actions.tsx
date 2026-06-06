import { Button } from "@/components/ui/button"
import {
  getOrganizerTournamentOperationalState,
  type TournamentRow,
} from "@/modules/organizer/domain"

import { canReopenTournament } from "./display"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function TournamentStatusActions({
  busy,
  tournament,
  updateTournamentStatus,
}: {
  busy: string | null
  tournament: TournamentRow
  updateTournamentStatus: ManageDashboardViewModel["updateTournamentStatus"]
}) {
  const operationalState = getOrganizerTournamentOperationalState(tournament)
  if (
    operationalState !== "registrations_open" &&
    operationalState !== "registrations_closed"
  ) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {operationalState === "registrations_open" && (
        <Button
          type="button"
          variant="outline"
          onClick={() => updateTournamentStatus("closed")}
          disabled={busy === "status:closed"}
          className="border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          {busy === "status:closed" ? "Cerrando..." : "Cerrar inscripciones"}
        </Button>
      )}

      {operationalState === "registrations_closed" &&
        tournament.status === "closed" && (
        <Button
          type="button"
          variant="outline"
          onClick={() => updateTournamentStatus("published")}
          disabled={busy === "status:published" || !canReopenTournament(tournament)}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          {busy === "status:published" ? "Reabriendo..." : "Reabrir inscripciones"}
        </Button>
      )}

      {(operationalState === "registrations_open" ||
        operationalState === "registrations_closed") && (
        <Button
          type="button"
          variant="destructive"
          onClick={() => updateTournamentStatus("cancelled")}
          disabled={busy === "status:cancelled"}
        >
          {busy === "status:cancelled" ? "Cancelando..." : "Cancelar torneo"}
        </Button>
      )}
    </div>
  )
}
