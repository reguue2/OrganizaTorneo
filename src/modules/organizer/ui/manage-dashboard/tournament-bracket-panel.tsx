"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink, RefreshCw, Trash2, Trophy } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TournamentRow } from "@/modules/organizer/domain"
import { BRACKET_FORMAT_LABELS } from "@/modules/tournaments/domain"
import { ShareTournamentButton } from "@/modules/tournaments/ui/public-tournament/share-tournament-button"

import { areRegistrationsClosed, formatDate } from "./display"
import { GenerateBracketModal } from "./generate-bracket-modal"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function TournamentBracketPanel({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)

  const closed = areRegistrationsClosed(tournament)
  const brackets = dashboard.brackets
  const hasBracket = brackets.length > 0
  const confirmedCount = dashboard.confirmedRegistrations.length
  const pendingCount =
    dashboard.pendingCashValidations.length + dashboard.pendingOnlinePayments.length
  const generating = dashboard.busy === "bracket:generate"
  const deleting = dashboard.busy === "bracket:delete"
  const cuadroPath = `/torneos/${tournament.id}/cuadro`

  const totalParticipants = brackets.reduce(
    (sum, bracket) => sum + bracket.participant_count,
    0
  )

  function openModal() {
    if (!closed) {
      setWarning("Cierra las inscripciones del torneo para poder generar el cuadro.")
      return
    }
    setWarning(null)
    setModalOpen(true)
  }

  function handleGenerate(
    format: Parameters<ManageDashboardViewModel["generateBracket"]>[0],
    options: Parameters<ManageDashboardViewModel["generateBracket"]>[1]
  ) {
    setModalOpen(false)
    dashboard.generateBracket(format, options)
  }

  return (
    <Card className="xl:sticky xl:top-6">
      <CardHeader>
        <CardTitle>Torneo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasBracket ? (
          <>
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {BRACKET_FORMAT_LABELS[brackets[0].format]}
                </span>
                <Badge variant="success">Generado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {totalParticipants} participantes
                {brackets.length > 1 ? ` · ${brackets.length} cuadros` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Generado el {formatDate(brackets[0].updated_at)}
              </p>
            </div>

            <div className="grid gap-2">
              <Button asChild variant="outline">
                <Link href={cuadroPath} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  Ver cuadro
                </Link>
              </Button>

              <ShareTournamentButton path={cuadroPath} title={`Cuadro · ${tournament.title}`} />

              <Button
                type="button"
                variant="ghost"
                onClick={openModal}
                disabled={generating || deleting}
              >
                <RefreshCw className="size-4" />
                Regenerar cuadro
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => dashboard.deleteBracket()}
                disabled={generating || deleting}
              >
                <Trash2 className="size-4" />
                {deleting ? "Eliminando..." : "Eliminar cuadro"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Genera el cuadro de juego</p>
              <p className="text-sm text-muted-foreground">
                Crea el cuadro, la liga o la fase de grupos con los participantes
                confirmados.
              </p>
            </div>
            <Button type="button" onClick={openModal} disabled={generating}>
              <Trophy className="size-4" />
              {generating ? "Generando..." : "Generar cuadro de torneo"}
            </Button>
            {!closed && (
              <p className="text-xs text-muted-foreground">
                Disponible cuando cierres las inscripciones.
              </p>
            )}
          </div>
        )}

        {warning && (
          <Alert variant="warning">
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <GenerateBracketModal
        busy={generating}
        confirmedCount={confirmedCount}
        hasCategories={tournament.has_categories}
        hasExistingBracket={hasBracket}
        onClose={() => setModalOpen(false)}
        onGenerate={handleGenerate}
        open={modalOpen}
        pendingCount={pendingCount}
      />
    </Card>
  )
}
