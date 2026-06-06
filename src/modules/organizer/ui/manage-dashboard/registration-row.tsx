import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import type { TournamentRow } from "@/modules/organizer/domain"

import {
  getPaymentMethodLabel,
  getRegistrationStatusLabel,
} from "./display"
import { RegistrationActions } from "./registration-actions"
import { getRegistrationStatusVariant } from "./status-badge"
import type { RegistrationView } from "./types"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function RegistrationRow({
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
  return (
    <TableRow>
      <TableCell className="text-center align-middle">
        <span className="font-medium text-foreground">
          {view.participant?.display_name ?? "Participante eliminado"}
        </span>
      </TableCell>

      <TableCell className="text-center align-middle text-muted-foreground">
        {view.participant?.contact_phone ?? "Sin teléfono"}
      </TableCell>

      <TableCell className="text-center align-middle text-muted-foreground">
        {view.participant?.contact_email ?? "Sin email"}
      </TableCell>

      <TableCell className="text-center align-middle">
        <Badge variant={getRegistrationStatusVariant(view)}>
          {getRegistrationStatusLabel(view)}
        </Badge>
      </TableCell>

      <TableCell className="text-center align-middle text-muted-foreground">
        {getPaymentMethodLabel(view.registration.payment_method)}
      </TableCell>

      <TableCell className="text-right align-middle">
        <RegistrationActions
          busy={busy}
          cancelRegistration={cancelRegistration}
          confirmCashRegistration={confirmCashRegistration}
          tournament={tournament}
          view={view}
        />
      </TableCell>
    </TableRow>
  )
}
