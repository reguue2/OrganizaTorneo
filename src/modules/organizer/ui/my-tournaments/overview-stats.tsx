import { BarChart3, CalendarCheck2, CheckCircle2, CircleDollarSign } from "lucide-react"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { OrganizerTournamentTotals } from "@/modules/organizer/domain"

import { formatMoney } from "./display"

const statToneClassName = {
  emerald: "bg-emerald-50 text-emerald-700",
  indigo: "bg-indigo-50 text-indigo-700",
  sky: "bg-sky-50 text-sky-700",
  teal: "bg-teal-50 text-teal-700",
} as const

type StatTone = keyof typeof statToneClassName

export function OverviewStats({ totals }: { totals: OrganizerTournamentTotals }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total torneos"
        value={String(totals.totalTournaments)}
        tone="sky"
        icon={<BarChart3 />}
      />
      <StatCard
        title="Activos"
        value={String(totals.totalActive)}
        tone="emerald"
        icon={<CalendarCheck2 />}
      />
      <StatCard
        title="Confirmadas"
        value={String(totals.totalConfirmed)}
        tone="indigo"
        icon={<CheckCircle2 />}
      />
      <StatCard
        title="Recaudación"
        value={formatMoney(totals.totalRevenue)}
        tone="teal"
        icon={<CircleDollarSign />}
      />
    </div>
  )
}

function StatCard({
  icon,
  title,
  tone,
  value,
}: {
  icon: React.ReactNode
  title: string
  tone: StatTone
  value: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-lg",
              statToneClassName[tone]
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
