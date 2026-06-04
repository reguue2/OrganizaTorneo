import { cloneElement, type ReactElement } from "react"
import {
  CalendarDays,
  CreditCard,
  FileText,
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
  getTournamentPriceSummary,
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
              tournament.address ? `, ${tournament.address}` : ""
            }`}
          />
          <DetailItem
            icon={<CalendarDays />}
            label="Fecha"
            value={formatDate(tournament.date, true)}
          />
          <DetailItem
            icon={<CreditCard />}
            label="Precio de inscripción"
            value={getTournamentPriceSummary(tournament, categories)}
          />
          <DetailItem
            icon={<Users />}
            label="Plazas"
            value={getTournamentCapacitySummary(tournament, categories)}
          />
        </div>

        {tournament.prize_mode !== "none" && (
          <>
            <Separator className="my-5" />
            <TournamentPrizes tournament={tournament} categories={categories} />
          </>
        )}

        {tournament.rules && (
          <>
            <Separator className="my-5" />
            <DetailsTextSection
              icon={<FileText />}
              title="Reglas y normativa"
              text={tournament.rules}
            />
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
      <DetailsTextSection
        icon={<Trophy />}
        title="Premios"
        text={tournament.prizes ?? "Sin premios definidos"}
      />
    )
  }

  return (
    <div className="space-y-3">
      <SectionTitle icon={<Trophy />} title="Premios por categoría" />
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

function DetailsTextSection({
  icon,
  title,
  text,
}: {
  icon: ReactElement<{ className?: string }>
  title: string
  text: string
}) {
  return (
    <div className="space-y-2">
      <SectionTitle icon={icon} title={title} />
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {text}
      </p>
    </div>
  )
}

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactElement<{ className?: string }>
  title: string
}) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
      {cloneElement(icon, {
        className: "size-4 shrink-0 text-muted-foreground",
      })}
      {title}
    </p>
  )
}

export { TournamentDetailsCard }
