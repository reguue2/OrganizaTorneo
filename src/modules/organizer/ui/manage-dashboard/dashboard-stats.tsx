import { Banknote, CheckCircle2, Clock3, CreditCard, UsersRound } from "lucide-react"

import { formatMoney } from "./display"
import { StatCard } from "./dashboard-cards"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function DashboardStats({
  dashboard,
}: {
  dashboard: ManageDashboardViewModel
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Inscripciones activas"
        value={String(dashboard.activeRegistrations.length)}
        tone="indigo"
        icon={<UsersRound />}
      />
      <StatCard
        title="Confirmadas"
        value={String(dashboard.confirmedRegistrations.length)}
        tone="emerald"
        icon={<CheckCircle2 />}
      />
      <StatCard
        title="Pendientes efectivo"
        value={String(dashboard.pendingCashValidations.length)}
        tone="amber"
        icon={<Clock3 />}
      />
      <StatCard
        title="Pendientes online"
        value={String(dashboard.pendingOnlinePayments.length)}
        tone="sky"
        icon={<CreditCard />}
      />
      <StatCard
        title="Ingresos cobrados"
        value={formatMoney(dashboard.revenue)}
        tone="teal"
        icon={<Banknote />}
      />
    </div>
  )
}
