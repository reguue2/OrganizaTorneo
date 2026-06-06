import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"
import { BracketSections } from "@/modules/tournaments/ui/bracket"

import { TournamentBracketPanel } from "./tournament-bracket-panel"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function CuadroTab({
  categories,
  dashboard,
  tournament,
}: {
  categories: CategoryRow[]
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const hasBracket = dashboard.brackets.length > 0

  if (!hasBracket) {
    return (
      <div className="mx-auto max-w-md">
        <TournamentBracketPanel dashboard={dashboard} tournament={tournament} />
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
      <TournamentBracketPanel dashboard={dashboard} tournament={tournament} />
      <BracketSections brackets={dashboard.brackets} categories={categories} />
    </div>
  )
}
