"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { ConfigTab } from "./config-tab"
import { DashboardHeader } from "./dashboard-header"
import { DashboardStats } from "./dashboard-stats"
import { DashboardTabs } from "./dashboard-tabs"
import { ParticipantsTab } from "./participants-tab"
import type { ManageDashboardProps } from "./types"
import { useManageDashboard } from "./use-manage-dashboard"

export default function ManageDashboard(props: ManageDashboardProps) {
  const dashboard = useManageDashboard(props)

  return (
    <div className="space-y-8">
      <DashboardHeader
        copyOk={dashboard.copyOk}
        onCopyPublicLink={dashboard.copyPublicLink}
        tournament={props.tournament}
      />

      {dashboard.pageError && (
        <Alert variant="destructive">
          <AlertDescription>{dashboard.pageError}</AlertDescription>
        </Alert>
      )}

      <DashboardStats dashboard={dashboard} />

      <DashboardTabs activeTab={dashboard.activeTab} onTabChange={dashboard.setActiveTab} />

      {dashboard.activeTab === "participants" ? (
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
