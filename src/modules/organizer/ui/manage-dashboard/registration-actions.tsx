import { Button } from "@/components/ui/button"
import type { TournamentRow } from "@/modules/organizer/domain"

import {
  canCancelFromDashboard,
  isConfirmedRegistration,
  needsCashValidation,
} from "./display"
import type { RegistrationView } from "./types"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function RegistrationActions({
  busy,
  cancelRegistration,
  confirmCashRegistration,
  tournament,
  view,
}: {
  busy: string | null
  cancelRegistration: ManageDashboardViewModel["cancelRegistration"]
  confirmCashRegistration: ManageDashboardViewModel["confirmCashRegistration"]
  tournament: TournamentRow
  view: RegistrationView
}) {
  const isConfirmed = isConfirmedRegistration(view.registration.status)
  const removing = busy === `cancel:${view.registration.id}`
  const removeLabel = isConfirmed
    ? removing
      ? "Cancelando..."
      : "Cancelar"
    : removing
      ? "Eliminando..."
      : "Eliminar"

  return (
    <div className="flex flex-row flex-wrap items-center justify-end gap-2">
      {needsCashValidation(view, tournament) && (
        <Button
          type="button"
          size="sm"
          className="whitespace-nowrap"
          onClick={() => confirmCashRegistration(view)}
          disabled={busy === `paid:${view.registration.id}`}
        >
          {busy === `paid:${view.registration.id}` ? "Guardando..." : "Validar pago"}
        </Button>
      )}

      {canCancelFromDashboard(view.registration.status, tournament) && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="whitespace-nowrap"
          onClick={() => cancelRegistration(view)}
          disabled={removing}
        >
          {removeLabel}
        </Button>
      )}
    </div>
  )
}
