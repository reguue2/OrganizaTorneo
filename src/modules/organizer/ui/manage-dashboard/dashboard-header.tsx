import Link from "next/link"
import { Copy, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TournamentRow } from "@/modules/organizer/domain"

import { formatDate, getStatusLabel } from "./display"
import { getTournamentStatusVariant } from "./status-badge"

export function DashboardHeader({
  copyOk,
  onCopyPublicLink,
  tournament,
}: {
  copyOk: boolean
  onCopyPublicLink: () => void
  tournament: TournamentRow
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Panel del torneo
          </h1>
          <Badge variant={getTournamentStatusVariant(tournament.status)}>
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>

        <p className="mt-3 text-lg text-muted-foreground">{tournament.title}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{formatDate(tournament.date)}</span>
          <span aria-hidden="true">·</span>
          <span>{tournament.province ?? "Provincia por definir"}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onCopyPublicLink}>
          <Copy data-icon="inline-start" />
          {copyOk ? "Enlace copiado" : "Copiar enlace"}
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href={`/torneos/${tournament.id}`}>
            <ExternalLink data-icon="inline-start" />
            Página pública
          </Link>
        </Button>
      </div>
    </div>
  )
}
