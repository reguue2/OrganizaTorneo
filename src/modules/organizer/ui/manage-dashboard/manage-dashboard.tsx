"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { ConfigTab } from "./config-tab"
import { DashboardHeader } from "./dashboard-header"
import { DashboardTabs } from "./dashboard-tabs"
import { OverviewTab } from "./overview-tab"
import { ParticipantsTab } from "./participants-tab"
import type { ManageDashboardProps } from "./types"
import { useManageDashboard } from "./use-manage-dashboard"

export default function ManageDashboard(props: ManageDashboardProps) {
  const dashboard = useManageDashboard(props)

  return (
    <div className="space-y-8">
      <DashboardHeader tournament={props.tournament} />

      {dashboard.pageError && (
        <Alert variant="destructive">
          <AlertDescription>{dashboard.pageError}</AlertDescription>
        </Alert>
      )}

      <DashboardTabs
        activeTab={dashboard.activeTab}
        busy={dashboard.busy}
        onTabChange={dashboard.setActiveTab}
        participantsCount={dashboard.activeRegistrations.length}
        tournament={props.tournament}
        updateTournamentStatus={dashboard.updateTournamentStatus}
      />

      {dashboard.activeTab === "overview" ? (
        <OverviewTab
          categories={props.categories}
          dashboard={dashboard}
          tournament={props.tournament}
        />
      ) : dashboard.activeTab === "participants" ? (
        <ParticipantsTab dashboard={dashboard} tournament={props.tournament} />
      ) : (
        <ConfigTab
          categories={props.categories}
          dashboard={dashboard}
          tournament={props.tournament}
        />
      )}
    </div>
  )
}
