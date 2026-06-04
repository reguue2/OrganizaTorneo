import Link from "next/link"
import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getPublicVisibilityLabel,
  getRegistrationState,
  getSidebarStatus,
  getTournamentCapacitySummary,
} from "@/modules/tournaments/domain"

import { getPublicTournamentStatusVariant } from "../status-badge"
import { ShareTournamentButton } from "./share-tournament-button"
import type { PublicTournamentViewData } from "./types"

type TournamentRegistrationSidebarProps = PublicTournamentViewData & {
  registerPath: string
  registrationState: ReturnType<typeof getRegistrationState>
  statusLabel: string
  statusState: ReturnType<typeof getSidebarStatus>["state"]
  sharePath: string
}

function TournamentRegistrationSidebar({
  tournament,
  categories,
  registerPath,
  registrationState,
  statusLabel,
  statusState,
  sharePath,
}: TournamentRegistrationSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Estado</p>
            <Badge variant={getPublicTournamentStatusVariant(statusState)}>
              {statusLabel}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Plazas</p>
            <p className="text-xl font-semibold text-foreground">
              {getTournamentCapacitySummary(tournament, categories)}
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

          <ShareTournamentButton path={sharePath} variant="full" />

          <Separator />

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="size-4" />
              Visibilidad
            </p>
            <p className="text-sm leading-6 text-foreground">
              {getPublicVisibilityLabel(tournament.is_public)}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Inscripción</p>
            <p className="text-sm leading-6 text-foreground">
              {registrationState.message}
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

export { TournamentRegistrationSidebar }
