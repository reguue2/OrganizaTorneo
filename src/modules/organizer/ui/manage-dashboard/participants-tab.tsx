import type { TournamentRow } from "@/modules/organizer/domain"

import { RegistrationGroupCard } from "./registration-group-card"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function ParticipantsTab({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const {
    busy,
    groupedViews,
  } = dashboard

  return (
    <div className="space-y-6">
      {groupedViews.map((group) => (
        <RegistrationGroupCard
          key={group.id}
          busy={busy}
          cancelRegistration={dashboard.cancelRegistration}
          confirmCashRegistration={dashboard.confirmCashRegistration}
          group={group}
          tournament={tournament}
        />
      ))}
    </div>
  )
}
