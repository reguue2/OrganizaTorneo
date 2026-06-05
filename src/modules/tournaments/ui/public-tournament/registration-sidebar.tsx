import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatDate,
  getRegistrationState,
} from "@/modules/tournaments/domain"

import { ShareTournamentButton } from "./share-tournament-button"
import type { PublicTournamentViewData } from "./types"

type TournamentRegistrationSidebarProps = PublicTournamentViewData & {
  registerPath: string
  registrationState: ReturnType<typeof getRegistrationState>
  sharePath: string
}

function TournamentRegistrationSidebar({
  tournament,
  registerPath,
  registrationState,
  sharePath,
}: TournamentRegistrationSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">
              Participa en el torneo
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Envía tu solicitud antes del límite y el participa en el torneo.
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">
              Límite de inscripción
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(tournament.registration_deadline, { withTime: true })}
            </p>
          </div>

          {registrationState.canJoin ? (
            <Button asChild size="lg" className="w-full">
              <Link href={registerPath}>{registrationState.buttonLabel}</Link>
            </Button>
          ) : (
            <Button type="button" disabled size="lg" className="w-full">
              {registrationState.buttonLabel}
            </Button>
          )}

          <ShareTournamentButton
            path={sharePath}
            title={tournament.title}
            variant="full"
          />
        </CardContent>
      </Card>
    </aside>
  )
}

export { TournamentRegistrationSidebar }
