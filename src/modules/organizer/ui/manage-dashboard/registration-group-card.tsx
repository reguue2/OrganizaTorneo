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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 border-b bg-muted/30 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{group.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {group.capacity === null
              ? `${activeGroupCount} activas`
              : `${activeGroupCount}/${group.capacity} activas`}
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
    <Table className="min-w-[820px]">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center normal-case">Participante</TableHead>
          <TableHead className="text-center normal-case">Teléfono</TableHead>
          <TableHead className="text-center normal-case">Email</TableHead>
          <TableHead className="text-center normal-case">Estado</TableHead>
          <TableHead className="text-center normal-case">Pago</TableHead>
          <TableHead className="text-center">
            <span className="sr-only">Acciones</span>
          </TableHead>
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
