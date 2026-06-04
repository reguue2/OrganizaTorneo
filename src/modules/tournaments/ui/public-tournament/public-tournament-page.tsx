import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  MapPin,
} from "lucide-react"

import { PublicPage } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getRegistrationState,
  getSidebarStatus,
} from "@/modules/tournaments/domain"
import { cn } from "@/lib/utils"

import { getPublicTournamentStatusVariant } from "../status-badge"
import { TournamentCategoriesCard } from "./categories-card"
import { TournamentDetailsCard } from "./details-card"
import { TournamentRegistrationSidebar } from "./registration-sidebar"
import { ShareTournamentButton } from "./share-tournament-button"
import type { PublicTournamentViewData } from "./types"

function PublicTournamentPage({
  tournament,
  categories,
}: PublicTournamentViewData) {
  return (
    <PublicPage size="wide" className="py-6 md:py-8">
      <PublicTournamentContent tournament={tournament} categories={categories} />
    </PublicPage>
  )
}

function PublicTournamentContent({
  tournament,
  categories,
  showRegistrationSidebar = true,
}: PublicTournamentViewData & {
  showRegistrationSidebar?: boolean
}) {
  const status = getSidebarStatus(tournament)
  const registrationState = getRegistrationState(tournament)
  const sharePath = `/torneos/${tournament.id}`
  const registerPath = `/torneo/${tournament.id}/inscribirse`

  return (
    <div className="space-y-6">
      <nav
        aria-label="Ruta de navegación"
        className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/explorar" className="transition-colors hover:text-foreground">
          Explorar torneos
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <span className="truncate">{tournament.title}</span>
      </nav>

      <section
        className={cn(
          "grid gap-6",
          showRegistrationSidebar && "lg:grid-cols-[minmax(0,1fr)_340px]"
        )}
      >
        <div className="min-w-0 space-y-6">
          <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
            <div className="relative aspect-[16/7] min-h-[220px]">
              {tournament.poster_url ? (
                <Image
                  src={tournament.poster_url}
                  alt={tournament.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  priority
                  unoptimized={tournament.poster_url.startsWith("blob:")}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Sin cartel
                </div>
              )}
            </div>
          </div>

          <header className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-3">
                <Badge variant={getPublicTournamentStatusVariant(status.state)}>
                  {status.label}
                </Badge>
                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {tournament.title}
                </h1>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {tournament.province ?? "Ubicación por definir"}
                  </span>
                  {tournament.address && <span>{tournament.address}</span>}
                </p>
              </div>

              <ShareTournamentButton path={sharePath} variant="icon" />
            </div>

            {tournament.description && (
              <p className="max-w-3xl whitespace-pre-wrap text-base leading-7 text-muted-foreground">
                {tournament.description}
              </p>
            )}
          </header>

          <TournamentDetailsCard
            tournament={tournament}
            categories={categories}
          />

          {tournament.rules && (
            <Card>
              <CardHeader>
                <CardTitle>Reglas y normativa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {tournament.rules}
                </p>
              </CardContent>
            </Card>
          )}

          {tournament.has_categories && categories.length > 0 && (
            <TournamentCategoriesCard categories={categories} />
          )}
        </div>

        {showRegistrationSidebar && (
          <TournamentRegistrationSidebar
            tournament={tournament}
            categories={categories}
            registerPath={registerPath}
            registrationState={registrationState}
            statusLabel={status.label}
            statusState={status.state}
            sharePath={sharePath}
          />
        )}
      </section>
    </div>
  )
}

export { PublicTournamentContent, PublicTournamentPage }
