import { Button } from "@/components/ui/button"

import type { ManageDashboardViewModel } from "./use-manage-dashboard"

type DashboardTab = ManageDashboardViewModel["activeTab"]

export function DashboardTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}) {
  return (
    <div
      aria-label="Secciones del panel"
      className="inline-flex w-fit rounded-lg border border-border bg-muted/40 p-1"
      role="tablist"
    >
      <Button
        type="button"
        role="tab"
        aria-selected={activeTab === "participants"}
        variant={activeTab === "participants" ? "default" : "ghost"}
        onClick={() => onTabChange("participants")}
      >
        Inscripciones
      </Button>
      <Button
        type="button"
        role="tab"
        aria-selected={activeTab === "config"}
        variant={activeTab === "config" ? "default" : "ghost"}
        onClick={() => onTabChange("config")}
      >
        Configuración
      </Button>
    </div>
  )
}
