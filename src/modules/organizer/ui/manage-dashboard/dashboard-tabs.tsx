import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Settings, UsersRound } from "lucide-react"
import type { TournamentRow } from "@/modules/organizer/domain"

import { TournamentStatusActions } from "./tournament-status-actions"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

type DashboardTab = ManageDashboardViewModel["activeTab"]

export function DashboardTabs({
  activeTab,
  busy,
  onTabChange,
  participantsCount,
  tournament,
  updateTournamentStatus,
}: {
  activeTab: DashboardTab
  busy: string | null
  onTabChange: (tab: DashboardTab) => void
  participantsCount: number
  tournament: TournamentRow
  updateTournamentStatus: ManageDashboardViewModel["updateTournamentStatus"]
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border lg:flex-row lg:items-end lg:justify-between">
      <div
        aria-label="Secciones del panel"
        className="flex max-w-full gap-1 overflow-x-auto"
        role="tablist"
      >
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          variant="ghost"
          className={
            activeTab === "overview"
              ? "relative rounded-none border-0 bg-transparent hover:bg-transparent after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
              : "rounded-none border-0 bg-transparent hover:bg-transparent"
          }
          onClick={() => onTabChange("overview")}
        >
          <LayoutDashboard data-icon="inline-start" />
          Resumen
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "participants"}
          variant="ghost"
          className={
            activeTab === "participants"
              ? "relative rounded-none border-0 bg-transparent hover:bg-transparent after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
              : "rounded-none border-0 bg-transparent hover:bg-transparent"
          }
          onClick={() => onTabChange("participants")}
        >
          <UsersRound data-icon="inline-start" />
          Inscripciones
          <Badge variant="secondary">{participantsCount}</Badge>
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "config"}
          variant="ghost"
          className={
            activeTab === "config"
              ? "relative rounded-none border-0 bg-transparent hover:bg-transparent after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
              : "rounded-none border-0 bg-transparent hover:bg-transparent"
          }
          onClick={() => onTabChange("config")}
        >
          <Settings data-icon="inline-start" />
          Configuración
        </Button>
      </div>

      <div className="pb-2">
        <TournamentStatusActions
          busy={busy}
          tournament={tournament}
          updateTournamentStatus={updateTournamentStatus}
        />
      </div>
    </div>
  )
}
