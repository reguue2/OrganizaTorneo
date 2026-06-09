import Image from "next/image"

import { PublicPage } from "@/components/layout"
import {
  getRegistrationState,
} from "@/modules/tournaments/domain"
import type { OrganizerPublicContact } from "@/modules/profile/domain"
import { OrganizerContactCard } from "@/modules/profile/ui/organizer-contact-card"
import { cn } from "@/lib/utils"

import { TournamentCategoriesCard } from "./categories-card"
import { TournamentDetailsCard } from "./details-card"
import { TournamentRegistrationSidebar } from "./registration-sidebar"
import { ShareTournamentButton } from "./share-tournament-button"
import type { PublicTournamentViewData } from "./types"

function PublicTournamentPage({
  tournament,
  categories,
  contact,
}: PublicTournamentViewData & {
  contact?: OrganizerPublicContact | null
}) {
  return (
    <PublicPage size="wide" className="py-6 md:py-8">
      <PublicTournamentContent
        tournament={tournament}
        categories={categories}
        contact={contact}
      />
    </PublicPage>
  )
}

function PublicTournamentContent({
  tournament,
  categories,
  contact,
  showRegistrationSidebar = true,
}: PublicTournamentViewData & {
  contact?: OrganizerPublicContact | null
  showRegistrationSidebar?: boolean
}) {
  const registrationState = getRegistrationState(tournament)
  const sharePath = `/torneos/${tournament.id}`
  const registerPath = `/torneo/${tournament.id}/inscribirse`

  return (
    <div className="space-y-6">
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
                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {tournament.title}
                </h1>
              </div>

              <ShareTournamentButton
                path={sharePath}
                title={tournament.title}
                variant="icon"
              />
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

          {tournament.has_categories && categories.length > 0 && (
            <TournamentCategoriesCard categories={categories} />
          )}

          {contact && (
            <OrganizerContactCard
              contact={contact}
              tournamentTitle={tournament.title}
            />
          )}
        </div>

        {showRegistrationSidebar && (
          <TournamentRegistrationSidebar
            tournament={tournament}
            categories={categories}
            registerPath={registerPath}
            registrationState={registrationState}
            sharePath={sharePath}
          />
        )}
      </section>
    </div>
  )
}

export { PublicTournamentContent, PublicTournamentPage }
