import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TournamentRow } from "@/modules/organizer/domain"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./dashboard-cards"
import {
  formatMoney,
  isActiveRegistration,
} from "./display"
import { RegistrationRow } from "./registration-row"
import type { RegistrationView } from "./types"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

type RegistrationGroup = ManageDashboardViewModel["groupedViews"][number]

export function RegistrationGroupCard({
  busy,
  cancelRegistration,
  confirmCashRegistration,
  group,
  tournament,
}: {
  busy: string | null
  cancelRegistration: ManageDashboardViewModel["cancelRegistration"]
  confirmCashRegistration: ManageDashboardViewModel["confirmCashRegistration"]
  group: RegistrationGroup
  tournament: TournamentRow
}) {
  const activeGroupCount = group.views.filter((view) =>
    isActiveRegistration(view.registration.status)
  ).length
  const remainingGroupSpots =
    group.capacity === null ? null : Math.max(group.capacity - activeGroupCount, 0)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 border-b bg-muted/30 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{group.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {group.capacity === null
              ? `${activeGroupCount} activas · sin límite`
              : `${activeGroupCount}/${group.capacity} activas · ${remainingGroupSpots} plazas restantes`}
          </p>
        </div>

        {tournament.has_categories && group.views.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Precio: {formatMoney(group.views[0]?.category?.price ?? 0)}
          </p>
        )}
      </CardHeader>

      {group.views.length === 0 ? (
        <CardContent className="p-5 text-sm text-muted-foreground">
          Todavía no hay inscripciones en este bloque.
        </CardContent>
      ) : (
        <RegistrationsTable
          busy={busy}
          cancelRegistration={cancelRegistration}
          confirmCashRegistration={confirmCashRegistration}
          tournament={tournament}
          views={group.views}
        />
      )}
    </Card>
  )
}

function RegistrationsTable({
  busy,
  cancelRegistration,
  confirmCashRegistration,
  tournament,
  views,
}: {
  busy: string | null
  cancelRegistration: ManageDashboardViewModel["cancelRegistration"]
  confirmCashRegistration: ManageDashboardViewModel["confirmCashRegistration"]
  tournament: TournamentRow
  views: RegistrationView[]
}) {
  return (
    <Table className="min-w-[980px]">
      <TableHeader>
        <TableRow>
          <TableHead className="normal-case">Participante</TableHead>
          <TableHead className="normal-case">Contacto</TableHead>
          <TableHead className="normal-case">Estado</TableHead>
          <TableHead className="normal-case">Pago</TableHead>
          <TableHead className="normal-case">Referencia</TableHead>
          <TableHead className="normal-case">Alta</TableHead>
          <TableHead className="text-right normal-case">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {views.map((view) => (
          <RegistrationRow
            key={view.registration.id}
            busy={busy}
            cancelRegistration={cancelRegistration}
            confirmCashRegistration={confirmCashRegistration}
            tournament={tournament}
            view={view}
          />
        ))}
      </TableBody>
    </Table>
  )
}
