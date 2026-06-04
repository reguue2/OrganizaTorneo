import Link from "next/link"
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Settings,
  UsersRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import type { OrganizerTournamentView } from "@/modules/organizer/domain"

import { CopyTournamentLinkButton } from "./copy-tournament-link-button"
import {
  formatDate,
  formatMoney,
  getParticipantLine,
  getRegistrationBadge,
  getTournamentStatusLabel,
  getTournamentStatusVariant,
} from "./display"

export function TournamentCard({
  tournament,
}: {
  tournament: OrganizerTournamentView
}) {
  const registrationBadge = getRegistrationBadge(tournament)
  const isDraft = tournament.status === "draft"

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Badge variant={getTournamentStatusVariant(tournament.status)}>
            {getTournamentStatusLabel(tournament.status)}
          </Badge>
          {registrationBadge && !isDraft && (
            <Badge variant={registrationBadge.variant}>{registrationBadge.label}</Badge>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {tournament.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isDraft
              ? "Borrador antiguo pendiente de rehacer"
              : tournament.is_public
                ? "Torneo público"
                : "Oculto del explorador, accesible por enlace"}
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <TournamentMetaItem icon={<CalendarDays />} text={formatDate(tournament.date)} />

          {!isDraft && (
            <TournamentMetaItem
              icon={<Clock3 />}
              text={`Límite inscripción: ${formatDate(tournament.registration_deadline)}`}
            />
          )}

          <TournamentMetaItem icon={<UsersRound />} text={getParticipantLine(tournament)} />
          <TournamentMetaItem
            icon={<CheckCircle2 />}
            text={`${tournament.confirmedCount} confirmadas`}
          />
          <TournamentMetaItem
            icon={<CircleDollarSign />}
            text={`${formatMoney(tournament.revenue)} recaudado`}
          />
        </div>

        {(tournament.pendingCashCount > 0 || tournament.pendingOnlineCount > 0) && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            {tournament.pendingCashCount > 0 && (
              <p>{tournament.pendingCashCount} pendientes de validación en efectivo</p>
            )}
            {tournament.pendingOnlineCount > 0 && (
              <p>{tournament.pendingOnlineCount} pendientes de pago online</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Ocupación</span>
            <span>
              {tournament.occupancyPercent === null
                ? "Sin máximo"
                : `${tournament.occupancyPercent}%`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width:
                  tournament.occupancyPercent === null
                    ? "35%"
                    : `${Math.min(tournament.occupancyPercent, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
          {isDraft ? (
            <Button asChild>
              <Link href="/crear-torneo">Crear de nuevo</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link href={`/torneo/${tournament.id}/gestionar`}>
                  <Settings data-icon="inline-start" />
                  Gestionar
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/torneos/${tournament.id}`}>
                  <ExternalLink data-icon="inline-start" />
                  Página pública
                </Link>
              </Button>
              <CopyTournamentLinkButton path={`/torneos/${tournament.id}`} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TournamentMetaItem({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      <span>{text}</span>
    </div>
  )
}
