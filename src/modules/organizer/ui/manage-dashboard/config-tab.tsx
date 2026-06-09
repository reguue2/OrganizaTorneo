import type { TournamentRow } from "@/modules/organizer/domain"

import { SectionBlock } from "./dashboard-cards"
import { ManagementConfigForm } from "./management-config-form"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function ConfigTab({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  return (
    <SectionBlock title="Configuración">
      <ManagementConfigForm dashboard={dashboard} tournament={tournament} />
    </SectionBlock>
  )
}
