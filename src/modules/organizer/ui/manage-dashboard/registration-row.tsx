import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import type { TournamentRow } from "@/modules/organizer/domain"

import {
  formatDateTime,
  formatMoney,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
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
    <TableRow>
      <TableCell className="align-top">
        <div className="font-medium text-foreground">
          {view.participant?.display_name ?? "Participante eliminado"}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {view.participant?.type === "team" ? "Equipo" : "Individual"}
        </div>
        {view.category && (
          <div className="mt-1 text-xs text-muted-foreground">
            Categoría: {view.category.name}
          </div>
        )}
      </TableCell>

      <TableCell className="align-top text-muted-foreground">
        <div>{view.participant?.contact_email ?? "Sin email"}</div>
        <div className="mt-1">{view.participant?.contact_phone ?? "Sin teléfono"}</div>
      </TableCell>

      <TableCell className="align-top">
        <Badge variant={getRegistrationStatusVariant(view)}>
          {getRegistrationStatusLabel(view)}
        </Badge>
        {view.registration.cancelled_at && (
          <div className="mt-2 text-xs text-muted-foreground">
            Cancelada: {formatDateTime(view.registration.cancelled_at)}
          </div>
        )}
      </TableCell>

      <TableCell className="align-top text-muted-foreground">
        <div>{getPaymentMethodLabel(view.registration.payment_method)}</div>
        <div className="mt-1 text-xs">
          {formatMoney(view.amount)} · {getPaymentStatusLabel(view, tournament)}
        </div>
        {view.payment?.paid_at && (
          <div className="mt-1 text-xs">Cobrado: {formatDateTime(view.payment.paid_at)}</div>
        )}
      </TableCell>

      <TableCell className="align-top text-muted-foreground">
        {view.registration.public_reference ?? "—"}
      </TableCell>

      <TableCell className="align-top text-muted-foreground">
        {formatDateTime(view.registration.created_at)}
      </TableCell>

      <TableCell className="align-top">
        <RegistrationActions
          busy={busy}
          cancelRegistration={cancelRegistration}
          confirmCashRegistration={confirmCashRegistration}
          confirmOnlineRegistration={confirmOnlineRegistration}
          tournament={tournament}
          view={view}
        />
      </TableCell>
    </TableRow>
  )
}
