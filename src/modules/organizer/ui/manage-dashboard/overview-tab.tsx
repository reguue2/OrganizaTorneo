import {
  AlertTriangle,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"

import { formatMoney } from "./display"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function OverviewTab({
  categories,
  dashboard,
  tournament,
}: {
  categories: CategoryRow[]
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  return (
    <div className="space-y-6">
      <PendingCashAlert dashboard={dashboard} />
      <TournamentSituation dashboard={dashboard} tournament={tournament} />
      {categories.length > 0 && (
        <CategoryDetails categories={categories} dashboard={dashboard} />
      )}
    </div>
  )
}

function PendingCashAlert({ dashboard }: { dashboard: ManageDashboardViewModel }) {
  if (dashboard.pendingCashValidations.length === 0) return null

  return (
    <Alert variant="warning" className="flex items-center gap-3">
      <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
      <AlertDescription className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <strong>
            {dashboard.pendingCashValidations.length}{" "}
            {dashboard.pendingCashValidations.length === 1
              ? "pago pendiente"
              : "pagos pendientes"}{" "}
            de validación.
          </strong>{" "}
          Confirma la inscripción cuando hayas recibido el efectivo.
        </span>
        <Button
          type="button"
          size="sm"
          onClick={() => dashboard.setActiveTab("participants")}
        >
          Revisar ahora
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function TournamentSituation({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const participantCount = dashboard.activeRegistrations.length
  const capacity = dashboard.totalCapacity
  const occupancy =
    capacity === null || capacity <= 0
      ? null
      : Math.min(Math.round((participantCount / capacity) * 100), 100)
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid p-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <section className="p-5 md:p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Participantes</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
              {participantCount}
              <span className="ml-2 text-lg font-normal text-muted-foreground">
                {capacity === null ? "sin límite" : `de ${capacity}`}
              </span>
            </p>
          </div>

          {occupancy !== null && (
            <div className="mt-5">
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Ocupación del torneo"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={occupancy}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <SituationValue
              label="Confirmados"
              value={dashboard.confirmedRegistrations.length}
            />
            <SituationValue
              label="Por validar"
              value={dashboard.pendingCashValidations.length}
            />
            <SituationValue
              label="Cancelados"
              value={dashboard.cancelledRegistrations.length}
            />
          </div>
        </section>

        <section className="flex h-full flex-col justify-between border-t border-border bg-muted/10 p-5 md:p-6 lg:border-l lg:border-t-0">
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-sm font-medium text-muted-foreground">Total ganado</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {formatMoney(dashboard.revenue)}
            </p>
          </div>
          <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <InlineDetail
              label="Método de pago"
              value={getPaymentMethodLabel(tournament.payment_method)}
            />
            <InlineDetail
              label="Precio"
              value={
                tournament.has_categories
                  ? "Según categoría"
                  : formatMoney(tournament.entry_price)
              }
            />
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

function SituationValue({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}

function InlineDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function CategoryDetails({
  categories,
  dashboard,
}: {
  categories: CategoryRow[]
  dashboard: ManageDashboardViewModel
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado por categoría</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const group = dashboard.groupedViews.find((item) => item.id === category.id)
          const activeCount =
            group?.views.filter((view) =>
              dashboard.activeRegistrations.some(
                (active) => active.registration.id === view.registration.id
              )
            ).length ?? 0
          const missingForMinimum = Math.max(category.min_participants - activeCount, 0)

          return (
            <div key={category.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeCount}{" "}
                    {category.max_participants === null
                      ? "inscritos"
                      : `de ${category.max_participants} inscritos`}
                  </p>
                </div>
                <Badge variant="secondary">{formatMoney(category.price)}</Badge>
              </div>
              <p
                className={
                  missingForMinimum === 0
                    ? "mt-4 text-xs font-medium text-emerald-700"
                    : "mt-4 text-xs font-medium text-amber-700"
                }
              >
                {missingForMinimum === 0
                  ? "Mínimo alcanzado"
                  : `Faltan ${missingForMinimum} para el mínimo`}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function getPaymentMethodLabel(method: TournamentRow["payment_method"]) {
  if (method === "cash") return "Efectivo"
  if (method === "online") return "Online"
  if (method === "both") return "Efectivo u online"
  return "Por definir"
}
