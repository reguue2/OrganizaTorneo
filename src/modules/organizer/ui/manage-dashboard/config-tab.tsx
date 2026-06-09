import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"

import { SectionBlock } from "./dashboard-cards"
import { CategoriesSummary, OperationalSummary } from "./config-summary"
import { ManagementConfigForm } from "./management-config-form"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function ConfigTab({
  categories,
  dashboard,
  tournament,
}: {
  categories: CategoryRow[]
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  return (
    <SectionBlock
      title="Configuración"
      description="Actualiza la publicación, las condiciones y la estructura operativa del torneo."
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <ManagementConfigForm dashboard={dashboard} tournament={tournament} />

        <div className="space-y-4 xl:sticky xl:top-6">
          <OperationalSummary dashboard={dashboard} tournament={tournament} />
          {categories.length > 0 && <CategoriesSummary categories={categories} />}
        </div>
      </div>
    </SectionBlock>
  )
}
