import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Eye,
  Layers3,
  MapPin,
  UsersRound,
  WalletCards,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"

import { formatDateTime, formatMoney } from "./display"
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <TournamentInformation tournament={tournament} />
          {categories.length > 0 && (
            <CategoryDetails categories={categories} dashboard={dashboard} />
          )}
        </div>

        <div className="space-y-6">
          <KeyDetails dashboard={dashboard} tournament={tournament} />
          <RegistrationSummary dashboard={dashboard} />
        </div>
      </div>
    </div>
  )
}

function PendingCashAlert({
  dashboard,
}: {
  dashboard: ManageDashboardViewModel
}) {
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

function TournamentInformation({ tournament }: { tournament: TournamentRow }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información pública</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <TextBlock
          title="Descripción"
          text={tournament.description}
          fallback="Todavía no has añadido una descripción."
        />
        <TextBlock
          title="Reglas y normativa"
          text={tournament.rules}
          fallback="Todavía no has añadido reglas o normativa."
        />
      </CardContent>
    </Card>
  )
}

function TextBlock({
  fallback,
  text,
  title,
}: {
  fallback: string
  text: string | null
  title: string
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {text || fallback}
      </p>
    </div>
  )
}

function KeyDetails({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const capacity =
    dashboard.totalCapacity === null ? "Sin límite" : `${dashboard.totalCapacity} plazas`
  const price = tournament.has_categories
    ? "Precio por categoría"
    : formatMoney(tournament.entry_price)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos clave</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Detail icon={<CalendarDays />} label="Fecha" value={formatDateTime(tournament.date)} />
        <Detail
          icon={<Clock3 />}
          label="Cierre de inscripciones"
          value={formatDateTime(tournament.registration_deadline)}
        />
        <Detail
          icon={<MapPin />}
          label="Ubicación"
          value={[tournament.province, tournament.address].filter(Boolean).join(", ") || "Por definir"}
        />
        <Detail
          icon={<UsersRound />}
          label="Participación"
          value={`${capacity} · mínimo ${tournament.min_participants}`}
        />
        <Detail
          icon={<Layers3 />}
          label="Formato"
          value={tournament.has_categories ? "Por categorías" : "General"}
        />
        <Detail
          icon={<WalletCards />}
          label="Pago y precio"
          value={`${getPaymentMethodLabel(tournament.payment_method)} · ${price}`}
        />
        <Detail
          icon={<Eye />}
          label="Publicación"
          value={tournament.is_public ? "Visible en Explorar" : "Solo mediante enlace"}
        />
      </CardContent>
    </Card>
  )
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

function RegistrationSummary({ dashboard }: { dashboard: ManageDashboardViewModel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de inscripciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <SummaryLine label="Participantes activos" value={dashboard.activeRegistrations.length} />
        <SummaryLine label="Confirmados" value={dashboard.confirmedRegistrations.length} />
        <SummaryLine label="Pendientes de validar" value={dashboard.pendingCashValidations.length} />
        <SummaryLine label="Pagos online en proceso" value={dashboard.pendingOnlinePayments.length} />
        <SummaryLine label="Cancelados" value={dashboard.cancelledRegistrations.length} />
        <SummaryLine
          label="Plazas restantes"
          value={dashboard.remainingSpots === null ? "Sin límite" : dashboard.remainingSpots}
        />
        <SummaryLine label="Total cobrado" value={formatMoney(dashboard.revenue)} />
      </CardContent>
    </Card>
  )
}

function SummaryLine({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <strong className="text-foreground">{value}</strong>
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
        <CardTitle>Categorías</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => {
          const group = dashboard.groupedViews.find((item) => item.id === category.id)
          const activeCount =
            group?.views.filter((view) =>
              dashboard.activeRegistrations.some(
                (active) => active.registration.id === view.registration.id
              )
            ).length ?? 0

          return (
            <div key={category.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-foreground">{category.name}</h3>
                <Badge variant="secondary">{formatMoney(category.price)}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeCount} inscritos · mínimo {category.min_participants} ·{" "}
                {category.max_participants === null
                  ? "sin límite máximo"
                  : `máximo ${category.max_participants}`}
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
