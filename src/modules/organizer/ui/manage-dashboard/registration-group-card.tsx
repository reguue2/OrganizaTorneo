"use client"

import { useCallback, useState } from "react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TournamentRow } from "@/modules/organizer/domain"

import { AddRegistrationModal } from "./add-registration-modal"
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
  createManualRegistration,
  group,
  tournament,
}: {
  busy: string | null
  cancelRegistration: ManageDashboardViewModel["cancelRegistration"]
  confirmCashRegistration: ManageDashboardViewModel["confirmCashRegistration"]
  createManualRegistration: ManageDashboardViewModel["createManualRegistration"]
  group: RegistrationGroup
  tournament: TournamentRow
}) {
  const [addOpen, setAddOpen] = useState(false)
  const closeAdd = useCallback(() => setAddOpen(false), [])

  const activeGroupCount = group.views.filter((view) =>
    isActiveRegistration(view.registration.status)
  ).length

  const canAddRegistration =
    tournament.status === "published" || tournament.status === "closed"

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

        <div className="flex flex-wrap items-center gap-3">
          {tournament.has_categories && (
            <p className="text-sm text-muted-foreground">
              Precio: {formatMoney(group.price)}
            </p>
          )}

          {canAddRegistration && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="whitespace-nowrap"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="size-4" />
              Añadir inscripción
            </Button>
          )}
        </div>
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

      {addOpen && (
        <AddRegistrationModal
          busy={busy === "registration:create"}
          groupName={group.name}
          hasCategories={tournament.has_categories}
          onClose={closeAdd}
          onSubmit={(input) =>
            createManualRegistration({
              ...input,
              categoryId: group.categoryId ?? undefined,
            })
          }
          participantType={group.participantType}
          price={group.price}
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
