import Link from "next/link"
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Settings,
  TriangleAlert,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import type { OrganizerTournamentView } from "@/modules/organizer/domain"
import { ShareTournamentButton } from "@/modules/tournaments/ui/public-tournament/share-tournament-button"

import {
  formatDate,
  getParticipantLine,
} from "./display"

export function TournamentCard({
  tournament,
}: {
  tournament: OrganizerTournamentView
}) {
  const isDraft = tournament.status === "draft"

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
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
        </div>

        <div className="pt-1">
          {isDraft ? (
            <Button asChild>
              <Link href="/crear-torneo">Crear de nuevo</Link>
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild>
                  <Link href={`/torneo/${tournament.id}/gestionar`}>
                    <Settings data-icon="inline-start" />
                    Gestionar
                  </Link>
                </Button>
                {tournament.pendingCashCount > 0 && (
                  <div className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-sm font-medium whitespace-nowrap text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200">
                    <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
                    {tournament.pendingCashCount}{" "}
                    {tournament.pendingCashCount === 1
                      ? "pago pendiente"
                      : "pagos pendientes"}{" "}
                    de validación
                  </div>
                )}
                <Button asChild variant="secondary" className="ml-auto">
                  <Link href={`/torneos/${tournament.id}`}>
                    <ExternalLink data-icon="inline-start" />
                    Publicación
                  </Link>
                </Button>
              </div>
              <ShareTournamentButton
                path={`/torneos/${tournament.id}`}
                title={tournament.title}
              />
            </div>
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
