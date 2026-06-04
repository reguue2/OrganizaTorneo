import { Button } from "@/components/ui/button"
import type { TournamentRow } from "@/modules/organizer/domain"

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
  return (
    <div className="flex flex-wrap gap-3">
      {tournament.status === "published" && (
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

      {tournament.status === "closed" && (
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

      {(tournament.status === "published" || tournament.status === "closed") && (
        <Button
          type="button"
          variant="outline"
          onClick={() => updateTournamentStatus("finished")}
          disabled={busy === "status:finished"}
          className="border-sky-200 text-sky-700 hover:bg-sky-50"
        >
          {busy === "status:finished" ? "Finalizando..." : "Marcar como finalizado"}
        </Button>
      )}

      {(tournament.status === "published" || tournament.status === "closed") && (
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
