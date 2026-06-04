import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"

import { Card, CardContent, CardHeader, CardTitle } from "./dashboard-cards"
import { formatMoney, getStatusLabel } from "./display"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function OperationalSummary({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const {
    activeRegistrations,
    pendingCashValidations,
    pendingOnlinePayments,
    totalCapacity,
  } = dashboard

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen operativo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <SummaryLine label="Estado" value={getStatusLabel(tournament.status)} />
        <SummaryLine
          label="Estructura"
          value={tournament.has_categories ? "Con categorías" : "Sin categorías"}
        />
        <SummaryLine
          label="Cupos"
          value={totalCapacity === null ? "Sin límite" : `${totalCapacity} plazas`}
        />
        <SummaryLine
          label="Precio base"
          value={tournament.has_categories ? "Por categoría" : formatMoney(tournament.entry_price)}
        />
        <SummaryLine label="Activas" value={activeRegistrations.length} />
        <SummaryLine label="Pendientes efectivo" value={pendingCashValidations.length} />
        <SummaryLine label="Pendientes online" value={pendingOnlinePayments.length} />

        {pendingOnlinePayments.length > 0 && (
          <Alert variant="info" className="mt-4">
            <AlertDescription>
              Mientras el pago online siga simulado, estas inscripciones se confirman manualmente
              desde el panel.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export function CategoriesSummary({ categories }: { categories: CategoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-foreground">{category.name}</p>
              <Badge variant="secondary">{formatMoney(category.price)}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              {category.max_participants === null
                ? "sin límite"
                : `${category.max_participants} plazas`}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SummaryLine({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <p>
      <span className="font-medium text-foreground">{label}:</span> {value}
    </p>
  )
}
