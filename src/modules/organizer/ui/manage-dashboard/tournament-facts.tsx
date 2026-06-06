import { CalendarDays, Clock3, Eye, MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { TournamentRow } from "@/modules/organizer/domain"

import { formatDateTime } from "./display"

export function TournamentFacts({ tournament }: { tournament: TournamentRow }) {
  const facts = [
    {
      icon: <Clock3 />,
      label: "Cierre de inscripciones",
      value: formatDateTime(tournament.registration_deadline),
    },
    {
      icon: <CalendarDays />,
      label: "Inicio del torneo",
      value: formatDateTime(tournament.date),
    },
    {
      icon: <MapPin />,
      label: "Lugar",
      value:
        [tournament.province, tournament.address].filter(Boolean).join(", ") ||
        "Pendiente de definir",
    },
    {
      icon: <Eye />,
      label: "Visibilidad",
      value: tournament.is_public ? "Público" : "Solo con enlace",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {facts.map((fact) => (
        <Card key={fact.label} className="shadow-none">
          <CardContent className="flex h-full items-center gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
              {fact.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{fact.label}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{fact.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
