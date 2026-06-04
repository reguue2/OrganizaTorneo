import { cloneElement, type ReactElement } from "react"
import {
  CalendarDays,
  CreditCard,
  MapPin,
  Trophy,
  Users,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  formatDate,
  getTournamentCapacitySummary,
  getTournamentCategoriesSummary,
  getTournamentPriceSummary,
  paymentMethodLabel,
} from "@/modules/tournaments/domain"

import type { PublicTournamentViewData } from "./types"

function TournamentDetailsCard({
  tournament,
  categories,
}: PublicTournamentViewData) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del torneo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 md:grid-cols-2">
          <DetailItem
            icon={<MapPin />}
            label="Ubicación"
            value={`${tournament.province ?? "Por definir"}${
              tournament.address ? ` · ${tournament.address}` : ""
            }`}
          />
          <DetailItem
            icon={<CalendarDays />}
            label="Fecha"
            value={formatDate(tournament.date, true)}
            description={`Inscripción hasta ${formatDate(
              tournament.registration_deadline
            )}`}
          />
          <DetailItem
            icon={<CreditCard />}
            label="Cuota"
            value={getTournamentPriceSummary(tournament, categories)}
            description={paymentMethodLabel(tournament.payment_method)}
          />
          <DetailItem
            icon={<Users />}
            label="Cupos"
            value={getTournamentCapacitySummary(tournament, categories)}
          />
          {tournament.has_categories && (
            <DetailItem
              icon={<Trophy />}
              label="Categorías"
              value={getTournamentCategoriesSummary(categories)}
            />
          )}
        </div>

        {tournament.prize_mode !== "none" && (
          <>
            <Separator className="my-5" />
            <TournamentPrizes tournament={tournament} categories={categories} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DetailItem({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactElement<{ className?: string }>
  label: string
  value: string
  description?: string
}) {
  return (
    <div className="flex gap-3">
      {cloneElement(icon, {
        className: "mt-0.5 size-4 shrink-0 text-muted-foreground",
      })}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{value}</p>
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function TournamentPrizes({
  tournament,
  categories,
}: PublicTournamentViewData) {
  if (tournament.prize_mode === "global") {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Premios</p>
        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {tournament.prizes ?? "Sin premios definidos"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Premios por categoría</p>
      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border border-border p-4">
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {category.prizes ?? "Sin premios definidos"}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export { TournamentDetailsCard }
