import { PublicPage, PublicPageHeader } from "@/components/layout"
import type { TournamentBracketRow } from "@/modules/tournaments/domain"

import { BracketSections } from "../bracket"
import { ShareTournamentButton } from "../public-tournament/share-tournament-button"

type PublicBracketPageProps = {
  tournament: { id: string; title: string; has_categories: boolean }
  categories: { id: string; name: string }[]
  brackets: TournamentBracketRow[]
}

export function PublicBracketPage({
  brackets,
  categories,
  tournament,
}: PublicBracketPageProps) {
  return (
    <PublicPage size="wide" className="py-6 md:py-8">
      <PublicPageHeader
        eyebrow={tournament.title}
        title="Cuadro del torneo"
        actions={
          <ShareTournamentButton
            path={`/torneos/${tournament.id}/cuadro`}
            title={`Cuadro · ${tournament.title}`}
          />
        }
      />

      <BracketSections brackets={brackets} categories={categories} />
    </PublicPage>
  )
}
