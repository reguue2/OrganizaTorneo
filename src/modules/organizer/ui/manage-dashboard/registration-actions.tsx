import { Button } from "@/components/ui/button"
import type { TournamentRow } from "@/modules/organizer/domain"

import {
  canCancelFromDashboard,
  needsCashValidation,
  needsOnlineValidation,
} from "./display"
import type { RegistrationView } from "./types"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function RegistrationActions({
  busy,
  cancelRegistration,
  confirmCashRegistration,
  confirmOnlineRegistration,
  tournament,
  view,
}: {
  busy: string | null
  cancelRegistration: ManageDashboardViewModel["cancelRegistration"]
  confirmCashRegistration: ManageDashboardViewModel["confirmCashRegistration"]
  confirmOnlineRegistration: ManageDashboardViewModel["confirmOnlineRegistration"]
  tournament: TournamentRow
  view: RegistrationView
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      {needsCashValidation(view, tournament) && (
        <Button
          type="button"
          size="sm"
          onClick={() => confirmCashRegistration(view)}
          disabled={busy === `paid:${view.registration.id}`}
        >
          {busy === `paid:${view.registration.id}` ? "Guardando..." : "Validar efectivo"}
        </Button>
      )}

      {needsOnlineValidation(view, tournament) && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => confirmOnlineRegistration(view)}
          disabled={busy === `online:${view.registration.id}`}
        >
          {busy === `online:${view.registration.id}` ? "Guardando..." : "Confirmar online"}
        </Button>
      )}

      {canCancelFromDashboard(view.registration.status, tournament) && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => cancelRegistration(view)}
          disabled={busy === `cancel:${view.registration.id}`}
        >
          {busy === `cancel:${view.registration.id}` ? "Cancelando..." : "Cancelar"}
        </Button>
      )}
    </div>
  )
}
