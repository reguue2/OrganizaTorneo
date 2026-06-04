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
      description="Edita la información pública del torneo y su visibilidad."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ManagementConfigForm dashboard={dashboard} tournament={tournament} />

        <div className="space-y-4">
          <OperationalSummary dashboard={dashboard} tournament={tournament} />
          {categories.length > 0 && <CategoriesSummary categories={categories} />}
        </div>
      </div>
    </SectionBlock>
  )
}
